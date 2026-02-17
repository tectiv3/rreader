<script setup>
import { ref } from 'vue';
import { router, Link } from '@inertiajs/vue3';

const props = defineProps({
    open: Boolean,
    persistent: {
        type: Boolean,
        default: false,
    },
    collapsed: {
        type: Boolean,
        default: false,
    },
    sidebar: Object,
    activeFeedId: Number,
    activeCategoryId: Number,
    activeFilter: String,
});

const emit = defineEmits(['close', 'collapse-toggle']);

const expandedCategories = ref({});

function toggleCategory(categoryId) {
    expandedCategories.value[categoryId] = !expandedCategories.value[categoryId];
}

function isCategoryExpanded(categoryId) {
    return expandedCategories.value[categoryId] ?? false;
}

function navigateTo(params) {
    if (!props.persistent) {
        emit('close');
    }
    router.get(route('articles.index', params), {}, {
        preserveState: false,
    });
}

function isActiveAll() {
    return !props.activeFeedId && !props.activeCategoryId && !props.activeFilter;
}
</script>

<template>
    <!-- Mobile: Overlay drawer -->
    <template v-if="!persistent">
        <Transition name="overlay">
            <div
                v-if="open"
                class="fixed inset-0 z-40 bg-black/60"
                @click="emit('close')"
            />
        </Transition>

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
                    <div class="flex items-center gap-1">
                        <Link
                            :href="route('feeds.manage')"
                            class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
                        >
                            Edit
                        </Link>
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
                </div>

                <!-- Drawer content -->
                <nav class="flex-1 overflow-y-auto py-2" aria-label="Feed navigation">
                    <!-- Smart filters -->
                    <div class="px-3 pb-2">
                        <!-- Today -->
                        <button
                            @click="navigateTo({ filter: 'today' })"
                            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer"
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
                            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer"
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
                            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer"
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
                            <div
                                class="flex w-full items-center gap-0.5 rounded-lg text-sm transition-colors"
                                :class="activeCategoryId === category.id ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                            >
                                <button
                                    @click="toggleCategory(category.id)"
                                    class="shrink-0 rounded-lg p-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
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
                                    class="flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-left cursor-pointer"
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
                                    class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
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
                                class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer"
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
                <div class="border-t border-slate-800 p-3 space-y-2">
                    <Link
                        :href="route('feeds.create')"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Feed
                    </Link>
                    <Link
                        :href="route('settings.index')"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </Link>
                </div>
            </div>
        </Transition>
    </template>

    <!-- Desktop: Persistent sidebar -->
    <template v-else>
        <aside
            class="flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-200"
            :class="collapsed ? 'w-16' : 'w-72'"
            aria-label="Navigation sidebar"
        >
            <!-- Sidebar header -->
            <div class="flex h-14 items-center border-b border-slate-800 px-3" :class="collapsed ? 'justify-center' : 'justify-between'">
                <h2 v-if="!collapsed" class="text-lg font-semibold text-slate-100 truncate">RReader</h2>
                <div class="flex items-center gap-1">
                    <Link
                        v-if="!collapsed"
                        :href="route('feeds.manage')"
                        class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors"
                    >
                        Edit
                    </Link>
                    <button
                        @click="emit('collapse-toggle')"
                        class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                    >
                        <svg class="h-5 w-5 transition-transform duration-200" :class="collapsed ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Sidebar content -->
            <nav class="flex-1 overflow-y-auto py-2" aria-label="Feed navigation">
                <!-- Smart filters -->
                <div class="px-3 pb-2">
                    <!-- Today -->
                    <button
                        @click="navigateTo({ filter: 'today' })"
                        class="flex w-full items-center gap-3 rounded-lg text-sm transition-colors cursor-pointer"
                        :class="[
                            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                            activeFilter === 'today' ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50',
                        ]"
                        :title="collapsed ? 'Today' : undefined"
                    >
                        <svg class="h-5 w-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        <template v-if="!collapsed">
                            <span class="flex-1 text-left">Today</span>
                            <span v-if="sidebar.todayCount > 0" class="text-xs text-slate-500">{{ sidebar.todayCount }}</span>
                        </template>
                    </button>

                    <!-- Read Later -->
                    <button
                        @click="navigateTo({ filter: 'read_later' })"
                        class="flex w-full items-center gap-3 rounded-lg text-sm transition-colors cursor-pointer"
                        :class="[
                            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                            activeFilter === 'read_later' ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50',
                        ]"
                        :title="collapsed ? 'Read Later' : undefined"
                    >
                        <svg class="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                        <template v-if="!collapsed">
                            <span class="flex-1 text-left">Read Later</span>
                            <span v-if="sidebar.readLaterCount > 0" class="text-xs text-slate-500">{{ sidebar.readLaterCount }}</span>
                        </template>
                    </button>
                </div>

                <div class="mx-3 border-t border-slate-800" />

                <!-- Feeds section -->
                <div class="px-3 pt-3">
                    <div v-if="!collapsed" class="flex items-center justify-between px-3 pb-2">
                        <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500">Feeds</h3>
                    </div>

                    <!-- All Feeds -->
                    <button
                        @click="navigateTo({})"
                        class="flex w-full items-center gap-3 rounded-lg text-sm transition-colors cursor-pointer"
                        :class="[
                            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                            isActiveAll() ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50',
                        ]"
                        :title="collapsed ? 'All Feeds' : undefined"
                    >
                        <svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        <template v-if="!collapsed">
                            <span class="flex-1 text-left">All</span>
                            <span v-if="sidebar.totalUnread > 0" class="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                {{ sidebar.totalUnread }}
                            </span>
                        </template>
                    </button>

                    <!-- Categories (hidden when collapsed) -->
                    <template v-if="!collapsed">
                        <div v-for="category in sidebar.categories" :key="category.id" class="mt-0.5">
                            <div
                                class="flex w-full items-center gap-0.5 rounded-lg text-sm transition-colors"
                                :class="activeCategoryId === category.id ? 'bg-slate-800 text-slate-100' : 'text-slate-300 hover:bg-slate-800/50'"
                            >
                                <button
                                    @click="toggleCategory(category.id)"
                                    class="shrink-0 rounded-lg p-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
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
                                    class="flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-left cursor-pointer"
                                >
                                    <span class="flex-1 truncate">{{ category.name }}</span>
                                    <span v-if="category.unread_count > 0" class="text-xs text-slate-500">{{ category.unread_count }}</span>
                                </button>
                            </div>

                            <div v-if="isCategoryExpanded(category.id)" class="ml-4">
                                <button
                                    v-for="feed in category.feeds"
                                    :key="feed.id"
                                    @click="navigateTo({ feed_id: feed.id })"
                                    class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer"
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
                                class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer"
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
                    </template>
                </div>
            </nav>

            <!-- Sidebar footer -->
            <div class="border-t border-slate-800 p-3 space-y-2">
                <Link
                    :href="route('feeds.create')"
                    class="flex w-full items-center rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    :class="collapsed ? 'justify-center p-2.5' : 'justify-center gap-2 px-4 py-2.5'"
                    :title="collapsed ? 'Add Feed' : undefined"
                >
                    <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span v-if="!collapsed">Add Feed</span>
                </Link>
                <Link
                    :href="route('settings.index')"
                    class="flex w-full items-center rounded-lg bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                    :class="collapsed ? 'justify-center p-2.5' : 'justify-center gap-2 px-4 py-2.5'"
                    :title="collapsed ? 'Settings' : undefined"
                >
                    <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span v-if="!collapsed">Settings</span>
                </Link>
            </div>
        </aside>
    </template>
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
