<script setup>
import axios from 'axios'
import { useArticleStore } from '@/Stores/useArticleStore.js'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { useToast } from '@/Composables/useToast.js'
import { useAddFeedModal } from '@/Composables/useAddFeedModal.js'
import { useRouter, useRoute } from 'vue-router'
import { setTitle } from '@/router.js'
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue'

defineOptions({ name: 'ArticleListView' })

const articleStore = useArticleStore()
const sidebarStore = useSidebarStore()
const router = useRouter()
const route = useRoute()
const { isOnline } = useOnlineStatus()
const { success } = useToast()
const { openAddFeedModal } = useAddFeedModal()
const toggleSidebar = inject('toggleSidebar')

// --- View derivation from route query params ---
function deriveView() {
    const q = route.query
    if (q.filter) return { type: q.filter }
    if (q.feed_id) return { type: 'feed', feedId: Number(q.feed_id) }
    if (q.category_id) return { type: 'category', categoryId: Number(q.category_id) }
    return { type: 'all' }
}

// Fetch on mount
articleStore.fetchArticles(deriveView())

// Keep document title in sync with the current filter
watch(
    () => articleStore.filterTitle,
    t => setTitle(t),
    { immediate: true }
)

// Watch route changes (skip if navigated away from this view)
watch(
    () => route.query,
    () => {
        if (route.name === 'articles.index') {
            closeArticlePanel()
            showFeedInfo.value = false
            articleStore.fetchArticles(deriveView())
        }
    },
    { deep: true }
)

// --- Computed helpers ---
const activeFeedId = computed(() => (route.query.feed_id ? Number(route.query.feed_id) : null))
const activeCategoryId = computed(() =>
    route.query.category_id ? Number(route.query.category_id) : null
)
const activeFilter = computed(() => route.query.filter || null)
const isReadLaterView = computed(() => activeFilter.value === 'read_later')

// Unread count for the header badge — always from sidebar store (server-provided)
const headerUnreadCount = computed(() => {
    if (activeFilter.value === 'read_later') return sidebarStore.readLaterCount
    if (activeFilter.value === 'today') return sidebarStore.todayCount
    if (activeFilter.value === 'recently_read') return 0
    if (activeFeedId.value) {
        for (const cat of sidebarStore.categories) {
            const feed = cat.feeds.find(f => f.id === activeFeedId.value)
            if (feed) return feed.unread_count || 0
        }
        const uncatFeed = sidebarStore.uncategorizedFeeds.find(f => f.id === activeFeedId.value)
        return uncatFeed?.unread_count || 0
    }
    if (activeCategoryId.value) {
        const cat = sidebarStore.categories.find(c => c.id === activeCategoryId.value)
        return cat?.unread_count || 0
    }
    return sidebarStore.totalUnread
})

const isSingleFeedView = computed(() => !!activeFeedId.value)

const activeFeedInfo = computed(() => {
    if (!activeFeedId.value) return null
    for (const cat of sidebarStore.categories) {
        const feed = cat.feeds.find(f => f.id === activeFeedId.value)
        if (feed) return feed
    }
    return sidebarStore.uncategorizedFeeds.find(f => f.id === activeFeedId.value) || null
})

const showFeedInfo = ref(false)

const feedCount = computed(() => {
    let count = sidebarStore.uncategorizedFeeds.length
    for (const cat of sidebarStore.categories) {
        count += cat.feeds?.length || 0
    }
    return count
})

// --- Date grouping ---
const groupedArticles = computed(() => {
    const groups = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    for (const article of articleStore.articles) {
        const pubDate = new Date(article.published_at)
        pubDate.setHours(0, 0, 0, 0)

        let label
        if (pubDate.getTime() === today.getTime()) label = 'Today'
        else if (pubDate.getTime() === yesterday.getTime()) label = 'Yesterday'
        else
            label = pubDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })

        if (!groups[label]) groups[label] = []
        groups[label].push(article)
    }
    return groups
})

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

// --- Desktop inline reader state ---
const isDesktop = ref(typeof window !== 'undefined' && window.innerWidth >= 1024)
const selectedArticleId = ref(null)
const selectedArticle = ref(null)
const loadingArticle = ref(false)
const selectedIsReadLater = ref(false)
const articleListEl = ref(null)
const loadMoreSentinel = ref(null)

function checkDesktop() {
    isDesktop.value = window.innerWidth >= 1024
}

let loadMoreObserver = null

onMounted(() => {
    window.addEventListener('resize', checkDesktop)
    window.addEventListener('keydown', onKeyDown)

    loadMoreObserver = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting && articleStore.hasMore && !articleStore.loadingMore) {
                articleStore.loadMore()
            }
        },
        { rootMargin: '200px' }
    )
    if (loadMoreSentinel.value) {
        loadMoreObserver.observe(loadMoreSentinel.value)
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', checkDesktop)
    window.removeEventListener('keydown', onKeyDown)
    loadMoreObserver?.disconnect()
})

watch(loadMoreSentinel, el => {
    loadMoreObserver?.disconnect()
    if (el) loadMoreObserver?.observe(el)
})

// --- Article open ---
function openArticle(article) {
    if (!article.is_read) {
        articleStore.markRead(article.id)
    }

    if (isDesktop.value) {
        if (selectedArticleId.value === article.id) {
            closeArticlePanel()
            return
        }
        selectedArticleId.value = article.id
        loadArticleInline(article.id)
    } else {
        router.push({ name: 'articles.show', params: { id: article.id } })
    }
}

async function loadArticleInline(articleId) {
    const cached = articleStore.getContent(articleId)
    if (cached) {
        selectedArticle.value = cached
        selectedIsReadLater.value = cached.is_read_later ?? false
        loadingArticle.value = false
        await nextTick()
        scrollExpandedIntoView(articleId)
        articleStore.prefetchAdjacent(articleId)
        return
    }

    loadingArticle.value = true
    try {
        const content = await articleStore.fetchContent(articleId)
        selectedArticle.value = content
        selectedIsReadLater.value = content.is_read_later ?? false
        await nextTick()
        scrollExpandedIntoView(articleId)
        articleStore.prefetchAdjacent(articleId)
    } catch {
        router.push({ name: 'articles.show', params: { id: articleId } })
    } finally {
        loadingArticle.value = false
    }
}

function scrollExpandedIntoView(articleId) {
    const el = document.getElementById(`article-expanded-${articleId}`)
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

function closeArticlePanel() {
    selectedArticle.value = null
    selectedArticleId.value = null
}

function navigateToFeed(feedId) {
    closeArticlePanel()
    router.push({ name: 'articles.index', query: { feed_id: feedId } })
}

// --- Desktop inline actions ---
function toggleReadLaterInline() {
    if (!selectedArticle.value) return
    articleStore.toggleReadLater(selectedArticle.value.id)
    selectedIsReadLater.value = !selectedIsReadLater.value
    success(selectedIsReadLater.value ? 'Article saved' : 'Removed from Read Later')
}

function markAsUnreadInline() {
    if (!selectedArticle.value) return
    articleStore.markUnread(selectedArticle.value.id)
    success('Marked as unread')
}

const showHeroImage = computed(() => {
    if (!selectedArticle.value?.image_url) return false
    const content = selectedArticle.value.content || selectedArticle.value.summary || ''
    return !content.includes(selectedArticle.value.image_url)
})

const selectedFormattedDate = computed(() => {
    if (!selectedArticle.value) return ''
    return new Date(selectedArticle.value.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
})

const selectedFormattedTime = computed(() => {
    if (!selectedArticle.value) return ''
    return new Date(selectedArticle.value.published_at).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    })
})

// --- Keyboard shortcuts (desktop) ---
const selectedIndex = computed(() => {
    if (!selectedArticleId.value) return -1
    return articleStore.articles.findIndex(a => a.id === selectedArticleId.value)
})

function onKeyDown(e) {
    if (!isDesktop.value) return
    if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
    )
        return
    if (route.name !== 'articles.index') return

    switch (e.key) {
        case 'ArrowRight':
        case 'j': {
            e.preventDefault()
            const nextIdx = selectedIndex.value + 1
            if (nextIdx < articleStore.articles.length) openArticle(articleStore.articles[nextIdx])
            break
        }
        case 'ArrowLeft':
        case 'k': {
            e.preventDefault()
            const prevIdx = selectedIndex.value - 1
            if (prevIdx >= 0) openArticle(articleStore.articles[prevIdx])
            break
        }
        case 's': {
            e.preventDefault()
            if (selectedArticle.value) toggleReadLaterInline()
            break
        }
        case 'm': {
            e.preventDefault()
            if (selectedArticle.value) {
                const currentIdx = selectedIndex.value
                markAsUnreadInline()
                closeArticlePanel()
                const next = articleStore.articles[currentIdx + 1]
                if (next) {
                    selectedArticleId.value = next.id
                    nextTick(() => {
                        document
                            .getElementById(`article-row-${next.id}`)
                            ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
                    })
                }
            }
            break
        }
        case 'Escape': {
            e.preventDefault()
            closeArticlePanel()
            break
        }
    }
}

// --- Mark all read ---
const markingAllRead = ref(false)
function markAllAsRead() {
    markingAllRead.value = true
    articleStore.markAllRead(activeFeedId.value)
    markingAllRead.value = false
    success('All marked as read')
}

// --- Refresh ---
const refreshing = ref(false)
async function refreshFeeds() {
    refreshing.value = true
    try {
        if (activeFeedId.value) {
            const endpoint = activeFeedInfo.value?.disabled_at
                ? `/api/feeds/${activeFeedId.value}/reenable`
                : `/api/feeds/${activeFeedId.value}/refresh`
            await axios.post(endpoint)
        }
        await Promise.all([articleStore.forceRefresh(), sidebarStore.fetchSidebar()])
    } finally {
        refreshing.value = false
    }
}

// --- Pull-to-refresh ---
const pullDistance = ref(0)
const isPulling = ref(false)
const isRefreshing = ref(false)
const PULL_THRESHOLD = 80
let pullStartY = 0

function onPullStart(e) {
    if (window.scrollY > 0 || isRefreshing.value) return
    pullStartY = e.touches[0].clientY
    isPulling.value = true
}

function onPullMove(e) {
    if (!isPulling.value || isRefreshing.value) return
    if (window.scrollY > 0) {
        isPulling.value = false
        pullDistance.value = 0
        return
    }
    const deltaY = e.touches[0].clientY - pullStartY
    if (deltaY > 0) pullDistance.value = Math.min(deltaY * 0.5, 120)
}

async function onPullEnd() {
    if (!isPulling.value) return
    isPulling.value = false
    if (pullDistance.value >= PULL_THRESHOLD && !isRefreshing.value) {
        isRefreshing.value = true
        pullDistance.value = 60
        await refreshFeeds()
        isRefreshing.value = false
        pullDistance.value = 0
    } else {
        pullDistance.value = 0
    }
}

// --- Swipe gestures ---
const swipeState = ref({})
const SWIPE_THRESHOLD = 80
const SWIPE_DEAD_ZONE = 10

function onTouchStart(articleId, e) {
    swipeState.value[articleId] = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        currentX: 0,
        swiping: false,
        directionLocked: false,
    }
}

function onTouchMove(articleId, e) {
    const state = swipeState.value[articleId]
    if (!state) return
    const deltaX = e.touches[0].clientX - state.startX
    const deltaY = e.touches[0].clientY - state.startY

    if (
        !state.directionLocked &&
        (Math.abs(deltaX) > SWIPE_DEAD_ZONE || Math.abs(deltaY) > SWIPE_DEAD_ZONE)
    ) {
        state.directionLocked = true
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            delete swipeState.value[articleId]
            return
        }
    }

    if (state.directionLocked && Math.abs(deltaX) > SWIPE_DEAD_ZONE) {
        state.swiping = true
        state.currentX = Math.max(Math.min(deltaX, 200), -200)
    }
}

function onTouchEnd(articleId, article) {
    const state = swipeState.value[articleId]
    if (!state) return

    if (state.currentX < -SWIPE_THRESHOLD) {
        // Swipe left → toggle read/unread
        if (article.is_read) articleStore.markUnread(article.id)
        else articleStore.markRead(article.id)
    } else if (state.currentX > SWIPE_THRESHOLD) {
        // Swipe right → toggle read later
        articleStore.toggleReadLater(article.id)
    }

    delete swipeState.value[articleId]
}

function getSwipeStyle(articleId) {
    const state = swipeState.value[articleId]
    if (!state || !state.swiping) return {}
    return { transform: `translateX(${state.currentX}px)`, transition: 'none' }
}

function isSwipingArticle(articleId) {
    return swipeState.value[articleId]?.swiping ?? false
}

function getSwipeDirection(articleId) {
    const state = swipeState.value[articleId]
    if (!state || !state.swiping) return null
    return state.currentX > 0 ? 'right' : 'left'
}
</script>

<template>
    <!-- Header: fixed on mobile, sticky on desktop -->
    <header
        :class="
            isDesktop
                ? 'sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pt-safe'
                : 'fixed top-0 inset-x-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pt-safe'
        ">
        <div class="flex h-11 items-center justify-between px-4">
            <div class="flex items-center gap-2 min-w-0">
                <button
                    @click="toggleSidebar()"
                    class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2"
                    title="Open sidebar"
                    aria-label="Open sidebar">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {{ articleStore.filterTitle }}
                    <span
                        v-if="headerUnreadCount > 0"
                        class="ml-1 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                        {{ headerUnreadCount }}
                    </span>
                </h1>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button
                    v-if="isSingleFeedView"
                    @click="showFeedInfo = !showFeedInfo"
                    class="rounded-lg p-2 transition-colors cursor-pointer"
                    :class="
                        showFeedInfo
                            ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                    "
                    title="Feed info"
                    aria-label="Feed info">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                </button>
                <button
                    @click="refreshFeeds"
                    :disabled="refreshing"
                    class="rounded-lg p-2 transition-colors cursor-pointer"
                    :class="
                        activeFeedInfo?.disabled_at
                            ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                    "
                    :title="
                        activeFeedInfo?.disabled_at
                            ? 'Feed is broken — click to retry'
                            : 'Refresh feed'
                    "
                    :aria-label="
                        activeFeedInfo?.disabled_at ? 'Retry broken feed' : 'Refresh feed'
                    ">
                    <svg
                        class="h-5 w-5 transition-transform"
                        :class="{ 'animate-spin': refreshing }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                    </svg>
                </button>
                <button
                    v-if="articleStore.unreadCount > 0"
                    @click="markAllAsRead"
                    :disabled="markingAllRead"
                    class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    title="Mark all as read"
                    aria-label="Mark all as read">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Feed info panel (single feed view) -->
    <div
        v-if="showFeedInfo && activeFeedInfo"
        class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3">
        <div class="flex items-start gap-3">
            <img
                v-if="activeFeedInfo.favicon_url"
                :src="activeFeedInfo.favicon_url"
                class="h-8 w-8 shrink-0 rounded-md mt-0.5"
                alt="" />
            <div class="min-w-0 flex-1">
                <h2 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {{ activeFeedInfo.title }}
                </h2>
                <p
                    v-if="activeFeedInfo.description"
                    class="mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    {{ activeFeedInfo.description }}
                </p>
                <a
                    v-if="activeFeedInfo.site_url"
                    :href="activeFeedInfo.site_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 hover:underline">
                    <svg
                        class="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {{ activeFeedInfo.site_url.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
                </a>
            </div>
        </div>
    </div>

    <!-- Loading state -->
    <div
        v-if="articleStore.loading && articleStore.articles.length === 0"
        class="flex items-center justify-center py-20"
        :style="!isDesktop ? 'margin-top: calc(2.75rem + env(safe-area-inset-top, 0px))' : ''">
        <svg class="h-8 w-8 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    </div>

    <!-- Desktop: article list with inline expansion -->
    <div
        v-else-if="isDesktop"
        class="flex"
        style="height: calc(100vh - 2.75rem - env(safe-area-inset-top, 0px))">
        <div ref="articleListEl" class="flex-1 flex flex-col overflow-y-auto pr-2">
            <template v-if="articleStore.articles.length > 0">
                <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                    <div
                        class="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur">
                        <h2
                            class="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500">
                            {{ dateLabel }}
                        </h2>
                    </div>
                    <div>
                        <template v-for="article in articles" :key="article.id">
                            <!-- Article row (becomes sticky header when expanded) -->
                            <div
                                :id="`article-row-${article.id}`"
                                class="flex w-full items-center gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-2.5 text-left transition-colors"
                                :class="[
                                    selectedArticleId === article.id
                                        ? 'sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b-neutral-200 dark:border-b-neutral-800'
                                        : 'group/row cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
                                ]"
                                @click="selectedArticleId !== article.id && openArticle(article)">
                                <template v-if="!isSingleFeedView">
                                    <img
                                        v-if="article.feed_favicon_url"
                                        :src="article.feed_favicon_url"
                                        class="h-4 w-4 shrink-0 rounded-sm"
                                        alt="" />
                                    <span
                                        class="w-32 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-500 hover:underline cursor-pointer"
                                        @click.stop="navigateToFeed(article.feed_id)">
                                        {{ article.feed_title }}
                                    </span>
                                </template>
                                <h3
                                    class="min-w-0 flex-1 truncate text-sm"
                                    :class="
                                        article.is_read
                                            ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                                            : 'text-neutral-900 dark:text-neutral-100 font-medium'
                                    ">
                                    {{ article.title }}
                                </h3>

                                <!-- Collapsed: summary + time + dismiss -->
                                <template v-if="selectedArticleId !== article.id">
                                    <span
                                        v-if="article.summary"
                                        class="hidden xl:block w-64 shrink-0 truncate text-xs text-neutral-500 dark:text-neutral-600">
                                        {{ article.summary }}
                                    </span>
                                    <span
                                        class="w-12 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-600">
                                        {{ timeAgo(article.published_at) }}
                                    </span>
                                    <span
                                        @click.stop="articleStore.dismissArticle(article.id)"
                                        class="w-6 shrink-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-opacity cursor-pointer"
                                        title="Dismiss — mark read & hide">
                                        <svg
                                            class="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="2"
                                            stroke="currentColor">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                </template>

                                <!-- Expanded: action buttons -->
                                <template v-else>
                                    <div class="flex shrink-0 items-center gap-0.5">
                                        <button
                                            @click.stop="toggleReadLaterInline"
                                            class="rounded-lg p-1.5 transition-colors cursor-pointer"
                                            :class="
                                                selectedIsReadLater
                                                    ? 'text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                    : 'text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300'
                                            "
                                            :title="
                                                selectedIsReadLater
                                                    ? 'Remove from Read Later'
                                                    : 'Save to Read Later'
                                            ">
                                            <svg
                                                class="h-4 w-4"
                                                :fill="
                                                    selectedIsReadLater ? 'currentColor' : 'none'
                                                "
                                                viewBox="0 0 24 24"
                                                stroke-width="1.5"
                                                stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                            </svg>
                                        </button>
                                        <button
                                            @click.stop="markAsUnreadInline"
                                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                                            title="Mark as unread">
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
                                        </button>
                                        <a
                                            v-if="selectedArticle?.url"
                                            :href="selectedArticle.url"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            @click.stop
                                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                            title="Open original">
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
                                        </a>
                                        <button
                                            @click.stop="closeArticlePanel"
                                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                                            title="Collapse (Esc)">
                                            <svg
                                                class="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke-width="1.5"
                                                stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                            </svg>
                                        </button>
                                    </div>
                                </template>
                            </div>

                            <!-- Inline expanded article content -->
                            <div
                                v-if="selectedArticleId === article.id"
                                :id="`article-expanded-${article.id}`"
                                class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                <!-- Loading state -->
                                <div
                                    v-if="loadingArticle && !selectedArticle"
                                    class="flex items-center justify-center py-12">
                                    <svg
                                        class="h-8 w-8 animate-spin text-neutral-400"
                                        fill="none"
                                        viewBox="0 0 24 24">
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
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>

                                <!-- Article content -->
                                <template v-if="selectedArticle">
                                    <article class="mx-auto max-w-3xl px-6 pt-5 pb-6">
                                        <!-- Article meta -->
                                        <div
                                            class="flex flex-wrap items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-500 mb-4">
                                            <span v-if="selectedArticle.author">{{
                                                selectedArticle.author
                                            }}</span>
                                            <span v-if="selectedArticle.author">&middot;</span>
                                            <span
                                                >{{ selectedFormattedDate }} at
                                                {{ selectedFormattedTime }}</span
                                            >
                                        </div>

                                        <img
                                            v-if="showHeroImage"
                                            :src="selectedArticle.image_url"
                                            :alt="selectedArticle.title"
                                            class="mb-6 w-full max-h-80 object-cover rounded-lg"
                                            loading="lazy" />

                                        <div
                                            class="article-content prose max-w-none dark:prose-invert prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-pre:bg-white dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-img:rounded-lg prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-500 dark:prose-blockquote:text-neutral-400"
                                            v-html="
                                                selectedArticle.content || selectedArticle.summary
                                            " />

                                        <div
                                            v-if="
                                                !selectedArticle.content && !selectedArticle.summary
                                            "
                                            class="py-12 text-center">
                                            <p class="text-neutral-500 dark:text-neutral-400">
                                                No article content available.
                                            </p>
                                            <a
                                                v-if="selectedArticle.url"
                                                :href="selectedArticle.url"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                                                Read on original site
                                            </a>
                                        </div>

                                        <!-- Keyboard shortcut hints -->
                                        <div
                                            class="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs text-neutral-400 dark:text-neutral-600">
                                            <span class="font-medium text-neutral-500"
                                                >Shortcuts:</span
                                            >
                                            <span class="ml-2"
                                                ><kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >j</kbd
                                                >/<kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >k</kbd
                                                >
                                                or
                                                <kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >&larr;</kbd
                                                >/<kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >&rarr;</kbd
                                                >
                                                navigate</span
                                            >
                                            <span class="ml-2"
                                                ><kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >s</kbd
                                                >
                                                save</span
                                            >
                                            <span class="ml-2"
                                                ><kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >m</kbd
                                                >
                                                mark unread</span
                                            >
                                            <span class="ml-2"
                                                ><kbd
                                                    class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5"
                                                    >Esc</kbd
                                                >
                                                close</span
                                            >
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>

                <!-- Load more sentinel -->
                <div ref="loadMoreSentinel" class="h-px" />

                <!-- Loading indicator -->
                <div v-if="articleStore.loadingMore" class="flex justify-center py-6">
                    <svg
                        class="h-6 w-6 animate-spin text-neutral-400"
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
                </div>

                <!-- No more articles -->
                <div
                    v-if="
                        !articleStore.hasMore &&
                        articleStore.loaded &&
                        groupedArticles &&
                        Object.keys(groupedArticles).length > 0
                    "
                    class="py-6 text-center text-sm text-neutral-500 dark:text-neutral-600">
                    No more articles
                </div>
            </template>

            <!-- Empty states (desktop) -->
            <div v-else class="flex flex-col items-center justify-center px-4 py-20 text-center">
                <template v-if="activeFilter === 'read_later'">
                    <svg
                        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        No saved articles
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        Save articles from your feeds to read later.
                    </p>
                </template>
                <template v-else-if="feedCount === 0">
                    <svg
                        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        No articles yet
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        Subscribe to feeds to start seeing articles here.
                    </p>
                    <button
                        type="button"
                        @click="openAddFeedModal()"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                        Add a Feed
                    </button>
                </template>
                <template v-else>
                    <svg
                        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        No articles yet
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        Subscribe to feeds to start seeing articles here.
                    </p>
                    <button
                        type="button"
                        @click="openAddFeedModal()"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                        Add a Feed
                    </button>
                </template>
            </div>
        </div>
    </div>

    <!-- Mobile layout -->
    <template v-else>
        <!-- Spacer for fixed header (h-11 + safe-area-inset-top) -->
        <div style="height: calc(2.75rem + env(safe-area-inset-top, 0px))"></div>

        <!-- Pull-to-refresh indicator -->
        <div
            class="flex items-center justify-center overflow-hidden transition-all duration-200"
            :style="{ height: pullDistance + 'px' }"
            :class="{ 'transition-none': isPulling }">
            <div class="flex flex-col items-center gap-1">
                <svg
                    class="h-5 w-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200"
                    :class="{ 'animate-spin': isRefreshing }"
                    :style="
                        !isRefreshing
                            ? {
                                  transform: `rotate(${
                                      Math.min(pullDistance / PULL_THRESHOLD, 1) * 360
                                  }deg)`,
                              }
                            : {}
                    "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                </svg>
                <span
                    v-if="!isRefreshing && pullDistance >= PULL_THRESHOLD"
                    class="text-[10px] text-neutral-600 dark:text-neutral-500"
                    >Release to refresh</span
                >
                <span
                    v-else-if="isRefreshing"
                    class="text-[10px] text-neutral-600 dark:text-neutral-500"
                    >Refreshing...</span
                >
            </div>
        </div>

        <!-- Scrollable area with pull-to-refresh touch handlers -->
        <div
            @touchstart.passive="onPullStart"
            @touchmove.passive="onPullMove"
            @touchend="onPullEnd">
            <!-- Empty state -->
            <div
                v-if="articleStore.articles.length === 0 && !articleStore.loading"
                class="flex flex-col items-center justify-center px-4 py-20 text-center">
                <template v-if="activeFilter === 'read_later'">
                    <svg
                        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        No saved articles
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        Save articles from your feeds to read later.
                    </p>
                </template>
                <template v-else-if="feedCount === 0">
                    <svg
                        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        No articles yet
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        Subscribe to feeds to start seeing articles here.
                    </p>
                    <button
                        type="button"
                        @click="openAddFeedModal()"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                        Add a Feed
                    </button>
                </template>
                <template v-else>
                    <svg
                        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        No articles yet
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        Subscribe to feeds to start seeing articles here.
                    </p>
                    <button
                        type="button"
                        @click="openAddFeedModal()"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                        Add a Feed
                    </button>
                </template>
            </div>

            <!-- Article list (mobile cards) -->
            <div v-else-if="articleStore.articles.length > 0">
                <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                    <div
                        class="sticky z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur"
                        style="top: calc(2.75rem + env(safe-area-inset-top, 0px))">
                        <h2
                            class="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500">
                            {{ dateLabel }}
                        </h2>
                    </div>
                    <div>
                        <div
                            v-for="article in articles"
                            :key="article.id"
                            class="relative overflow-hidden border-b border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-200 dark:bg-neutral-800">
                            <!-- Swipe right reveal: Read Later (left side) -->
                            <div
                                v-if="
                                    isSwipingArticle(article.id) &&
                                    getSwipeDirection(article.id) === 'right'
                                "
                                class="absolute inset-0 flex items-center bg-neutral-800 px-6">
                                <svg
                                    class="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                </svg>
                                <span
                                    class="ml-2 text-sm font-medium text-white uppercase tracking-wide">
                                    {{ article.is_read_later ? 'Saved' : 'Read Later' }}
                                </span>
                            </div>
                            <!-- Swipe left reveal: Mark as Read/Unread (right side) -->
                            <div
                                v-if="
                                    isSwipingArticle(article.id) &&
                                    getSwipeDirection(article.id) === 'left'
                                "
                                class="absolute inset-0 flex items-center justify-end bg-neutral-800 px-6">
                                <svg
                                    class="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span
                                    class="ml-2 text-sm font-medium text-white uppercase tracking-wide">
                                    {{ article.is_read ? 'Mark as Unread' : 'Mark as Read' }}
                                </span>
                            </div>
                            <button
                                @click="!isSwipingArticle(article.id) && openArticle(article)"
                                @touchstart="onTouchStart(article.id, $event)"
                                @touchmove="onTouchMove(article.id, $event)"
                                @touchend="onTouchEnd(article.id, article)"
                                class="relative flex w-full gap-3 bg-white dark:bg-neutral-950 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:bg-neutral-100 dark:active:bg-neutral-800/50"
                                :style="getSwipeStyle(article.id)">
                                <div class="min-w-0 flex-1">
                                    <div
                                        class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500">
                                        <template v-if="!isSingleFeedView">
                                            <img
                                                v-if="article.feed_favicon_url"
                                                :src="article.feed_favicon_url"
                                                class="h-3.5 w-3.5 rounded-sm"
                                                alt="" />
                                            <span
                                                class="truncate hover:underline"
                                                @click.stop="navigateToFeed(article.feed_id)">
                                                {{ article.feed_title }}
                                            </span>
                                            <span>&middot;</span>
                                        </template>
                                        <span class="shrink-0">{{
                                            timeAgo(article.published_at)
                                        }}</span>
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
                </template>

                <!-- Load more sentinel -->
                <div ref="loadMoreSentinel" class="h-px" />

                <!-- Loading indicator -->
                <div v-if="articleStore.loadingMore" class="flex justify-center py-6">
                    <svg
                        class="h-6 w-6 animate-spin text-neutral-400"
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
                </div>

                <!-- No more articles -->
                <div
                    v-if="
                        !articleStore.hasMore &&
                        articleStore.loaded &&
                        groupedArticles &&
                        Object.keys(groupedArticles).length > 0
                    "
                    class="py-6 text-center text-sm text-neutral-500 dark:text-neutral-600">
                    No more articles
                </div>
            </div>
        </div>
    </template>
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
</style>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
