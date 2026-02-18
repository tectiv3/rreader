import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

    // --- Actions (stubs for now) ---
    async function fetchArticles(view) {
        // TODO: Phase 2
    }

    async function fetchContent(id) {
        // TODO: Phase 2
    }

    function prefetchAdjacent(id) {
        // TODO: Phase 2
    }

    function markRead(id) {
        // TODO: Phase 3
    }

    function markUnread(id) {
        // TODO: Phase 3
    }

    function toggleReadLater(id) {
        // TODO: Phase 3
    }

    function markAllRead(feedId = null) {
        // TODO: Phase 3
    }

    function forceRefresh() {
        // TODO: Phase 3
    }

    return {
        // state
        articles, contentCache, activeView, loading, loaded, filterTitle,
        // getters
        unreadCount, readLaterCount, unreadByFeed,
        getContent, adjacentIds,
        // actions
        fetchArticles, fetchContent, prefetchAdjacent,
        markRead, markUnread, toggleReadLater, markAllRead, forceRefresh,
    }
})
