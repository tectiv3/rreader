<script setup>
import { useRouter } from 'vue-router'
import { ref, onUnmounted } from 'vue'
import axios from 'axios'

const router = useRouter()

const searchQuery = ref('')
const isSearching = ref(false)
const debounceTimer = ref(null)
const allArticles = ref([])
const hasSearched = ref(false)
const searchInputRef = ref(null)

function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function onInput() {
    if (debounceTimer.value) clearTimeout(debounceTimer.value)

    const q = searchQuery.value.trim()
    if (!q) {
        allArticles.value = []
        hasSearched.value = false
        return
    }

    isSearching.value = true
    debounceTimer.value = setTimeout(() => {
        doSearch(q)
    }, 300)
}

async function doSearch(q) {
    try {
        const response = await axios.get('/api/articles/search', {
            params: { q },
        })
        allArticles.value = response.data.articles || []
        hasSearched.value = true
    } catch {
        allArticles.value = []
        hasSearched.value = true
    } finally {
        isSearching.value = false
    }
}

function openArticle(article) {
    router.push({ name: 'articles.show', params: { id: article.id } })
}

function clearSearch() {
    searchQuery.value = ''
    allArticles.value = []
    hasSearched.value = false
    searchInputRef.value?.focus()
}

function goBack() {
    router.back()
}

onUnmounted(() => {
    if (debounceTimer.value) clearTimeout(debounceTimer.value)
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
                    Search
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
                ref="searchInputRef"
                v-model="searchQuery"
                @input="onInput"
                type="search"
                placeholder="Search articles..."
                class="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2.5 pl-10 pr-10 text-base text-neutral-800 dark:text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                autocomplete="off" />
            <!-- Clear button -->
            <button
                v-if="searchQuery && !isSearching"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                aria-label="Clear search">
                <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <!-- Loading indicator -->
            <div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
                <svg class="h-4 w-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
            </div>
        </div>
    </div>

    <!-- Initial state: no search yet -->
    <div
        v-if="!hasSearched && !searchQuery"
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
            Search your articles
        </h3>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
            Find articles by title or content across all your feeds.
        </p>
    </div>

    <!-- Empty results -->
    <div
        v-else-if="hasSearched && allArticles.length === 0 && !isSearching"
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
            No articles match "{{ searchQuery }}". Try different keywords.
        </p>
    </div>

    <!-- Search results -->
    <div v-else-if="allArticles.length > 0">
        <!-- Mobile view: card layout -->
        <div class="lg:hidden">
            <div
                v-for="article in allArticles"
                :key="article.id"
                class="border-b border-neutral-200/50 dark:border-neutral-800/50">
                <button
                    @click="openArticle(article)"
                    class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:bg-neutral-100 dark:active:bg-neutral-800/50">
                    <div class="min-w-0 flex-1">
                        <div
                            class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500">
                            <img
                                v-if="article.feed_favicon_url"
                                :src="article.feed_favicon_url"
                                class="h-3.5 w-3.5 rounded-sm"
                                alt="" />
                            <span class="truncate">{{ article.feed_title }}</span>
                            <span>&middot;</span>
                            <span class="shrink-0">{{ timeAgo(article.published_at) }}</span>
                        </div>
                        <h3
                            class="mt-1 text-sm leading-snug"
                            :class="
                                article.is_read
                                    ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                                    : 'text-neutral-900 dark:text-neutral-100 font-semibold'
                            ">
                            {{ article.title }}
                        </h3>
                        <p
                            v-if="article.summary"
                            class="mt-0.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-500">
                            {{ article.summary }}
                        </p>
                    </div>
                    <img
                        v-if="article.image_url"
                        :src="article.image_url"
                        class="h-16 w-16 shrink-0 rounded-lg object-cover"
                        :alt="article.title"
                        loading="lazy" />
                </button>
            </div>
        </div>

        <!-- Desktop view: compact single-line layout -->
        <div class="hidden lg:block">
            <button
                v-for="article in allArticles"
                :key="article.id"
                @click="openArticle(article)"
                class="flex w-full items-center gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:bg-neutral-100 dark:active:bg-neutral-800/50">
                <img
                    v-if="article.feed_favicon_url"
                    :src="article.feed_favicon_url"
                    class="h-4 w-4 shrink-0 rounded-sm"
                    alt="" />
                <span
                    class="w-32 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-500"
                    >{{ article.feed_title }}</span
                >
                <h3
                    class="min-w-0 flex-1 truncate text-sm"
                    :class="
                        article.is_read
                            ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                            : 'text-neutral-900 dark:text-neutral-100 font-medium'
                    ">
                    {{ article.title }}
                </h3>
                <span
                    v-if="article.summary"
                    class="hidden xl:block w-64 shrink-0 truncate text-xs text-neutral-500 dark:text-neutral-600">
                    {{ article.summary }}
                </span>
                <span
                    class="w-12 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-600"
                    >{{ timeAgo(article.published_at) }}</span
                >
            </button>
        </div>

        <!-- End of results -->
        <div class="py-8 text-center text-sm text-neutral-500 dark:text-neutral-600">
            {{ allArticles.length }} result{{ allArticles.length !== 1 ? 's' : '' }}
        </div>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
