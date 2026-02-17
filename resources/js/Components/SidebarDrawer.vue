<script setup>
import { ref } from 'vue';
import { router, Link } from '@inertiajs/vue3';

const props = defineProps({
    open: Boolean,
    sidebar: Object,
    activeFeedId: Number,
    activeCategoryId: Number,
    activeFilter: String,
});

const emit = defineEmits(['close']);

const expandedCategories = ref({});

function toggleCategory(categoryId) {
    expandedCategories.value[categoryId] = !expandedCategories.value[categoryId];
}

function isCategoryExpanded(categoryId) {
    return expandedCategories.value[categoryId] ?? false;
}

function navigateTo(params) {
    emit('close');
    router.get(route('articles.index', params), {}, {
        preserveState: false,
    });
}

function isActiveAll() {
    return !props.activeFeedId && !props.activeCategoryId && !props.activeFilter;
}
</script>

<template>
    <!-- Overlay -->
    <Transition name="overlay">
        <div
            v-if="open"
            class="fixed inset-0 z-40 bg-black/60"
            @click="emit('close')"
        />
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
        <div
            v-if="open"
            class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 shadow-xl"
            role="dialog"
            aria-label="Navigation sidebar"
        >
            <!-- Drawer header -->
            <div class="flex h-14 items-center justify-between border-b border-slate-800 px-4">
                <h2 class="text-lg font-semibold text-slate-100">RReader</h2>
                <button
                    @click="emit('close')"
                    class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    aria-label="Close sidebar"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Drawer content -->
            <nav class="flex-1 overflow-y-auto py-2" aria-label="Feed navigation">
                <!-- Smart filters -->
                <div class="px-3 pb-2">
                    <!-- Today -->
                    <button
                        @click="navigateTo({ filter: 'today' })"
                        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                        :class="activeFilter === 'today' ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                    >
                        <svg class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        <span class="flex-1 text-left">Today</span>
                        <span v-if="sidebar.todayCount > 0" class="text-xs text-slate-500">{{ sidebar.todayCount }}</span>
                    </button>

                    <!-- Read Later -->
                    <button
                        @click="navigateTo({ filter: 'read_later' })"
                        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                        :class="activeFilter === 'read_later' ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                    >
                        <svg class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        <span class="flex-1 text-left">Read Later</span>
                        <span v-if="sidebar.readLaterCount > 0" class="text-xs text-slate-500">{{ sidebar.readLaterCount }}</span>
                    </button>
                </div>

                <div class="mx-3 border-t border-slate-800" />

                <!-- Feeds section -->
                <div class="px-3 pt-3">
                    <div class="flex items-center justify-between px-3 pb-2">
                        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Feeds</h3>
                    </div>

                    <!-- All Feeds -->
                    <button
                        @click="navigateTo({})"
                        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                        :class="isActiveAll() ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                    >
                        <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        <span class="flex-1 text-left">All</span>
                        <span v-if="sidebar.totalUnread > 0" class="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                            {{ sidebar.totalUnread }}
                        </span>
                    </button>

                    <!-- Categories -->
                    <div v-for="category in sidebar.categories" :key="category.id" class="mt-0.5">
                        <!-- Category row: chevron toggle + name navigation -->
                        <div
                            class="flex w-full items-center gap-0.5 rounded-lg text-sm transition-colors"
                            :class="activeCategoryId === category.id ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                        >
                            <button
                                @click="toggleCategory(category.id)"
                                class="shrink-0 rounded-lg p-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                                :aria-expanded="isCategoryExpanded(category.id)"
                                :aria-label="`Toggle ${category.name} feeds`"
                            >
                                <svg
                                    class="h-4 w-4 transition-transform duration-200"
                                    :class="{ 'rotate-90': isCategoryExpanded(category.id) }"
                                    fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                            <button
                                @click="navigateTo({ category_id: category.id })"
                                class="flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-left"
                            >
                                <span class="flex-1 truncate">{{ category.name }}</span>
                                <span v-if="category.unread_count > 0" class="text-xs text-slate-500">{{ category.unread_count }}</span>
                            </button>
                        </div>

                        <!-- Category feeds (expanded) -->
                        <div v-if="isCategoryExpanded(category.id)" class="ml-4">
                            <button
                                v-for="feed in category.feeds"
                                :key="feed.id"
                                @click="navigateTo({ feed_id: feed.id })"
                                class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors"
                                :class="activeFeedId === feed.id ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'"
                            >
                                <img
                                    v-if="feed.favicon_url"
                                    :src="feed.favicon_url"
                                    class="h-4 w-4 shrink-0 rounded-sm"
                                    alt=""
                                />
                                <div v-else class="h-4 w-4 shrink-0 rounded-sm bg-slate-700" />
                                <span class="flex-1 truncate text-left">{{ feed.title }}</span>
                                <span v-if="feed.unread_count > 0" class="text-xs text-slate-500">{{ feed.unread_count }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Uncategorized feeds -->
                    <div v-if="sidebar.uncategorizedFeeds.length > 0" class="mt-0.5">
                        <button
                            v-for="feed in sidebar.uncategorizedFeeds"
                            :key="feed.id"
                            @click="navigateTo({ feed_id: feed.id })"
                            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                            :class="activeFeedId === feed.id ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                        >
                            <img
                                v-if="feed.favicon_url"
                                :src="feed.favicon_url"
                                class="h-4 w-4 shrink-0 rounded-sm"
                                alt=""
                            />
                            <div v-else class="h-4 w-4 shrink-0 rounded-sm bg-slate-700" />
                            <span class="flex-1 truncate text-left">{{ feed.title }}</span>
                            <span v-if="feed.unread_count > 0" class="text-xs text-slate-500">{{ feed.unread_count }}</span>
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Drawer footer -->
            <div class="border-t border-slate-800 p-3">
                <Link
                    :href="route('feeds.create')"
                    class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Feed
                </Link>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
    transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
    transform: translateX(-100%);
}
</style>
