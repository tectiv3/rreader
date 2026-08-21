import { ref, watch } from 'vue'
import axios from 'axios'
import { useOnlineStatus } from './useOnlineStatus.js'
import { useToast } from './useToast.js'

const STORAGE_KEY = 'rreader-offline-queue'
const RETRY_DELAY_MS = 30000
const QUEUEABLE_METHODS = ['post', 'put', 'patch', 'delete']
const MAX_ATTEMPTS = 5

// Statuses that say "not now" rather than "not ever": the server was reached but
// couldn't answer, so the entry itself is still good. 419 is Laravel's expired
// CSRF token, which is the normal outcome of being offline past the session
// lifetime — dropping on it would silently discard a whole reading session.
function isTransient(status) {
    return status >= 500 || status === 408 || status === 419 || status === 429
}

// The queue outlives deploys in localStorage, so entries written by an older
// version of the app — or hand-edited ones — have to be treated as untrusted.
function isValidEntry(entry) {
    return (
        !!entry &&
        typeof entry.url === 'string' &&
        // "//host/path" also starts with "/" but resolves to another origin
        /^\/(?!\/)/.test(entry.url) &&
        QUEUEABLE_METHODS.includes(entry.method)
    )
}

const queue = ref(loadQueue())
let syncPromise = null
let retryTimer = null

function loadQueue() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const parsed = stored ? JSON.parse(stored) : []
        return Array.isArray(parsed) ? parsed.filter(isValidEntry) : []
    } catch {
        return []
    }
}

// WebKit gives an origin ~5MB of localStorage, shared with the reading bookmark.
// A long offline session can reach it, and the write that fails is the one that
// would have saved everything since the last good one — so drop the oldest half
// and retry rather than letting the whole session evaporate on app close.
function saveQueue() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
        return
    } catch (e) {
        if (e?.name !== 'QuotaExceededError') return
    }

    queue.value.splice(0, Math.ceil(queue.value.length / 2))
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
        useToast().error('Storage was full — some offline changes were dropped.')
    } catch {
        // Nothing left to try; the in-memory queue still flushes if we reconnect
    }
}

/**
 * Queue an API write to replay when the connection comes back.
 *
 * Repeated writes to the same endpoint are merged rather than appended: toggling
 * read-later or scrolling a long article otherwise fills the queue with hundreds
 * of entries that all describe the same final state.
 *
 * @param {string} method - HTTP method ('post', 'put', 'patch', 'delete')
 * @param {string} url - The API URL
 * @param {object} data - Request body
 */
export function enqueue(method, url, data = {}) {
    if (!isValidEntry({ method, url })) return

    const mergeable = method === 'patch' || method === 'put'
    const existing = mergeable
        ? queue.value.find(a => a.method === method && a.url === url)
        : null

    if (existing) {
        existing.data = { ...existing.data, ...data }
        existing.queuedAt = new Date().toISOString()
    } else {
        queue.value.push({ method, url, data, queuedAt: new Date().toISOString() })
    }

    saveQueue()
}

/**
 * Issue one API write. axios.delete takes (url, config), not (url, data), so a
 * body has to travel under `data` — shared with the store's optimistic writes so
 * the two can't drift apart on that.
 */
export function sendRequest({ method, url, data }) {
    return method === 'delete' ? axios.delete(url, { data }) : axios[method](url, data)
}

export function queuedCount() {
    return queue.value.length
}

function scheduleRetry() {
    if (retryTimer || queue.value.length === 0) return
    retryTimer = setTimeout(() => {
        retryTimer = null
        flushQueue()
    }, RETRY_DELAY_MS)
}

/**
 * Replay the queue, oldest first.
 *
 * Always returns a promise that settles when the queue is empty or a retry has
 * been scheduled — including when a flush is already running, where it returns
 * that same promise. Callers that refetch on reconnect depend on this: a GET that
 * lands before the replay would overwrite the reader's offline changes with the
 * server's stale answer, and then snapshot that answer to IndexedDB.
 */
export function flushQueue() {
    if (syncPromise) return syncPromise
    if (queue.value.length === 0) return Promise.resolve()

    syncPromise = (async () => {
        while (queue.value.length > 0) {
            const entry = queue.value[0]
            try {
                await sendRequest(entry)
            } catch (e) {
                // No response at all means the request never reached the server.
                // Keep the queue and try again later — the browser only fires an
                // `online` event when the link changes, which never happens when
                // the link is up but the server itself is down.
                const unreachable = axios.isAxiosError(e) && !e.response
                if (unreachable || isTransient(e.response?.status)) {
                    entry.attempts = (entry.attempts || 0) + 1
                    if (entry.attempts < MAX_ATTEMPTS) {
                        saveQueue()
                        scheduleRetry()
                        return
                    }
                    // Out of attempts. Say so rather than losing the write in
                    // silence, then drop it so the rest of the queue can move.
                    useToast().error("Couldn't sync some offline changes.")
                }
                // Everything else is the entry's own fault: a 4xx means it's stale
                // (article deleted), a non-axios throw means it's malformed. Drop,
                // because a retry fails identically forever and blocks the queue.
            }
            queue.value.shift()
            saveQueue()
        }
    })().finally(() => {
        syncPromise = null
    })

    return syncPromise
}

export function useOfflineQueue() {
    const { isOnline } = useOnlineStatus()

    watch(isOnline, online => {
        if (online) flushQueue()
    })

    if (isOnline.value && queue.value.length > 0) {
        // Defer so this never runs during component setup
        setTimeout(flushQueue, 100)
    }

    return { queue, enqueue, flushQueue, queuedCount }
}
