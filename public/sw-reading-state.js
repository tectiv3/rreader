// public/sw-reading-state.js
const CACHE_NAME = 'rreader-reading-state';
const CACHE_KEY = '/_reading-state';

self.addEventListener('message', async (event) => {
    const { type, state } = event.data || {};

    if (type === 'save-reading-state') {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(state), {
            headers: { 'Content-Type': 'application/json' },
        });
        await cache.put(CACHE_KEY, response);
    }

    if (type === 'clear-reading-state') {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(CACHE_KEY);
    }

    if (type === 'get-reading-state') {
        let state = null;
        try {
            const cache = await caches.open(CACHE_NAME);
            const response = await cache.match(CACHE_KEY);
            if (response) {
                state = await response.json();
            }
        } catch {
            // Cache miss or corrupt — ignore
        }
        event.ports[0].postMessage(state);
    }
});
