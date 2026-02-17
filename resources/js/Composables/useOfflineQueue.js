import { ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { useOnlineStatus } from './useOnlineStatus.js';

const STORAGE_KEY = 'rreader-offline-queue';
const queue = ref(loadQueue());
let syncing = false;

function loadQueue() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveQueue() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value));
    } catch {
        // Storage full or unavailable — silently ignore
    }
}

/**
 * Enqueue an action to be performed when online.
 * @param {string} method - HTTP method ('post', 'put', 'patch', 'delete')
 * @param {string} url - The route URL
 * @param {object} data - Request body data
 */
function enqueue(method, url, data = {}) {
    queue.value.push({
        method,
        url,
        data,
        queuedAt: new Date().toISOString(),
    });
    saveQueue();
}

function flushQueue() {
    if (syncing || queue.value.length === 0) return;
    syncing = true;

    const pending = [...queue.value];
    queue.value = [];
    saveQueue();

    let chain = Promise.resolve();
    for (const action of pending) {
        chain = chain.then(() => new Promise((resolve) => {
            router[action.method](action.url, action.data, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => resolve(),
                onError: () => resolve(), // Don't re-queue on error — action may be stale
            });
        }));
    }

    chain.finally(() => {
        syncing = false;
        // If new items were queued while syncing, flush again
        if (queue.value.length > 0) {
            flushQueue();
        }
    });
}

export function useOfflineQueue() {
    const { isOnline } = useOnlineStatus();

    // Flush queue when coming back online
    watch(isOnline, (online) => {
        if (online) {
            flushQueue();
        }
    });

    // Also try to flush on initialization if online
    if (isOnline.value && queue.value.length > 0) {
        // Defer to next tick to avoid running during component setup
        setTimeout(flushQueue, 100);
    }

    return { queue, enqueue, flushQueue };
}
