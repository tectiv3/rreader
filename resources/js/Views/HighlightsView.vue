<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useToast } from '../Composables/useToast.js'

const router = useRouter()
const { success, error } = useToast()

const highlights = ref([])
const loading = ref(true)
const searchQuery = ref('')

async function fetchHighlights() {
    loading.value = true
    try {
        const response = await axios.get('/api/highlights')
        highlights.value = response.data.data || []
    } catch {
        error('Failed to load highlights')
    } finally {
        loading.value = false
    }
}

async function deleteHighlight(id) {
    const prev = [...highlights.value]
    highlights.value = highlights.value.filter(h => h.id !== id)
    try {
        await axios.delete(`/api/highlights/${id}`)
        success('Quote deleted')
    } catch {
        highlights.value = prev
        error('Failed to delete quote')
    }
}

const filteredHighlights = computed(() => {
    if (!searchQuery.value.trim()) return highlights.value
    const q = searchQuery.value.toLowerCase()
    return highlights.value.filter(
        h => h.text.toLowerCase().includes(q) || h.article?.title?.toLowerCase().includes(q)
    )
})

const groupedHighlights = computed(() => {
    const groups = []
    const map = new Map()
    for (const h of filteredHighlights.value) {
        const articleId = h.article_id
        if (!map.has(articleId)) {
            const group = {
                articleId,
                articleTitle: h.article?.title || 'Unknown Article',
                articleUrl: h.article?.url,
                feedTitle: h.article?.feed?.title,
                feedFaviconUrl: h.article?.feed?.favicon_url,
                highlights: [],
            }
            map.set(articleId, group)
            groups.push(group)
        }
        map.get(articleId).highlights.push(h)
    }
    return groups
})

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function goBack() {
    router.back()
}

function openArticle(articleId) {
    router.push({ name: 'articles.show', params: { id: articleId } })
}

onMounted(() => {
    fetchHighlights()
})
</script>

<template>
    <!-- Sticky header -->
    <header
        class="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pt-safe">
        <div class="flex h-11 items-center justify-between px-4">
            <div class="flex items-center gap-2 min-w-0">
                <button
                    @click="goBack"
                    class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2"
                    aria-label="Go back">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 class="text-base font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    Highlights
                </h1>
            </div>
        </div>
    </header>

    <!-- Search input -->
    <div
        class="sticky top-11 z-20 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-3 backdrop-blur">
        <div class="relative">
            <svg
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
                v-model="searchQuery"
                type="search"
                placeholder="Search quotes..."
                class="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2.5 pl-10 pr-4 text-base text-neutral-800 dark:text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                autocomplete="off" />
        </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4 px-4 py-6">
        <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="mb-2 h-4 w-48 rounded bg-neutral-200 dark:bg-neutral-800"></div>
            <div class="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
                <div class="mb-2 h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div class="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800"></div>
            </div>
        </div>
    </div>

    <!-- Empty state -->
    <div
        v-else-if="highlights.length === 0"
        class="flex flex-col items-center justify-center px-4 py-20 text-center">
        <svg
            class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
            No saved quotes yet
        </h3>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
            Select text in any article and tap "Save quote" to save it here.
        </p>
    </div>

    <!-- No search results -->
    <div
        v-else-if="filteredHighlights.length === 0 && searchQuery.trim()"
        class="flex flex-col items-center justify-center px-4 py-20 text-center">
        <svg
            class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
            No results found
        </h3>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
            No quotes match "{{ searchQuery }}".
        </p>
    </div>

    <!-- Grouped highlights -->
    <div v-else class="px-4 py-4 space-y-6">
        <section v-for="group in groupedHighlights" :key="group.articleId">
            <!-- Article title as group header -->
            <button
                @click="openArticle(group.articleId)"
                class="flex items-center gap-2 text-left group mb-2">
                <img
                    v-if="group.feedFaviconUrl"
                    :src="group.feedFaviconUrl"
                    class="h-4 w-4 rounded-sm shrink-0"
                    alt="" />
                <h2
                    class="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {{ group.articleTitle }}
                </h2>
            </button>
            <p v-if="group.feedTitle" class="text-xs text-neutral-500 dark:text-neutral-500 mb-3">
                {{ group.feedTitle }}
            </p>

            <!-- Quotes for this article -->
            <div class="space-y-2">
                <div
                    v-for="highlight in group.highlights"
                    :key="highlight.id"
                    class="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3">
                    <blockquote
                        class="border-l-2 border-blue-500 pl-3 text-sm text-neutral-700 dark:text-neutral-300 italic">
                        {{ highlight.text }}
                    </blockquote>
                    <div class="mt-2 flex items-center justify-between">
                        <span class="text-xs text-neutral-500 dark:text-neutral-500">{{
                            formatDate(highlight.created_at)
                        }}</span>
                        <button
                            @click="deleteHighlight(highlight.id)"
                            class="rounded p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                            aria-label="Delete quote">
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Count -->
        <div class="py-4 text-center text-sm text-neutral-500 dark:text-neutral-600">
            {{ filteredHighlights.length }} quote{{ filteredHighlights.length !== 1 ? 's' : '' }}
        </div>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
