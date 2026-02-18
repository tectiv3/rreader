import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useSidebarStore = defineStore('sidebar', () => {
    const categories = ref([])
    const uncategorizedFeeds = ref([])
    const totalUnread = ref(0)
    const readLaterCount = ref(0)
    const todayCount = ref(0)
    const loaded = ref(false)

    function initialize(data) {
        categories.value = data.categories ?? []
        uncategorizedFeeds.value = data.uncategorizedFeeds ?? []
        totalUnread.value = data.totalUnread ?? 0
        readLaterCount.value = data.readLaterCount ?? 0
        todayCount.value = data.todayCount ?? 0
        loaded.value = true
    }

    async function fetchSidebar() {
        const response = await axios.get('/api/sidebar')
        categories.value = response.data.categories
        uncategorizedFeeds.value = response.data.uncategorizedFeeds
        totalUnread.value = response.data.totalUnread ?? 0
        readLaterCount.value = response.data.readLaterCount ?? 0
        todayCount.value = response.data.todayCount ?? 0
        loaded.value = true
    }

    function _findFeed(feedId) {
        for (const cat of categories.value) {
            const feed = cat.feeds.find(f => f.id === feedId)
            if (feed) return { feed, category: cat }
        }
        const feed = uncategorizedFeeds.value.find(f => f.id === feedId)
        return feed ? { feed, category: null } : null
    }

    function decrementFeedUnread(feedId, count = 1) {
        const result = _findFeed(feedId)
        if (!result) return
        result.feed.unread_count = Math.max(0, (result.feed.unread_count || 0) - count)
        if (result.category) {
            result.category.unread_count = Math.max(0, (result.category.unread_count || 0) - count)
        }
        totalUnread.value = Math.max(0, totalUnread.value - count)
    }

    function incrementFeedUnread(feedId, count = 1) {
        const result = _findFeed(feedId)
        if (!result) return
        result.feed.unread_count = (result.feed.unread_count || 0) + count
        if (result.category) {
            result.category.unread_count = (result.category.unread_count || 0) + count
        }
        totalUnread.value += count
    }

    function adjustReadLaterCount(delta) {
        readLaterCount.value = Math.max(0, readLaterCount.value + delta)
    }

    function adjustTodayCount(delta) {
        todayCount.value = Math.max(0, todayCount.value + delta)
    }

    return {
        categories,
        uncategorizedFeeds,
        totalUnread,
        readLaterCount,
        todayCount,
        loaded,
        initialize,
        fetchSidebar,
        decrementFeedUnread,
        incrementFeedUnread,
        adjustReadLaterCount,
        adjustTodayCount,
    }
})
