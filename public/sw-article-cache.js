// public/sw-article-cache.js
const ARTICLE_CACHE_NAME = 'rreader-articles'
const ARTICLE_CACHE_PREFIX = '/_article/'
const ARTICLE_MAX_ENTRIES = 500
const ARTICLE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

self.addEventListener('message', async event => {
    const { type, articleId, content } = event.data || {}

    if (type === 'article-cache-get') {
        let result = null
        try {
            const cache = await caches.open(ARTICLE_CACHE_NAME)
            const response = await cache.match(ARTICLE_CACHE_PREFIX + articleId)
            if (response) {
                const wrapper = await response.json()
                if (Date.now() - wrapper.ts < ARTICLE_TTL_MS) {
                    result = wrapper.content
                } else {
                    await cache.delete(ARTICLE_CACHE_PREFIX + articleId)
                }
            }
        } catch {
            // Cache miss or corrupt — ignore
        }
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage(result)
        }
    }

    if (type === 'article-cache-put') {
        try {
            const cache = await caches.open(ARTICLE_CACHE_NAME)
            const wrapper = { ts: Date.now(), content }
            const response = new Response(JSON.stringify(wrapper), {
                headers: { 'Content-Type': 'application/json' },
            })
            await cache.put(ARTICLE_CACHE_PREFIX + articleId, response)

            // Evict oldest entries if over max
            const keys = await cache.keys()
            if (keys.length > ARTICLE_MAX_ENTRIES) {
                const entries = []
                for (const req of keys) {
                    const res = await cache.match(req)
                    if (res) {
                        try {
                            const w = await res.json()
                            entries.push({ url: req.url, ts: w.ts || 0 })
                        } catch {
                            await cache.delete(req)
                        }
                    }
                }
                entries.sort((a, b) => a.ts - b.ts)
                const toRemove = entries.slice(0, entries.length - ARTICLE_MAX_ENTRIES)
                for (const e of toRemove) {
                    await cache.delete(e.url)
                }
            }
        } catch {
            // Storage full or other error — ignore
        }
    }

    if (type === 'article-cache-list') {
        let ids = []
        try {
            const cache = await caches.open(ARTICLE_CACHE_NAME)
            const keys = await cache.keys()
            const now = Date.now()
            for (const req of keys) {
                const url = new URL(req.url)
                const idStr = url.pathname.replace(ARTICLE_CACHE_PREFIX, '')
                const res = await cache.match(req)
                if (res) {
                    try {
                        const wrapper = await res.json()
                        if (now - wrapper.ts < ARTICLE_TTL_MS) {
                            const parsed = Number(idStr)
                            ids.push(isNaN(parsed) ? idStr : parsed)
                        } else {
                            await cache.delete(req)
                        }
                    } catch {
                        await cache.delete(req)
                    }
                }
            }
        } catch {
            // ignore
        }
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage(ids)
        }
    }

    if (type === 'article-cache-clean') {
        try {
            const cache = await caches.open(ARTICLE_CACHE_NAME)
            const keys = await cache.keys()
            const now = Date.now()
            for (const req of keys) {
                const res = await cache.match(req)
                if (res) {
                    try {
                        const wrapper = await res.json()
                        if (now - wrapper.ts >= ARTICLE_TTL_MS) {
                            await cache.delete(req)
                        }
                    } catch {
                        await cache.delete(req)
                    }
                }
            }
        } catch {
            // ignore
        }
    }
})
