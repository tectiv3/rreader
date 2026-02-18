<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, router } from '@inertiajs/vue3'
import { ref } from 'vue'

const refreshing = ref(false)

function refreshFeeds() {
    refreshing.value = true
    router.post(
        route('feeds.refresh'),
        {},
        {
            preserveScroll: true,
            onFinish: () => {
                refreshing.value = false
            },
        }
    )
}
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout>
        <template #title>RReader</template>

        <div class="p-4">
            <div class="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
                <div class="flex items-center justify-between">
                    <p class="text-neutral-300">Welcome to RReader. Your feeds will appear here.</p>
                    <button
                        @click="refreshFeeds"
                        :disabled="refreshing"
                        class="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
                        <span v-if="refreshing">Refreshing...</span>
                        <span v-else>Refresh Feeds</span>
                    </button>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
