<script setup>
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { useOfflineQueue } from '@/Composables/useOfflineQueue.js'
import { useAddFeedModal } from '@/Composables/useAddFeedModal.js'
import AddFeedModal from '@/Components/AddFeedModal.vue'
import ToastContainer from '@/Components/ToastContainer.vue'
import { router, usePage } from '@inertiajs/vue3'
import ArticleListSkeleton from '@/Components/ArticleListSkeleton.vue'
import { inject, ref, onMounted, onUnmounted } from 'vue'
const { isOnline } = useOnlineStatus()
useOfflineQueue() // Initialize queue — auto-flushes when back online

const page = usePage()
const toggleSidebar = inject('toggleSidebar', null)
const { isAddFeedModalOpen, openAddFeedModal, closeAddFeedModal } = useAddFeedModal()

// Navigation loading state for skeleton screens
const isNavigating = ref(false)
let removeStartListener = null
let removeFinishListener = null

onMounted(() => {
    removeStartListener = router.on('start', () => {
        isNavigating.value = true
    })
    removeFinishListener = router.on('finish', () => {
        isNavigating.value = false
    })
})

onUnmounted(() => {
    removeStartListener?.()
    removeFinishListener?.()
})

function navigateTo(params) {
    router.get(route('articles.index', params), {}, { preserveState: false })
}

// Scroll-direction hide/show for bottom nav
const navHidden = ref(false)
let lastScrollY = 0
const SCROLL_THRESHOLD = 10

function onScroll() {
    const currentY = window.scrollY
    if (currentY < SCROLL_THRESHOLD) {
        navHidden.value = false
    } else if (currentY > lastScrollY + SCROLL_THRESHOLD) {
        navHidden.value = true
    } else if (currentY < lastScrollY - SCROLL_THRESHOLD) {
        navHidden.value = false
    }
    lastScrollY = currentY
}

onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
})
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <!-- Header -->
        <header
            class="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pt-safe">
            <div class="flex h-11 items-center justify-between px-4">
                <div class="flex items-center gap-2 min-w-0">
                    <slot name="header-left" />
                    <!-- Desktop: title inline in the header row -->
                    <h1
                        v-if="$slots.title"
                        class="hidden lg:block text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        <slot name="title" />
                    </h1>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <slot name="header-right" />
                </div>
            </div>
            <!-- Mobile: title on its own row below the toolbar -->
            <div v-if="$slots.title" class="px-4 pb-2 lg:hidden">
                <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    <slot name="title" />
                </h1>
            </div>
        </header>

        <!-- Offline indicator banner -->
        <div
            v-if="!isOnline"
            class="flex items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-xs font-medium text-white">
            <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            You're offline — viewing cached content
        </div>

        <!-- Main content -->
        <main class="pb-16 lg:pb-0">
            <!-- Skeleton loading during navigation -->
            <ArticleListSkeleton v-if="isNavigating" />
            <div v-else class="page-enter">
                <slot />
            </div>
        </main>

        <!-- Toast notifications -->
        <ToastContainer />
        <AddFeedModal :show="isAddFeedModalOpen" @close="closeAddFeedModal" />

        <!-- Bottom navigation bar (mobile only) -->
        <nav
            class="fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 lg:hidden pb-safe transition-transform duration-300"
            :class="navHidden ? 'translate-y-full' : 'translate-y-0'"
            aria-label="Bottom navigation">
            <div class="flex h-14 items-center justify-around px-2">
                <!-- Sidebar toggle (hamburger) -->
                <button
                    @click="toggleSidebar ? toggleSidebar() : router.visit(route('articles.index'))"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
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
                    <span class="text-[10px]">Menu</span>
                </button>

                <!-- Read Later (bookmark) -->
                <button
                    @click="navigateTo({ filter: 'read_later' })"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
                    :class="
                        page.props.activeFilter === 'read_later'
                            ? 'text-amber-500'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                    "
                    title="Read Later"
                    aria-label="Read Later">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    <span class="text-[10px]">Read Later</span>
                </button>

                <!-- Feed view (grid icon) -->
                <button
                    @click="navigateTo({})"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
                    :class="
                        !page.props.activeFilter &&
                        !page.props.activeFeedId &&
                        !page.props.activeCategoryId &&
                        page.url.startsWith('/articles') &&
                        !page.url.startsWith('/articles/search')
                            ? 'text-blue-500'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                    "
                    title="All feeds"
                    aria-label="All feeds">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    <span class="text-[10px]">Feeds</span>
                </button>

                <!-- Add Feed (RSS+ icon) -->
                <button
                    @click="openAddFeedModal()"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                    title="Add feed"
                    aria-label="Add feed">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3" />
                    </svg>
                    <span class="text-[10px]">Add</span>
                </button>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
