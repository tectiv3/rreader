import '../css/app.css'
import './bootstrap'

import { createPinia } from 'pinia'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createApp, h } from 'vue'
import router from '@/router.js'
import { idbCleanup } from '@/Composables/useArticleCache.js'
const appName = import.meta.env.VITE_APP_NAME || 'RReader'

// Register SW and store promise globally for composables to use
window.__swReady =
    'serviceWorker' in navigator
        ? navigator.serviceWorker
              .register('/sw.js')
              .then(reg => {
                  const sw = reg.active || reg.installing || reg.waiting
                  if (!sw) return null
                  if (sw.state === 'activated') return sw
                  return new Promise(resolve => {
                      sw.addEventListener('statechange', () => {
                          if (sw.state === 'activated') resolve(sw)
                      })
                  })
              })
              .catch(() => null)
        : Promise.resolve(null)

// Reload when a new SW takes control (deploy detected)
if ('serviceWorker' in navigator) {
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
    })
}

idbCleanup()

// Check reading state before mounting Inertia to restore article position
const READING_STATE_KEY = 'rreader-reading-state'

async function getReadingState() {
    // Try SW first (works offline in PWA)
    try {
        const sw = await Promise.race([
            window.__swReady,
            new Promise(resolve => setTimeout(() => resolve(null), 800)),
        ])
        if (sw) {
            const state = await new Promise(resolve => {
                const channel = new MessageChannel()
                channel.port1.onmessage = e => resolve(e.data)
                sw.postMessage({ type: 'get-reading-state' }, [channel.port2])
                setTimeout(() => resolve(null), 400)
            })
            if (state?.url) return state
        }
    } catch {
        // SW unavailable
    }
    // Fallback to localStorage
    try {
        const raw = localStorage.getItem(READING_STATE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

async function boot() {
    try {
        const state = await getReadingState()
        if (state?.url && state.url !== window.location.pathname + window.location.search) {
            window.location.replace(state.url)
            return
        }
    } catch {
        // proceed normally
    }

    createInertiaApp({
        title: title => `${title} - ${appName}`,
        resolve: name =>
            resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
        setup({ el, App, props, plugin }) {
            const app = createApp({ render: () => h(App, props) })
                .use(plugin)
                .use(createPinia())

            // Only install Vue Router on the AppShell page (not auth pages)
            if (props.initialPage.component === 'AppShell') {
                app.use(router)
            }

            return app.mount(el)
        },
        progress: {
            color: '#3b82f6',
        },
    })
}

boot()
