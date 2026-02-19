<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useDarkMode } from '@/Composables/useDarkMode.js'
import { useToast } from '@/Composables/useToast.js'

const router = useRouter()
const { theme, setTheme } = useDarkMode()
const { success, error: showError } = useToast()

const loading = ref(true)

// Preferences form
const prefsForm = reactive({
    theme: 'dark',
    article_view: 'full',
    font_size: 'medium',
    refresh_interval: 30,
    mark_read_on_scroll: true,
    hide_read_articles: false,
})
const prefsSaving = ref(false)

// Account form
const accountForm = reactive({
    name: '',
    email: '',
})
const accountSaving = ref(false)
const accountErrors = reactive({})

// Password form
const passwordForm = reactive({
    current_password: '',
    password: '',
    password_confirmation: '',
})
const passwordSaving = ref(false)
const passwordErrors = reactive({})

// --- Load settings on mount ---
onMounted(async () => {
    try {
        const response = await axios.get('/api/settings')
        const { settings, user } = response.data

        prefsForm.theme = settings.theme || 'dark'
        prefsForm.article_view = settings.article_view || 'full'
        prefsForm.font_size = settings.font_size || 'medium'
        prefsForm.refresh_interval = settings.refresh_interval || 30
        prefsForm.mark_read_on_scroll = settings.mark_read_on_scroll || true
        prefsForm.hide_read_articles = settings.hide_read_articles || false

        accountForm.name = user.name || ''
        accountForm.email = user.email || ''
    } catch {
        showError('Failed to load settings')
    } finally {
        loading.value = false
    }
})

// --- Save Preferences ---
async function savePrefs() {
    prefsSaving.value = true
    try {
        await axios.patch('/api/settings', {
            theme: prefsForm.theme,
            article_view: prefsForm.article_view,
            font_size: prefsForm.font_size,
            refresh_interval: prefsForm.refresh_interval,
            mark_read_on_scroll: prefsForm.mark_read_on_scroll,
            hide_read_articles: prefsForm.hide_read_articles,
        })
        setTheme(prefsForm.theme)
        success('Preferences saved')
    } catch {
        showError('Failed to save preferences')
    } finally {
        prefsSaving.value = false
    }
}

function setFormTheme(value) {
    prefsForm.theme = value
    setTheme(value)
}

// --- Save Account ---
async function saveAccount() {
    accountSaving.value = true
    Object.keys(accountErrors).forEach(key => delete accountErrors[key])

    try {
        await axios.patch('/api/settings/account', {
            name: accountForm.name,
            email: accountForm.email,
        })
        success('Account updated')
    } catch (e) {
        if (e.response?.status === 422) {
            Object.assign(accountErrors, e.response.data.errors || {})
        } else {
            showError('Failed to update account')
        }
    } finally {
        accountSaving.value = false
    }
}

// --- Save Password ---
async function savePassword() {
    passwordSaving.value = true
    Object.keys(passwordErrors).forEach(key => delete passwordErrors[key])

    try {
        await axios.patch('/api/settings/password', {
            current_password: passwordForm.current_password,
            password: passwordForm.password,
            password_confirmation: passwordForm.password_confirmation,
        })
        passwordForm.current_password = ''
        passwordForm.password = ''
        passwordForm.password_confirmation = ''
        success('Password updated')
    } catch (e) {
        if (e.response?.status === 422) {
            Object.assign(passwordErrors, e.response.data.errors || {})
        } else {
            showError('Failed to update password')
        }
        passwordForm.password = ''
        passwordForm.password_confirmation = ''
    } finally {
        passwordSaving.value = false
    }
}

function goToImport() {
    router.push({ name: 'opml.import' })
}

function exportOpml() {
    window.location.href = '/opml/export'
}

// --- Logout ---
async function logout() {
    try {
        await axios.post('/logout')
        window.location.href = '/'
    } catch {
        window.location.href = '/'
    }
}

function goBack() {
    router.back()
}
</script>

<template>
    <header
        class="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pt-safe">
        <div class="flex h-11 items-center justify-between px-4">
            <div class="flex items-center gap-2 min-w-0">
                <button
                    @click="goBack"
                    class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2"
                    aria-label="Go back">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 class="text-base font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    Settings
                </h1>
            </div>
        </div>
    </header>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
        <svg class="h-8 w-8 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4" />
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    </div>

    <div v-else class="mx-auto max-w-lg px-4 py-6 space-y-5">
        <form @submit.prevent="savePrefs">
            <!-- Appearance -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                    Appearance
                </h2>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2"
                            >Theme</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                            <button
                                v-for="opt in [
                                    { value: 'dark', label: 'Dark' },
                                    { value: 'light', label: 'Light' },
                                    { value: 'system', label: 'System' },
                                ]"
                                :key="opt.value"
                                type="button"
                                @click="setFormTheme(opt.value)"
                                class="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                :class="
                                    prefsForm.theme === opt.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                                ">
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!--div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                    Reading
                </h2>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2"
                            >Font size</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                            <button
                                v-for="opt in [
                                    { value: 'small', label: 'Small' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'large', label: 'Large' },
                                ]"
                                :key="opt.value"
                                type="button"
                                @click="prefsForm.font_size = opt.value"
                                class="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                :class="
                                    prefsForm.font_size === opt.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                                ">
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div!-->

            <!-- Feeds -->
            <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5">
                <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                    Feeds
                </h2>

                <div class="space-y-4">
                    <div>
                        <label
                            for="refresh_interval"
                            class="block text-sm text-neutral-700 dark:text-neutral-300 mb-2"
                            >Refresh interval (minutes)</label
                        >
                        <select
                            id="refresh_interval"
                            v-model.number="prefsForm.refresh_interval"
                            class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900">
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
                        <label
                            for="mark_read_on_scroll"
                            class="text-sm text-neutral-700 dark:text-neutral-300"
                            >Mark as read on scroll</label
                        >
                        <button
                            id="mark_read_on_scroll"
                            type="button"
                            @click="prefsForm.mark_read_on_scroll = !prefsForm.mark_read_on_scroll"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            :class="
                                prefsForm.mark_read_on_scroll
                                    ? 'bg-blue-600'
                                    : 'bg-neutral-300 dark:bg-neutral-700'
                            "
                            role="switch"
                            :aria-checked="prefsForm.mark_read_on_scroll">
                            <span
                                class="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                                :class="
                                    prefsForm.mark_read_on_scroll
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                " />
                        </button>
                    </div>

                    <div class="flex items-center justify-between">
                        <label
                            for="hide_read_articles"
                            class="text-sm text-neutral-700 dark:text-neutral-300"
                            >Hide read articles</label
                        >
                        <button
                            id="hide_read_articles"
                            type="button"
                            @click="prefsForm.hide_read_articles = !prefsForm.hide_read_articles"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            :class="
                                prefsForm.hide_read_articles
                                    ? 'bg-blue-600'
                                    : 'bg-neutral-300 dark:bg-neutral-700'
                            "
                            role="switch"
                            :aria-checked="prefsForm.hide_read_articles">
                            <span
                                class="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                                :class="
                                    prefsForm.hide_read_articles ? 'translate-x-6' : 'translate-x-1'
                                " />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Save preferences button -->
            <button
                type="submit"
                class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-25"
                :disabled="prefsSaving">
                {{ prefsSaving ? 'Saving...' : 'Save Preferences' }}
            </button>
        </form>

        <!-- Account -->
        <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Account
            </h2>

            <form @submit.prevent="saveAccount" class="space-y-4">
                <div>
                    <label
                        for="name"
                        class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1"
                        >Name</label
                    >
                    <input
                        id="name"
                        v-model="accountForm.name"
                        type="text"
                        class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900" />
                    <p
                        v-if="accountErrors.name"
                        class="mt-1 text-sm text-red-600 dark:text-red-400">
                        {{ accountErrors.name[0] }}
                    </p>
                </div>

                <div>
                    <label
                        for="email"
                        class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1"
                        >Email</label
                    >
                    <input
                        id="email"
                        v-model="accountForm.email"
                        type="email"
                        class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900" />
                    <p
                        v-if="accountErrors.email"
                        class="mt-1 text-sm text-red-600 dark:text-red-400">
                        {{ accountErrors.email[0] }}
                    </p>
                </div>

                <button
                    type="submit"
                    class="w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-25"
                    :disabled="accountSaving">
                    {{ accountSaving ? 'Updating...' : 'Update Account' }}
                </button>
            </form>
        </div>

        <!-- Change Password -->
        <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Change Password
            </h2>

            <form @submit.prevent="savePassword" class="space-y-4">
                <div>
                    <label
                        for="current_password"
                        class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1"
                        >Current password</label
                    >
                    <input
                        id="current_password"
                        v-model="passwordForm.current_password"
                        type="password"
                        class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900" />
                    <p
                        v-if="passwordErrors.current_password"
                        class="mt-1 text-sm text-red-600 dark:text-red-400">
                        {{ passwordErrors.current_password[0] }}
                    </p>
                </div>

                <div>
                    <label
                        for="password"
                        class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1"
                        >New password</label
                    >
                    <input
                        id="password"
                        v-model="passwordForm.password"
                        type="password"
                        class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900" />
                    <p
                        v-if="passwordErrors.password"
                        class="mt-1 text-sm text-red-600 dark:text-red-400">
                        {{ passwordErrors.password[0] }}
                    </p>
                </div>

                <div>
                    <label
                        for="password_confirmation"
                        class="block text-sm text-neutral-700 dark:text-neutral-300 mb-1"
                        >Confirm new password</label
                    >
                    <input
                        id="password_confirmation"
                        v-model="passwordForm.password_confirmation"
                        type="password"
                        class="w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900" />
                </div>

                <button
                    type="submit"
                    class="w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-25"
                    :disabled="passwordSaving">
                    {{ passwordSaving ? 'Updating...' : 'Update Password' }}
                </button>
            </form>
        </div>

        <!-- Data -->
        <div class="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5">
            <h2 class="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4">Data</h2>

            <div class="space-y-3">
                <button
                    @click="goToImport"
                    class="flex w-full items-center gap-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700">
                    <svg
                        class="h-5 w-5 text-neutral-500 dark:text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Import OPML
                </button>

                <button
                    @click="exportOpml"
                    class="flex w-full items-center gap-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700">
                    <svg
                        class="h-5 w-5 text-neutral-500 dark:text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
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
                    <a
                        href="https://github.com/tectiv3/rreader"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-400 hover:text-blue-300">
                        GitHub
                    </a>
                </div>
            </div>
        </div>

        <!-- Logout -->
        <button
            @click="logout"
            class="w-full rounded-lg bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-800 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/70">
            Log Out
        </button>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
