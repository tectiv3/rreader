<script setup>
import AppLayout from '@/Views/AppLayout.vue'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'

const props = defineProps({
    initialSidebar: { type: Object, default: () => ({}) },
    user: { type: Object, required: true },
})

const sidebarStore = useSidebarStore()

// Hydrate sidebar from server-provided initial data (avoids an API round-trip on first load)
if (!sidebarStore.loaded) {
    sidebarStore.initialize(props.initialSidebar)
}
</script>

<template>
    <AppLayout />
</template>
