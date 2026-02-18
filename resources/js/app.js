import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import { registerSW } from 'virtual:pwa-register';

const appName = import.meta.env.VITE_APP_NAME || 'RReader';

registerSW({ immediate: true });

// Restore reading state: if the SW has a saved reading URL, redirect before rendering
if (navigator.serviceWorker?.controller) {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
        const state = event.data;
        if (state?.url && state.url !== (window.location.pathname + window.location.search)) {
            window.location.replace(state.url);
        }
    };
    navigator.serviceWorker.controller.postMessage({ type: 'get-reading-state' }, [channel.port2]);
}

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
