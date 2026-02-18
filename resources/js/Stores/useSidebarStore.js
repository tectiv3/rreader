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
        loaded.value = true
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
    }
})
