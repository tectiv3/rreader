<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import SidebarDrawer from '@/Components/SidebarDrawer.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, computed, onUnmounted, watch, provide } from 'vue';
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js';
import { useOfflineQueue } from '@/Composables/useOfflineQueue.js';

const props = defineProps({
    articles: Object,
    unreadCount: Number,
    filterTitle: String,
    activeFeedId: Number,
    activeCategoryId: Number,
    activeFilter: String,
    sidebar: Object,
});

const isReadLaterView = computed(() => props.activeFilter === 'read_later');
const { isOnline } = useOnlineStatus();
const { enqueue } = useOfflineQueue();

// Track when data was last fetched
const lastUpdatedAt = ref(new Date());
watch(() => props.articles, () => {
    lastUpdatedAt.value = new Date();
});

// Provide sidebar toggle for bottom nav in AppLayout
provide('toggleSidebar', () => { sidebarOpen.value = true; });

const loading = ref(false);
const loadingMore = ref(false);
const markingAllRead = ref(false);
const sidebarOpen = ref(false);

// Local copy of articles to avoid mutating props
const allArticles = ref([...props.articles.data]);
const nextPageUrl = ref(props.articles.next_page_url);

watch(() => props.articles, (newArticles) => {
    allArticles.value = [...newArticles.data];
    nextPageUrl.value = newArticles.next_page_url;
});

// Group articles by date
const groupedArticles = computed(() => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const article of allArticles.value) {
        const pubDate = new Date(article.published_at);
        pubDate.setHours(0, 0, 0, 0);

        let label;
        if (pubDate.getTime() === today.getTime()) {
            label = 'Today';
        } else if (pubDate.getTime() === yesterday.getTime()) {
            label = 'Yesterday';
        } else {
            label = pubDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }

        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(article);
    }

    return groups;
});

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function openArticle(article) {
    router.visit(route('articles.show', article.id));
}

function markAllAsRead() {
    markingAllRead.value = true;
    const data = {};
    if (props.activeFeedId) data.feed_id = props.activeFeedId;
    if (props.activeCategoryId) data.category_id = props.activeCategoryId;
    if (props.activeFilter) data.filter = props.activeFilter;

    if (!isOnline.value) {
        // Optimistic UI: mark all visible articles as read locally
        allArticles.value = allArticles.value.map(a => ({ ...a, is_read: true }));
        enqueue('post', route('articles.markAllAsRead'), data);
        markingAllRead.value = false;
        return;
    }

    router.post(route('articles.markAllAsRead'), data, {
        preserveScroll: true,
        onFinish: () => {
            markingAllRead.value = false;
        },
    });
}

function loadMore() {
    if (!nextPageUrl.value || loadingMore.value) return;

    loadingMore.value = true;
    router.get(nextPageUrl.value, {}, {
        preserveState: true,
        preserveScroll: true,
        only: ['articles'],
        onSuccess: (page) => {
            const newArticles = page.props.articles;
            allArticles.value.push(...newArticles.data);
            nextPageUrl.value = newArticles.next_page_url;
        },
        onFinish: () => {
            loadingMore.value = false;
        },
    });
}

function refreshFeeds() {
    loading.value = true;
    const data = {};
    if (props.activeFeedId) data.feed_ids = [props.activeFeedId];

    router.post(route('feeds.refresh'), data, {
        preserveScroll: true,
        onFinish: () => {
            loading.value = false;
        },
    });
}

// Swipe-to-remove for Read Later view
const swipeState = ref({});
const SWIPE_THRESHOLD = 100;

function onTouchStart(articleId, e) {
    if (!isReadLaterView.value) return;
    swipeState.value[articleId] = {
        startX: e.touches[0].clientX,
        currentX: 0,
        swiping: false,
    };
}

function onTouchMove(articleId, e) {
    const state = swipeState.value[articleId];
    if (!state) return;
    const deltaX = e.touches[0].clientX - state.startX;
    // Only allow left swipe (negative deltaX)
    if (deltaX < -10) {
        state.swiping = true;
        state.currentX = Math.max(deltaX, -200);
    }
}

function onTouchEnd(articleId, article) {
    const state = swipeState.value[articleId];
    if (!state) return;
    if (state.currentX < -SWIPE_THRESHOLD) {
        removeFromReadLater(article);
    }
    delete swipeState.value[articleId];
}

function getSwipeStyle(articleId) {
    const state = swipeState.value[articleId];
    if (!state || !state.swiping) return {};
    return {
        transform: `translateX(${state.currentX}px)`,
        transition: 'none',
    };
}

function isSwipingArticle(articleId) {
    return swipeState.value[articleId]?.swiping ?? false;
}

function removeFromReadLater(article) {
    // Remove from local list immediately (optimistic)
    allArticles.value = allArticles.value.filter(a => a.id !== article.id);

    if (!isOnline.value) {
        enqueue('post', route('articles.toggleReadLater', article.id), {});
        return;
    }

    // Send toggle request to server
    router.post(route('articles.toggleReadLater', article.id), {}, {
        preserveScroll: true,
        preserveState: true,
    });
}

// Infinite scroll observer
const observer = ref(null);

function setupObserver() {
    if (observer.value) observer.value.disconnect();

    observer.value = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        },
        { rootMargin: '200px' }
    );
}

function onSentinel(el) {
    if (el) {
        setupObserver();
        observer.value.observe(el);
    } else if (observer.value) {
        observer.value.disconnect();
    }
}

onUnmounted(() => {
    if (observer.value) observer.value.disconnect();
});

function formatLastUpdated(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
</script>

<template>
    <Head title="Articles" />

    <AppLayout>
        <template #header-left>
            <button
                @click="sidebarOpen = true"
                class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors -ml-2"
                aria-label="Open sidebar"
            >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
        </template>

        <template #title>
            {{ filterTitle }}
            <span
                v-if="unreadCount > 0"
                class="ml-2 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white"
            >
                {{ unreadCount }}
            </span>
        </template>

        <template #header-right>
            <button
                @click="refreshFeeds"
                :disabled="loading"
                class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                aria-label="Refresh feeds"
            >
                <svg
                    class="h-5 w-5 transition-transform"
                    :class="{ 'animate-spin': loading }"
                    fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                </svg>
            </button>
            <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                :disabled="markingAllRead"
                class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                aria-label="Mark all as read"
            >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </template>

        <SidebarDrawer
            :open="sidebarOpen"
            :sidebar="sidebar"
            :active-feed-id="activeFeedId"
            :active-category-id="activeCategoryId"
            :active-filter="activeFilter"
            @close="sidebarOpen = false"
        />

        <!-- Empty state -->
        <div v-if="allArticles.length === 0" class="flex flex-col items-center justify-center px-4 py-20 text-center">
            <svg class="h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-slate-300">
                {{ activeFilter === 'read_later' ? 'No saved articles' : 'No articles yet' }}
            </h3>
            <p class="mt-2 text-sm text-slate-500">
                {{ activeFilter === 'read_later' ? 'Save articles from your feeds to read later.' : 'Subscribe to feeds to start seeing articles here.' }}
            </p>
            <a
                v-if="!activeFilter"
                :href="route('feeds.create')"
                class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
                Add a Feed
            </a>
        </div>

        <!-- Article list -->
        <div v-else>
            <!-- Mobile view: card layout -->
            <div class="lg:hidden">
                <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                    <div class="sticky top-14 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-2 backdrop-blur">
                        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ dateLabel }}</h2>
                    </div>
                    <div>
                        <div
                            v-for="article in articles"
                            :key="article.id"
                            class="relative overflow-hidden border-b border-slate-800/50"
                        >
                            <!-- Swipe reveal background (Read Later view only) -->
                            <div
                                v-if="isReadLaterView && isSwipingArticle(article.id)"
                                class="absolute inset-0 flex items-center justify-end bg-red-600/90 px-6"
                            >
                                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.533-1.8a3.75 3.75 0 01-5.3-5.3m5.3 5.3l-5.3-5.3m5.3 5.3L17.25 21m-1.35-1.35L21 21m-5.533-1.8L9.7 13.133m0 0l-1.225-1.225M9.7 13.133L3 6.433" />
                                </svg>
                                <span class="ml-2 text-sm font-medium text-white">Remove</span>
                            </div>
                            <button
                                @click="!isSwipingArticle(article.id) && openArticle(article)"
                                @touchstart="onTouchStart(article.id, $event)"
                                @touchmove="onTouchMove(article.id, $event)"
                                @touchend="onTouchEnd(article.id, article)"
                                class="relative flex w-full gap-3 bg-slate-950 px-4 py-3 text-left transition-colors hover:bg-slate-900/50 active:bg-slate-800/50"
                                :style="isReadLaterView ? getSwipeStyle(article.id) : {}"
                            >
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center gap-2 text-xs text-slate-500">
                                        <img
                                            v-if="article.feed?.favicon_url"
                                            :src="article.feed.favicon_url"
                                            class="h-3.5 w-3.5 rounded-sm"
                                            alt=""
                                        />
                                        <span class="truncate">{{ article.feed?.title }}</span>
                                        <span>&middot;</span>
                                        <span class="shrink-0">{{ timeAgo(article.published_at) }}</span>
                                    </div>
                                    <h3
                                        class="mt-1 text-sm leading-snug"
                                        :class="article.is_read ? 'text-slate-500 font-normal' : 'text-slate-100 font-semibold'"
                                    >
                                        {{ article.title }}
                                    </h3>
                                    <p v-if="article.summary" class="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                        {{ article.summary }}
                                    </p>
                                </div>
                                <img
                                    v-if="article.image_url"
                                    :src="article.image_url"
                                    class="h-16 w-16 shrink-0 rounded-lg object-cover"
                                    :alt="article.title"
                                    loading="lazy"
                                />
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Desktop view: compact single-line layout -->
            <div class="hidden lg:block">
                <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                    <div class="sticky top-14 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-2 backdrop-blur">
                        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ dateLabel }}</h2>
                    </div>
                    <div>
                        <button
                            v-for="article in articles"
                            :key="article.id"
                            @click="openArticle(article)"
                            class="flex w-full items-center gap-3 border-b border-slate-800/50 px-4 py-2.5 text-left transition-colors hover:bg-slate-900/50 active:bg-slate-800/50"
                        >
                            <img
                                v-if="article.feed?.favicon_url"
                                :src="article.feed.favicon_url"
                                class="h-4 w-4 shrink-0 rounded-sm"
                                alt=""
                            />
                            <span class="w-32 shrink-0 truncate text-xs text-slate-500">{{ article.feed?.title }}</span>
                            <h3
                                class="min-w-0 flex-1 truncate text-sm"
                                :class="article.is_read ? 'text-slate-500 font-normal' : 'text-slate-100 font-medium'"
                            >
                                {{ article.title }}
                            </h3>
                            <span v-if="article.summary" class="hidden xl:block w-64 shrink-0 truncate text-xs text-slate-600">
                                {{ article.summary }}
                            </span>
                            <span class="w-12 shrink-0 text-right text-xs text-slate-600">{{ timeAgo(article.published_at) }}</span>
                        </button>
                    </div>
                </template>
            </div>

            <!-- Infinite scroll sentinel -->
            <div v-if="nextPageUrl" :ref="onSentinel" class="flex justify-center py-6">
                <div v-if="loadingMore" class="text-sm text-slate-500">Loading more...</div>
            </div>

            <!-- End of list -->
            <div v-else class="py-8 text-center text-sm text-slate-600">
                You're all caught up
            </div>

            <!-- Last updated timestamp (shown when offline) -->
            <div v-if="!isOnline" class="pb-4 text-center text-xs text-slate-600">
                Last updated at {{ formatLastUpdated(lastUpdatedAt) }}
            </div>
        </div>
    </AppLayout>
</template>
