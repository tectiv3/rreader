import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
const appName = import.meta.env.VITE_APP_NAME || 'RReader';

// Register SW and store promise globally for composables to use
window.__swReady = ('serviceWorker' in navigator)
    ? navigator.serviceWorker.register('/build/sw.js').then(reg => {
        // Wait for the SW to be active
        const sw = reg.active || reg.installing || reg.waiting;
        if (!sw) return null;
        if (sw.state === 'activated') return sw;
        return new Promise(resolve => {
            sw.addEventListener('statechange', () => {
                if (sw.state === 'activated') resolve(sw);
            });
        });
    }).catch(() => null)
    : Promise.resolve(null);

// Restore reading state: redirect to saved URL if needed
window.__swReady.then(sw => {
    if (!sw) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
        const state = event.data;
        if (state?.url && state.url !== (window.location.pathname + window.location.search)) {
            window.location.replace(state.url);
        }
    };
    sw.postMessage({ type: 'get-reading-state' }, [channel.port2]);
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob('./Pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#3b82f6',
    },
});
