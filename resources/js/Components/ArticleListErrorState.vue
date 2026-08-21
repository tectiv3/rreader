<script setup>
import { computed } from 'vue'

const props = defineProps({
    // 'offline' — the request never reached the server and nothing was cached.
    // 'server'  — the server answered with an error (often an expired session).
    reason: { type: String, required: true },
})

const isOffline = computed(() => props.reason === 'offline')
</script>

<template>
    <svg
        class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1"
        stroke="currentColor">
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
    <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
        {{ isOffline ? 'Nothing cached for this view' : "Couldn't load articles" }}
    </h3>
    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
        {{
            isOffline
                ? "You're offline and haven't opened this view before."
                : 'The server returned an error. Try refreshing, or sign in again.'
        }}
    </p>
    <!-- A standalone PWA has no address bar, so "sign in again" is only
         actionable if the screen provides the way there. -->
    <a
        v-if="!isOffline"
        href="/login"
        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
        Sign in
    </a>
</template>
