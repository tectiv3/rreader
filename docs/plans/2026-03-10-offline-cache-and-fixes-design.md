# Offline Cache & Mobile Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the iOS-purgeable SW Cache API article storage with durable IndexedDB, add scroll position restoration for articles, and disable accidental zoom on the mobile list view.

**Architecture:** New `useArticleCache.js` composable wraps IndexedDB for durable article content storage. The existing SW article cache (`sw-article-cache.js`) is removed entirely. Reading state is extended with `scrollTop`. CSS `touch-action` disables zoom on the list.

**Tech Stack:** IndexedDB (raw API), Vue 3 composables, CSS touch-action

---

### Task 1: Create IndexedDB article cache composable

**Files:**
- Create: `resources/js/Composables/useArticleCache.js`

**Step 1: Create the composable**

```js
// resources/js/Composables/useArticleCache.js
const DB_NAME = 'rreader'
const DB_VERSION = 1
const STORE_NAME = 'articles'

let dbPromise = null

function openDB() {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('cachedAt', 'cachedAt')
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
    return dbPromise
}

function tx(mode) {
    return openDB().then(db => db.transaction(STORE_NAME, mode).objectStore(STORE_NAME))
}

function reqToPromise(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

export async function idbGet(id) {
    try {
        const store = await tx('readonly')
        const row = await reqToPromise(store.get(id))
        return row ? row.content : null
    } catch {
        return null
    }
}

export async function idbPut(id, content) {
    try {
        const store = await tx('readwrite')
        await reqToPromise(store.put({
            id,
            content,
            cachedAt: Date.now(),
            isRead: false,
            readAt: null,
        }))
    } catch {
        // storage full or error — ignore
    }
}

export async function idbMarkRead(id) {
    try {
        const store = await tx('readwrite')
        const row = await reqToPromise(store.get(id))
        if (row) {
            row.isRead = true
            row.readAt = Date.now()
            await reqToPromise(store.put(row))
        }
    } catch {
        // ignore
    }
}

export async function idbList() {
    try {
        const store = await tx('readonly')
        const keys = await reqToPromise(store.getAllKeys())
        return keys
    } catch {
        return []
    }
}

// Evict articles that are both read AND older than 30 days
export async function idbCleanup() {
    try {
        const store = await tx('readwrite')
        const all = await reqToPromise(store.getAll())
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        for (const row of all) {
            if (row.isRead && row.cachedAt < thirtyDaysAgo) {
                store.delete(row.id)
            }
        }
    } catch {
        // ignore
    }
}
```

**Step 2: Commit**

```
git add resources/js/Composables/useArticleCache.js
git commit -m "Add IndexedDB article cache composable"
```

---

### Task 2: Migrate useArticleStore from SW cache to IndexedDB

**Files:**
- Modify: `resources/js/Stores/useArticleStore.js`

**Step 1: Replace SW cache functions with IndexedDB imports**

Remove the three `swCache*` functions at lines 6–46 and replace with:

```js
import { idbGet, idbPut, idbList, idbMarkRead, idbCleanup } from '@/Composables/useArticleCache.js'
```

**Step 2: Update `fetchContent` (lines 219–267)**

Replace the SW cache lookup with IndexedDB:

```js
async function fetchContent(id) {
    // 1. In-memory cache hit
    const cached = contentCache.value.get(id)
    if (cached) {
        contentCache.value.delete(id)
        contentCache.value.set(id, cached)
        return cached
    }

    // 2. In-flight dedup
    if (inFlightRequests.has(id)) {
        return inFlightRequests.get(id)
    }

    // 3. Try IndexedDB, then network, then list fallback
    const promise = (async () => {
        try {
            const idbCached = await idbGet(id)
            if (idbCached) {
                contentCache.value.set(id, idbCached)
                evictContentCache()
                return idbCached
            }

            // 4. Network fetch (skip if offline)
            if (navigator.onLine) {
                const res = await axios.get(`/api/articles/${id}`)
                const content = res.data
                contentCache.value.set(id, content)
                await idbPut(id, content)
                evictContentCache()
                return content
            }

            // 5. Offline fallback: construct from article list data
            const listArticle = articles.value.find(a => a.id === id)
            if (listArticle) {
                return { ...listArticle, _offline: true }
            }

            throw new Error('Article not available offline')
        } finally {
            inFlightRequests.delete(id)
        }
    })()

    inFlightRequests.set(id, promise)
    return promise
}
```

**Step 3: Update `warmCache` (lines 277–302)**

Replace `swCacheList()` with `idbList()` and `swCachePut()` with `idbPut()`:

```js
async function warmCache() {
    const gen = ++warmGeneration
    const cachedIds = new Set(await idbList())
    if (gen !== warmGeneration) return

    const toWarm = articles.value
        .filter(a => !a.is_read && !contentCache.value.has(a.id) && !cachedIds.has(a.id))
        .map(a => a.id)
        .slice(0, 50)
    if (toWarm.length === 0) return

    for (let i = 0; i < toWarm.length; i++) {
        if (gen !== warmGeneration) return
        const id = toWarm[i]
        try {
            const res = await axios.get(`/api/articles/${id}`)
            if (i < WARM_INMEMORY) {
                contentCache.value.set(id, res.data)
                evictContentCache()
            }
            await idbPut(id, res.data)
        } catch {
            return
        }
    }
}
```

**Step 4: Update `markRead` (line 314–328)**

Add `idbMarkRead(id)` call after the optimistic update:

```js
function markRead(id) {
    const article = articles.value.find(a => a.id === id)
    if (!article || article.is_read) return
    article.is_read = true
    article.read_at = new Date().toISOString()
    const sidebar = useSidebarStore()
    sidebar.decrementFeedUnread(article.feed_id)
    if (_isToday(article.published_at)) sidebar.adjustTodayCount(-1)
    idbMarkRead(id)
    axios.patch(`/api/articles/${id}`, { is_read: true }).catch(() => {
        article.is_read = false
        article.read_at = null
        sidebar.incrementFeedUnread(article.feed_id)
        if (_isToday(article.published_at)) sidebar.adjustTodayCount(1)
    })
}
```

**Step 5: Commit**

```
git add resources/js/Stores/useArticleStore.js
git commit -m "Migrate article cache from SW Cache API to IndexedDB"
```

---

### Task 3: Remove SW article cache and update app.js

**Files:**
- Delete: `public/sw-article-cache.js`
- Modify: `resources/js/app.js` (lines 29–32)
- Modify: `vite.config.js` (line 79)

**Step 1: Remove the article-cache-clean message from app.js**

Remove lines 29–32:

```js
// DELETE these lines:
// Evict expired article cache entries on app open
window.__swReady.then(sw => {
    if (sw) sw.postMessage({ type: 'article-cache-clean' })
})
```

Replace with IndexedDB cleanup:

```js
// Evict read articles older than 30 days from IndexedDB
import { idbCleanup } from '@/Composables/useArticleCache.js'
idbCleanup()
```

**Step 2: Remove sw-article-cache.js from vite workbox importScripts**

In `vite.config.js` line 79, remove `'/sw-article-cache.js'` from the `importScripts` array:

```js
importScripts: [
    '/sw-reading-state.js',
    '/sw-share-target.js',
],
```

**Step 3: Delete the SW article cache file**

```
rm public/sw-article-cache.js
```

**Step 4: Commit**

```
git add resources/js/app.js vite.config.js
git rm public/sw-article-cache.js
git commit -m "Remove SW article cache, use IndexedDB cleanup on boot"
```

---

### Task 4: Add scroll position to reading state

**Files:**
- Modify: `resources/js/Views/ArticleDetailView.vue` (lines 45–66, 71–106)
- Modify: `resources/js/Views/ArticleListView.vue` (lines 165–188)
- Modify: `resources/js/app.js` (lines 37–74)

**Step 1: Extend saveReadingState in ArticleDetailView to include scrollTop**

In `ArticleDetailView.vue`, modify `saveReadingState` (lines 48–55) and add throttled scroll saving:

```js
// --- Reading state persistence (restore article on app reopen) ---
const READING_STATE_KEY = 'rreader-reading-state'

function saveReadingState(url, scrollTop = 0) {
    const state = { url, scrollTop }
    try {
        localStorage.setItem(READING_STATE_KEY, JSON.stringify(state))
    } catch {}
    window.__swReady?.then(sw => {
        if (sw) sw.postMessage({ type: 'save-reading-state', state })
    })
}
```

**Step 2: Add throttled scroll listener in ArticleDetailView**

After `loadArticle` function (around line 106), add scroll tracking:

```js
let scrollSaveTimer = null

function onArticleScroll() {
    if (!article.value) return
    clearTimeout(scrollSaveTimer)
    scrollSaveTimer = setTimeout(() => {
        const top = isMobile.value && scrollContainer.value
            ? scrollContainer.value.scrollTop
            : window.scrollY
        saveReadingState(`/articles/${article.value.id}`, top)
    }, 500)
}

onMounted(() => {
    // existing mount code stays...
    window.addEventListener('scroll', onArticleScroll, { passive: true })
})

onUnmounted(() => {
    // existing unmount code stays...
    window.removeEventListener('scroll', onArticleScroll)
    clearTimeout(scrollSaveTimer)
})
```

Also attach `@scroll="onArticleScroll"` to the mobile `scrollContainer` div in the template (line 681).

**Step 3: Restore scroll position after article loads**

In `loadArticle` function, after content loads successfully (line 98), restore scroll from reading state:

```js
// After article content loads and renders:
try {
    const raw = localStorage.getItem(READING_STATE_KEY)
    const state = raw ? JSON.parse(raw) : null
    if (state?.scrollTop && state.url === `/articles/${numId}`) {
        await nextTick()
        // Small delay for content to render
        setTimeout(() => {
            if (isMobile.value && scrollContainer.value) {
                scrollContainer.value.scrollTop = state.scrollTop
            } else {
                window.scrollTo(0, state.scrollTop)
            }
        }, 100)
    }
} catch {}
```

**Step 4: Reset scroll position only when navigating to a DIFFERENT article**

The current line 73–74 resets scroll to 0 on every `loadArticle` call. This is correct for new articles but must not fire when restoring. The restore logic in Step 3 runs after content loads, so the initial reset is fine — the restore will override it.

**Step 5: Update ArticleListView saveReadingState for consistency**

In `ArticleListView.vue` line 168, the desktop inline reading state doesn't need scroll tracking (the desktop panel has its own scroll context and the user asked about article content scroll). No changes needed here.

**Step 6: Commit**

```
git add resources/js/Views/ArticleDetailView.vue
git commit -m "Save and restore article scroll position on app restart"
```

---

### Task 5: Disable zoom on mobile article list

**Files:**
- Modify: `resources/js/Views/ArticleListView.vue` (template section)

**Step 1: Find the scrollable article list container**

Look for the article list's scrollable wrapper in the template. Add `touch-action: pan-y` to prevent pinch-zoom and double-tap-zoom while allowing vertical scroll.

Add the CSS class to the outer list container div:

```css
/* In the component's <style> block or as an inline style */
.article-list-nozoom {
    touch-action: pan-y;
}
```

Add this class to the scrollable article list wrapper element in the template.

**Step 2: Commit**

```
git add resources/js/Views/ArticleListView.vue
git commit -m "Disable pinch-zoom on mobile article list"
```

---

### Task 6: Build and verify

**Step 1: Run the build**

```
yarn build
```

Expected: No build errors.

**Step 2: Manual verification checklist**

- [ ] Open app, verify articles load and warm cache writes to IndexedDB (check DevTools > Application > IndexedDB > rreader > articles)
- [ ] Open an article, scroll down, close the PWA, reopen — scroll position should restore
- [ ] Kill the PWA from iOS app switcher, reopen — cached articles should still be in IndexedDB
- [ ] On mobile list view, attempt pinch-to-zoom — should be disabled
- [ ] On article detail view, attempt pinch-to-zoom — should still work

**Step 3: Format**

```
prettier --write resources/js/Composables/useArticleCache.js resources/js/Stores/useArticleStore.js resources/js/Views/ArticleDetailView.vue resources/js/Views/ArticleListView.vue resources/js/app.js
```

**Step 4: Final commit**

```
git add -A
git commit -m "Format code after offline cache migration"
```
