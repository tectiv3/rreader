<template>
    <!-- Mobile skeleton -->
    <div class="lg:hidden">
        <!-- Date section skeleton -->
        <div
            class="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2">
            <div class="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <!-- Card skeletons -->
        <div
            v-for="i in 6"
            :key="i"
            class="flex gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-3">
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                    <div
                        class="h-3.5 w-3.5 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-800"></div>
                    <div
                        class="h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                    <div
                        class="h-3 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                </div>
                <div
                    class="mt-2 h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div
                    class="mt-1.5 h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
                <div
                    class="mt-1.5 h-3 w-full animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-800/60"></div>
            </div>
            <div
                class="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
                :class="{ hidden: i % 3 === 0 }"></div>
        </div>
    </div>

    <!-- Desktop skeleton -->
    <div class="hidden lg:block">
        <div
            class="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2">
            <div class="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
        <div
            v-for="i in 10"
            :key="'d' + i"
            class="flex items-center gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-2.5">
            <div
                class="h-4 w-4 shrink-0 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-800"></div>
            <div
                class="h-3 w-28 shrink-0 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            <div
                class="h-3.5 flex-1 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
            <div
                class="hidden xl:block h-3 w-48 shrink-0 animate-pulse rounded bg-neutral-200/60 dark:bg-neutral-800/60"></div>
            <div
                class="h-3 w-10 shrink-0 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
    </div>
</template>
