<script setup>
import InputError from '@/Components/InputError.vue'
import InputLabel from '@/Components/InputLabel.vue'
import TextInput from '@/Components/TextInput.vue'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import axios from 'axios'
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['close'])

// Step 1 state
const url = ref('')
const urlError = ref('')
const isSearching = ref(false)

// Step 2 state
const preview = ref(null)
const categories = ref([])
const feedUrl = ref('')
const title = ref('')
const categoryId = ref('')
const newCategory = ref('')
const showNewCategory = ref(false)
const isSubscribing = ref(false)
const subscribeErrors = ref({})

const urlInput = ref(null)

// Lock body scroll and manage lifecycle when modal opens/closes
watch(
    () => props.show,
    newVal => {
        if (newVal) {
            document.body.style.overflow = 'hidden'
            nextTick(() => {
                urlInput.value?.focus()
            })
        } else {
            document.body.style.overflow = ''
            resetState()
        }
    }
)

function onKeydown(e) {
    if (e.key === 'Escape' && props.show) {
        e.preventDefault()
        close()
    }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
})

function resetState() {
    url.value = ''
    urlError.value = ''
    isSearching.value = false
    preview.value = null
    categories.value = []
    feedUrl.value = ''
    title.value = ''
    categoryId.value = ''
    newCategory.value = ''
    showNewCategory.value = false
    isSubscribing.value = false
    subscribeErrors.value = {}
}

function close() {
    emit('close')
}

async function discoverFeed() {
    if (!url.value.trim()) return

    urlError.value = ''
    isSearching.value = true

    try {
        const response = await axios.post('/api/feeds/preview', {
            url: url.value,
        })

        preview.value = response.data.preview
        categories.value = response.data.categories
        feedUrl.value = response.data.preview.feed_url
        title.value = ''
    } catch (error) {
        if (error.response?.status === 422 && error.response.data?.errors?.url) {
            urlError.value = error.response.data.errors.url[0]
        } else {
            urlError.value = 'Something went wrong. Please try again.'
        }
    } finally {
        isSearching.value = false
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

async function subscribe() {
    isSubscribing.value = true
    subscribeErrors.value = {}

    try {
        await axios.post('/api/feeds', {
            feed_url: feedUrl.value,
            title: title.value || preview.value?.title || '',
            category_id: categoryId.value || '',
            new_category: newCategory.value || '',
        })

        useSidebarStore().fetchSidebar()
        close()
    } catch (error) {
        if (error.response?.status === 422 && error.response.data?.errors) {
            subscribeErrors.value = Object.fromEntries(
                Object.entries(error.response.data.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
            )
        }
    } finally {
        isSubscribing.value = false
    }
}

function goBackToSearch() {
    preview.value = null
    subscribeErrors.value = {}
    nextTick(() => {
        urlInput.value?.focus()
    })
}
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div
                v-if="show"
                class="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] lg:items-center lg:pt-0">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/60" @click="close" />

                <!-- Modal panel -->
                <Transition
                    enter-active-class="duration-200 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="duration-150 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                    appear>
                    <div
                        v-if="show"
                        class="relative z-10 w-full max-h-[80vh] overflow-y-auto rounded-2xl bg-neutral-50 dark:bg-neutral-900 shadow-2xl max-w-md mx-4">
                        <!-- Header -->
                        <div
                            class="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-5 py-4 rounded-t-2xl">
                            <h2
                                class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                Add Feed
                            </h2>
                            <button
                                @click="close"
                                class="rounded-lg p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                aria-label="Close">
                                <svg
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="p-5">
                            <!-- Step 1: Enter URL -->
                            <div v-if="!preview">
                                <form @submit.prevent="discoverFeed">
                                    <div>
                                        <TextInput
                                            ref="urlInput"
                                            id="add-feed-url"
                                            type="url"
                                            class="block w-full text-base"
                                            v-model="url"
                                            placeholder="https://example.com or feed URL"
                                            required />
                                        <p
                                            class="mt-1.5 text-xs text-neutral-600 dark:text-neutral-500">
                                            Enter a website URL or direct RSS/Atom feed URL
                                        </p>
                                        <InputError class="mt-2" :message="urlError" />
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
                            <div v-else>
                                <!-- Back button -->
                                <button
                                    @click="goBackToSearch"
                                    class="mb-4 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                                    <svg
                                        class="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                    Search again
                                </button>

                                <!-- Feed preview -->
                                <div
                                    class="flex items-start gap-3 mb-5 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3">
                                    <img
                                        v-if="preview.favicon_url"
                                        :src="preview.favicon_url"
                                        class="mt-0.5 h-6 w-6 rounded"
                                        @error="$event.target.style.display = 'none'" />
                                    <div
                                        v-else
                                        class="mt-0.5 h-6 w-6 rounded bg-neutral-300 dark:bg-neutral-700 shrink-0" />
                                    <div class="min-w-0 flex-1">
                                        <h3
                                            class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                            {{ preview.title || 'Untitled Feed' }}
                                        </h3>
                                        <p
                                            v-if="preview.description"
                                            class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                            {{ preview.description }}
                                        </p>
                                        <p
                                            class="mt-0.5 text-xs text-neutral-600 dark:text-neutral-500">
                                            {{ preview.article_count }} articles found
                                        </p>
                                    </div>
                                </div>

                                <form @submit.prevent="subscribe">
                                    <!-- Custom title -->
                                    <div class="mb-4">
                                        <InputLabel for="add-feed-title" value="Title (optional)" />
                                        <TextInput
                                            id="add-feed-title"
                                            type="text"
                                            class="mt-1 block w-full text-base"
                                            v-model="title"
                                            :placeholder="preview.title || 'Feed title'" />
                                    </div>

                                    <!-- Category selection -->
                                    <div class="mb-4">
                                        <InputLabel
                                            for="add-feed-category"
                                            value="Category (optional)" />

                                        <div v-if="!showNewCategory">
                                            <select
                                                id="add-feed-category"
                                                v-model="categoryId"
                                                class="mt-1 block w-full rounded-lg border-neutral-300 bg-white text-base text-neutral-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                                                <option value="">No category</option>
                                                <option
                                                    v-for="cat in categories"
                                                    :key="cat.id"
                                                    :value="cat.id">
                                                    {{ cat.name }}
                                                </option>
                                            </select>
                                        </div>

                                        <div v-else>
                                            <TextInput
                                                id="add-feed-new-category"
                                                type="text"
                                                class="mt-1 block w-full text-base"
                                                v-model="newCategory"
                                                placeholder="New category name" />
                                        </div>

                                        <button
                                            type="button"
                                            @click="toggleNewCategory"
                                            class="mt-2 text-sm text-blue-400 hover:text-blue-300">
                                            {{
                                                showNewCategory
                                                    ? 'Choose existing category'
                                                    : '+ Create new category'
                                            }}
                                        </button>

                                        <InputError
                                            class="mt-2"
                                            :message="subscribeErrors.category_id" />
                                        <InputError
                                            class="mt-2"
                                            :message="subscribeErrors.new_category" />
                                    </div>

                                    <InputError class="mb-3" :message="subscribeErrors.feed_url" />

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
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
