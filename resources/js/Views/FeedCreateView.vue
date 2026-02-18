<script setup>
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import { useToast } from '@/Composables/useToast.js'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const sidebarStore = useSidebarStore()
const router = useRouter()
const { error: showError } = useToast()

// --- Form state ---
const searchUrl = ref('')
const searchErrors = ref({})
const isSearching = ref(false)

const preview = ref(null)

const feedUrl = ref('')
const title = ref('')
const categoryId = ref('')
const newCategory = ref('')
const subscribeErrors = ref({})
const isSubscribing = ref(false)

const showNewCategory = ref(false)

const categories = computed(() => sidebarStore.categories)

// --- Load sidebar data ---
onMounted(async () => {
    if (!sidebarStore.loaded) {
        try {
            await sidebarStore.fetchSidebar()
        } catch {
            // Sidebar data not critical for this view
        }
    }
})

// --- Discover feed ---
async function discoverFeed() {
    isSearching.value = true
    searchErrors.value = {}
    preview.value = null

    try {
        const response = await axios.post('/api/feeds/preview', {
            url: searchUrl.value,
        })
        preview.value = response.data.preview
    } catch (e) {
        if (e.response?.status === 422) {
            searchErrors.value = e.response.data.errors || {}
        } else {
            showError(e.response?.data?.message || 'Failed to discover feed')
        }
    } finally {
        isSearching.value = false
    }
}

// --- Subscribe ---
async function subscribe() {
    if (!preview.value) return

    isSubscribing.value = true
    subscribeErrors.value = {}

    const data = {
        feed_url: preview.value.feed_url,
        title: title.value || preview.value.title,
        category_id: showNewCategory.value ? '' : categoryId.value,
        new_category: showNewCategory.value ? newCategory.value : '',
    }

    try {
        await axios.post('/api/feeds', data)
        await sidebarStore.fetchSidebar()
        router.push({ name: 'articles.index' })
    } catch (e) {
        if (e.response?.status === 422) {
            subscribeErrors.value = e.response.data.errors || {}
        } else {
            showError(e.response?.data?.message || 'Failed to subscribe')
        }
    } finally {
        isSubscribing.value = false
    }
}

function toggleNewCategory() {
    showNewCategory.value = !showNewCategory.value
    if (showNewCategory.value) {
        categoryId.value = ''
    } else {
        newCategory.value = ''
    }
}

function goBack() {
    if (window.history.length > 1) {
        router.back()
    } else {
        router.push({ name: 'articles.index' })
    }
}
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
                    Add Feed
                </h1>
            </div>
        </div>
    </header>

    <div class="mx-auto max-w-lg px-4 py-6">
        <!-- Step 1: Enter URL -->
        <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Feed URL
            </h2>

            <form @submit.prevent="discoverFeed">
                <div>
                    <input
                        id="url"
                        type="url"
                        class="block w-full text-base rounded-md border-neutral-700 bg-neutral-800 text-neutral-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-neutral-400"
                        v-model="searchUrl"
                        placeholder="https://example.com or feed URL"
                        required
                        autofocus />
                    <p class="mt-1.5 text-xs text-neutral-600 dark:text-neutral-500">
                        Enter a website URL or direct RSS/Atom feed URL
                    </p>
                    <div v-if="searchErrors.url" class="mt-2">
                        <p class="text-sm text-red-400">
                            {{ searchErrors.url[0] }}
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    class="mt-4 w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 active:bg-blue-700"
                    :class="{ 'opacity-25': isSearching }"
                    :disabled="isSearching">
                    <svg
                        v-if="isSearching"
                        class="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none">
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4" />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ isSearching ? 'Searching...' : 'Find Feed' }}
                </button>
            </form>
        </div>

        <!-- Step 2: Preview & Subscribe -->
        <div v-if="preview" class="mt-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <div class="flex items-start gap-3 mb-4">
                <img
                    v-if="preview.favicon_url"
                    :src="preview.favicon_url"
                    class="mt-0.5 h-6 w-6 rounded"
                    @error="$event.target.style.display = 'none'" />
                <div class="min-w-0 flex-1">
                    <h3
                        class="text-base font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {{ preview.title || 'Untitled Feed' }}
                    </h3>
                    <p
                        v-if="preview.description"
                        class="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {{ preview.description }}
                    </p>
                    <p class="mt-1 text-xs text-neutral-600 dark:text-neutral-500">
                        {{ preview.article_count }} articles found
                    </p>
                </div>
            </div>

            <form @submit.prevent="subscribe">
                <!-- Custom title -->
                <div class="mb-4">
                    <label for="title" class="block text-sm font-medium text-neutral-300">
                        Title (optional)
                    </label>
                    <input
                        id="title"
                        type="text"
                        class="mt-1 block w-full text-base rounded-md border-neutral-700 bg-neutral-800 text-neutral-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-neutral-400"
                        v-model="title"
                        :placeholder="preview.title || 'Feed title'" />
                </div>

                <!-- Category selection -->
                <div class="mb-4">
                    <label for="category" class="block text-sm font-medium text-neutral-300">
                        Category (optional)
                    </label>

                    <div v-if="!showNewCategory">
                        <select
                            id="category"
                            v-model="categoryId"
                            class="mt-1 block w-full rounded-lg border-neutral-300 bg-white text-base text-neutral-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                            <option value="">No category</option>
                            <option
                                v-for="category in categories"
                                :key="category.id"
                                :value="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <div v-else>
                        <input
                            id="new_category"
                            type="text"
                            class="mt-1 block w-full text-base rounded-md border-neutral-700 bg-neutral-800 text-neutral-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-neutral-400"
                            v-model="newCategory"
                            placeholder="New category name" />
                    </div>

                    <button
                        type="button"
                        @click="toggleNewCategory"
                        class="mt-2 text-sm text-blue-400 hover:text-blue-300">
                        {{ showNewCategory ? 'Choose existing category' : '+ Create new category' }}
                    </button>

                    <div v-if="subscribeErrors.category_id" class="mt-2">
                        <p class="text-sm text-red-400">
                            {{ subscribeErrors.category_id[0] }}
                        </p>
                    </div>
                    <div v-if="subscribeErrors.new_category" class="mt-2">
                        <p class="text-sm text-red-400">
                            {{ subscribeErrors.new_category[0] }}
                        </p>
                    </div>
                </div>

                <div v-if="subscribeErrors.feed_url" class="mb-3">
                    <p class="text-sm text-red-400">
                        {{ subscribeErrors.feed_url[0] }}
                    </p>
                </div>

                <button
                    type="submit"
                    class="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 active:bg-blue-700"
                    :class="{ 'opacity-25': isSubscribing }"
                    :disabled="isSubscribing">
                    <svg
                        v-if="isSubscribing"
                        class="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none">
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4" />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ isSubscribing ? 'Subscribing...' : 'Subscribe' }}
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
