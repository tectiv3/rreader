<script setup>
import { useDarkMode } from '@/Composables/useDarkMode.js';
import { router, usePage } from '@inertiajs/vue3';
import { inject } from 'vue';

const { isDark, toggle } = useDarkMode();

const page = usePage();
const toggleSidebar = inject('toggleSidebar', null);

function navigateTo(params) {
    router.get(route('articles.index', params), {}, { preserveState: false });
}
</script>

<template>
    <div class="min-h-screen bg-slate-950 text-slate-100">
        <!-- Header -->
        <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
            <div class="flex h-14 items-center justify-between px-4">
                <div class="flex items-center gap-3">
                    <slot name="header-left" />
                    <h1 class="text-lg font-semibold text-slate-100">
                        <slot name="title">RReader</slot>
                    </h1>
                </div>

                <div class="flex items-center gap-2">
                    <slot name="header-right" />
                    <!-- Dark mode toggle -->
                    <button
                        @click="toggle"
                        class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                    >
                        <!-- Sun icon (shown in dark mode) -->
                        <svg v-if="isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        <!-- Moon icon (shown in light mode) -->
                        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- Main content -->
        <main class="pb-16 lg:pb-0">
            <slot />
        </main>

        <!-- Bottom navigation bar (mobile only) -->
        <nav class="fixed bottom-0 inset-x-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 lg:hidden pb-safe"
             aria-label="Bottom navigation">
            <div class="flex h-14 items-center justify-around px-2">
                <!-- Sidebar toggle -->
                <button
                    @click="toggleSidebar?.()"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label="Open sidebar"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                    <span class="text-[10px]">Menu</span>
                </button>

                <!-- Read Later -->
                <button
                    @click="navigateTo({ filter: 'read_later' })"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
                    :class="page.props.activeFilter === 'read_later' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'"
                    aria-label="Read Later"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    <span class="text-[10px]">Read Later</span>
                </button>

                <!-- All Feeds -->
                <button
                    @click="navigateTo({})"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
                    :class="!page.props.activeFilter && !page.props.activeFeedId && !page.props.activeCategoryId ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'"
                    aria-label="All feeds"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <span class="text-[10px]">Feeds</span>
                </button>

                <!-- Add Feed -->
                <button
                    @click="router.visit(route('feeds.create'))"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label="Add feed"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span class="text-[10px]">Add</span>
                </button>

                <!-- Settings -->
                <button
                    @click="router.visit(route('settings.index'))"
                    class="flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
                    :class="page.url.startsWith('/settings') ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'"
                    aria-label="Settings"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-[10px]">Settings</span>
                </button>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
