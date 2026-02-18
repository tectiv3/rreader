<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import SidebarDrawer from '@/Components/SidebarDrawer.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted, watch, provide, nextTick } from 'vue';
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js';
import { useOfflineQueue } from '@/Composables/useOfflineQueue.js';
import { useToast } from '@/Composables/useToast.js';

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
});

const isReadLaterView = computed(() => props.activeFilter === 'read_later');
const { isOnline } = useOnlineStatus();
const { enqueue } = useOfflineQueue();
const { success } = useToast();

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

// Desktop layout state
const isDesktop = ref(typeof window !== 'undefined' && window.innerWidth >= 1024);
const sidebarCollapsed = ref(false);
const selectedArticle = ref(null);
const selectedArticleId = ref(null);
const loadingArticle = ref(false);
const selectedIsReadLater = ref(false);
const togglingReadLater = ref(false);
const markingUnread = ref(false);
const articleListEl = ref(null);

// Initialize sidebar collapsed state from localStorage
onMounted(() => {
    const saved = localStorage.getItem('rreader-sidebar-collapsed');
    if (saved !== null) {
        sidebarCollapsed.value = saved === 'true';
    }
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkDesktop);
});

function checkDesktop() {
    isDesktop.value = window.innerWidth >= 1024;
}

function toggleSidebarCollapse() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem('rreader-sidebar-collapsed', String(sidebarCollapsed.value));
}

// Pull-to-refresh state
const pullDistance = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const PULL_THRESHOLD = 80;
let pullStartY = 0;

function onPullStart(e) {
    if (window.scrollY > 0 || isRefreshing.value) return;
    pullStartY = e.touches[0].clientY;
    isPulling.value = true;
}

function onPullMove(e) {
    if (!isPulling.value || isRefreshing.value) return;
    if (window.scrollY > 0) {
        isPulling.value = false;
        pullDistance.value = 0;
        return;
    }
    const deltaY = e.touches[0].clientY - pullStartY;
    if (deltaY > 0) {
        pullDistance.value = Math.min(deltaY * 0.5, 120);
    }
}

function onPullEnd() {
    if (!isPulling.value) return;
    isPulling.value = false;
    if (pullDistance.value >= PULL_THRESHOLD && !isRefreshing.value) {
        isRefreshing.value = true;
        pullDistance.value = 60;
        refreshFeeds();
    } else {
        pullDistance.value = 0;
    }
}

// Local copy of articles to avoid mutating props
const allArticles = ref([...props.articles.data]);
const nextPageUrl = ref(props.articles.next_page_url);

watch(() => props.articles, (newArticles) => {
    allArticles.value = [...newArticles.data];
    nextPageUrl.value = newArticles.next_page_url;
    // Clear selected article on full navigation (filter change, etc.)
    selectedArticle.value = null;
    selectedArticleId.value = null;
});

// Flat list of articles for keyboard navigation
const flatArticles = computed(() => allArticles.value);

// Current article index for keyboard navigation
const selectedIndex = computed(() => {
    if (!selectedArticleId.value) return -1;
    return flatArticles.value.findIndex(a => a.id === selectedArticleId.value);
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
    // Optimistic UI: mark as read immediately
    if (!article.is_read) {
        const idx = allArticles.value.findIndex(a => a.id === article.id);
        if (idx !== -1) {
            allArticles.value[idx] = { ...allArticles.value[idx], is_read: true };
        }
    }

    if (isDesktop.value) {
        // Desktop: toggle inline expansion (clicking same article collapses it)
        if (selectedArticleId.value === article.id) {
            closeArticlePanel();
            return;
        }
        selectedArticleId.value = article.id;
        loadArticleInline(article.id);
    } else {
        // Mobile: navigate to Show page
        router.visit(route('articles.show', article.id));
    }
}

async function loadArticleInline(articleId) {
    loadingArticle.value = true;
    try {
        const response = await fetch(route('articles.show', articleId), {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        if (!response.ok) throw new Error('Failed to load article');
        const data = await response.json();
        selectedArticle.value = data.article;
        selectedIsReadLater.value = data.article.is_read_later ?? false;
        // Scroll the expanded article into view
        await nextTick();
        const expandedEl = document.getElementById(`article-expanded-${articleId}`);
        if (expandedEl) expandedEl.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } catch (err) {
        console.error('Failed to load article:', err);
        // Fallback: navigate to show page
        router.visit(route('articles.show', articleId));
    } finally {
        loadingArticle.value = false;
    }
}

function closeArticlePanel() {
    selectedArticle.value = null;
    selectedArticleId.value = null;
}

// Article reader actions (desktop inline)
function toggleReadLaterInline() {
    if (!selectedArticle.value || togglingReadLater.value) return;
    togglingReadLater.value = true;

    if (!isOnline.value) {
        selectedIsReadLater.value = !selectedIsReadLater.value;
        enqueue('post', route('articles.toggleReadLater', selectedArticle.value.id), {});
        togglingReadLater.value = false;
        success(selectedIsReadLater.value ? 'Article saved' : 'Removed from Read Later');
        return;
    }

    router.post(route('articles.toggleReadLater', selectedArticle.value.id), {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            selectedIsReadLater.value = !selectedIsReadLater.value;
            success(selectedIsReadLater.value ? 'Article saved' : 'Removed from Read Later');
        },
        onFinish: () => {
            togglingReadLater.value = false;
        },
    });
}

function markAsUnreadInline() {
    if (!selectedArticle.value || markingUnread.value) return;
    markingUnread.value = true;

    // Update local list
    const idx = allArticles.value.findIndex(a => a.id === selectedArticle.value.id);
    if (idx !== -1) {
        allArticles.value[idx] = { ...allArticles.value[idx], is_read: false };
    }

    if (!isOnline.value) {
        enqueue('post', route('articles.markAsUnread', selectedArticle.value.id), {});
        markingUnread.value = false;
        success('Marked as unread');
        return;
    }

    router.post(route('articles.markAsUnread', selectedArticle.value.id), {}, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
            markingUnread.value = false;
            success('Marked as unread');
        },
    });
}

const selectedFormattedDate = computed(() => {
    if (!selectedArticle.value) return '';
    const date = new Date(selectedArticle.value.published_at);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});

const selectedFormattedTime = computed(() => {
    if (!selectedArticle.value) return '';
    const date = new Date(selectedArticle.value.published_at);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
});

// Keyboard shortcuts (desktop only)
function onKeyDown(e) {
    if (!isDesktop.value) return;
    // Don't capture if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'j': {
            // Next article
            e.preventDefault();
            const nextIdx = selectedIndex.value + 1;
            if (nextIdx < flatArticles.value.length) {
                openArticle(flatArticles.value[nextIdx]);
                scrollArticleIntoView(flatArticles.value[nextIdx].id);
            }
            break;
        }
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'k': {
            // Previous article
            e.preventDefault();
            const prevIdx = selectedIndex.value - 1;
            if (prevIdx >= 0) {
                openArticle(flatArticles.value[prevIdx]);
                scrollArticleIntoView(flatArticles.value[prevIdx].id);
            }
            break;
        }
        case 's': {
            // Save / toggle read later
            e.preventDefault();
            if (selectedArticle.value) {
                toggleReadLaterInline();
            }
            break;
        }
        case 'm': {
            // Mark as unread
            e.preventDefault();
            if (selectedArticle.value) {
                markAsUnreadInline();
            }
            break;
        }
        case 'Escape': {
            // Close article panel
            e.preventDefault();
            closeArticlePanel();
            break;
        }
    }
}

function scrollArticleIntoView(articleId) {
    nextTick(() => {
        const el = document.getElementById(`article-row-${articleId}`);
        if (el) {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });
}

onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
});

function markAllAsRead() {
    markingAllRead.value = true;
    const data = {};
    if (props.activeFeedId) data.feed_id = props.activeFeedId;
    if (props.activeCategoryId) data.category_id = props.activeCategoryId;
    if (props.activeFilter) data.filter = props.activeFilter;

    if (!isOnline.value) {
        allArticles.value = allArticles.value.map(a => ({ ...a, is_read: true }));
        enqueue('post', route('articles.markAllAsRead'), data);
        markingAllRead.value = false;
        success('All marked as read');
        return;
    }

    router.post(route('articles.markAllAsRead'), data, {
        preserveScroll: true,
        onFinish: () => {
            markingAllRead.value = false;
            success('All marked as read');
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
            isRefreshing.value = false;
            pullDistance.value = 0;
            success('Feeds refreshed');
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
    allArticles.value = allArticles.value.filter(a => a.id !== article.id);

    if (!isOnline.value) {
        enqueue('post', route('articles.toggleReadLater', article.id), {});
        return;
    }

    router.post(route('articles.toggleReadLater', article.id), {}, {
        preserveScroll: true,
        preserveState: true,
    });
}

// Load more is now manual (button click) to avoid infinite scroll loops

function formatLastUpdated(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
</script>

<template>
    <Head title="Articles" />

    <AppLayout>
        <template #header-left>
            <!-- Mobile: hamburger to open drawer -->
            <button
                @click="sidebarOpen = true"
                class="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors -ml-2 lg:hidden"
                title="Open sidebar"
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
                class="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Refresh feeds"
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
                class="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Mark all as read"
                aria-label="Mark all as read"
            >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </template>

        <!-- Mobile: Sidebar drawer (overlay) -->
        <SidebarDrawer
            v-if="!isDesktop"
            :open="sidebarOpen"
            :persistent="false"
            :sidebar="sidebar"
            :active-feed-id="activeFeedId"
            :active-category-id="activeCategoryId"
            :active-filter="activeFilter"
            @close="sidebarOpen = false"
        />

        <!-- Desktop: 2-column layout (sidebar + full-width article list with inline expansion) -->
        <div v-if="isDesktop" class="flex" style="height: calc(100vh - 3.5rem);">
            <!-- Left: Persistent sidebar -->
            <SidebarDrawer
                :open="true"
                :persistent="true"
                :collapsed="sidebarCollapsed"
                :sidebar="sidebar"
                :active-feed-id="activeFeedId"
                :active-category-id="activeCategoryId"
                :active-filter="activeFilter"
                @collapse-toggle="toggleSidebarCollapse"
            />

            <!-- Article list with inline expansion -->
            <div
                ref="articleListEl"
                class="flex-1 flex flex-col overflow-y-auto"
            >
                <!-- Desktop article list with inline expansion -->
                <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                    <div class="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 py-2 backdrop-blur">
                        <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">{{ dateLabel }}</h2>
                    </div>
                    <div>
                        <template v-for="article in articles" :key="article.id">
                            <!-- Article row -->
                            <button
                                :id="`article-row-${article.id}`"
                                @click="openArticle(article)"
                                class="flex w-full items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-2.5 text-left transition-colors cursor-pointer"
                                :class="[
                                    selectedArticleId === article.id
                                        ? 'bg-blue-50 dark:bg-slate-900 border-l-2 border-l-blue-500'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50',
                                ]"
                            >
                                <img
                                    v-if="article.feed?.favicon_url"
                                    :src="article.feed.favicon_url"
                                    class="h-4 w-4 shrink-0 rounded-sm"
                                    alt=""
                                />
                                <span class="w-32 shrink-0 truncate text-xs text-slate-600 dark:text-slate-500">{{ article.feed?.title }}</span>
                                <h3
                                    class="min-w-0 flex-1 truncate text-sm"
                                    :class="article.is_read ? 'text-slate-600 dark:text-slate-500 font-normal' : 'text-slate-900 dark:text-slate-100 font-medium'"
                                >
                                    {{ article.title }}
                                </h3>
                                <span v-if="article.summary && selectedArticleId !== article.id" class="hidden xl:block w-64 shrink-0 truncate text-xs text-slate-500 dark:text-slate-600">
                                    {{ article.summary }}
                                </span>
                                <span class="w-12 shrink-0 text-right text-xs text-slate-500 dark:text-slate-600">{{ timeAgo(article.published_at) }}</span>
                            </button>

                            <!-- Inline expanded article (Feedly-style) -->
                            <div
                                v-if="selectedArticleId === article.id"
                                :id="`article-expanded-${article.id}`"
                                class="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                            >
                                <!-- Loading state -->
                                <div v-if="loadingArticle && !selectedArticle" class="flex items-center justify-center py-12">
                                    <svg class="h-8 w-8 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>

                                <!-- Article content -->
                                <template v-if="selectedArticle">
                                    <article class="mx-auto max-w-3xl px-6 py-6">
                                        <header class="mb-6">
                                            <div class="flex items-start justify-between gap-4">
                                                <h1 class="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                                                    {{ selectedArticle.title }}
                                                </h1>
                                                <!-- Toolbar: bookmark, unread, close -->
                                                <div class="flex shrink-0 items-center gap-1">
                                                    <button
                                                        @click.stop="toggleReadLaterInline"
                                                        :disabled="togglingReadLater"
                                                        class="rounded-lg p-1.5 transition-colors cursor-pointer"
                                                        :class="selectedIsReadLater ? 'text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'"
                                                        :title="selectedIsReadLater ? 'Remove from Read Later' : 'Save to Read Later'"
                                                        :aria-label="selectedIsReadLater ? 'Remove from Read Later' : 'Save to Read Later'"
                                                    >
                                                        <svg class="h-5 w-5" :fill="selectedIsReadLater ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        @click.stop="markAsUnreadInline"
                                                        :disabled="markingUnread"
                                                        class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                                        title="Mark as unread"
                                                        aria-label="Mark as unread"
                                                    >
                                                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        @click.stop="closeArticlePanel"
                                                        class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                                        title="Close article"
                                                        aria-label="Close article"
                                                    >
                                                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                                                <div class="flex items-center gap-2">
                                                    <img
                                                        v-if="selectedArticle.feed?.favicon_url"
                                                        :src="selectedArticle.feed.favicon_url"
                                                        class="h-4 w-4 rounded-sm"
                                                        alt=""
                                                    />
                                                    <span>{{ selectedArticle.feed?.title }}</span>
                                                </div>
                                                <span v-if="selectedArticle.author">&middot; {{ selectedArticle.author }}</span>
                                                <span>&middot; {{ selectedFormattedDate }} at {{ selectedFormattedTime }}</span>
                                            </div>
                                        </header>

                                        <div
                                            class="article-content prose max-w-none dark:prose-invert prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-800 dark:prose-strong:text-slate-200 prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-pre:bg-white dark:prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800 prose-img:rounded-lg prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-700 prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-400"
                                            v-html="selectedArticle.content || selectedArticle.summary"
                                        />

                                        <div v-if="!selectedArticle.content && !selectedArticle.summary" class="py-12 text-center">
                                            <p class="text-slate-500 dark:text-slate-400">No article content available.</p>
                                            <a
                                                v-if="selectedArticle.url"
                                                :href="selectedArticle.url"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                            >
                                                Read on original site
                                            </a>
                                        </div>

                                        <!-- Keyboard shortcut hints -->
                                        <div class="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs text-slate-400 dark:text-slate-600">
                                            <span class="font-medium text-slate-500">Shortcuts:</span>
                                            <span class="ml-2"><kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">j</kbd>/<kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">k</kbd> or <kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">&larr;</kbd>/<kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">&rarr;</kbd> navigate</span>
                                            <span class="ml-2"><kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">s</kbd> save</span>
                                            <span class="ml-2"><kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">m</kbd> mark unread</span>
                                            <span class="ml-2"><kbd class="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5">Esc</kbd> close</span>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>

                <!-- Empty state (desktop) -->
                <div v-if="allArticles.length === 0" class="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <!-- Read Later empty -->
                    <template v-if="activeFilter === 'read_later'">
                        <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No saved articles</h3>
                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Save articles from your feeds to read later.</p>
                    </template>
                    <!-- No feeds at all -->
                    <template v-else-if="feedCount === 0">
                        <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No articles yet</h3>
                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Subscribe to feeds to start seeing articles here.</p>
                        <a
                            :href="route('feeds.create')"
                            class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            Add a Feed
                        </a>
                    </template>
                    <!-- Feeds exist but still being fetched -->
                    <template v-else-if="hasPendingFeeds">
                        <svg class="h-10 w-10 animate-spin text-slate-400 dark:text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Fetching your feeds...</h3>
                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Articles will appear here shortly as your feeds are being updated.</p>
                    </template>
                    <!-- Specific feed has no articles -->
                    <template v-else-if="activeFeedId">
                        <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No articles in this feed</h3>
                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">This feed doesn't have any articles yet.</p>
                    </template>
                    <!-- Generic fallback -->
                    <template v-else>
                        <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No articles yet</h3>
                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Subscribe to feeds to start seeing articles here.</p>
                        <a
                            :href="route('feeds.create')"
                            class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            Add a Feed
                        </a>
                    </template>
                </div>

                <!-- Infinite scroll sentinel -->
                <div v-if="nextPageUrl" class="flex justify-center py-6">
                    <button
                        @click="loadMore"
                        :disabled="loadingMore"
                        class="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {{ loadingMore ? 'Loading...' : 'Load more articles' }}
                    </button>
                </div>

                <!-- End of list -->
                <div v-else-if="allArticles.length > 0" class="py-8 text-center text-sm text-slate-500 dark:text-slate-600">
                    You're all caught up
                </div>

                <!-- Last updated timestamp (shown when offline) -->
                <div v-if="!isOnline" class="pb-4 text-center text-xs text-slate-500 dark:text-slate-600">
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
                :class="{ 'transition-none': isPulling }"
            >
                <div class="flex flex-col items-center gap-1">
                    <svg
                        class="h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform duration-200"
                        :class="{ 'animate-spin': isRefreshing }"
                        :style="!isRefreshing ? { transform: `rotate(${Math.min(pullDistance / PULL_THRESHOLD, 1) * 360}deg)` } : {}"
                        fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                    </svg>
                    <span v-if="!isRefreshing && pullDistance >= PULL_THRESHOLD" class="text-[10px] text-slate-600 dark:text-slate-500">Release to refresh</span>
                    <span v-else-if="isRefreshing" class="text-[10px] text-slate-600 dark:text-slate-500">Refreshing...</span>
                </div>
            </div>

            <!-- Scrollable area with pull-to-refresh touch handlers -->
            <div
                @touchstart.passive="onPullStart"
                @touchmove.passive="onPullMove"
                @touchend="onPullEnd"
            >

            <!-- Empty state -->
            <div v-if="allArticles.length === 0" class="flex flex-col items-center justify-center px-4 py-20 text-center">
                <!-- Read Later empty -->
                <template v-if="activeFilter === 'read_later'">
                    <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No saved articles</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Save articles from your feeds to read later.</p>
                </template>
                <!-- No feeds at all -->
                <template v-else-if="feedCount === 0">
                    <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No articles yet</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Subscribe to feeds to start seeing articles here.</p>
                    <a
                        :href="route('feeds.create')"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        Add a Feed
                    </a>
                </template>
                <!-- Feeds exist but still being fetched -->
                <template v-else-if="hasPendingFeeds">
                    <svg class="h-10 w-10 animate-spin text-slate-400 dark:text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Fetching your feeds...</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Articles will appear here shortly as your feeds are being updated.</p>
                </template>
                <!-- Specific feed has no articles -->
                <template v-else-if="activeFeedId">
                    <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No articles in this feed</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">This feed doesn't have any articles yet.</p>
                </template>
                <!-- Generic fallback -->
                <template v-else>
                    <svg class="h-16 w-16 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No articles yet</h3>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-500">Subscribe to feeds to start seeing articles here.</p>
                    <a
                        :href="route('feeds.create')"
                        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        Add a Feed
                    </a>
                </template>
            </div>

            <!-- Article list -->
            <div v-else>
                <!-- Mobile view: card layout -->
                <div>
                    <template v-for="(articles, dateLabel) in groupedArticles" :key="dateLabel">
                        <div class="sticky top-14 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 py-2 backdrop-blur">
                            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">{{ dateLabel }}</h2>
                        </div>
                        <div>
                            <div
                                v-for="article in articles"
                                :key="article.id"
                                class="relative overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50"
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
                                    class="relative flex w-full gap-3 bg-white dark:bg-slate-950 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 active:bg-slate-100 dark:active:bg-slate-800/50"
                                    :style="isReadLaterView ? getSwipeStyle(article.id) : {}"
                                >
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
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
                                            :class="article.is_read ? 'text-slate-600 dark:text-slate-500 font-normal' : 'text-slate-900 dark:text-slate-100 font-semibold'"
                                        >
                                            {{ article.title }}
                                        </h3>
                                        <p v-if="article.summary" class="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-500">
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

                <!-- Infinite scroll sentinel -->
                <div v-if="nextPageUrl" class="flex justify-center py-6">
                    <button
                        @click="loadMore"
                        :disabled="loadingMore"
                        class="rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {{ loadingMore ? 'Loading...' : 'Load more articles' }}
                    </button>
                </div>

                <!-- End of list -->
                <div v-else class="py-8 text-center text-sm text-slate-500 dark:text-slate-600">
                    You're all caught up
                </div>

                <!-- Last updated timestamp (shown when offline) -->
                <div v-if="!isOnline" class="pb-4 text-center text-xs text-slate-500 dark:text-slate-600">
                    Last updated at {{ formatLastUpdated(lastUpdatedAt) }}
                </div>
            </div>
            </div><!-- end pull-to-refresh touch area -->
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
</style>
