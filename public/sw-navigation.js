// Offline handling for page navigations.
//
// Workbox's navigateFallback needs a precached HTML shell, which this app doesn't
// have — every page is rendered by Laravel with per-user Inertia props. So handle
// navigations here instead: network first, then the cached copy of the same URL,
// then the last cached app shell, so a deep link like /articles/123 still boots
// the SPA while offline.

const NAV_CACHE = 'navigation-cache'
// "/" is deliberately absent: routes/web.php redirects it to /articles for a
// signed-in reader, so the only thing that could ever be cached under it is the
// public Welcome page — a worse shell than any real SPA page.
const NAV_FALLBACKS = ['/articles']

// Paths the SPA can actually boot into. app.js installs Vue Router only for the
// AppShell page, so serving /login as a shell renders a login form at the wrong
// URL with no router and no navigation — and a standalone iOS PWA has no address
// bar to escape with.
const SPA_PATHS = /^\/(articles|feeds|settings|opml|highlights|chat)(\/|$)/
const NAV_MAX_ENTRIES = 20
const NETWORK_TIMEOUT_MS = 5000

function navCacheKey(url) {
    const parsed = new URL(url)
    return parsed.pathname + parsed.search
}

// Resolves to the response, or to null once NETWORK_TIMEOUT_MS passes — the
// request itself is never aborted. A 6-second first byte is ordinary on cellular,
// and killing it there discards a good response in order to serve stale HTML to a
// reader who is online. The caller answers from cache and lets this land anyway.
function raceTimeout(promise) {
    return Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS)),
    ])
}

async function storeShell(key, response) {
    if (!response.ok || !isShell(response)) return
    const cache = await caches.open(NAV_CACHE)
    await cache.put(key, response)
    await trimNavCache(cache)
}

// Navigation requests carry redirect:"manual", so a 302 (e.g. "/" -> "/articles"
// for a signed-in reader) reaches us as an opaqueredirect: status 0, not ok, no
// body. We pass it straight through and the browser follows it, which starts a
// fresh navigation we handle and cache normally — so "/" itself never lands in
// the cache, and offline it resolves through NAV_FALLBACKS instead.
//
// This guard is for the other case: should a response ever arrive already
// followed, returning it as-is would fail the navigation with a TypeError, so
// rebuild it as a plain response.
function unredirect(response) {
    if (!response.redirected) return response
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    })
}

// Asset filenames are content-hashed and `vite build` empties public/build, so
// HTML cached before a deploy references scripts that exist neither in the new
// precache nor on disk — restoring it offline boots a blank page with no way out
// but reinstalling. A new worker means a new build, so start the shell cache over.
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            await caches.delete(NAV_CACHE)

            // Repopulate straight away rather than waiting for the next
            // navigation. Activation happens online — that is how this worker
            // arrived — and the reader's next launch may well be offline, where
            // an empty cache means the saved article can't be reopened at all.
            try {
                const res = await fetch('/articles', { credentials: 'same-origin' })
                // Unlike a navigation, this fetch follows redirects: an expired
                // session turns it into the login page, still 200 and still HTML.
                // Caching that under /articles would hand it out as the shell.
                if (res.ok && !res.redirected && isShell(res)) {
                    const cache = await caches.open(NAV_CACHE)
                    await cache.put('/articles', res)
                }
            } catch {
                // No connection at activation; the next navigation fills it in.
            }
        })()
    )
})

// Not every navigation returns a document: /opml/export is a same-origin GET with
// mode "navigate" that answers with an XML attachment. Cache only what can
// actually boot the SPA, or the shell fallback hands the reader a download prompt.
function isShell(response) {
    return (response.headers.get('Content-Type') || '').includes('text/html')
}

async function trimNavCache(cache) {
    const keys = await cache.keys()
    // Guard the subtraction: under the limit it goes negative, and slice(0, -n)
    // counts back from the end and would delete most of the cache.
    if (keys.length <= NAV_MAX_ENTRIES) return

    // Cache.keys() yields insertion order, so the oldest entries come first.
    for (const key of keys.slice(0, keys.length - NAV_MAX_ENTRIES)) {
        await cache.delete(key)
    }
}

async function cachedShell(cache, key) {
    const exact = await cache.match(key)
    if (exact) return exact

    for (const fallback of NAV_FALLBACKS) {
        // ignoreSearch: a cache holding only /articles?feed_id=3 would otherwise
        // miss the /articles fallback entirely.
        const hit = await cache.match(fallback, { ignoreSearch: true })
        if (hit) return hit
    }

    // Any previously visited SPA page works as a shell — Vue Router takes over
    // from the current URL once the app boots. Newest first: Cache.put re-appends
    // an existing key, so the tail is the most recently visited page.
    const keys = await cache.keys()
    for (let i = keys.length - 1; i >= 0; i--) {
        if (!SPA_PATHS.test(new URL(keys[i].url).pathname)) continue
        const hit = await cache.match(keys[i])
        if (hit && isShell(hit)) return hit
    }

    return null
}

function offlineResponse() {
    // The app's own theme lives in localStorage, which a service worker can't
    // read, so follow the OS preference — the best signal available here.
    return new Response(
        '<!doctype html><html><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>Offline</title><style>' +
            ':root{color-scheme:light dark;--bg:#ffffff;--fg:#171717}' +
            '@media (prefers-color-scheme:dark){:root{--bg:#171717;--fg:#e5e5e5}}' +
            'body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--fg);' +
            'display:flex;align-items:center;justify-content:center;height:100vh;' +
            'margin:0;text-align:center}</style>' +
            '</head><body><div><h1>You’re offline</h1>' +
            '<p>This page hasn’t been cached yet. Reconnect and try again.</p>' +
            '</div></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
}

self.addEventListener('fetch', event => {
    const request = event.request

    if (request.method !== 'GET' || request.mode !== 'navigate') return

    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return
    // Handled by sw-share-target.js. The two listeners are mutually exclusive —
    // it responds only to this path, this one responds to everything but — so
    // neither depends on the order they're imported in.
    if (url.pathname === '/_share-target') return
    // A file download, and useless offline — let it fail rather than caching the
    // reader's whole feed list under a key the shell fallback can reach.
    if (url.pathname === '/opml/export') return

    const key = navCacheKey(request.url)

    event.respondWith(
        (async () => {
            const live = fetch(request)
            // Claimed below in every branch, but attach a handler now: if the race
            // is lost the rejection would otherwise go unhandled.
            live.catch(() => {})

            let response = null
            try {
                response = await raceTimeout(live)
            } catch {
                response = null
            }

            if (response) {
                event.waitUntil(storeShell(key, response.clone()))
                return unredirect(response)
            }

            // Failed, or too slow to wait on. Answer from cache if we can, and
            // keep the request alive so the cache is fresher next time.
            const cache = await caches.open(NAV_CACHE)
            const shell = await cachedShell(cache, key)
            if (shell) {
                event.waitUntil(live.then(r => storeShell(key, r.clone())).catch(() => {}))
                return shell
            }

            // Nothing cached for this URL and nothing to fall back on, so the
            // request is the only hope left — wait it out rather than giving up.
            try {
                const late = await live
                event.waitUntil(storeShell(key, late.clone()))
                return unredirect(late)
            } catch {
                return offlineResponse()
            }
        })()
    )
})
