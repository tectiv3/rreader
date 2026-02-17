<script setup>
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
});
</script>

<template>
    <Head title="Welcome" />
    <div class="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6">
        <div class="text-center">
            <h1 class="text-5xl font-bold text-blue-500">RReader</h1>
            <p class="mt-3 text-lg text-slate-400">Your self-hosted RSS reader</p>
        </div>

        <div v-if="canLogin" class="mt-10 flex flex-col gap-3 w-full max-w-xs">
            <Link
                v-if="$page.props.auth.user"
                :href="route('dashboard')"
                class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
                Go to Dashboard
            </Link>

            <template v-else>
                <Link
                    :href="route('login')"
                    class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Log in
                </Link>

                <Link
                    v-if="canRegister"
                    :href="route('register')"
                    class="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Register
                </Link>
            </template>
        </div>
    </div>
</template>
