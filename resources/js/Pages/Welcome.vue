<script setup>
import { Head, Link } from '@inertiajs/vue3'

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
})
</script>

<template>
    <Head title="Welcome" />
    <div class="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6">
        <div class="text-center">
            <h1 class="text-5xl font-bold text-blue-500">RReader</h1>
            <p class="mt-3 text-lg text-neutral-400">Your self-hosted RSS reader</p>
        </div>

        <div v-if="canLogin" class="mt-10 flex flex-col gap-3 w-full max-w-xs">
            <Link
                v-if="$page.props.auth.user"
                :href="'/dashboard'"
                class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900">
                Go to Dashboard
            </Link>

            <template v-else>
                <Link
                    :href="'/login'"
                    class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900">
                    Log in
                </Link>

                <Link
                    v-if="canRegister"
                    :href="'/register'"
                    class="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-neutral-300 transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900">
                    Register
                </Link>
            </template>
        </div>
    </div>
</template>
