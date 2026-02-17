<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Head } from '@inertiajs/vue3';
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout>
        <template #title>RReader</template>

        <div class="p-4">
            <div class="rounded-lg border border-slate-800 bg-slate-900 p-6">
                <p class="text-slate-300">
                    Welcome to RReader. Your feeds will appear here.
                </p>
            </div>
        </div>
    </AppLayout>
</template>
