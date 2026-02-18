<script setup>
import AppLayout from '@/Views/AppLayout.vue'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import { getCurrentInstance } from 'vue'

// If we arrived here via an Inertia redirect (e.g. after login), Vue Router
// won't be installed because it was skipped for the auth page that booted the app.
// Force a full page reload so the app re-boots with Vue Router enabled.
const instance = getCurrentInstance()
if (!instance.appContext.config.globalProperties.$router) {
    window.location.reload()
}

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
