<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, router } from '@inertiajs/vue3'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { useOfflineQueue } from '@/Composables/useOfflineQueue.js'
import { useToast } from '@/Composables/useToast.js'
import { useReadingState } from '@/Composables/useReadingState.js'
import { useArticleReadState } from '@/Composables/useArticleReadState.js'

const props = defineProps({
    article: Object,
    prevArticleId: Number,
    nextArticleId: Number,
    context: { type: Object, default: () => ({}) },
})

// Build article show URL preserving feed/category/filter context
function articleUrl(articleId) {
    const params = new URLSearchParams()
    if (props.context.feed_id) params.set('feed_id', props.context.feed_id)
    if (props.context.category_id) params.set('category_id', props.context.category_id)
    if (props.context.filter) params.set('filter', props.context.filter)
    const qs = params.toString()
    return route('articles.show', articleId) + (qs ? '?' + qs : '')
}

const { isOnline } = useOnlineStatus()
const { enqueue } = useOfflineQueue()
const { success } = useToast()
const { saveReadingState, clearReadingState } = useReadingState()
const { markRead } = useArticleReadState()

const isReadLater = ref(props.article.is_read_later ?? false)
const togglingReadLater = ref(false)
const markingUnread = ref(false)
const articleEl = ref(null)
const navigating = ref(false)
const showMenu = ref(false)
const menuRef = ref(null)

function toggleMenu() {
    showMenu.value = !showMenu.value
}

function closeMenu(e) {
    if (menuRef.value && !menuRef.value.contains(e.target)) {
        showMenu.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
    document.removeEventListener('click', closeMenu)
    clearReadingState()
})

// Whether to show a hero image at the top of the article content
const showHeroImage = computed(() => {
    if (!props.article.image_url) return false
    const content = props.article.content || props.article.summary || ''
    return !content.includes(props.article.image_url)
})

const formattedDate = computed(() => {
    const date = new Date(props.article.published_at)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
})

const formattedTime = computed(() => {
    const date = new Date(props.article.published_at)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    })
})

function goBack() {
    // Use browser history when possible for instant back navigation.
    // Inertia v2 handles popstate by restoring the page from history state
    // without a network request, and Vue lifecycle hooks (onUnmounted) still
    // fire normally because Inertia swaps the component.
    if (window.history.length > 1) {
        window.history.back()
        return
    }

    // Fallback for direct URL access (no history entry to go back to)
    const params = {}
    if (props.context.feed_id) params.feed_id = props.context.feed_id
    if (props.context.category_id) params.category_id = props.context.category_id
    if (props.context.filter) params.filter = props.context.filter
    router.get(route('articles.index', params))
}

function toggleReadLater() {
    togglingReadLater.value = true

    if (!isOnline.value) {
        isReadLater.value = !isReadLater.value
        enqueue('post', route('articles.toggleReadLater', props.article.id), {})
        togglingReadLater.value = false
        success(isReadLater.value ? 'Article saved' : 'Removed from Read Later')
        return
    }

    axios
        .post(route('articles.toggleReadLater', props.article.id))
        .then(() => {
            isReadLater.value = !isReadLater.value
            success(isReadLater.value ? 'Article saved' : 'Removed from Read Later')
        })
        .finally(() => {
            togglingReadLater.value = false
        })
}

function markAsUnread() {
    markingUnread.value = true
    showMenu.value = false

    if (!isOnline.value) {
        enqueue('post', route('articles.markAsUnread', props.article.id), {})
        markingUnread.value = false
        success('Marked as unread')
        return
    }

    axios
        .post(route('articles.markAsUnread', props.article.id))
        .then(() => {
            success('Marked as unread')
        })
        .finally(() => {
            markingUnread.value = false
        })
}

function openInBrowser() {
    if (props.article.url) {
        showMenu = false
        try {
            const url = new URL(props.article.url)
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                window.open(url.href, '_blank', 'noopener,noreferrer')
            }
        } catch {
            // Invalid URL, ignore
        }
    }
}

function shareArticle() {
    if (navigator.share) {
        navigator
            .share({
                title: props.article.title,
                url: props.article.url,
            })
            .catch(() => {
                // User cancelled or share failed
            })
    } else {
        // Fallback: copy URL to clipboard
        if (props.article.url) {
            navigator.clipboard
                .writeText(props.article.url)
                .then(() => {
                    success('Link copied to clipboard')
                })
                .catch(() => {})
        }
    }
}

// Swipe navigation between articles
let touchStartX = 0
let touchStartY = 0
const SWIPE_THRESHOLD = 80
const SWIPE_ANGLE_LIMIT = 30 // degrees — must be mostly horizontal
const SWIPE_ANIMATION_MS = 160
const SWIPE_TRANSLATE_PERCENT = 45
const ADJACENT_ARTICLE_PREFETCH_CACHE_FOR = '10m'

function prefetchAdjacentArticles() {
    const queue = [props.nextArticleId, props.prevArticleId].filter(Boolean)
    if (!queue.length) return

    const prefetchNext = index => {
        const articleId = queue[index]
        if (!articleId) return

        const url = articleUrl(articleId)
        const options = { method: 'get' }

        // Skip already-cached/in-flight requests so we can continue the queue.
        if (router.getCached(url, options) || router.getPrefetching(url, options)) {
            prefetchNext(index + 1)
            return
        }

        router.prefetch(
            url,
            {
                ...options,
                onPrefetched: () => prefetchNext(index + 1),
                onPrefetchError: () => prefetchNext(index + 1),
                onCancel: () => prefetchNext(index + 1),
            },
            {
                cacheFor: ADJACENT_ARTICLE_PREFETCH_CACHE_FOR,
            }
        )
    }

    prefetchNext(0)
}

// Prefetch adjacent articles and save reading state for PWA restore
onMounted(() => {
    // Track in shared state so Index.vue can reconcile on back-navigation
    markRead(props.article.id, props.article.feed?.id)

    // Save reading state so app.js can redirect here after iOS kills the PWA
    saveReadingState({
        url: window.location.pathname + window.location.search,
        selectedArticleId: props.article.id,
    })

    prefetchAdjacentArticles()

    // Slide-in animation when arriving from a swipe
    const direction = sessionStorage.getItem('article-swipe-direction')
    if (direction && articleEl.value) {
        sessionStorage.removeItem('article-swipe-direction')
        const el = articleEl.value
        // Start off-screen (opposite side from swipe direction)
        el.style.transition = 'none'
        el.style.transform =
            direction === 'next'
                ? `translateX(${SWIPE_TRANSLATE_PERCENT}%)`
                : `translateX(-${SWIPE_TRANSLATE_PERCENT}%)`
        el.style.opacity = '0'
        el.offsetHeight // force reflow
        // Animate into place
        el.style.transition = `transform ${SWIPE_ANIMATION_MS}ms ease-out, opacity ${SWIPE_ANIMATION_MS}ms ease-out`
        el.style.transform = 'translateX(0)'
        el.style.opacity = '1'
        el.addEventListener(
            'transitionend',
            () => {
                el.style.transition = ''
                el.style.transform = ''
                el.style.opacity = ''
            },
            { once: true }
        )
    }
})

function onSwipeStart(e) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
}

function onSwipeEnd(e) {
    if (navigating.value) return
    const deltaX = e.changedTouches[0].clientX - touchStartX
    const deltaY = e.changedTouches[0].clientY - touchStartY
    const angle = Math.abs((Math.atan2(deltaY, deltaX) * 180) / Math.PI)

    // Must be mostly horizontal
    if (angle > SWIPE_ANGLE_LIMIT && angle < 180 - SWIPE_ANGLE_LIMIT) return

    if (deltaX < -SWIPE_THRESHOLD && props.nextArticleId) {
        // Swipe left → next article (older): slide out to left
        navigating.value = true
        sessionStorage.setItem('article-swipe-direction', 'next')
        if (articleEl.value) {
            articleEl.value.style.transition = `transform ${SWIPE_ANIMATION_MS}ms ease-out, opacity ${SWIPE_ANIMATION_MS}ms ease-out`
            articleEl.value.style.transform = `translateX(-${SWIPE_TRANSLATE_PERCENT}%)`
            articleEl.value.style.opacity = '0'
        }
        setTimeout(() => router.visit(articleUrl(props.nextArticleId)), SWIPE_ANIMATION_MS)
    } else if (deltaX > SWIPE_THRESHOLD && props.prevArticleId) {
        // Swipe right → previous article (newer): slide out to right
        navigating.value = true
        sessionStorage.setItem('article-swipe-direction', 'prev')
        if (articleEl.value) {
            articleEl.value.style.transition = `transform ${SWIPE_ANIMATION_MS}ms ease-out, opacity ${SWIPE_ANIMATION_MS}ms ease-out`
            articleEl.value.style.transform = `translateX(${SWIPE_TRANSLATE_PERCENT}%)`
            articleEl.value.style.opacity = '0'
        }
        setTimeout(() => router.visit(articleUrl(props.prevArticleId)), SWIPE_ANIMATION_MS)
    }
}
</script>

<template>
    <Head :title="article.title" />

    <AppLayout>
        <template #header-left>
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
        </template>

        <template #header-right>
            <!-- Save to Read Later -->
            <button
                @click="toggleReadLater"
                :disabled="togglingReadLater"
                class="rounded-lg p-2 transition-colors"
                :class="
                    isReadLater
                        ? 'text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                "
                :aria-label="isReadLater ? 'Remove from Read Later' : 'Save to Read Later'">
                <svg
                    class="h-5 w-5"
                    :fill="isReadLater ? 'currentColor' : 'none'"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
            </button>

            <!-- Share -->
            <button
                @click="shareArticle"
                class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                aria-label="Share article">
                <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
            </button>

            <!-- Three-dots overflow menu -->
            <div ref="menuRef" class="relative">
                <button
                    @click="toggleMenu"
                    class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                    aria-label="More actions">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                </button>

                <!-- Dropdown menu -->
                <div
                    v-if="showMenu"
                    class="absolute right-0 top-full mt-1 w-48 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg py-1 z-50">
                    <button
                        @click="markAsUnread()"
                        :disabled="markingUnread"
                        class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <svg
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18" />
                        </svg>
                        Mark as unread
                    </button>
                    <button
                        v-if="article.url"
                        @click="openInBrowser()"
                        class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <svg
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Open in browser
                    </button>
                </div>
            </div>
        </template>

        <!-- Article content -->
        <div class="overflow-x-hidden">
            <article
                ref="articleEl"
                class="mx-auto max-w-3xl px-4 py-6"
                @touchstart.passive="onSwipeStart"
                @touchend="onSwipeEnd">
                <!-- Article header -->
                <header class="mb-6">
                    <h1
                        class="text-2xl font-bold leading-tight text-neutral-900 dark:text-neutral-100">
                        <a
                            v-if="article.url"
                            :href="article.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            {{ article.title }}
                        </a>
                        <template v-else>{{ article.title }}</template>
                    </h1>
                    <div
                        class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <a
                            v-if="article.feed?.id"
                            :href="route('articles.index', { feed_id: article.feed.id })"
                            class="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            @click.prevent="
                                router.get(route('articles.index', { feed_id: article.feed.id }))
                            ">
                            <img
                                v-if="article.feed?.favicon_url"
                                :src="article.feed.favicon_url"
                                class="h-4 w-4 rounded-sm"
                                alt="" />
                            <span>{{ article.feed?.title }}</span>
                        </a>
                        <span v-if="article.author">&middot; {{ article.author }}</span>
                        <span>&middot; {{ formattedDate }} at {{ formattedTime }}</span>
                    </div>
                </header>

                <!-- Hero image -->
                <img
                    v-if="showHeroImage"
                    :src="article.image_url"
                    :alt="article.title"
                    class="mb-6 w-full max-h-80 object-cover rounded-lg"
                    loading="lazy" />

                <!-- Article body -->
                <div
                    class="article-content prose max-w-none dark:prose-invert prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 prose-code:text-blue-300 prose-pre:bg-neutral-50 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-img:rounded-lg prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-500 dark:prose-blockquote:text-neutral-400"
                    v-html="article.content || article.summary" />

                <!-- Fallback: if no content or summary -->
                <div v-if="!article.content && !article.summary" class="py-12 text-center">
                    <p class="text-neutral-500 dark:text-neutral-400">
                        No article content available.
                    </p>
                    <button
                        v-if="article.url"
                        @click="openInBrowser"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        Read on original site
                    </button>
                </div>
            </article>
        </div>
    </AppLayout>
</template>

<style>
.article-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
}

.article-content iframe {
    max-width: 100%;
    border-radius: 0.5rem;
}

.article-content pre {
    overflow-x: auto;
}

.article-content a {
    word-break: break-word;
}
</style>
