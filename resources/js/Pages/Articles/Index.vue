<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    articles: Object,
    unreadCount: Number,
});

const loading = ref(false);
const loadingMore = ref(false);
const markingAllRead = ref(false);

// Group articles by date
const groupedArticles = computed(() => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const article of props.articles.data) {
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
    // Mark as read
    if (!article.is_read) {
        router.post(route('articles.markAsRead'), {
            article_ids: [article.id],
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    }
    // TODO: Navigate to article view (US-008)
    // For now, open the article URL in a new tab
    if (article.url) {
        window.open(article.url, '_blank');
    }
}

function markAllAsRead() {
    markingAllRead.value = true;
    router.post(route('articles.markAllAsRead'), {}, {
        preserveScroll: true,
        onFinish: () => {
            markingAllRead.value = false;
        },
    });
}

function loadMore() {
    if (!props.articles.next_page_url || loadingMore.value) return;

    loadingMore.value = true;
    router.get(props.articles.next_page_url, {}, {
        preserveState: true,
        preserveScroll: true,
        only: ['articles'],
        onSuccess: (page) => {
            // Merge new articles into existing data
            const newArticles = page.props.articles;
            props.articles.data.push(...newArticles.data);
            props.articles.next_page_url = newArticles.next_page_url;
            props.articles.current_page = newArticles.current_page;
        },
        onFinish: () => {
            loadingMore.value = false;
        },
    });
}

function refreshFeeds() {
    loading.value = true;
    router.post(route('feeds.refresh'), {}, {
        preserveScroll: true,
        onFinish: () => {
            loading.value = false;
        },
    });
}

// Infinite scroll observer
const observer = ref(null);
const sentinel = ref(null);

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
    }
}
</script>

<template>
    <Head title="Articles" />

    <AppLayout>
        <template #title>
            All Feeds
            <span
                v-if="unreadCount > 0"
                class="ml-2 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white"
            >
                {{ unreadCount }}
            </span>
        </template>

        <template #header-right>
            <!-- Refresh button -->
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
            <!-- Mark all as read button -->
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

        <!-- Empty state -->
        <div v-if="articles.data.length === 0" class="flex flex-col items-center justify-center px-4 py-20 text-center">
            <svg class="h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-slate-300">No articles yet</h3>
            <p class="mt-2 text-sm text-slate-500">Subscribe to feeds to start seeing articles here.</p>
            <a
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
                        <button
                            v-for="article in articles"
                            :key="article.id"
                            @click="openArticle(article)"
                            class="flex w-full gap-3 border-b border-slate-800/50 px-4 py-3 text-left transition-colors hover:bg-slate-900/50 active:bg-slate-800/50"
                        >
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 text-xs text-slate-500">
                                    <img
                                        v-if="article.feed?.favicon_url"
                                        :src="article.feed.favicon_url"
                                        class="h-3.5 w-3.5 rounded-sm"
                                        :alt="article.feed.title"
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
                                :alt="article.feed.title"
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
            <div v-if="articles.next_page_url" :ref="onSentinel" class="flex justify-center py-6">
                <div v-if="loadingMore" class="text-sm text-slate-500">Loading more...</div>
            </div>

            <!-- End of list -->
            <div v-else class="py-8 text-center text-sm text-slate-600">
                You're all caught up
            </div>
        </div>
    </AppLayout>
</template>
