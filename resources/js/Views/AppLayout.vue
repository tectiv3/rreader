<script setup>
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { useOfflineQueue } from '@/Composables/useOfflineQueue.js'
import { useAddFeedModal } from '@/Composables/useAddFeedModal.js'
import AddFeedModal from '@/Components/AddFeedModal.vue'
import ToastContainer from '@/Components/ToastContainer.vue'
import SidebarDrawer from '@/Components/SidebarDrawer.vue'
import { useArticleStore } from '@/Stores/useArticleStore.js'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import { useUIStore } from '@/Stores/useUIStore.js'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'

const { isOnline } = useOnlineStatus()
useOfflineQueue()

const articleStore = useArticleStore()
const sidebarStore = useSidebarStore()
const uiStore = useUIStore()
const router = useRouter()
const route = useRoute()

const { isAddFeedModalOpen, openAddFeedModal, closeAddFeedModal } = useAddFeedModal()

// Desktop detection via matchMedia
const desktopQuery = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)') : null
const isDesktop = ref(desktopQuery ? desktopQuery.matches : false)

function onMediaChange(e) {
    isDesktop.value = e.matches
}

// Sidebar collapsed state persisted to localStorage
const sidebarCollapsed = ref(
    typeof window !== 'undefined'
        ? localStorage.getItem('rreader-sidebar-collapsed') === 'true'
        : false
)

function toggleSidebarCollapse() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('rreader-sidebar-collapsed', String(sidebarCollapsed.value))
}

// Provide toggleSidebar for child components (smart: desktop = collapse, mobile = drawer)
function toggleSidebar() {
    if (isDesktop.value) {
        toggleSidebarCollapse()
    } else {
        uiStore.toggleSidebar()
    }
}
provide('toggleSidebar', toggleSidebar)

// Build sidebar data object compatible with SidebarDrawer props
const sidebarData = computed(() => ({
    totalUnread: sidebarStore.totalUnread,
    readLaterCount: sidebarStore.readLaterCount,
    todayCount: sidebarStore.todayCount,
    categories: sidebarStore.categories,
    uncategorizedFeeds: sidebarStore.uncategorizedFeeds,
}))

// Active states derived from route
const activeFeedId = computed(() => {
    const fid = route.query.feed_id
    return fid ? Number(fid) : null
})

const activeCategoryId = computed(() => {
    const cid = route.query.category_id
    return cid ? Number(cid) : null
})

const activeFilter = computed(() => route.query.filter || null)

// Navigate via Vue Router (used by sidebar)
function navigateTo(params) {
    uiStore.closeSidebar()
    if (params.filter) {
        router.push({ name: 'articles.index', query: { filter: params.filter } })
    } else if (params.feed_id) {
        router.push({ name: 'articles.index', query: { feed_id: params.feed_id } })
    } else if (params.category_id) {
        router.push({ name: 'articles.index', query: { category_id: params.category_id } })
    } else {
        router.push({ name: 'articles.index' })
    }
}

onMounted(() => {
    if (desktopQuery) {
        desktopQuery.addEventListener('change', onMediaChange)
    }
})

onUnmounted(() => {
    if (desktopQuery) {
        desktopQuery.removeEventListener('change', onMediaChange)
    }
})
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <!-- Offline indicator banner (full width, above everything) -->
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

        <div class="flex" :style="isDesktop ? 'height: 100vh' : undefined">
            <!-- Desktop: persistent sidebar -->
            <SidebarDrawer
                v-if="isDesktop"
                :open="true"
                :persistent="true"
                :collapsed="sidebarCollapsed"
                :sidebar="sidebarData"
                :active-feed-id="activeFeedId"
                :active-category-id="activeCategoryId"
                :active-filter="activeFilter"
                @collapse-toggle="toggleSidebarCollapse"
                @navigate="navigateTo" />

            <!-- Main content with keep-alive for ArticleListView -->
            <main class="flex-1 overflow-y-auto" :class="isDesktop ? '' : 'pb-16'">
                <router-view v-slot="{ Component }">
                    <keep-alive include="ArticleListView">
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </main>
        </div>

        <!-- Toast notifications -->
        <ToastContainer />
        <AddFeedModal :show="isAddFeedModalOpen" @close="closeAddFeedModal" />

        <!-- Mobile: overlay sidebar drawer -->
        <SidebarDrawer
            v-if="!isDesktop"
            :open="uiStore.sidebarOpen"
            :sidebar="sidebarData"
            :active-feed-id="activeFeedId"
            :active-category-id="activeCategoryId"
            :active-filter="activeFilter"
            @close="uiStore.closeSidebar()"
            @navigate="navigateTo" />

        <!-- Bottom navigation bar (mobile only) -->
        <nav
            v-if="!isDesktop"
            class="fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pb-safe"
            aria-label="Bottom navigation">
            <div class="flex h-14 items-center justify-around px-2">
                <!-- Sidebar toggle (hamburger) -->
                <button
                    @click="toggleSidebar()"
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
                        activeFilter === 'read_later'
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
                        !activeFilter &&
                        !activeFeedId &&
                        !activeCategoryId &&
                        route.name === 'articles.index'
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
