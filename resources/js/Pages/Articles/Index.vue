<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import SidebarDrawer from '@/Components/SidebarDrawer.vue'
import { Head, Link, router } from '@inertiajs/vue3'
import { ref, computed, onMounted, onUnmounted, watch, provide, nextTick } from 'vue'
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { useOfflineQueue } from '@/Composables/useOfflineQueue.js'
import { useToast } from '@/Composables/useToast.js'
import { useReadingState } from '@/Composables/useReadingState.js'
import { useArticleReadState } from '@/Composables/useArticleReadState.js'
import { useAddFeedModal } from '@/Composables/useAddFeedModal.js'

const props = defineProps({
    articles: Object,
    unreadCount: Number,
    filterTitle: String,
    activeFeedId: Number,
    activeCategoryId: Number,
    activeFilter: String,
    sidebar: Object,
    feedCount: Number,
    hasPendingFeeds: Boolean,
    hideReadArticles: Boolean,
    allArticlesRead: Boolean,
    showAll: Boolean,
})

const isReadLaterView = computed(() => props.activeFilter === 'read_later')
const { isOnline } = useOnlineStatus()
const { enqueue } = useOfflineQueue()
const { success } = useToast()
const { saveReadingState, clearReadingState, loadReadingState } = useReadingState()
const { markRead, markUnread, applyReadStates } = useArticleReadState()
const { openAddFeedModal } = useAddFeedModal()

// Track when data was last fetched
const lastUpdatedAt = ref(new Date())
watch(
    () => props.articles,
    () => {
        lastUpdatedAt.value = new Date()
        clearReadingState()
    }
)

// Provide sidebar toggle for bottom nav in AppLayout
provide('toggleSidebar', () => {
    sidebarOpen.value = true
})

const loading = ref(false)
const loadingMore = ref(false)
const markingAllRead = ref(false)
const sidebarOpen = ref(false)
const hideRead = ref(props.hideReadArticles)
const togglingHideRead = ref(false)

// Desktop layout state
const isDesktop = ref(typeof window !== 'undefined' && window.innerWidth >= 1024)
const sidebarCollapsed = ref(false)
const selectedArticle = ref(null)
const selectedArticleId = ref(null)
const loadingArticle = ref(false)
const articleCache = new Map() // articleId → { article data }
const CACHE_MAX = 50
const selectedIsReadLater = ref(false)
const togglingReadLater = ref(false)
const markingUnread = ref(false)
const unsubscribing = ref(false)
const showUnsubscribeConfirm = ref(false)
const articleListEl = ref(null)

// Initialize sidebar collapsed state from localStorage
onMounted(async () => {
    const saved = localStorage.getItem('rreader-sidebar-collapsed')
    if (saved !== null) {
        sidebarCollapsed.value = saved === 'true'
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    articleListEl.value?.addEventListener('scroll', onArticleListScroll, { passive: true })

    // Restore reading state (e.g. after iOS memory eviction)
    const readingState = await loadReadingState()
    const currentUrl = window.location.pathname + window.location.search
    if (
        readingState &&
        readingState.selectedArticleId &&
        !selectedArticleId.value &&
        readingState.url === currentUrl
    ) {
        try {
            // Fetch article data first to ensure we can display it
            const article = await fetchArticleData(readingState.selectedArticleId)

            // Inject into list if not present (may be paginated or filtered out)
            if (!allArticles.value.some(a => a.id === readingState.selectedArticleId)) {
                allArticles.value.unshift({
                    id: article.id,
                    title: article.title,
                    summary: article.summary,
                    url: article.url,
                    author: article.author,
                    published_at: article.published_at,
                    is_read: true,
                    is_read_later: article.is_read_later ?? false,
                    feed: article.feed,
                })
            }

            selectedArticleId.value = readingState.selectedArticleId
            selectedArticle.value = article
            selectedIsReadLater.value = article.is_read_later ?? false
            loadingArticle.value = false

            await nextTick()
            if (articleListEl.value && readingState.listScrollTop) {
                articleListEl.value.scrollTop = readingState.listScrollTop
            }
        } catch {
            clearReadingState()
        }
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', checkDesktop)
    articleListEl.value?.removeEventListener('scroll', onArticleListScroll)
    clearTimeout(scrollSaveTimeout)
})

function checkDesktop() {
    isDesktop.value = window.innerWidth >= 1024
}

function toggleSidebarCollapse() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('rreader-sidebar-collapsed', String(sidebarCollapsed.value))
}

// Pull-to-refresh state
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
    if (deltaY > 0) {
        pullDistance.value = Math.min(deltaY * 0.5, 120)
    }
}

function onPullEnd() {
    if (!isPulling.value) return
    isPulling.value = false
    if (pullDistance.value >= PULL_THRESHOLD && !isRefreshing.value) {
        isRefreshing.value = true
        pullDistance.value = 60
        refreshFeeds()
    } else {
        pullDistance.value = 0
    }
}

// Local copies to avoid mutating props
const allArticles = ref([...props.articles.data])
const nextPageUrl = ref(props.articles.next_page_url)
const localUnreadCount = ref(props.unreadCount)

// Reconcile with in-memory read states (covers Inertia history restore)
function reconcileReadStates() {
    const deltas = applyReadStates(allArticles.value)
    let totalDelta = 0
    for (const [feedId, delta] of Object.entries(deltas)) {
        adjustUnreadCount(Number(feedId), delta)
        totalDelta += delta
    }
    if (totalDelta !== 0) {
        localUnreadCount.value = Math.max(0, localUnreadCount.value + totalDelta)
    }
}
reconcileReadStates()

watch(
    () => props.articles,
    newArticles => {
        allArticles.value = [...newArticles.data]
        nextPageUrl.value = newArticles.next_page_url
        localUnreadCount.value = props.unreadCount
        reconcileReadStates()
        // Clear selected article and cache on full navigation (filter change, etc.)
        selectedArticle.value = null
        selectedArticleId.value = null
        articleCache.clear()
    }
)

watch(
    () => props.hideReadArticles,
    val => {
        hideRead.value = val
    }
)

// Flat list of articles for keyboard navigation
const flatArticles = computed(() => allArticles.value)

// Current article index for keyboard navigation
const selectedIndex = computed(() => {
    if (!selectedArticleId.value) return -1
    return flatArticles.value.findIndex(a => a.id === selectedArticleId.value)
})

// Group articles by date
const groupedArticles = computed(() => {
    const groups = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    for (const article of allArticles.value) {
        const pubDate = new Date(article.published_at)
        pubDate.setHours(0, 0, 0, 0)

        let label
        if (pubDate.getTime() === today.getTime()) {
            label = 'Today'
        } else if (pubDate.getTime() === yesterday.getTime()) {
            label = 'Yesterday'
        } else {
            label = pubDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })
        }

        if (!groups[label]) {
            groups[label] = []
        }
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

function openArticle(article) {
    // Optimistic UI: mark as read immediately
    if (!article.is_read) {
        markRead(article.id, article.feed?.id)
        const idx = allArticles.value.findIndex(a => a.id === article.id)
        if (idx !== -1) {
            allArticles.value[idx] = { ...allArticles.value[idx], is_read: true }
        }
        localUnreadCount.value = Math.max(0, localUnreadCount.value - 1)
        // Desktop adjusts sidebar immediately (stays on page).
        // Mobile skips — reconcileReadStates handles it on return
        // to avoid double-counting with Inertia's history-saved state.
        if (isDesktop.value) {
            adjustUnreadCount(article.feed?.id, -1)
        }
    }

    if (isDesktop.value) {
        // Desktop: toggle inline expansion (clicking same article collapses it)
        if (selectedArticleId.value === article.id) {
            closeArticlePanel()
            return
        }
        selectedArticleId.value = article.id
        loadArticleInline(article.id)
    } else {
        // Mobile: navigate to Show page with feed context
        const ctx = {}
        if (props.activeFeedId) ctx.feed_id = props.activeFeedId
        if (props.activeCategoryId) ctx.category_id = props.activeCategoryId
        if (props.activeFilter) ctx.filter = props.activeFilter
        const qs = new URLSearchParams(ctx).toString()
        router.visit(route('articles.show', article.id) + (qs ? '?' + qs : ''))
    }
}

async function fetchArticleData(articleId) {
    const response = await fetch(route('articles.show', articleId), {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    if (!response.ok) throw new Error('Failed to load article')
    const data = await response.json()
    // Evict oldest entries if cache is full
    if (articleCache.size >= CACHE_MAX) {
        const oldest = articleCache.keys().next().value
        articleCache.delete(oldest)
    }
    articleCache.set(articleId, data.article)
    return data.article
}

function prefetchAdjacentArticles(articleId) {
    const idx = flatArticles.value.findIndex(a => a.id === articleId)
    if (idx === -1) return
    for (let i = 1; i <= 2; i++) {
        const next = flatArticles.value[idx + i]
        if (next && !articleCache.has(next.id)) {
            fetchArticleData(next.id).catch(() => {})
        }
    }
}

async function loadArticleInline(articleId, { restoring = false } = {}) {
    // Serve from cache if available
    const cached = articleCache.get(articleId)
    if (cached) {
        selectedArticle.value = cached
        selectedIsReadLater.value = cached.is_read_later ?? false
        loadingArticle.value = false
        await nextTick()
        if (!restoring) {
            const expandedEl = document.getElementById(`article-expanded-${articleId}`)
            if (expandedEl) expandedEl.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
        saveReadingState(buildReadingStateSnapshot())
        prefetchAdjacentArticles(articleId)
        return
    }

    loadingArticle.value = true
    try {
        const article = await fetchArticleData(articleId)
        selectedArticle.value = article
        selectedIsReadLater.value = article.is_read_later ?? false
        await nextTick()
        if (!restoring) {
            const expandedEl = document.getElementById(`article-expanded-${articleId}`)
            if (expandedEl) expandedEl.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
        saveReadingState(buildReadingStateSnapshot())
        prefetchAdjacentArticles(articleId)
    } catch (err) {
        console.error('Failed to load article:', err)
        router.visit(route('articles.show', articleId))
    } finally {
        loadingArticle.value = false
    }
}

function closeArticlePanel() {
    selectedArticle.value = null
    selectedArticleId.value = null
    clearReadingState()
}

function navigateToFeed(feedId) {
    closeArticlePanel()
    router.get(route('articles.index', { feed_id: feedId }))
}

function buildReadingStateSnapshot() {
    return {
        url: window.location.pathname + window.location.search,
        selectedArticleId: selectedArticleId.value,
        listScrollTop: articleListEl.value?.scrollTop ?? 0,
    }
}

let scrollSaveTimeout = null
function onArticleListScroll() {
    if (!selectedArticleId.value) return
    clearTimeout(scrollSaveTimeout)
    scrollSaveTimeout = setTimeout(() => {
        saveReadingState(buildReadingStateSnapshot())
    }, 500)
}

// Article reader actions (desktop inline)
function toggleReadLaterInline() {
    if (!selectedArticle.value || togglingReadLater.value) return
    togglingReadLater.value = true

    if (!isOnline.value) {
        selectedIsReadLater.value = !selectedIsReadLater.value
        enqueue('post', route('articles.toggleReadLater', selectedArticle.value.id), {})
        togglingReadLater.value = false
        success(selectedIsReadLater.value ? 'Article saved' : 'Removed from Read Later')
        return
    }

    router.post(
        route('articles.toggleReadLater', selectedArticle.value.id),
        {},
        {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                selectedIsReadLater.value = !selectedIsReadLater.value
                success(selectedIsReadLater.value ? 'Article saved' : 'Removed from Read Later')
            },
            onFinish: () => {
                togglingReadLater.value = false
            },
        }
    )
}

function markAsUnreadInline() {
    if (!selectedArticle.value || markingUnread.value) return
    markingUnread.value = true
    markUnread(selectedArticle.value.id)

    // Update local list
    const idx = allArticles.value.findIndex(a => a.id === selectedArticle.value.id)
    if (idx !== -1) {
        allArticles.value[idx] = { ...allArticles.value[idx], is_read: false }
    }
    localUnreadCount.value += 1
    adjustUnreadCount(selectedArticle.value.feed?.id, +1)

    if (!isOnline.value) {
        enqueue('post', route('articles.markAsUnread', selectedArticle.value.id), {})
        markingUnread.value = false
        success('Marked as unread')
        return
    }

    axios.post(route('articles.markAsUnread', selectedArticle.value.id)).finally(() => {
        markingUnread.value = false
        success('Marked as unread')
    })
}

// Whether to show a hero image at the top of the article content
const showHeroImage = computed(() => {
    if (!selectedArticle.value?.image_url) return false
    const content = selectedArticle.value.content || selectedArticle.value.summary || ''
    return !content.includes(selectedArticle.value.image_url)
})

const selectedFormattedDate = computed(() => {
    if (!selectedArticle.value) return ''
    const date = new Date(selectedArticle.value.published_at)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
})

const selectedFormattedTime = computed(() => {
    if (!selectedArticle.value) return ''
    const date = new Date(selectedArticle.value.published_at)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    })
})

// Keyboard shortcuts (desktop only)
function onKeyDown(e) {
    if (!isDesktop.value) return
    // Don't capture if user is typing in an input
    if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
    )
        return

    switch (e.key) {
        case 'ArrowRight':
        case 'j': {
            // Next article
            e.preventDefault()
            const nextIdx = selectedIndex.value + 1
            if (nextIdx < flatArticles.value.length) {
                openArticle(flatArticles.value[nextIdx])
            }
            break
        }
        case 'ArrowLeft':
        case 'k': {
            // Previous article
            e.preventDefault()
            const prevIdx = selectedIndex.value - 1
            if (prevIdx >= 0) {
                openArticle(flatArticles.value[prevIdx])
            }
            break
        }
        case 's': {
            // Save / toggle read later
            e.preventDefault()
            if (selectedArticle.value) {
                toggleReadLaterInline()
            }
            break
        }
        case 'm': {
            // Mark as unread
            e.preventDefault()
            if (selectedArticle.value) {
                const currentIdx = selectedIndex.value
                markAsUnreadInline()
                closeArticlePanel()
                const nextArticle = flatArticles.value[currentIdx + 1]
                if (nextArticle) {
                    selectedArticleId.value = nextArticle.id
                    scrollArticleIntoView(nextArticle.id)
                }
            }
            break
        }
        case 'Escape': {
            // Close article panel
            e.preventDefault()
            closeArticlePanel()
            break
        }
    }
}

function scrollArticleIntoView(articleId) {
    nextTick(() => {
        const el = document.getElementById(`article-row-${articleId}`)
        if (el) {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    })
}

onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
})

function markAllAsRead() {
    markingAllRead.value = true
    const data = {}
    if (props.activeFeedId) data.feed_id = props.activeFeedId
    if (props.activeCategoryId) data.category_id = props.activeCategoryId
    if (props.activeFilter) data.filter = props.activeFilter

    // Adjust sidebar counts for all currently unread articles
    const unreadByFeed = {}
    let totalUnreadInView = 0
    for (const article of allArticles.value) {
        if (!article.is_read && article.feed?.id) {
            unreadByFeed[article.feed.id] = (unreadByFeed[article.feed.id] || 0) + 1
            totalUnreadInView++
        }
    }
    for (const [feedId, count] of Object.entries(unreadByFeed)) {
        adjustUnreadCount(Number(feedId), -count)
    }
    localUnreadCount.value = Math.max(0, localUnreadCount.value - totalUnreadInView)

    if (!isOnline.value) {
        allArticles.value = allArticles.value.map(a => ({ ...a, is_read: true }))
        enqueue('post', route('articles.markAllAsRead'), data)
        markingAllRead.value = false
        success('All marked as read')
        return
    }

    router.post(route('articles.markAllAsRead'), data, {
        preserveScroll: true,
        onFinish: () => {
            markingAllRead.value = false
            success('All marked as read')
        },
    })
}

function loadMore() {
    if (!nextPageUrl.value || loadingMore.value) return

    loadingMore.value = true
    router.get(
        nextPageUrl.value,
        {},
        {
            preserveState: true,
            preserveScroll: true,
            only: ['articles'],
            onSuccess: page => {
                const newArticles = page.props.articles
                allArticles.value.push(...newArticles.data)
                nextPageUrl.value = newArticles.next_page_url
            },
            onFinish: () => {
                loadingMore.value = false
            },
        }
    )
}

function refreshFeeds() {
    loading.value = true

    router.reload({
        preserveScroll: true,
        onFinish: () => {
            loading.value = false
            isRefreshing.value = false
            pullDistance.value = 0
        },
    })
}

// Use fetch instead of router.patch to avoid Inertia page revisit,
// which would re-filter articles immediately and break the "hide on refresh only" behavior
async function toggleHideRead() {
    togglingHideRead.value = true
    const newValue = !hideRead.value
    try {
        await fetch(route('settings.update'), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                ),
            },
            body: JSON.stringify({ hide_read_articles: newValue }),
        })
        hideRead.value = newValue
        success(
            newValue
                ? 'Hiding read articles on next refresh'
                : 'Showing all articles on next refresh'
        )
    } finally {
        togglingHideRead.value = false
    }
}

// Unsubscribe from feed
function confirmUnsubscribe() {
    showUnsubscribeConfirm.value = true
}

function cancelUnsubscribe() {
    showUnsubscribeConfirm.value = false
}

function executeUnsubscribe() {
    if (!props.activeFeedId || unsubscribing.value) return
    unsubscribing.value = true
    showUnsubscribeConfirm.value = false

    router.delete(route('feeds.destroy', props.activeFeedId), {
        onFinish: () => {
            unsubscribing.value = false
        },
    })
}

// Adjust sidebar unread counts when read state changes
function adjustUnreadCount(feedId, delta) {
    if (!feedId || !props.sidebar || delta === 0) return

    // Adjust total unread
    props.sidebar.totalUnread = Math.max(0, (props.sidebar.totalUnread || 0) + delta)

    // Adjust per-feed and per-category counts
    for (const category of props.sidebar.categories || []) {
        for (const feed of category.feeds || []) {
            if (feed.id === feedId) {
                feed.unread_count = Math.max(0, (feed.unread_count || 0) + delta)
                category.unread_count = Math.max(0, (category.unread_count || 0) + delta)
                return
            }
        }
    }

    // Check uncategorized feeds
    for (const feed of props.sidebar.uncategorizedFeeds || []) {
        if (feed.id === feedId) {
            feed.unread_count = Math.max(0, (feed.unread_count || 0) + delta)
            return
        }
    }
}

function showAllArticles() {
    const params = {}
    if (props.activeFeedId) params.feed_id = props.activeFeedId
    if (props.activeCategoryId) params.category_id = props.activeCategoryId
    if (props.activeFilter) params.filter = props.activeFilter
    params.show_all = 1
    router.get(route('articles.index'), params)
}

// Bidirectional swipe gestures
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

    // Lock direction once past dead zone — ignore vertical swipes
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
        swipeToggleRead(article)
    } else if (state.currentX > SWIPE_THRESHOLD) {
        // Swipe right → toggle read later
        swipeToggleReadLater(article)
    }

    delete swipeState.value[articleId]
}

function swipeToggleRead(article) {
    const idx = allArticles.value.findIndex(a => a.id === article.id)
    if (idx === -1) return

    if (article.is_read) {
        markUnread(article.id)
        allArticles.value[idx] = { ...allArticles.value[idx], is_read: false }
        localUnreadCount.value += 1
        adjustUnreadCount(article.feed?.id, +1)
        if (!isOnline.value) {
            enqueue('post', route('articles.markAsUnread', article.id), {})
            return
        }
        axios.post(route('articles.markAsUnread', article.id))
    } else {
        markRead(article.id, article.feed?.id)
        allArticles.value[idx] = { ...allArticles.value[idx], is_read: true }
        localUnreadCount.value = Math.max(0, localUnreadCount.value - 1)
        adjustUnreadCount(article.feed?.id, -1)
        if (!isOnline.value) {
            enqueue('post', route('articles.markAsRead'), { article_ids: [article.id] })
            return
        }
        axios.post(route('articles.markAsRead'), { article_ids: [article.id] })
    }
}

function swipeToggleReadLater(article) {
    if (isReadLaterView.value) {
        // In Read Later view, right-swipe removes from list
        allArticles.value = allArticles.value.filter(a => a.id !== article.id)
        if (!isOnline.value) {
            enqueue('post', route('articles.toggleReadLater', article.id), {})
            return
        }
        router.post(
            route('articles.toggleReadLater', article.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        )
    } else {
        const idx = allArticles.value.findIndex(a => a.id === article.id)
        if (idx !== -1) {
            const current = allArticles.value[idx].is_read_later
            allArticles.value[idx] = { ...allArticles.value[idx], is_read_later: !current }
        }
        if (!isOnline.value) {
            enqueue('post', route('articles.toggleReadLater', article.id), {})
            return
        }
        router.post(
            route('articles.toggleReadLater', article.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        )
    }
}

function getSwipeStyle(articleId) {
    const state = swipeState.value[articleId]
    if (!state || !state.swiping) return {}
    return {
        transform: `translateX(${state.currentX}px)`,
        transition: 'none',
    }
}

function isSwipingArticle(articleId) {
    return swipeState.value[articleId]?.swiping ?? false
}

function getSwipeDirection(articleId) {
    const state = swipeState.value[articleId]
    if (!state || !state.swiping) return null
    return state.currentX > 0 ? 'right' : 'left'
}

// Load more is now manual (button click) to avoid infinite scroll loops

function formatLastUpdated(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
</script>

<template>
    <Head title="Articles" />

    <AppLayout>
        <template #header-left>
            <!-- Mobile: hamburger to open drawer -->
            <button
                @click="sidebarOpen = true"
                class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2 lg:hidden"
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
        </template>

        <template #title>
            {{ filterTitle }}
            <span
                v-if="localUnreadCount > 0"
                class="ml-2 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                {{ localUnreadCount }}
            </span>
        </template>

        <template #header-right>
            <button
                @click="toggleHideRead"
                :disabled="togglingHideRead"
                class="rounded-lg p-2 transition-colors cursor-pointer"
                :class="
                    hideRead
                        ? 'text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                "
                :title="hideRead ? 'Showing unread only' : 'Showing all articles'"
                :aria-label="hideRead ? 'Show all articles' : 'Hide read articles'">
                <!-- Eye-off icon when hiding read -->
                <svg
                    v-if="hideRead"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <!-- Eye icon when showing all -->
                <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
            <button
                @click="refreshFeeds"
                :disabled="loading"
                class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Refresh feeds"
                aria-label="Refresh feeds">
                <svg
                    class="h-5 w-5 transition-transform"
                    :class="{ 'animate-spin': loading }"
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
                v-if="localUnreadCount > 0"
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
            <button
                v-if="activeFeedId"
                @click="confirmUnsubscribe"
                :disabled="unsubscribing"
                class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Unsubscribe from feed"
                aria-label="Unsubscribe from feed">
                <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
        </template>

        <!-- Unsubscribe confirmation dialog -->
        <Teleport to="body">
            <Transition name="overlay">
                <div
                    v-if="showUnsubscribeConfirm"
                    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
                    @click.self="cancelUnsubscribe">
                    <div
                        class="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-xl">
                        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            Unsubscribe from feed?
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            This will remove
                            <strong class="text-neutral-800 dark:text-neutral-200">{{
                                filterTitle
                            }}</strong>
                            and all its articles. This cannot be undone.
                        </p>
                        <div class="mt-6 flex justify-end gap-3">
                            <button
                                @click="cancelUnsubscribe"
                                class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button
                                @click="executeUnsubscribe"
                                :disabled="unsubscribing"
                                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer">
                                {{ unsubscribing ? 'Removing...' : 'Unsubscribe' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Mobile: Sidebar drawer (overlay) -->
        <SidebarDrawer
            v-if="!isDesktop"
            :open="sidebarOpen"
            :persistent="false"
            :sidebar="sidebar"
            :active-feed-id="activeFeedId"
            :active-category-id="activeCategoryId"
            :active-filter="activeFilter"
            @close="sidebarOpen = false" />

        <!-- Desktop: 2-column layout (sidebar + full-width article list with inline expansion) -->
        <div v-if="isDesktop" class="flex" style="height: calc(100vh - 2.75rem)">
            <!-- Left: Persistent sidebar -->
            <SidebarDrawer
                :open="true"
                :persistent="true"
                :collapsed="sidebarCollapsed"
                :sidebar="sidebar"
                :active-feed-id="activeFeedId"
                :active-category-id="activeCategoryId"
                :active-filter="activeFilter"
                @collapse-toggle="toggleSidebarCollapse" />

            <!-- Article list with inline expansion -->
            <div ref="articleListEl" class="flex-1 flex flex-col overflow-y-auto">
                <!-- Desktop article list with inline expansion -->
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
                            <!-- Article row -->
                            <button
                                :id="`article-row-${article.id}`"
                                @click="openArticle(article)"
                                class="flex w-full items-center gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-2.5 text-left transition-colors cursor-pointer"
                                :class="[
                                    selectedArticleId === article.id
                                        ? 'bg-blue-50 dark:bg-neutral-900 border-l-2 border-l-blue-500'
                                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
                                ]">
                                <img
                                    v-if="article.feed?.favicon_url"
                                    :src="article.feed.favicon_url"
                                    class="h-4 w-4 shrink-0 rounded-sm"
                                    alt="" />
                                <span
                                    class="w-32 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-500 hover:underline cursor-pointer"
                                    @click.stop="
                                        router.get(
                                            route('articles.index', {
                                                feed_id: article.feed?.id,
                                            })
                                        )
                                    "
                                    >{{ article.feed?.title }}</span
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
                                    v-if="article.summary && selectedArticleId !== article.id"
                                    class="hidden xl:block w-64 shrink-0 truncate text-xs text-neutral-500 dark:text-neutral-600">
                                    {{ article.summary }}
                                </span>
                                <span
                                    class="w-12 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-600"
                                    >{{ timeAgo(article.published_at) }}</span
                                >
                            </button>

                            <!-- Inline expanded article (Feedly-style) -->
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
                                    <!-- Compact sticky header bar: title + action buttons inline, metadata below -->
                                    <div
                                        class="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/80 backdrop-blur px-4 py-2">
                                        <div class="flex items-center justify-between gap-3">
                                            <h2
                                                class="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                <a
                                                    v-if="selectedArticle.url"
                                                    :href="selectedArticle.url"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                                    {{ selectedArticle.title }}
                                                </a>
                                                <template v-else>{{
                                                    selectedArticle.title
                                                }}</template>
                                            </h2>
                                            <div class="flex shrink-0 items-center gap-0.5">
                                                <button
                                                    @click.stop="toggleReadLaterInline"
                                                    :disabled="togglingReadLater"
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
                                                    "
                                                    :aria-label="
                                                        selectedIsReadLater
                                                            ? 'Remove from Read Later'
                                                            : 'Save to Read Later'
                                                    ">
                                                    <svg
                                                        class="h-4 w-4"
                                                        :fill="
                                                            selectedIsReadLater
                                                                ? 'currentColor'
                                                                : 'none'
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
                                                    :disabled="markingUnread"
                                                    class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                                                    title="Mark as unread"
                                                    aria-label="Mark as unread">
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
                                                <button
                                                    @click.stop="closeArticlePanel"
                                                    class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                                                    title="Close article"
                                                    aria-label="Close article">
                                                    <svg
                                                        class="h-4 w-4"
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
                                        </div>
                                        <div
                                            class="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-500">
                                            <a
                                                v-if="selectedArticle.feed?.id"
                                                :href="
                                                    route('articles.index', {
                                                        feed_id: selectedArticle.feed.id,
                                                    })
                                                "
                                                class="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                                @click.prevent="
                                                    navigateToFeed(selectedArticle.feed.id)
                                                ">
                                                <img
                                                    v-if="selectedArticle.feed?.favicon_url"
                                                    :src="selectedArticle.feed.favicon_url"
                                                    class="h-3.5 w-3.5 rounded-sm"
                                                    alt="" />
                                                <span>{{ selectedArticle.feed?.title }}</span>
                                            </a>
                                            <span v-if="selectedArticle.author"
                                                >&middot; {{ selectedArticle.author }}</span
                                            >
                                            <span
                                                >&middot; {{ selectedFormattedDate }} at
                                                {{ selectedFormattedTime }}</span
                                            >
                                        </div>
                                    </div>

                                    <article class="mx-auto max-w-3xl px-6 pt-6 pb-6">
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

                <!-- Empty state (desktop) -->
                <div
                    v-if="allArticles.length === 0"
                    class="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <!-- Read Later empty -->
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
                    <!-- No feeds at all -->
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
                    <!-- All articles read (hide-read mode) -->
                    <template v-else-if="hideReadArticles && allArticlesRead && !showAll">
                        <svg
                            class="h-16 w-16 text-green-400 dark:text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1"
                            stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                            All caught up!
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                            You've read everything in this view.
                        </p>
                        <button
                            @click="showAllArticles"
                            class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                            Show all articles
                        </button>
                    </template>
                    <!-- Feeds exist but still being fetched -->
                    <template v-else-if="hasPendingFeeds">
                        <svg
                            class="h-10 w-10 animate-spin text-neutral-400 dark:text-neutral-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                            Fetching your feeds...
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                            Articles will appear here shortly as your feeds are being updated.
                        </p>
                    </template>
                    <!-- Specific feed has no articles -->
                    <template v-else-if="activeFeedId">
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
                            No articles in this feed
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                            This feed doesn't have any articles yet.
                        </p>
                    </template>
                    <!-- Generic fallback -->
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

                <!-- Infinite scroll sentinel -->
                <div v-if="nextPageUrl" class="flex justify-center py-6">
                    <button
                        @click="loadMore"
                        :disabled="loadingMore"
                        class="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50">
                        {{ loadingMore ? 'Loading...' : 'Load more articles' }}
                    </button>
                </div>

                <!-- End of list -->
                <div
                    v-else-if="allArticles.length > 0"
                    class="py-8 text-center text-sm text-neutral-500 dark:text-neutral-600">
                    You're all caught up
                </div>

                <!-- Last updated timestamp (shown when offline) -->
                <div
                    v-if="!isOnline"
                    class="pb-4 text-center text-xs text-neutral-500 dark:text-neutral-600">
                    Last updated at {{ formatLastUpdated(lastUpdatedAt) }}
                </div>
            </div>
        </div>

        <!-- Mobile layout (unchanged) -->
        <template v-if="!isDesktop">
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
                    v-if="allArticles.length === 0"
                    class="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <!-- Read Later empty -->
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
                    <!-- No feeds at all -->
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
                    <!-- All articles read (hide-read mode) -->
                    <template v-else-if="hideReadArticles && allArticlesRead && !showAll">
                        <svg
                            class="h-16 w-16 text-green-400 dark:text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1"
                            stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                            All caught up!
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                            You've read everything in this view.
                        </p>
                        <button
                            @click="showAllArticles"
                            class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                            Show all articles
                        </button>
                    </template>
                    <!-- Feeds exist but still being fetched -->
                    <template v-else-if="hasPendingFeeds">
                        <svg
                            class="h-10 w-10 animate-spin text-neutral-400 dark:text-neutral-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                            Fetching your feeds...
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                            Articles will appear here shortly as your feeds are being updated.
                        </p>
                    </template>
                    <!-- Specific feed has no articles -->
                    <template v-else-if="activeFeedId">
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
                            No articles in this feed
                        </h3>
                        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                            This feed doesn't have any articles yet.
                        </p>
                    </template>
                    <!-- Generic fallback -->
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

                <!-- Article list -->
                <div v-else>
                    <!-- Mobile view: card layout -->
                    <div>
                        <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                            <div
                                class="sticky top-14 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur">
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
                                            {{
                                                article.is_read ? 'Mark as Unread' : 'Mark as Read'
                                            }}
                                        </span>
                                    </div>
                                    <button
                                        @click="
                                            !isSwipingArticle(article.id) && openArticle(article)
                                        "
                                        @touchstart="onTouchStart(article.id, $event)"
                                        @touchmove="onTouchMove(article.id, $event)"
                                        @touchend="onTouchEnd(article.id, article)"
                                        class="relative flex w-full gap-3 bg-white dark:bg-neutral-950 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:bg-neutral-100 dark:active:bg-neutral-800/50"
                                        :style="getSwipeStyle(article.id)">
                                        <div class="min-w-0 flex-1">
                                            <div
                                                class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500">
                                                <img
                                                    v-if="article.feed?.favicon_url"
                                                    :src="article.feed.favicon_url"
                                                    class="h-3.5 w-3.5 rounded-sm"
                                                    alt="" />
                                                <span
                                                    class="truncate hover:underline"
                                                    @click.stop="
                                                        router.get(
                                                            route('articles.index', {
                                                                feed_id: article.feed?.id,
                                                            })
                                                        )
                                                    "
                                                    >{{ article.feed?.title }}</span
                                                >
                                                <span>&middot;</span>
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
                    </div>

                    <!-- Infinite scroll sentinel -->
                    <div v-if="nextPageUrl" class="flex justify-center py-6">
                        <button
                            @click="loadMore"
                            :disabled="loadingMore"
                            class="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50">
                            {{ loadingMore ? 'Loading...' : 'Load more articles' }}
                        </button>
                    </div>

                    <!-- End of list -->
                    <div
                        v-else
                        class="py-8 text-center text-sm text-neutral-500 dark:text-neutral-600">
                        You're all caught up
                    </div>

                    <!-- Last updated timestamp (shown when offline) -->
                    <div
                        v-if="!isOnline"
                        class="pb-4 text-center text-xs text-neutral-500 dark:text-neutral-600">
                        Last updated at {{ formatLastUpdated(lastUpdatedAt) }}
                    </div>
                </div>
            </div>
            <!-- end pull-to-refresh touch area -->
        </template>
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

.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}
</style>
