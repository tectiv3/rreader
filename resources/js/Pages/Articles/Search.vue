<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, computed, onUnmounted, watch } from 'vue';

const props = defineProps({
    articles: Object,
    query: String,
    feedId: Number,
    categoryId: Number,
});

const searchQuery = ref(props.query || '');
const isSearching = ref(false);
const loadingMore = ref(false);
const debounceTimer = ref(null);

// Local copy of articles to support infinite scroll
const allArticles = ref(props.articles?.data ? [...props.articles.data] : []);
const nextPageUrl = ref(props.articles?.next_page_url || null);
const hasSearched = ref(!!props.query);

watch(() => props.articles, (newArticles) => {
    if (newArticles) {
        allArticles.value = [...newArticles.data];
        nextPageUrl.value = newArticles.next_page_url;
    }
});

watch(() => props.query, (newQuery) => {
    if (newQuery !== undefined) {
        searchQuery.value = newQuery || '';
    }
});

function onInput() {
    if (debounceTimer.value) clearTimeout(debounceTimer.value);

    const q = searchQuery.value.trim();
    if (!q) {
        allArticles.value = [];
        nextPageUrl.value = null;
        hasSearched.value = false;
        return;
    }

    isSearching.value = true;
    debounceTimer.value = setTimeout(() => {
        doSearch(q);
    }, 300);
}

function doSearch(q) {
    const params = { q };
    if (props.feedId) params.feed_id = props.feedId;
    if (props.categoryId) params.category_id = props.categoryId;

    router.get(route('articles.search'), params, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
            hasSearched.value = true;
        },
        onFinish: () => {
            isSearching.value = false;
        },
    });
}

function openArticle(article) {
    router.visit(route('articles.show', article.id));
}

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

const searchInputRef = ref(null);

function clearSearch() {
    searchQuery.value = '';
    allArticles.value = [];
    nextPageUrl.value = null;
    hasSearched.value = false;
    searchInputRef.value?.focus();
}

onUnmounted(() => {
    if (observer.value) observer.value.disconnect();
    if (debounceTimer.value) clearTimeout(debounceTimer.value);
});
</script>

<template>
    <Head title="Search" />

    <AppLayout>
        <template #title>Search</template>

        <!-- Search input -->
        <div class="sticky top-14 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
            <div class="relative">
                <svg
                    class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    ref="searchInputRef"
                    v-model="searchQuery"
                    @input="onInput"
                    type="search"
                    placeholder="Search articles..."
                    class="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-10 text-base text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0"
                    autocomplete="off"
                />
                <!-- Clear button -->
                <button
                    v-if="searchQuery"
                    @click="clearSearch"
                    class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Clear search"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <!-- Loading indicator -->
                <div
                    v-if="isSearching"
                    class="absolute right-3 top-1/2 -translate-y-1/2"
                >
                    <svg class="h-4 w-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                </div>
            </div>
        </div>

        <!-- Initial state: no search yet -->
        <div v-if="!hasSearched && !searchQuery" class="flex flex-col items-center justify-center px-4 py-20 text-center">
            <svg class="h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-slate-300">Search your articles</h3>
            <p class="mt-2 text-sm text-slate-500">Find articles by title or content across all your feeds.</p>
        </div>

        <!-- Empty results -->
        <div v-else-if="hasSearched && allArticles.length === 0 && !isSearching" class="flex flex-col items-center justify-center px-4 py-20 text-center">
            <svg class="h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-slate-300">No results found</h3>
            <p class="mt-2 text-sm text-slate-500">No articles match "{{ searchQuery }}". Try different keywords.</p>
        </div>

        <!-- Search results -->
        <div v-else-if="allArticles.length > 0">
            <!-- Mobile view: card layout -->
            <div class="lg:hidden">
                <div
                    v-for="article in allArticles"
                    :key="article.id"
                    class="border-b border-slate-800/50"
                >
                    <button
                        @click="openArticle(article)"
                        class="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-900/50 active:bg-slate-800/50"
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

            <!-- Desktop view: compact single-line layout -->
            <div class="hidden lg:block">
                <button
                    v-for="article in allArticles"
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

            <!-- Infinite scroll sentinel -->
            <div v-if="nextPageUrl" :ref="onSentinel" class="flex justify-center py-6">
                <div v-if="loadingMore" class="text-sm text-slate-500">Loading more...</div>
            </div>

            <!-- End of results -->
            <div v-else class="py-8 text-center text-sm text-slate-600">
                End of results
            </div>
        </div>
    </AppLayout>
</template>
