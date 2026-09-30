<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/Stores/useChatStore.js'
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { setTitle } from '@/router.js'
import ChatPanel from '@/Components/ChatPanel.vue'

const props = defineProps({
    // Conversation ids are UUID strings from the API
    conversationId: { type: String, required: true },
})

const router = useRouter()
const chat = useChatStore()
const { isOnline } = useOnlineStatus()

const loadError = ref(null) // 'offline' | 'server'

async function load() {
    loadError.value = null
    try {
        await chat.openConversation(props.conversationId)
        if (chat.currentConversation) {
            setTitle(
                chat.currentConversation.article_title || chat.currentConversation.title || 'Chat'
            )
        }
    } catch (e) {
        if (e?.response?.status === 404) {
            // Toast already shown by the store — the conversation may have been
            // deleted, so the hub (without that row) is the right landing.
            router.replace({ name: 'chat.index' })
            return
        }
        loadError.value = e?.response || navigator.onLine ? 'server' : 'offline'
    }
}

onMounted(() => {
    chat.loadModels()
    load()
})

// Same component instance when hopping between conversations (hub → hub links)
watch(
    () => props.conversationId,
    () => load()
)

function goBack() {
    router.push({ name: 'chat.index' })
}
</script>

<template>
    <!--
        Full-screen overlay on mobile (covers the bottom nav, like the article
        reader), a bounded column on desktop where AppLayout's main has a fixed
        height.
    -->
    <div
        class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-950 lg:static lg:z-auto lg:h-full">
        <!-- Loading state -->
        <div v-if="chat.messagesLoading" class="flex flex-1 items-center justify-center py-20">
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

        <!-- Load error -->
        <div
            v-else-if="loadError"
            class="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
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
            <h1 class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                {{ loadError === 'offline' ? "You're offline" : "Couldn't load conversation" }}
            </h1>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                {{
                    loadError === 'offline'
                        ? 'Chat needs a connection.'
                        : 'The server returned an error.'
                }}
            </p>
            <div class="mt-6 flex items-center gap-3">
                <button
                    v-if="loadError === 'server' && isOnline"
                    type="button"
                    @click="load"
                    class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                    Try again
                </button>
                <button
                    type="button"
                    @click="goBack"
                    class="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                    Back to chats
                </button>
            </div>
        </div>

        <!-- Conversation -->
        <ChatPanel v-else-if="chat.currentConversation" class="min-h-0 flex-1" />
    </div>
</template>
