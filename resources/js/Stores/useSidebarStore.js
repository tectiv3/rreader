import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
    const categories = ref([])
    const uncategorizedFeeds = ref([])
    const loaded = ref(false)

    function initialize(data) {
        categories.value = data.categories ?? []
        uncategorizedFeeds.value = data.uncategorizedFeeds ?? []
        loaded.value = true
    }

    async function fetchSidebar() {
        // TODO: Phase 2
    }

    return { categories, uncategorizedFeeds, loaded, initialize, fetchSidebar }
})
