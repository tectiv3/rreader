<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import InputError from '@/Components/InputError.vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import { useDarkMode } from '@/Composables/useDarkMode.js';

const { theme, setTheme } = useDarkMode();

const props = defineProps({
    settings: Object,
    user: Object,
    status: String,
});

const showStatus = ref(false);
let statusTimer = null;
watch(() => props.status, (val) => {
    if (val) {
        showStatus.value = true;
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => { showStatus.value = false; }, 3000);
    }
}, { immediate: true });

// Preferences form
const prefsForm = useForm({
    theme: props.settings.theme,
    article_view: props.settings.article_view,
    font_size: props.settings.font_size,
    refresh_interval: props.settings.refresh_interval,
    mark_read_on_scroll: props.settings.mark_read_on_scroll,
    hide_read_articles: props.settings.hide_read_articles,
});

const savePrefs = () => {
    prefsForm.patch(route('settings.update'), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            // Sync client-side theme with saved preference
            setTheme(prefsForm.theme);
        },
    });
};

// Account form
const accountForm = useForm({
    name: props.user.name,
    email: props.user.email,
});

const saveAccount = () => {
    accountForm.patch(route('settings.updateAccount'), {
        preserveScroll: true,
        preserveState: true,
    });
};

// Password form
const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
});

const savePassword = () => {
    passwordForm.patch(route('settings.updatePassword'), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            passwordForm.reset();
        },
        onError: () => {
            passwordForm.reset('password', 'password_confirmation');
        },
    });
};

const exportOpml = () => {
    window.location.href = route('opml.export');
};

const logout = () => {
    router.post(route('logout'));
};
</script>

<template>
    <AppLayout>
        <template #header-left>
            <button
                @click="router.visit(route('articles.index'))"
                class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2"
                title="Go back"
                aria-label="Go back"
            >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
        </template>
        <template #title>Settings</template>

        <Head title="Settings" />

        <div class="mx-auto max-w-lg px-4 py-6 space-y-5">
            <!-- Status notification -->
            <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
            >
                <div v-if="showStatus && status" class="rounded-lg bg-green-50 dark:bg-green-900/50 border border-green-300 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-300">
                    {{ status }}
                </div>
            </Transition>

            <form @submit.prevent="savePrefs">
            <!-- Appearance -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Appearance</h2>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">Theme</label>
                        <div class="grid grid-cols-3 gap-2">
                            <button
                                v-for="opt in [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'system', label: 'System' }]"
                                :key="opt.value"
                                @click="prefsForm.theme = opt.value; setTheme(opt.value)"
                                class="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                :class="prefsForm.theme === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'"
                            >
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reading -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Reading</h2>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">Default article view</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button
                                v-for="opt in [{ value: 'full', label: 'Full content' }, { value: 'summary', label: 'Summary' }]"
                                :key="opt.value"
                                @click="prefsForm.article_view = opt.value"
                                class="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                :class="prefsForm.article_view === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'"
                            >
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">Font size</label>
                        <div class="grid grid-cols-3 gap-2">
                            <button
                                v-for="opt in [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]"
                                :key="opt.value"
                                @click="prefsForm.font_size = opt.value"
                                class="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                :class="prefsForm.font_size === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'"
                            >
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Feeds -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Feeds</h2>

                <div class="space-y-4">
                    <div>
                        <label for="refresh_interval" class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">Refresh interval (minutes)</label>
                        <select
                            id="refresh_interval"
                            v-model.number="prefsForm.refresh_interval"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
                        >
                            <option :value="5">5 minutes</option>
                            <option :value="15">15 minutes</option>
                            <option :value="30">30 minutes</option>
                            <option :value="60">1 hour</option>
                            <option :value="120">2 hours</option>
                            <option :value="360">6 hours</option>
                            <option :value="720">12 hours</option>
                            <option :value="1440">24 hours</option>
                        </select>
                    </div>

                    <div class="flex items-center justify-between">
                        <label for="mark_read_on_scroll" class="text-sm text-neutral-700 dark:text-neutral-300">Mark as read on scroll</label>
                        <button
                            id="mark_read_on_scroll"
                            @click="prefsForm.mark_read_on_scroll = !prefsForm.mark_read_on_scroll"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            :class="prefsForm.mark_read_on_scroll ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'"
                            role="switch"
                            :aria-checked="prefsForm.mark_read_on_scroll"
                        >
                            <span
                                class="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                                :class="prefsForm.mark_read_on_scroll ? 'translate-x-6' : 'translate-x-1'"
                            />
                        </button>
                    </div>

                    <div class="flex items-center justify-between">
                        <label for="hide_read_articles" class="text-sm text-neutral-700 dark:text-neutral-300">Hide read articles</label>
                        <button
                            id="hide_read_articles"
                            @click="prefsForm.hide_read_articles = !prefsForm.hide_read_articles"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            :class="prefsForm.hide_read_articles ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'"
                            role="switch"
                            :aria-checked="prefsForm.hide_read_articles"
                        >
                            <span
                                class="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                                :class="prefsForm.hide_read_articles ? 'translate-x-6' : 'translate-x-1'"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Save preferences button -->
            <button
                type="submit"
                class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-25"
                :disabled="prefsForm.processing"
            >
                {{ prefsForm.processing ? 'Saving...' : 'Save Preferences' }}
            </button>
            </form>

            <!-- Account -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Account</h2>

                <form @submit.prevent="saveAccount" class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Name</label>
                        <input
                            id="name"
                            v-model="accountForm.name"
                            type="text"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
                        />
                        <InputError class="mt-1" :message="accountForm.errors.name" />
                    </div>

                    <div>
                        <label for="email" class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
                        <input
                            id="email"
                            v-model="accountForm.email"
                            type="email"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
                        />
                        <InputError class="mt-1" :message="accountForm.errors.email" />
                    </div>

                    <button
                        type="submit"
                        class="w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-25"
                        :disabled="accountForm.processing"
                    >
                        {{ accountForm.processing ? 'Updating...' : 'Update Account' }}
                    </button>
                </form>
            </div>

            <!-- Change Password -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Change Password</h2>

                <form @submit.prevent="savePassword" class="space-y-4">
                    <div>
                        <label for="current_password" class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Current password</label>
                        <input
                            id="current_password"
                            v-model="passwordForm.current_password"
                            type="password"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
                        />
                        <InputError class="mt-1" :message="passwordForm.errors.current_password" />
                    </div>

                    <div>
                        <label for="password" class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">New password</label>
                        <input
                            id="password"
                            v-model="passwordForm.password"
                            type="password"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
                        />
                        <InputError class="mt-1" :message="passwordForm.errors.password" />
                    </div>

                    <div>
                        <label for="password_confirmation" class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1">Confirm new password</label>
                        <input
                            id="password_confirmation"
                            v-model="passwordForm.password_confirmation"
                            type="password"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
                        />
                    </div>

                    <button
                        type="submit"
                        class="w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-25"
                        :disabled="passwordForm.processing"
                    >
                        {{ passwordForm.processing ? 'Updating...' : 'Update Password' }}
                    </button>
                </form>
            </div>

            <!-- Data -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Data</h2>

                <div class="space-y-3">
                    <a
                        :href="route('opml.index')"
                        class="flex w-full items-center gap-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700"
                    >
                        <svg class="h-5 w-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Import OPML
                    </a>

                    <button
                        @click="exportOpml"
                        class="flex w-full items-center gap-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700"
                    >
                        <svg class="h-5 w-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
                        </svg>
                        Export OPML
                    </button>
                </div>
            </div>

            <!-- About -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-3">About</h2>

                <div class="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <div class="flex justify-between">
                        <span>Version</span>
                        <span class="text-neutral-700 dark:text-neutral-300">1.0.0</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Source code</span>
                        <a href="https://github.com/rreader/rreader" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300">
                            GitHub
                        </a>
                    </div>
                </div>
            </div>

            <!-- Logout -->
            <button
                @click="logout"
                class="w-full rounded-lg bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-800 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/70"
            >
                Log Out
            </button>
        </div>
    </AppLayout>
</template>
