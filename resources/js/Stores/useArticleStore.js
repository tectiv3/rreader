import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'

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
    const viewCache = new Map() // per-view article list cache

    const CONTENT_CACHE_MAX = 20

    // --- Getters ---
    const unreadCount = computed(() =>
        articles.value.filter(a => !a.is_read).length
    )

    const readLaterCount = computed(() =>
        articles.value.filter(a => a.is_read_later).length
    )

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
    function viewKey(view) {
        if (view.feedId) return `feed:${view.feedId}`
        if (view.categoryId) return `category:${view.categoryId}`
        return view.type
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
            activeView.value.categoryId === view.categoryId
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
            return
        }

        loading.value = true
        articles.value = []
        activeView.value = view
        nextCursor.value = null
        hasMore.value = false

        const params = new URLSearchParams()
        if (view.feedId) params.set('feed_id', view.feedId)
        if (view.categoryId) params.set('category_id', view.categoryId)
        if (view.type === 'today') params.set('filter', 'today')
        if (view.type === 'read_later') params.set('filter', 'read_later')
        if (view.type === 'recently_read') params.set('filter', 'recently_read')

        try {
            const response = await axios.get('/api/articles?' + params.toString())
            articles.value = response.data.articles
            filterTitle.value = response.data.filter_title
            hasMore.value = response.data.has_more
            nextCursor.value = response.data.next_cursor
            loaded.value = true
        } finally {
            loading.value = false
        }
    }

    async function showAllFeedArticles() {
        const view = activeView.value
        if (!view.feedId) return

        loading.value = true
        articles.value = []
        nextCursor.value = null
        hasMore.value = false

        const params = new URLSearchParams()
        params.set('feed_id', view.feedId)
        params.set('show_all', '1')

        try {
            const response = await axios.get('/api/articles?' + params.toString())
            articles.value = response.data.articles
            filterTitle.value = response.data.filter_title
            hasMore.value = response.data.has_more
            nextCursor.value = response.data.next_cursor
            loaded.value = true
        } finally {
            loading.value = false
        }
    }

    async function loadMore() {
        if (!hasMore.value || loadingMore.value || !nextCursor.value) return
        loadingMore.value = true
        try {
            const params = new URLSearchParams()
            if (activeView.value.feedId) params.set('feed_id', activeView.value.feedId)
            if (activeView.value.categoryId) params.set('category_id', activeView.value.categoryId)
            if (activeView.value.type === 'today') params.set('filter', 'today')
            if (activeView.value.type === 'read_later') params.set('filter', 'read_later')
            if (activeView.value.type === 'recently_read') params.set('filter', 'recently_read')
            params.set('cursor', nextCursor.value)

            const response = await axios.get('/api/articles?' + params.toString())
            articles.value = [...articles.value, ...response.data.articles]
            hasMore.value = response.data.has_more
            nextCursor.value = response.data.next_cursor
        } finally {
            loadingMore.value = false
        }
    }

    async function fetchContent(id) {
        // 1. Cache hit
        const cached = contentCache.value.get(id)
        if (cached) {
            // Move to end (most recently used)
            contentCache.value.delete(id)
            contentCache.value.set(id, cached)
            return cached
        }

        // 2. In-flight dedup
        if (inFlightRequests.has(id)) {
            return inFlightRequests.get(id)
        }

        // 3. Fetch
        const promise = axios
            .get(`/api/articles/${id}`)
            .then(res => {
                const content = res.data
                contentCache.value.set(id, content)

                // Evict LRU if over max
                if (contentCache.value.size > CONTENT_CACHE_MAX) {
                    const firstKey = contentCache.value.keys().next().value
                    contentCache.value.delete(firstKey)
                }

                inFlightRequests.delete(id)
                return content
            })
            .catch(err => {
                inFlightRequests.delete(id)
                throw err
            })

        inFlightRequests.set(id, promise)
        return promise
    }

    function prefetchAdjacent(id) {
        const { prev, next } = adjacentIds(id)
        if (next) fetchContent(next).catch(() => {})
        if (prev) fetchContent(prev).catch(() => {})
    }

    function _isToday(dateString) {
        const d = new Date(dateString)
        const now = new Date()
        return d.getFullYear() === now.getFullYear()
            && d.getMonth() === now.getMonth()
            && d.getDate() === now.getDate()
    }

    function markRead(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article || article.is_read) return
        article.is_read = true
        article.read_at = new Date().toISOString()
        const sidebar = useSidebarStore()
        sidebar.decrementFeedUnread(article.feed_id)
        if (_isToday(article.published_at)) sidebar.adjustTodayCount(-1)
        axios.patch(`/api/articles/${id}`, { is_read: true }).catch(() => {
            article.is_read = false
            article.read_at = null
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
        axios.patch(`/api/articles/${id}`, { is_read: false }).catch(() => {
            article.is_read = true
            sidebar.decrementFeedUnread(article.feed_id)
            if (_isToday(article.published_at)) sidebar.adjustTodayCount(-1)
        })
    }

    function toggleReadLater(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article) return
        const was = article.is_read_later
        article.is_read_later = !was
        const sidebar = useSidebarStore()
        sidebar.adjustReadLaterCount(was ? -1 : 1)
        axios.patch(`/api/articles/${id}`, { is_read_later: !was }).catch(() => {
            article.is_read_later = was
            sidebar.adjustReadLaterCount(was ? 1 : -1)
        })
    }

    function markAllRead(feedId = null) {
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

        axios
            .post('/api/articles/mark-all-read', {
                feed_id: activeView.value.feedId || null,
                category_id: activeView.value.categoryId || null,
                filter: ['today', 'read_later'].includes(activeView.value.type)
                    ? activeView.value.type
                    : null,
            })
            .catch(() => {
                targets.forEach(a => {
                    a.is_read = false
                    a.read_at = null
                })
                for (const [fid, count] of Object.entries(feedCounts)) {
                    sidebar.incrementFeedUnread(Number(fid), count)
                }
                if (todayDelta) sidebar.adjustTodayCount(todayDelta)
            })
    }

    function dismissArticle(id) {
        const idx = articles.value.findIndex(a => a.id === id)
        if (idx === -1) return
        const article = articles.value[idx]
        const wasUnread = !article.is_read
        const feedId = article.feed_id
        const pubToday = _isToday(article.published_at)

        articles.value.splice(idx, 1)

        if (wasUnread) {
            const sidebar = useSidebarStore()
            sidebar.decrementFeedUnread(feedId)
            if (pubToday) sidebar.adjustTodayCount(-1)
            axios.patch(`/api/articles/${id}`, { is_read: true }).catch(() => {})
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
        // getters
        unreadCount,
        readLaterCount,
        unreadByFeed,
        getContent,
        adjacentIds,
        // actions
        fetchArticles,
        showAllFeedArticles,
        loadMore,
        fetchContent,
        prefetchAdjacent,
        markRead,
        markUnread,
        toggleReadLater,
        markAllRead,
        dismissArticle,
        forceRefresh,
    }
})
