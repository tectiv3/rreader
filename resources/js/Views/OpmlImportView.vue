<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useToast } from '@/Composables/useToast.js'

const router = useRouter()
const { success, error: showError } = useToast()

// Upload state
const file = ref(null)
const uploadError = ref('')
const isUploading = ref(false)

// Preview state
const preview = ref(null)
const totalFeeds = ref(0)
const duplicateCount = ref(0)

// Import state
const isImporting = ref(false)
const selectedFeeds = ref([])

const allNewFeeds = computed(() => {
    if (!preview.value) return []
    const feeds = []
    for (const cat of preview.value.categories) {
        for (const feed of cat.feeds) {
            if (!feed.is_duplicate) {
                feeds.push(feed.feed_url)
            }
        }
    }
    for (const feed of preview.value.uncategorized) {
        if (!feed.is_duplicate) {
            feeds.push(feed.feed_url)
        }
    }
    return feeds
})

// Re-initialize selections whenever preview changes
watch(
    () => preview.value,
    () => {
        selectedFeeds.value = [...allNewFeeds.value]
    },
    { immediate: true }
)

const selectedCount = computed(() => selectedFeeds.value.length)

const allSelected = computed(() => {
    return allNewFeeds.value.length > 0 && selectedFeeds.value.length === allNewFeeds.value.length
})

function toggleAll() {
    if (allSelected.value) {
        selectedFeeds.value = []
    } else {
        selectedFeeds.value = [...allNewFeeds.value]
    }
}

function toggleFeed(feedUrl) {
    if (!allNewFeeds.value.includes(feedUrl)) return
    const index = selectedFeeds.value.indexOf(feedUrl)
    if (index > -1) {
        selectedFeeds.value.splice(index, 1)
    } else {
        selectedFeeds.value.push(feedUrl)
    }
}

function isFeedSelected(feedUrl) {
    return selectedFeeds.value.includes(feedUrl)
}

function onFileChange(e) {
    const selected = e.target.files[0]
    if (selected) {
        file.value = selected
        uploadError.value = ''
    }
}

async function uploadFile() {
    if (!file.value) return

    isUploading.value = true
    uploadError.value = ''

    const formData = new FormData()
    formData.append('file', file.value)

    try {
        const response = await axios.post('/api/opml/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        preview.value = response.data.preview
        totalFeeds.value = response.data.totalFeeds
        duplicateCount.value = response.data.duplicateCount
    } catch (e) {
        if (e.response?.status === 422) {
            const errors = e.response.data.errors || {}
            uploadError.value = errors.file ? errors.file[0] : 'Invalid file'
        } else {
            uploadError.value = e.response?.data?.message || 'Failed to parse OPML file'
        }
    } finally {
        isUploading.value = false
    }
}

async function importFeeds() {
    if (selectedCount.value === 0) return

    isImporting.value = true
    try {
        const response = await axios.post('/api/opml/import', {
            selected_feeds: selectedFeeds.value,
        })
        const data = response.data
        success(
            `Imported ${data.imported} feed${data.imported !== 1 ? 's' : ''}` +
                (data.skipped > 0 ? `, ${data.skipped} skipped` : '')
        )
        router.push({ name: 'articles.index' })
    } catch (e) {
        showError(e.response?.data?.message || 'Failed to import feeds')
    } finally {
        isImporting.value = false
    }
}

function exportOpml() {
    window.location.href = '/opml/export'
}

function goBack() {
    router.back()
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
                    Import / Export
                </h1>
            </div>
        </div>
    </header>

    <div class="mx-auto max-w-lg px-4 py-6 space-y-5">
        <!-- Import Section -->
        <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Import OPML
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Upload an .opml or .xml file to import feeds from another reader.
            </p>

            <form @submit.prevent="uploadFile">
                <div>
                    <label
                        class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 bg-white px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400 transition hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600 dark:hover:text-neutral-300"
                        :class="{ 'border-blue-500 text-blue-400': file }">
                        <svg
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span v-if="file">{{ file.name }}</span>
                        <span v-else>Choose .opml or .xml file</span>
                        <input
                            type="file"
                            accept=".opml,.xml"
                            class="hidden"
                            @change="onFileChange" />
                    </label>
                    <p v-if="uploadError" class="mt-2 text-sm text-red-600 dark:text-red-400">
                        {{ uploadError }}
                    </p>
                </div>

                <button
                    type="submit"
                    class="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-25"
                    :disabled="isUploading || !file">
                    <svg
                        v-if="isUploading"
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
                    {{ isUploading ? 'Parsing...' : 'Upload & Preview' }}
                </button>
            </form>
        </div>

        <!-- Preview Section -->
        <div v-if="preview" class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200">
                    Preview
                    <span class="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                        ({{ totalFeeds }} feeds found<span v-if="duplicateCount"
                            >, {{ duplicateCount }} already subscribed</span
                        >)
                    </span>
                </h2>
            </div>

            <!-- Select all toggle -->
            <div
                class="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div
                    class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    @click="toggleAll">
                    <input
                        type="checkbox"
                        :checked="allSelected"
                        class="rounded border-neutral-300 bg-white text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-offset-neutral-900 pointer-events-none" />
                    Select all new feeds ({{ allNewFeeds.length }})
                </div>
            </div>

            <!-- Categories -->
            <div v-for="(category, catIdx) in preview.categories" :key="catIdx" class="mb-4">
                <h3
                    class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                    <svg
                        class="h-4 w-4 text-neutral-600 dark:text-neutral-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {{ category.name }}
                </h3>

                <div class="space-y-1 pl-1">
                    <div
                        v-for="(feed, feedIdx) in category.feeds"
                        :key="feedIdx"
                        class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
                        :class="
                            feed.is_duplicate
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        "
                        @click="!feed.is_duplicate && toggleFeed(feed.feed_url)">
                        <input
                            type="checkbox"
                            :checked="feed.is_duplicate ? false : isFeedSelected(feed.feed_url)"
                            :disabled="feed.is_duplicate"
                            class="rounded border-neutral-300 bg-white text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-offset-neutral-900 disabled:opacity-40 pointer-events-none" />
                        <img
                            v-if="feed.favicon_url"
                            :src="feed.favicon_url"
                            class="h-4 w-4 rounded"
                            @error="$event.target.style.display = 'none'" />
                        <span
                            class="flex-1 truncate"
                            :class="
                                feed.is_duplicate
                                    ? 'text-neutral-500 line-through'
                                    : 'text-neutral-800 dark:text-neutral-200'
                            ">
                            {{ feed.title }}
                        </span>
                        <span
                            v-if="feed.is_duplicate"
                            class="text-xs text-neutral-600 dark:text-neutral-500 shrink-0"
                            >subscribed</span
                        >
                    </div>
                </div>
            </div>

            <!-- Uncategorized -->
            <div v-if="preview.uncategorized.length > 0" class="mb-4">
                <h3
                    class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                    <svg
                        class="h-4 w-4 text-neutral-600 dark:text-neutral-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    Uncategorized
                </h3>

                <div class="space-y-1 pl-1">
                    <div
                        v-for="(feed, feedIdx) in preview.uncategorized"
                        :key="feedIdx"
                        class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
                        :class="
                            feed.is_duplicate
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        "
                        @click="!feed.is_duplicate && toggleFeed(feed.feed_url)">
                        <input
                            type="checkbox"
                            :checked="feed.is_duplicate ? false : isFeedSelected(feed.feed_url)"
                            :disabled="feed.is_duplicate"
                            class="rounded border-neutral-300 bg-white text-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-offset-neutral-900 disabled:opacity-40 pointer-events-none" />
                        <img
                            v-if="feed.favicon_url"
                            :src="feed.favicon_url"
                            class="h-4 w-4 rounded"
                            @error="$event.target.style.display = 'none'" />
                        <span
                            class="flex-1 truncate"
                            :class="
                                feed.is_duplicate
                                    ? 'text-neutral-500 line-through'
                                    : 'text-neutral-800 dark:text-neutral-200'
                            ">
                            {{ feed.title }}
                        </span>
                        <span
                            v-if="feed.is_duplicate"
                            class="text-xs text-neutral-600 dark:text-neutral-500 shrink-0"
                            >subscribed</span
                        >
                    </div>
                </div>
            </div>

            <!-- Import Button -->
            <button
                class="mt-2 w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-25"
                :disabled="isImporting || selectedCount === 0"
                @click="importFeeds">
                <svg
                    v-if="isImporting"
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
                {{
                    isImporting
                        ? 'Importing...'
                        : `Import ${selectedCount} Feed${selectedCount !== 1 ? 's' : ''}`
                }}
            </button>
        </div>

        <!-- Export Section -->
        <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                Export OPML
            </h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Download your subscriptions as an OPML file for backup or migration.
            </p>

            <button
                @click="exportOpml"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700">
                <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download OPML File
            </button>
        </div>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
