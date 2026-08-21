/**
 * The reading state is the app's bookmark: where the reader was when they last
 * left. It's written to localStorage and mirrored into a service worker cache so
 * an installed PWA can read it back offline before the app boots.
 *
 * Everything that touches the bookmark goes through here — app.js reads it on
 * boot, both reader views write it, and the IndexedDB cleanup consults it to know
 * which article it must not evict.
 */
export const READING_STATE_KEY = 'rreader-reading-state'

function postToServiceWorker(message) {
    window.__swReady?.then(sw => {
        if (sw) sw.postMessage(message)
    })
}

/**
 * @param {string} url - Where to reopen, e.g. /articles/123 or /articles?article=123
 * @param {number} scrollTop - Pixel offset to restore
 * @param {string|null} title - Article title, so a failed restore can name what it
 *   was trying to reopen even when nothing about the article is cached
 */
export function saveReadingState(url, scrollTop = 0, title = null) {
    const state = { url, scrollTop, title }
    try {
        localStorage.setItem(READING_STATE_KEY, JSON.stringify(state))
    } catch {
        // Storage full or unavailable — the service worker copy may still land
    }
    postToServiceWorker({ type: 'save-reading-state', state })
}

export function clearReadingState() {
    try {
        localStorage.removeItem(READING_STATE_KEY)
    } catch {
        // Nothing to do — the service worker copy is cleared regardless
    }
    postToServiceWorker({ type: 'clear-reading-state' })
}

export function readReadingState() {
    try {
        const raw = localStorage.getItem(READING_STATE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

/**
 * The article id the bookmark points at, or null. Two URL shapes are in use: the
 * detail view saves /articles/123, the desktop inline panel saves
 * /articles?feed_id=1&article=123.
 */
export function readingStateArticleId(state = readReadingState()) {
    const url = state?.url
    if (typeof url !== 'string') return null

    const detail = url.match(/^\/articles\/(\d+)(?:[?#]|$)/)
    if (detail) return Number(detail[1])

    const inline = url.match(/[?&]article=(\d+)/)
    return inline ? Number(inline[1]) : null
}
