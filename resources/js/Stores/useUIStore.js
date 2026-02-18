import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const sidebarOpen = ref(false)

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value
    }

    function closeSidebar() {
        sidebarOpen.value = false
    }

    return { sidebarOpen, toggleSidebar, closeSidebar }
})
