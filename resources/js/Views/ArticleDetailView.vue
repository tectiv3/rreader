<script setup>
import { useArticleStore } from '@/Stores/useArticleStore.js'
import { useToast } from '@/Composables/useToast.js'
import { useRouter, useRoute } from 'vue-router'
import { setTitle } from '@/router.js'
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const articleStore = useArticleStore()
const router = useRouter()
const route = useRoute()
const { success } = useToast()

const article = ref(null)
const loading = ref(true)
const isReadLater = ref(false)
const showMenu = ref(false)
const menuRef = ref(null)
const articleEl = ref(null)
const navigating = ref(false)

// Mobile detection for pull-to-dismiss
const isMobile = ref(false)
const scrollContainer = ref(null)

function checkMobile() {
    const mobile = window.innerWidth < 1024
    if (isMobile.value !== mobile) isMobile.value = mobile
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

// --- Reading state persistence (restore article on app reopen) ---
function saveReadingState(url) {
    window.__swReady?.then(sw => {
        if (sw) sw.postMessage({ type: 'save-reading-state', state: { url } })
    })
}

function clearReadingState() {
    window.__swReady?.then(sw => {
        if (sw) sw.postMessage({ type: 'clear-reading-state' })
    })
}

onUnmounted(() => clearReadingState())

// --- Load article ---
async function loadArticle(id) {
    loading.value = true
    article.value = null
    if (isMobile.value && scrollContainer.value) scrollContainer.value.scrollTop = 0
    else window.scrollTo(0, 0)

    const url = `/articles/${id}`
    saveReadingState(url)

    try {
        const content = await articleStore.fetchContent(Number(id))
        article.value = content
        isReadLater.value = content.is_read_later || false
        setTitle(content.title)
        articleStore.markRead(Number(id))
        articleStore.prefetchAdjacent(Number(id))
    } catch {
        clearReadingState()
        router.replace({ name: 'articles.index' })
    } finally {
        loading.value = false
    }
}

// Load on mount
loadArticle(route.params.id)

// Watch for route param changes (same component, different article)
watch(
    () => route.params.id,
    async newId => {
        if (newId && route.name === 'articles.show') {
            navigating.value = false
            await loadArticle(newId)
            await nextTick()
            applySlideInAnimation()
        }
    }
)

// --- Adjacent navigation ---
const adjacentIds = computed(() => {
    if (!article.value) return { prev: null, next: null }
    return articleStore.adjacentIds(article.value.id)
})

function navigateToArticle(direction) {
    if (navigating.value) return
    const id = direction === 'next' ? adjacentIds.value.next : adjacentIds.value.prev
    if (!id) return
    navigating.value = true
    sessionStorage.setItem('article-swipe-direction', direction)
    router.replace({ name: 'articles.show', params: { id } })
}

// --- Formatting ---
const showHeroImage = computed(() => {
    if (!article.value?.image_url) return false
    const content = article.value.content || article.value.summary || ''
    return !content.includes(article.value.image_url)
})

const formattedDate = computed(() => {
    if (!article.value) return ''
    return new Date(article.value.published_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
})

const formattedTime = computed(() => {
    if (!article.value) return ''
    return new Date(article.value.published_at).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    })
})

// --- Actions ---
function goBack() {
    clearReadingState()
    const currentPath = route.fullPath
    router.back()
    // If router.back() had no effect (e.g. PWA with no history after reading-state restore),
    // fall back to navigating to the article list
    setTimeout(() => {
        if (route.fullPath === currentPath) {
            router.push({ name: 'articles.index' })
        }
    }, 100)
}

function toggleReadLater() {
    if (!article.value) return
    articleStore.toggleReadLater(article.value.id)
    isReadLater.value = !isReadLater.value
    success(isReadLater.value ? 'Article saved' : 'Removed from Read Later')
}

function markAsUnread() {
    if (!article.value) return
    showMenu.value = false
    articleStore.markUnread(article.value.id)
    success('Marked as unread')
}

function openInBrowser() {
    if (article.value?.url) {
        showMenu.value = false
        try {
            const url = new URL(article.value.url)
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                window.open(url.href, '_blank', 'noopener,noreferrer')
            }
        } catch {
            // Invalid URL
        }
    }
}

function shareArticle() {
    if (!article.value) return
    if (navigator.share) {
        navigator
            .share({
                title: article.value.title,
                url: article.value.url,
            })
            .catch(() => {})
    } else if (article.value.url) {
        navigator.clipboard
            .writeText(article.value.url)
            .then(() => {
                success('Link copied to clipboard')
            })
            .catch(() => {})
    }
}

function toggleMenu() {
    showMenu.value = !showMenu.value
}

function closeMenu(e) {
    if (menuRef.value && !menuRef.value.contains(e.target)) {
        showMenu.value = false
    }
}

// --- Keyboard navigation ---
function onKeydown(e) {
    if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
    )
        return
    if (e.key === 'ArrowRight' || e.key === 'j') navigateToArticle('next')
    else if (e.key === 'ArrowLeft' || e.key === 'k') navigateToArticle('prev')
    else if (e.key === 'Escape') goBack()
}

function applySlideInAnimation() {
    const direction = sessionStorage.getItem('article-swipe-direction')
    if (direction && articleEl.value) {
        sessionStorage.removeItem('article-swipe-direction')
        const el = articleEl.value
        const translateFrom = direction === 'next' ? '40%' : '-40%'
        el.style.transition = 'none'
        el.style.transform = `translateX(${translateFrom})`
        el.offsetHeight // force reflow
        el.style.transition = 'transform 160ms ease-out'
        el.style.transform = 'translateX(0)'
        el.addEventListener(
            'transitionend',
            () => {
                el.style.transition = ''
                el.style.transform = ''
            },
            { once: true }
        )
    }
}

onMounted(() => {
    document.addEventListener('click', closeMenu)
    document.addEventListener('keydown', onKeydown)

    applySlideInAnimation()
})

onUnmounted(() => {
    document.removeEventListener('click', closeMenu)
    document.removeEventListener('keydown', onKeydown)
    touchState = 'idle'
    resetTransform()
})

// --- Pull-to-dismiss + horizontal swipe navigation ---
const DISMISS_THRESHOLD = 150
const DIRECTION_LOCK_DISTANCE = 15
const HORIZONTAL_SWIPE_THRESHOLD = 100
const VELOCITY_THRESHOLD = 0.5 // px/ms for velocity-based commit
const HORIZONTAL_DAMPING = 0.45

const scrimEl = ref(null)
const swipeIndicatorEl = ref(null)
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0
let touchState = 'idle' // idle | tracking | dismissing | horizontal | animating
let startedAtScrollTop = false
let horizontalDampedX = 0

function isContentZoomed() {
    if (window.visualViewport) {
        return window.visualViewport.scale > 1.05
    }
    return false
}

function onTouchStart(e) {
    if (touchState === 'animating') return
    if (!isMobile.value) return
    if (navigating.value) return
    if (isContentZoomed()) return

    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()
    horizontalDampedX = 0

    // Only track for dismiss if at scroll top
    const container = scrollContainer.value
    startedAtScrollTop = container ? container.scrollTop <= 0 : false
    touchState = 'tracking'
}

function onTouchMove(e) {
    if (touchState === 'idle' || touchState === 'animating') return
    if (!isMobile.value) return

    const deltaX = e.touches[0].clientX - touchStartX
    const deltaY = e.touches[0].clientY - touchStartY
    const absDX = Math.abs(deltaX)
    const absDY = Math.abs(deltaY)

    // Direction lock phase
    if (touchState === 'tracking') {
        const totalDelta = Math.sqrt(absDX * absDX + absDY * absDY)
        if (totalDelta < DIRECTION_LOCK_DISTANCE) return

        if (absDY > absDX && deltaY > 0 && startedAtScrollTop) {
            touchState = 'dismissing'
            e.preventDefault()
        } else if (absDX > absDY * 1.2) {
            // Only lock horizontal if clearly more horizontal than vertical
            touchState = 'horizontal'
            e.preventDefault()
        } else {
            // Ambiguous or vertical scroll — bail out
            touchState = 'idle'
            return
        }
    }

    if (touchState === 'dismissing') {
        e.preventDefault()
        const rawDelta = Math.max(0, e.touches[0].clientY - touchStartY)
        applyDismissTransform(rawDelta)
    }

    if (touchState === 'horizontal') {
        e.preventDefault()
        applyHorizontalSwipeTransform(deltaX)
    }
}

function onTouchEnd(e) {
    const prevState = touchState
    const deltaX = e.changedTouches[0].clientX - touchStartX
    const deltaY = e.changedTouches[0].clientY - touchStartY

    if (prevState === 'horizontal') {
        const elapsed = Date.now() - touchStartTime
        const velocity = Math.abs(deltaX) / Math.max(elapsed, 1)
        const committed =
            Math.abs(horizontalDampedX) > HORIZONTAL_SWIPE_THRESHOLD ||
            velocity > VELOCITY_THRESHOLD

        if (committed && !navigating.value) {
            const direction = horizontalDampedX < 0 ? 'next' : 'prev'
            const targetId = direction === 'next' ? adjacentIds.value.next : adjacentIds.value.prev
            if (targetId) {
                animateHorizontalCommit(direction)
                return
            }
        }
        // Snap back
        animateHorizontalSnapBack()
        return
    }

    if (prevState === 'dismissing') {
        const elapsed = Date.now() - touchStartTime
        const velocity = deltaY / Math.max(elapsed, 1)
        const viewportThreshold = window.innerHeight * 0.3
        const dampedDelta = Math.max(0, deltaY) * 0.6

        if (dampedDelta > DISMISS_THRESHOLD || dampedDelta > viewportThreshold || velocity > 1.5) {
            animateDismiss()
        } else {
            animateSnapBack()
        }
        return
    }

    touchState = 'idle'
}

// --- Horizontal swipe visual tracking ---
function applyHorizontalSwipeTransform(rawDeltaX) {
    const articleContent = articleEl.value
    const indicator = swipeIndicatorEl.value
    if (!articleContent) return

    // Determine if there's an article in this direction
    const direction = rawDeltaX < 0 ? 'next' : 'prev'
    const hasTarget = direction === 'next' ? adjacentIds.value.next : adjacentIds.value.prev

    // Apply damping — stronger if no target in that direction
    const damping = hasTarget ? HORIZONTAL_DAMPING : 0.15
    horizontalDampedX = rawDeltaX * damping

    // Translate the article content
    articleContent.style.transition = 'none'
    articleContent.style.transform = `translateX(${horizontalDampedX}px)`
    articleContent.style.willChange = 'transform'

    // Update swipe indicator
    if (indicator) {
        const progress = Math.min(Math.abs(horizontalDampedX) / HORIZONTAL_SWIPE_THRESHOLD, 1)
        const isLeft = rawDeltaX < 0
        indicator.style.transition = 'none'
        indicator.style.opacity = String(hasTarget ? progress * 0.9 : progress * 0.3)
        indicator.className =
            'swipe-indicator ' + (isLeft ? 'swipe-indicator-right' : 'swipe-indicator-left')
        // Scale the chevron based on progress
        const chevron = indicator.querySelector('.swipe-chevron')
        if (chevron) {
            const scale = 0.6 + 0.4 * progress
            const flipX = isLeft ? ' scaleX(-1)' : ''
            chevron.style.transform = `scale(${scale})${flipX}`
            chevron.style.opacity = String(hasTarget ? 1 : 0.4)
        }
        const label = indicator.querySelector('.swipe-label')
        if (label) {
            label.style.opacity = String(progress > 0.6 ? (progress - 0.6) / 0.4 : 0)
            label.textContent = hasTarget ? (isLeft ? 'Next' : 'Previous') : ''
        }
    }
}

function animateHorizontalCommit(direction) {
    touchState = 'animating'
    const articleContent = articleEl.value
    const indicator = swipeIndicatorEl.value
    if (!articleContent) return

    const targetX = direction === 'next' ? -window.innerWidth : window.innerWidth

    articleContent.style.transition = 'transform 200ms ease-in'
    articleContent.style.transform = `translateX(${targetX}px)`

    if (indicator) {
        indicator.style.transition = 'opacity 200ms ease-in'
        indicator.style.opacity = '0'
    }

    let done = false
    const cleanup = () => {
        if (done) return
        done = true
        clearTimeout(timeout)
        resetHorizontalSwipe()
        navigateToArticle(direction)
    }

    const timeout = setTimeout(cleanup, 300)
    articleContent.addEventListener('transitionend', cleanup, { once: true })
}

function animateHorizontalSnapBack() {
    touchState = 'animating'
    const articleContent = articleEl.value
    const indicator = swipeIndicatorEl.value
    if (!articleContent) {
        touchState = 'idle'
        return
    }

    articleContent.style.transition = 'transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1.0)'
    articleContent.style.transform = 'translateX(0)'

    if (indicator) {
        indicator.style.transition = 'opacity 250ms ease-out'
        indicator.style.opacity = '0'
    }

    let done = false
    const cleanup = () => {
        if (done) return
        done = true
        clearTimeout(timeout)
        resetHorizontalSwipe()
    }

    const timeout = setTimeout(cleanup, 350)
    articleContent.addEventListener('transitionend', cleanup, { once: true })
}

function resetHorizontalSwipe() {
    touchState = 'idle'
    horizontalDampedX = 0
    const articleContent = articleEl.value
    const indicator = swipeIndicatorEl.value
    if (articleContent) {
        articleContent.style.transition = ''
        articleContent.style.transform = ''
        articleContent.style.willChange = ''
    }
    if (indicator) {
        indicator.style.transition = ''
        indicator.style.opacity = '0'
    }
}

function applyDismissTransform(rawDelta) {
    const container = scrollContainer.value
    const scrim = scrimEl.value
    if (!container) return

    const dampedDelta = rawDelta * 0.6
    const maxDrag = window.innerHeight * 0.5
    const progress = Math.min(dampedDelta / maxDrag, 1)
    const scale = 1 - 0.08 * progress // 1.0 → 0.92

    container.style.transition = 'none'
    container.style.transform = `translateY(${dampedDelta}px) scale(${scale})`
    container.style.transformOrigin = 'top center'
    container.style.borderRadius = `${12 * progress}px`

    if (scrim) {
        scrim.style.transition = 'none'
        scrim.style.opacity = String(0.5 * progress)
    }
}

function animateDismiss() {
    touchState = 'animating'
    const container = scrollContainer.value
    const scrim = scrimEl.value
    if (!container) return

    container.style.transition = 'transform 250ms ease-in, border-radius 250ms ease-in'
    container.style.transform = 'translateY(100vh) scale(0.9)'
    container.style.borderRadius = '12px'

    if (scrim) {
        scrim.style.transition = 'opacity 250ms ease-in'
        scrim.style.opacity = '0'
    }

    let done = false
    const cleanup = () => {
        if (done) return
        done = true
        clearTimeout(timeout)
        touchState = 'idle'
        resetTransform()
        goBack()
    }

    const timeout = setTimeout(cleanup, 400)
    container.addEventListener('transitionend', cleanup, { once: true })
}

function animateSnapBack() {
    touchState = 'animating'
    const container = scrollContainer.value
    const scrim = scrimEl.value
    if (!container) return

    container.style.transition =
        'transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1.0), border-radius 300ms ease-out'
    container.style.transform = 'translateY(0) scale(1)'
    container.style.borderRadius = '0px'

    if (scrim) {
        scrim.style.transition = 'opacity 300ms ease-out'
        scrim.style.opacity = '0'
    }

    let done = false
    const cleanup = () => {
        if (done) return
        done = true
        clearTimeout(timeout)
        touchState = 'idle'
        resetTransform()
    }

    const timeout = setTimeout(cleanup, 450)
    container.addEventListener('transitionend', cleanup, { once: true })
}

function resetTransform() {
    const container = scrollContainer.value
    const scrim = scrimEl.value
    if (container) {
        container.style.transition = ''
        container.style.transform = ''
        container.style.transformOrigin = ''
        container.style.borderRadius = ''
    }
    if (scrim) {
        scrim.style.transition = ''
        scrim.style.opacity = '0'
    }
}

function navigateToFeed(feedId) {
    router.push({ name: 'articles.index', query: { feed_id: feedId } })
}
</script>

<template>
    <div>
        <!-- Scrim overlay (mobile only, visible during dismiss drag) -->
        <div
            v-show="isMobile"
            ref="scrimEl"
            class="fixed inset-0 z-40 bg-black pointer-events-none"
            style="opacity: 0" />

        <!-- Horizontal swipe indicator (mobile only) -->
        <div v-show="isMobile" ref="swipeIndicatorEl" class="swipe-indicator" style="opacity: 0">
            <div class="swipe-chevron">
                <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </div>
            <span class="swipe-label"></span>
        </div>

        <!-- Article container: fixed overlay on mobile, normal flow on desktop -->
        <div
            ref="scrollContainer"
            :class="
                isMobile
                    ? 'fixed inset-0 z-50 overflow-y-auto overscroll-none bg-white dark:bg-neutral-950'
                    : ''
            "
            @touchstart.passive="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd">
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
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button
                            v-if="article"
                            @click="toggleReadLater"
                            class="rounded-lg p-2 transition-colors cursor-pointer"
                            :class="
                                isReadLater
                                    ? 'text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                            "
                            :aria-label="
                                isReadLater ? 'Remove from Read Later' : 'Save to Read Later'
                            ">
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

                        <button
                            v-if="article"
                            @click="shareArticle"
                            class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
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

                        <div v-if="article" ref="menuRef" class="relative">
                            <button
                                @click="toggleMenu"
                                class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
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

                            <div
                                v-if="showMenu"
                                class="absolute right-0 top-full mt-1 w-48 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg py-1 z-50">
                                <button
                                    @click="markAsUnread()"
                                    class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
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
                                    class="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
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
                    </div>
                </div>
            </header>

            <!-- Loading state -->
            <div v-if="loading" class="flex items-center justify-center py-20">
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

            <!-- Article content -->
            <div v-else-if="article" class="overflow-x-hidden">
                <article ref="articleEl" class="mx-auto max-w-3xl px-4 py-6">
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
                                v-if="article.feed_id"
                                href="#"
                                class="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                @click.prevent="navigateToFeed(article.feed_id)">
                                <img
                                    v-if="article.feed_favicon_url"
                                    :src="article.feed_favicon_url"
                                    class="h-4 w-4 rounded-sm"
                                    alt="" />
                                <span>{{ article.feed_title }}</span>
                            </a>
                            <span v-if="article.author">&middot; {{ article.author }}</span>
                            <span>&middot; {{ formattedDate }} at {{ formattedTime }}</span>
                        </div>
                    </header>

                    <img
                        v-if="showHeroImage"
                        :src="article.image_url"
                        :alt="article.title"
                        class="mb-6 w-full max-h-80 object-cover rounded-lg"
                        loading="lazy" />

                    <div
                        class="article-content prose max-w-none dark:prose-invert prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 prose-code:text-blue-300 prose-pre:bg-neutral-50 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-img:rounded-lg prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-500 dark:prose-blockquote:text-neutral-400"
                        v-html="article.content || article.summary" />

                    <div v-if="!article.content && !article.summary" class="py-12 text-center">
                        <p class="text-neutral-500 dark:text-neutral-400">
                            No article content available.
                        </p>
                        <button
                            v-if="article.url"
                            @click="openInBrowser"
                            class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer">
                            Read on original site
                        </button>
                    </div>

                    <!-- Navigation arrows -->
                    <div
                        class="mt-8 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-4">
                        <button
                            v-if="adjacentIds.prev"
                            @click="navigateToArticle('prev')"
                            class="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer">
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
                            Previous
                        </button>
                        <div v-else></div>
                        <button
                            v-if="adjacentIds.next"
                            @click="navigateToArticle('next')"
                            class="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer">
                            Next
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                        <div v-else></div>
                    </div>
                </article>
            </div>
        </div>
    </div>
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

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}

.swipe-indicator {
    position: fixed;
    top: 50%;
    z-index: 60;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    pointer-events: none;
    color: rgb(163 163 163); /* neutral-400 */
}

.swipe-indicator-left {
    left: 12px;
}

.swipe-indicator-right {
    right: 12px;
}

.swipe-chevron {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgb(38 38 38 / 0.7); /* neutral-800/70 */
    backdrop-filter: blur(4px);
    transition: transform 60ms ease-out;
}

@media (prefers-color-scheme: dark) {
    .swipe-chevron {
        background: rgb(64 64 64 / 0.7); /* neutral-700/70 */
    }
}

.swipe-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
}
</style>
