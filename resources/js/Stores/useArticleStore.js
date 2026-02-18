import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useArticleStore = defineStore('articles', () => {
    // --- State ---
    const articles = ref([])
    const contentCache = ref(new Map())
    const inFlightRequests = new Map() // not reactive, just tracking promises
    const activeView = ref({ type: 'all' })
    const loading = ref(false)
    const loaded = ref(false)
    const filterTitle = ref('All Feeds')

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
        return contentCache.value.get(id) ?? null
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

        loading.value = true
        activeView.value = view

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
            loaded.value = true
        } finally {
            loading.value = false
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

    function markRead(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article || article.is_read) return
        article.is_read = true
        article.read_at = new Date().toISOString()
        axios.patch(`/api/articles/${id}`, { is_read: true }).catch(() => {
            article.is_read = false
            article.read_at = null
        })
    }

    function markUnread(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article || !article.is_read) return
        article.is_read = false
        article.read_at = null
        axios.patch(`/api/articles/${id}`, { is_read: false }).catch(() => {
            article.is_read = true
        })
    }

    function toggleReadLater(id) {
        const article = articles.value.find(a => a.id === id)
        if (!article) return
        const was = article.is_read_later
        article.is_read_later = !was
        axios.patch(`/api/articles/${id}`, { is_read_later: !was }).catch(() => {
            article.is_read_later = was
        })
    }

    function markAllRead(feedId = null) {
        const targets = feedId
            ? articles.value.filter(a => a.feed_id === feedId && !a.is_read)
            : articles.value.filter(a => !a.is_read)

        targets.forEach(a => {
            a.is_read = true
            a.read_at = new Date().toISOString()
        })

        axios
            .post('/api/articles/mark-all-read', {
                feed_id: activeView.value.feedId ?? null,
                category_id: activeView.value.categoryId ?? null,
                filter: ['today', 'read_later'].includes(activeView.value.type)
                    ? activeView.value.type
                    : null,
            })
            .catch(() => {
                // Revert on failure
                targets.forEach(a => {
                    a.is_read = false
                    a.read_at = null
                })
            })
    }

    function forceRefresh() {
        loaded.value = false
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
        // getters
        unreadCount,
        readLaterCount,
        unreadByFeed,
        getContent,
        adjacentIds,
        // actions
        fetchArticles,
        fetchContent,
        prefetchAdjacent,
        markRead,
        markUnread,
        toggleReadLater,
        markAllRead,
        forceRefresh,
    }
})
