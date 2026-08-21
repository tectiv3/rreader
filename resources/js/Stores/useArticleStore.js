import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import {
    enqueue,
    sendRequest,
    flushQueue,
    queuedCount,
} from '@/Composables/useOfflineQueue.js'
import {
    idbGet,
    idbPut,
    idbList,
    idbMarkRead,
    idbUpdateMeta,
    idbGetList,
    idbPutList,
} from '@/Composables/useArticleCache.js'

export const useArticleStore = defineStore('articles', () => {
    // --- State ---
    const articles = ref([])
    const contentCache = ref(new Map())
    const inFlightRequests = new Map() // not reactive, just tracking promises
    const activeView = ref({ type: 'all' })
    const loading = ref(false)
    const loaded = ref(false)
    const filterTitle = ref('All Feeds')
    const hasMore = ref(false)
    const nextCursor = ref(null)
    const loadingMore = ref(false)
    const showingCached = ref(false) // list came from the offline snapshot, not the API
    const loadError = ref(null) // 'offline' | 'server' when the list couldn't be shown
    const viewCache = new Map() // per-view article list cache

    const CONTENT_CACHE_MAX = 20
    let warmGeneration = 0
    let fetchGeneration = 0

    // --- Getters ---
    const unreadCount = computed(() => articles.value.filter(a => !a.is_read).length)

    const readLaterCount = computed(() => articles.value.filter(a => a.is_read_later).length)

    const unreadByFeed = computed(() => {
        const counts = {}
        for (const a of articles.value) {
            if (!a.is_read) {
                counts[a.feed_id] = (counts[a.feed_id] || 0) + 1
            }
        }
        return counts
    })

    function getContent(id) {
        return contentCache.value.get(id) || null
    }

    function adjacentIds(id) {
        const idx = articles.value.findIndex(a => a.id === id)
        if (idx === -1) return { prev: null, next: null }
        return {
            prev: idx > 0 ? articles.value[idx - 1].id : null,
            next: idx < articles.value.length - 1 ? articles.value[idx + 1].id : null,
        }
    }

    // --- Actions ---

    /**
     * Send an optimistic update to the API. When the request never reaches the
     * server (offline, flaky connection) the change is queued for replay instead
     * of being rolled back, so reading offline doesn't visibly undo itself.
     *
     * Pass `queueable: false` for a write whose meaning depends on when it runs —
     * those roll back on any failure rather than replaying against a server whose
     * state has moved on.
     */
    function persist(method, url, data, revert, { queueable = true } = {}) {
        if (!queueable) {
            return sendRequest({ method, url, data }).catch(() => revert?.())
        }

        // A non-empty queue may already hold an older write for this same URL.
        // Firing directly would race the replay, and the stale queued value can
        // land last — leaving the server disagreeing with the screen, with both
        // requests returning 2xx so nothing rolls back.
        if (!navigator.onLine || queuedCount() > 0) {
            enqueue(method, url, data)
            if (navigator.onLine) flushQueue()
            return Promise.resolve()
        }

        return sendRequest({ method, url, data }).catch(e => {
            if (!e.response) {
                enqueue(method, url, data)
                return
            }
            revert?.()
        })
    }

    // View types that map to a `filter` query param. Kept here so adding one can't
    // be half-applied: every request the store makes builds its params from this.
    const FILTER_TYPES = ['today', 'read_later', 'recently_read']

    function viewParams(view) {
        const params = new URLSearchParams()
        if (view.feedId) params.set('feed_id', view.feedId)
        if (view.categoryId) params.set('category_id', view.categoryId)
        if (FILTER_TYPES.includes(view.type)) params.set('filter', view.type)
        if (view.showAll) params.set('show_all', '1')
        return params
    }

    // Show-all gets its own key: the list includes read articles, so caching it
    // over the unread view's key would resurrect them on the next visit and, via
    // scheduleSnapshot, persist them to IndexedDB for offline too.
    function viewKey(view) {
        const base = view.feedId
            ? `feed:${view.feedId}`
            : view.categoryId
              ? `category:${view.categoryId}`
              : view.type
        return view.showAll ? `${base}:all` : base
    }

    /**
     * Persist a list for offline use. Called after a successful fetch and after
     * optimistic mutations, so an offline reload doesn't resurrect articles the
     * reader already marked read. Takes the list explicitly: the caller decides
     * what is being saved, rather than this racing whatever is on screen now.
     */
    function saveSnapshot(key, list) {
        idbPutList(key, {
            // Plain copy: IndexedDB can't store Vue's reactive proxies
            articles: JSON.parse(JSON.stringify(list)),
            filterTitle: filterTitle.value,
        })
    }

    // Mutations arrive in bursts (mark-all-read, scroll-driven progress saves), so
    // coalesce them into one write rather than re-serialising the list each time.
    //
    // Keyed by view, not one shared timer: a shared one is cleared by whichever
    // view schedules next, so switching views inside the debounce window dropped
    // the outgoing view's write entirely and an offline reload resurrected the
    // articles it had just marked read.
    const snapshotTimers = new Map()
    function scheduleSnapshot() {
        const key = viewKey(activeView.value)
        clearTimeout(snapshotTimers.get(key))
        snapshotTimers.set(
            key,
            setTimeout(() => {
                snapshotTimers.delete(key)
                // A view switch or a fetch in flight means `articles` no longer holds
                // what we set out to save — writing it now would clobber a good
                // snapshot with another view's list, or with an empty mid-fetch one.
                if (!loaded.value || loading.value) return
                if (key !== viewKey(activeView.value)) return
                saveSnapshot(key, articles.value)
            }, 1000)
        )
    }

    /**
     * Apply a field change to every other copy of an article.
     *
     * Each view holds articles from its own API response, so article 42 in the
     * `all` view and in `feed:3` are different objects. Without this, marking it
     * read in one view leaves the others showing it unread — and the next
     * scheduleSnapshot() persists that stale copy to IndexedDB, so the
     * disagreement survives reloads and is what the reader sees offline.
     */
    function syncArticleCopies(id, fields) {
        for (const entry of viewCache.values()) {
            const copy = entry.articles.find(a => a.id === id)
            if (copy) Object.assign(copy, fields)
        }
        const content = contentCache.value.get(id)
        if (content) Object.assign(content, fields)
    }

    function saveViewToCache() {
        if (!loaded.value || articles.value.length === 0) return
        const key = viewKey(activeView.value)
        viewCache.set(key, {
            articles: articles.value,
            filterTitle: filterTitle.value,
            hasMore: hasMore.value,
            nextCursor: nextCursor.value,
        })
    }

    async function fetchArticles(view) {
        // Don't refetch if same view is already loaded
        if (
            loaded.value &&
            activeView.value.type === view.type &&
            activeView.value.feedId === view.feedId &&
            activeView.value.categoryId === view.categoryId &&
            !activeView.value.showAll === !view.showAll
        ) {
            return
        }

        // Save current view before switching
        saveViewToCache()

        // Restore from cache if available
        const key = viewKey(view)
        const cached = viewCache.get(key)
        if (cached) {
            articles.value = cached.articles
            filterTitle.value = cached.filterTitle
            hasMore.value = cached.hasMore
            nextCursor.value = cached.nextCursor
            activeView.value = view
            loaded.value = true
            // This view holds live data from its own fetch — don't let a failure on
            // the view we came from keep the "viewing cached content" banner up.
            showingCached.value = false
            loadError.value = null
            return
        }

        // Each fetch claims a generation. Switching views mid-flight bumps it, and
        // every resumption point below bails so the outgoing view can't write its
        // articles — or drop the loading flag — over the incoming one.
        const gen = ++fetchGeneration

        loading.value = true
        articles.value = []
        activeView.value = view
        nextCursor.value = null
        hasMore.value = false
        loadError.value = null
        showingCached.value = false

        const params = viewParams(view)

        try {
            const response = await axios.get('/api/articles?' + params.toString())
            if (gen !== fetchGeneration) return

            articles.value = response.data.articles
            filterTitle.value = response.data.filter_title
            hasMore.value = response.data.has_more
            nextCursor.value = response.data.next_cursor
            loaded.value = true
            showingCached.value = false
            // Empty lists are saved too — a view the reader emptied should come back
            // empty offline, not resurrect the articles it used to hold.
            saveSnapshot(key, response.data.articles)
        } catch (e) {
            // Never rethrow — callers chain on this and an offline reader is a normal
            // state, not an error.
            if (gen !== fetchGeneration) return

            hasMore.value = false
            nextCursor.value = null

            // A response with a status means the server answered: the session
            // expired, or something is broken. Serving a stale snapshot there would
            // present wrong data as if it were fine, so surface it instead.
            if (e.response) {
                loadError.value = 'server'
                return
            }

            // The request never reached the server: fall back to the last snapshot
            // of this view so the list still renders instead of coming up empty.
            const snapshot = await idbGetList(key)
            if (gen !== fetchGeneration) return

            // A snapshot of an empty view is still a snapshot: restore it and say
            // the data is cached, rather than claiming the view was never opened.
            if (snapshot) {
                articles.value = snapshot.articles
                filterTitle.value = snapshot.filterTitle
                loaded.value = true
                showingCached.value = true
            } else {
                loadError.value = 'offline'
            }
        } finally {
            if (gen === fetchGeneration) loading.value = false
        }
    }

    async function showAllArticles() {
        // Carry the whole view across, not a hand-picked subset: dropping the
        // filter here sent an unfiltered request from the recently-read view and
        // replaced the list with every article in the account.
        const view = { ...activeView.value, showAll: true }
        const params = viewParams(view)

        // Bump, don't just read: this is a fresh load the reader asked for, so it
        // supersedes any fetch still in flight — and a view switch after this one
        // supersedes it in turn. Whichever the reader triggered last wins.
        const gen = ++fetchGeneration

        loading.value = true
        try {
            const response = await axios.get('/api/articles?' + params.toString())
            if (gen !== fetchGeneration) return

            articles.value = response.data.articles
            filterTitle.value = response.data.filter_title
            hasMore.value = response.data.has_more
            nextCursor.value = response.data.next_cursor
            activeView.value = view
            loaded.value = true
            showingCached.value = false
            loadError.value = null
            saveSnapshot(viewKey(view), response.data.articles)
        } catch {
            // Offline — keep the unread list that's already on screen
        } finally {
            if (gen === fetchGeneration) loading.value = false
        }
    }

    async function loadMore() {
        if (!hasMore.value || loadingMore.value || !nextCursor.value) return
        if (!navigator.onLine) return
        loadingMore.value = true
        try {
            const params = viewParams(activeView.value)
            params.set('cursor', nextCursor.value)

            const response = await axios.get('/api/articles?' + params.toString())
            articles.value = [...articles.value, ...response.data.articles]
            hasMore.value = response.data.has_more
            nextCursor.value = response.data.next_cursor
        } catch {
            // Keep what's already on screen and stop paginating — the sentinel would
            // otherwise retry in a tight loop while the connection is down. A refresh
            // (or switching views) starts pagination over.
            hasMore.value = false
        } finally {
            loadingMore.value = false
        }
    }

    function evictContentCache() {
        while (contentCache.value.size > CONTENT_CACHE_MAX) {
            const firstKey = contentCache.value.keys().next().value
            contentCache.value.delete(firstKey)
        }
    }

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

        // 3. Try IndexedDB cache, then network, then list fallback
        const promise = (async () => {
            try {
                const swCached = await idbGet(id)
                // A partial record is list metadata stored when the body couldn't
                // be fetched. Good enough to reopen a bookmark offline, but online
                // we still want the real article, so don't let it satisfy the read.
                if (swCached && !(swCached._partial && navigator.onLine)) {
                    // IDB caches article body but user state may be stale —
                    // overlay fresh metadata from the list if available
                    const listArticle = articles.value.find(a => a.id === id)
                    if (listArticle) {
                        swCached.is_read_later = listArticle.is_read_later
                        swCached.is_read = listArticle.is_read
                        if (listArticle.reading_progress != null) {
                            swCached.reading_progress = listArticle.reading_progress
                        }
                    }
                    contentCache.value.set(id, swCached)
                    evictContentCache()
                    return swCached
                }

                // 4. Network fetch (skip if offline)
                if (navigator.onLine) {
                    try {
                        const res = await axios.get(`/api/articles/${id}`)
                        const content = res.data
                        contentCache.value.set(id, content)
                        await idbPut(id, content)
                        evictContentCache()
                        return content
                    } catch (e) {
                        // Fall through to the offline fallback below only when the
                        // request never reached the server; a real 404/403 is final.
                        if (e.response) throw e
                    }
                }

                // 5. Offline fallback: construct from article list data, and
                // persist it. A bookmark has to reopen after a cold boot, and on a
                // cold boot the list isn't in memory yet — so without this, an
                // article first opened offline has no record anywhere and the
                // reader loses their place for good.
                const listArticle = articles.value.find(a => a.id === id)
                if (listArticle) {
                    const partial = { ...listArticle, _offline: true, _partial: true }
                    await idbPut(id, partial)
                    contentCache.value.set(id, partial)
                    evictContentCache()
                    return partial
                }

                throw new Error('Article not available offline')
            } finally {
                inFlightRequests.delete(id)
            }
        })()

        inFlightRequests.set(id, promise)
        return promise
    }

    function prefetchAdjacent(id) {
        const { prev, next } = adjacentIds(id)
        if (next) fetchContent(next).catch(() => {})
        if (prev) fetchContent(prev).catch(() => {})
    }

    function cancelWarmCache() {
        warmGeneration++
    }

    // Warm caches: first few go to in-memory (instant tap), rest to SW only (offline)
    const WARM_INMEMORY = 5
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

    function _isToday(dateString) {
        const d = new Date(dateString)
        const now = new Date()
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
        )
    }

    function markRead(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article || article.is_read) return
        article.is_read = true
        article.read_at = new Date().toISOString()
        const sidebar = useSidebarStore()
        sidebar.decrementFeedUnread(article.feed_id)
        if (_isToday(article.published_at)) sidebar.adjustTodayCount(-1)
        idbMarkRead(id)
        syncArticleCopies(id, { is_read: true, read_at: article.read_at })
        scheduleSnapshot()
        persist('patch', `/api/articles/${id}`, { is_read: true }, () => {
            article.is_read = false
            article.read_at = null
            syncArticleCopies(id, { is_read: false, read_at: null })
            sidebar.incrementFeedUnread(article.feed_id)
            if (_isToday(article.published_at)) sidebar.adjustTodayCount(1)
        })
    }

    function markUnread(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article || !article.is_read) return
        article.is_read = false
        article.read_at = null
        const sidebar = useSidebarStore()
        sidebar.incrementFeedUnread(article.feed_id)
        if (_isToday(article.published_at)) sidebar.adjustTodayCount(1)
        syncArticleCopies(id, { is_read: false, read_at: null })
        scheduleSnapshot()
        persist('patch', `/api/articles/${id}`, { is_read: false }, () => {
            article.is_read = true
            syncArticleCopies(id, { is_read: true })
            sidebar.decrementFeedUnread(article.feed_id)
            if (_isToday(article.published_at)) sidebar.adjustTodayCount(-1)
        })
    }

    function toggleReadLater(id, currentProgress = null) {
        const article = articles.value.find(a => a.id === id)
        if (!article) return
        const was = article.is_read_later
        article.is_read_later = !was
        const sidebar = useSidebarStore()
        sidebar.adjustReadLaterCount(was ? -1 : 1)

        const payload = { is_read_later: !was }
        const idbFields = { is_read_later: !was }
        if (!was && currentProgress !== null) {
            payload.reading_progress = currentProgress
            article.reading_progress = currentProgress
            idbFields.reading_progress = currentProgress
        }

        idbUpdateMeta(id, idbFields)
        syncArticleCopies(id, idbFields)
        scheduleSnapshot()

        persist('patch', `/api/articles/${id}`, payload, () => {
            article.is_read_later = was
            syncArticleCopies(id, { is_read_later: was })
            sidebar.adjustReadLaterCount(was ? 1 : -1)
        })
    }

    function saveReadingProgress(id, progress) {
        const article = articles.value.find(a => a.id === id)
        if (article) article.reading_progress = progress
        syncArticleCopies(id, { reading_progress: progress })
        idbUpdateMeta(id, { reading_progress: progress })
        scheduleSnapshot()
        persist('patch', `/api/articles/${id}`, { reading_progress: progress })
    }

    /**
     * Mark every unread article in the current view as read.
     *
     * Needs a live connection, and says so by returning false when there isn't
     * one. The API takes a filter, not a list of ids, and resolves it server-side
     * at request time — so a queued replay hours later would also mark everything
     * the feed fetched in the meantime, articles the reader never saw.
     *
     * @returns {boolean} whether the request was made
     */
    function markAllRead(feedId = null) {
        if (!navigator.onLine) return false

        const targets = feedId
            ? articles.value.filter(a => a.feed_id === feedId && !a.is_read)
            : articles.value.filter(a => !a.is_read)

        const feedCounts = {}
        let todayDelta = 0
        targets.forEach(a => {
            feedCounts[a.feed_id] = (feedCounts[a.feed_id] || 0) + 1
            if (_isToday(a.published_at)) todayDelta++
        })

        targets.forEach(a => {
            a.is_read = true
            a.read_at = new Date().toISOString()
        })

        const sidebar = useSidebarStore()
        for (const [fid, count] of Object.entries(feedCounts)) {
            sidebar.decrementFeedUnread(Number(fid), count)
        }
        if (todayDelta) sidebar.adjustTodayCount(-todayDelta)
        scheduleSnapshot()

        persist(
            'post',
            '/api/articles/mark-all-read',
            {
                feed_id: activeView.value.feedId || null,
                category_id: activeView.value.categoryId || null,
                // Only 'today' — the API ignores any other filter, and an ignored
                // filter widens the scope instead of narrowing it.
                filter: activeView.value.type === 'today' ? 'today' : null,
            },
            () => {
                targets.forEach(a => {
                    a.is_read = false
                    a.read_at = null
                })
                for (const [fid, count] of Object.entries(feedCounts)) {
                    sidebar.incrementFeedUnread(Number(fid), count)
                }
                if (todayDelta) sidebar.adjustTodayCount(todayDelta)
            },
            // Never queue: the API resolves the filter server-side at request
            // time, so a replay marks whatever the feed has fetched since.
            { queueable: false }
        )

        return true
    }

    function dismissArticle(id) {
        const idx = articles.value.findIndex(a => a.id === id)
        if (idx === -1) return
        const article = articles.value[idx]
        const wasUnread = !article.is_read
        const feedId = article.feed_id
        const pubToday = _isToday(article.published_at)

        articles.value.splice(idx, 1)
        scheduleSnapshot()

        if (wasUnread) {
            const sidebar = useSidebarStore()
            sidebar.decrementFeedUnread(feedId)
            if (pubToday) sidebar.adjustTodayCount(-1)
            persist('patch', `/api/articles/${id}`, { is_read: true })
        }
    }

    function forceRefresh() {
        viewCache.clear()
        loaded.value = false
        nextCursor.value = null
        hasMore.value = false
        return fetchArticles(activeView.value)
    }

    return {
        // state
        articles,
        contentCache,
        activeView,
        loading,
        loaded,
        filterTitle,
        hasMore,
        loadingMore,
        nextCursor,
        showingCached,
        loadError,
        // getters
        unreadCount,
        readLaterCount,
        unreadByFeed,
        getContent,
        adjacentIds,
        // actions
        fetchArticles,
        showAllArticles,
        loadMore,
        fetchContent,
        prefetchAdjacent,
        warmCache,
        cancelWarmCache,
        markRead,
        markUnread,
        toggleReadLater,
        saveReadingProgress,
        markAllRead,
        dismissArticle,
        forceRefresh,
    }
})
