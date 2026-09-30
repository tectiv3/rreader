<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/Stores/useChatStore.js'
import { useToast } from '@/Composables/useToast.js'
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'

const router = useRouter()
const chat = useChatStore()
const { error: showError } = useToast()
const { isOnline } = useOnlineStatus()

// Inline delete confirmation (FeedManageView pattern)
const deletingId = ref(null)

function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// A conversation with no messages yet has no last_message_at
function lastActivity(conversation) {
    return conversation.last_message_at ? timeAgo(conversation.last_message_at) : 'new'
}

async function loadHub() {
    await Promise.all([chat.loadModels(true), chat.fetchConversationList()])
}

onMounted(loadHub)

function openConversation(conversation) {
    router.push({ name: 'chat.show', params: { conversationId: conversation.id } })
}

function startDelete(conversation) {
    deletingId.value = conversation.id
}

function cancelDelete() {
    deletingId.value = null
}

async function confirmDelete(conversation) {
    try {
        await chat.removeConversation(conversation.id)
        deletingId.value = null
    } catch (e) {
        showError(e.response?.data?.message || 'Failed to delete conversation')
    }
}

function goBack() {
    router.push({ name: 'articles.index' })
}
</script>

<template>
    <!-- Sticky header -->
    <header
        class="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pt-safe">
        <div class="flex h-11 items-center justify-between px-4">
            <div class="flex items-center gap-2 min-w-0">
                <button
                    @click="goBack"
                    class="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2"
                    aria-label="Back to articles">
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
                    Chat
                </h1>
            </div>
        </div>
    </header>

    <!-- Loading state -->
    <div
        v-if="chat.conversationsLoading && !chat.conversationsLoaded"
        class="flex items-center justify-center py-20">
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

    <!-- Chat disabled: no provider resolves on the server -->
    <div
        v-else-if="chat.enabled === false"
        class="flex flex-col items-center justify-center px-4 py-20 text-center">
        <svg
            class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Chat is unavailable
        </h3>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
            No AI provider is configured on this server.
        </p>
    </div>

    <!-- Load error -->
    <div
        v-else-if="chat.conversationsError && !chat.conversationsLoaded"
        class="flex flex-col items-center justify-center px-4 py-20 text-center">
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
            {{
                chat.conversationsError === 'offline'
                    ? "You're offline"
                    : "Couldn't load conversations"
            }}
        </h3>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
            {{
                chat.conversationsError === 'offline'
                    ? 'Chat needs a connection.'
                    : 'The server returned an error.'
            }}
        </p>
        <button
            v-if="chat.conversationsError === 'server' && isOnline"
            @click="loadHub"
            class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Try again
        </button>
    </div>

    <!-- Hub list -->
    <div v-else class="mx-auto max-w-2xl px-4 py-6">
        <!-- Offline notice: the list stays browsable, turns don't work -->
        <div
            v-if="!isOnline"
            class="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            You're offline — chat needs a connection.
        </div>

        <div v-if="chat.conversations.length > 0" class="space-y-1">
            <div
                v-for="conversation in chat.conversations"
                :key="conversation.id"
                class="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3">
                <div class="flex items-center gap-3">
                    <button
                        @click="openConversation(conversation)"
                        class="flex-1 min-w-0 text-left transition-colors"
                        :title="conversation.article_title">
                        <p
                            class="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                            {{ conversation.article_title || 'Untitled article' }}
                        </p>
                        <div
                            class="mt-1 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500">
                            <span v-if="conversation.feed_title" class="truncate">{{
                                conversation.feed_title
                            }}</span>
                            <span v-if="conversation.feed_title">&middot;</span>
                            <span class="truncate">{{ conversation.model }}</span>
                            <span>&middot;</span>
                            <span class="shrink-0">{{ lastActivity(conversation) }}</span>
                        </div>
                        <p
                            v-if="!conversation.provider_available"
                            class="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                            <svg
                                class="h-3.5 w-3.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Model unavailable — switch to a configured model in the chat.
                        </p>
                    </button>
                    <button
                        v-if="deletingId !== conversation.id"
                        @click="startDelete(conversation)"
                        class="rounded-lg p-1.5 text-neutral-500 hover:bg-red-900/50 hover:text-red-400 transition-colors shrink-0"
                        title="Delete conversation"
                        aria-label="Delete conversation">
                        <svg
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>

                <!-- Delete confirmation -->
                <div
                    v-if="deletingId === conversation.id"
                    class="mt-3 rounded-lg border border-red-800/50 bg-red-950/50 p-3">
                    <p class="text-sm text-red-300 mb-2">
                        Delete this conversation? Its history is removed for good.
                    </p>
                    <div class="flex gap-2">
                        <button
                            @click="confirmDelete(conversation)"
                            class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors">
                            Delete
                        </button>
                        <button
                            @click="cancelDelete"
                            class="rounded-lg px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
            <svg
                class="h-16 w-16 text-neutral-300 dark:text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1"
                stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                No conversations yet
            </h3>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                Open an article and start a chat — it will show up here.
            </p>
        </div>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}
</style>
