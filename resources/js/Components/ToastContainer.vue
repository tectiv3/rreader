<script setup>
import { useToast } from '@/Composables/useToast.js'

const { toasts, dismiss } = useToast()
</script>

<template>
    <div
        class="fixed bottom-20 lg:bottom-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            class="pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg transition-all duration-300"
            :class="[
                toast.type === 'success'
                    ? 'bg-green-600 text-white'
                    : toast.type === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
                toast.leaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
            ]"
            role="status"
            aria-live="polite">
            <!-- Success icon -->
            <svg
                v-if="toast.type === 'success'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <!-- Error icon -->
            <svg
                v-else-if="toast.type === 'error'"
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <!-- Info icon -->
            <svg
                v-else
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span>{{ toast.message }}</span>
            <button
                @click="dismiss(toast.id)"
                class="ml-1 shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss">
                <svg
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
</template>
