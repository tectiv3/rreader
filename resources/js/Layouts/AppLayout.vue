<script setup>
import { useDarkMode } from '@/Composables/useDarkMode.js';

const { isDark, toggle } = useDarkMode();
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
        <main class="pb-safe">
            <slot />
        </main>
    </div>
</template>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
