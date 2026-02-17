<script setup>
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div
        class="flex min-h-screen flex-col items-center bg-slate-950 pt-6 sm:justify-center sm:pt-0"
    >
        <div>
            <Link href="/" class="text-3xl font-bold text-blue-500">
                RReader
            </Link>
        </div>

        <div
            class="mt-6 w-full overflow-hidden border border-slate-800 bg-slate-900 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg"
        >
            <slot />
        </div>
    </div>
</template>
