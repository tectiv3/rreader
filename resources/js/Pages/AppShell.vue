<script setup>
import router from '@/router.js'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

defineProps({
    initialSidebar: { type: Object, default: () => ({}) },
    user: { type: Object, required: true },
})

// Mount Vue Router into this component
// The router is used via <router-view> in the template
</script>

<template>
    <router-view />
</template>
