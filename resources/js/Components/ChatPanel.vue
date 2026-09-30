<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/Stores/useChatStore.js'
import { useOnlineStatus } from '@/Composables/useOnlineStatus.js'
import { useToast } from '@/Composables/useToast.js'
import { renderMarkdown, useStreamingMarkdown } from '@/Composables/useMarkdown.js'

/**
 * The conversation UI: message list, streaming turn, model routing header,
 * composer. Rendered full-height by ChatConversationView (route chat.show)
 * and docked inline under an article by ArticleListView (desktop).
 */
defineProps({
    // Docked mode: bordered block with a capped-height message list and a
    // close affordance instead of the back-to-hub button.
    inline: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const router = useRouter()
const chat = useChatStore()
const { isOnline } = useOnlineStatus()
const { success, error: showError } = useToast()

const conversation = computed(() => chat.currentConversation)

// --- Model routing ---

const modelOptions = computed(() => {
    const options = []
    for (const [provider, info] of Object.entries(chat.providers)) {
        for (const model of info.models ?? []) {
            options.push({ provider, model })
        }
    }
    return options
})

const switching = ref(false)

// Option values are indices into modelOptions; '' means the conversation's
// current routing isn't offered anymore (stale provider) and keeps the
// placeholder selected so the current pair stays visible.
const selectedRouting = computed({
    get() {
        const current = conversation.value
        if (!current) return ''
        const index = modelOptions.value.findIndex(
            option => option.provider === current.provider && option.model === current.model
        )
        return index === -1 ? '' : String(index)
    },
    async set(value) {
        const current = conversation.value
        const option = modelOptions.value[Number(value)]
        if (!current || !option) return
        switching.value = true
        try {
            await chat.switchRouting(current.id, option.provider, option.model)
            success('Switched — applies from your next message.')
        } catch (e) {
            showError(e.response?.data?.message || 'Could not switch model.')
        } finally {
            switching.value = false
        }
    },
})

// --- Message rendering ---

const streamingMessage = computed(() => chat.messages.find(m => m.status === 'streaming') ?? null)

const { html: streamingHtml } = useStreamingMarkdown(
    computed(() => streamingMessage.value?.content ?? '')
)

const mdClasses =
    'prose prose-sm max-w-none dark:prose-invert ' +
    'prose-p:my-2 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 ' +
    'prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 ' +
    'prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline ' +
    'prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 ' +
    'prose-code:text-blue-600 dark:prose-code:text-blue-300 ' +
    'prose-code:before:content-none prose-code:after:content-none ' +
    'prose-pre:bg-white dark:prose-pre:bg-neutral-900 prose-pre:border ' +
    'prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 ' +
    'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 ' +
    'prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700'

function isLastMessage(index) {
    return index === chat.messages.length - 1
}

// --- Reasoning / tool activity (current turn only; cleared by the store) ---

const reasoningOpen = ref(false)

// --- Composer ---

const draft = ref('')
const composerEl = ref(null)

const canSend = computed(() => draft.value.trim() !== '' && !chat.streaming && isOnline.value)

function submit() {
    const content = draft.value.trim()
    if (!content || chat.streaming || !isOnline.value) return
    draft.value = ''
    // Resize after v-model flushes the cleared value, otherwise the composer
    // keeps the height of the message just sent.
    nextTick(autoResize)
    chat.sendTurn(content)
}

function onComposerKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submit()
    }
}

function autoResize() {
    const el = composerEl.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}

// --- Scroll following ---
// Follow the stream while pinned to the bottom; a manual scroll up suspends
// following until the reader returns to the bottom.

const messagesEl = ref(null)
const following = ref(true)

function onMessagesScroll() {
    const el = messagesEl.value
    if (!el) return
    following.value = el.scrollHeight - el.scrollTop - el.clientHeight < 48
}

function followIfTracking() {
    const el = messagesEl.value
    if (el && following.value) el.scrollTop = el.scrollHeight
}

watch(
    () => [
        chat.messages.length,
        streamingHtml.value,
        chat.reasoningBuffer,
        chat.toolActivity.map(tool => tool.status).join(),
    ],
    () => nextTick(followIfTracking),
    { flush: 'post' }
)

watch(
    () => conversation.value?.id,
    () => {
        following.value = true
        nextTick(followIfTracking)
    }
)

onMounted(() => nextTick(followIfTracking))

// --- Navigation ---

function goToHub() {
    router.push({ name: 'chat.index' })
}

function goToArticle() {
    const articleId = conversation.value?.article_id
    if (articleId) {
        router.push({ name: 'articles.show', params: { id: articleId } })
    }
}
</script>

<template>
    <div
        class="flex min-h-0 flex-col bg-white dark:bg-neutral-950"
        :class="inline ? 'rounded-xl border border-neutral-200 dark:border-neutral-800' : 'h-full'">
        <!-- Header: article context + model routing -->
        <header
            class="flex shrink-0 flex-col gap-1 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2.5"
            :class="inline ? '' : 'pt-safe'">
            <div class="flex items-center gap-2">
                <button
                    v-if="!inline"
                    @click="goToHub"
                    class="-ml-2 rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                    aria-label="Back to conversations">
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
                <button
                    v-else
                    @click="emit('close')"
                    class="-ml-2 rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                    aria-label="Close chat">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                </button>

                <div class="min-w-0 flex-1">
                    <component
                        :is="conversation?.article_id ? 'button' : 'p'"
                        class="block max-w-full truncate text-left text-sm font-semibold text-neutral-800 dark:text-neutral-200"
                        :class="
                            conversation?.article_id
                                ? 'hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
                                : ''
                        "
                        :title="conversation?.article_title || 'Untitled article'"
                        @click="conversation?.article_id && goToArticle()">
                        {{ conversation?.article_title || 'Untitled article' }}
                    </component>
                    <p
                        v-if="conversation?.feed_title"
                        class="truncate text-xs text-neutral-500 dark:text-neutral-500">
                        {{ conversation.feed_title }}
                    </p>
                </div>
            </div>

            <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pl-10">
                <span
                    v-if="modelOptions.length <= 1"
                    class="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {{ conversation?.provider }} &middot; {{ conversation?.model }}
                </span>
                <select
                    v-else
                    v-model="selectedRouting"
                    :disabled="chat.streaming || switching"
                    title="Switch model — applies from your next message"
                    class="max-w-[16rem] truncate rounded-md border border-neutral-300 bg-white px-1.5 py-1 text-xs text-neutral-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                    <option value="" disabled>
                        {{ conversation?.provider }} &middot; {{ conversation?.model }}
                    </option>
                    <option v-for="(option, i) in modelOptions" :key="i" :value="String(i)">
                        {{ option.provider }} &middot; {{ option.model }}
                    </option>
                </select>
                <span
                    v-if="modelOptions.length > 1"
                    class="shrink-0 text-[10px] text-neutral-400 dark:text-neutral-600">
                    next message
                </span>
                <span
                    v-if="conversation && !conversation.provider_available"
                    class="flex min-w-0 items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
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
                    <span class="truncate">Model unavailable — switch for your next message.</span>
                </span>
            </div>
        </header>

        <!-- Messages -->
        <div
            ref="messagesEl"
            @scroll.passive="onMessagesScroll"
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            :class="inline ? 'max-h-[28rem]' : ''">
            <div class="mx-auto w-full max-w-2xl space-y-4 px-4 py-4">
                <!-- Empty state -->
                <div
                    v-if="chat.messages.length === 0"
                    class="flex flex-col items-center justify-center py-16 text-center">
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
                        Ask something about this article
                    </h3>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-500">
                        The assistant can read the article, search your feeds, highlights and past
                        chats, and fetch pages.
                    </p>
                </div>

                <template v-for="(message, index) in chat.messages" :key="message.id ?? index">
                    <!-- User message -->
                    <div v-if="message.role === 'user'" class="flex justify-end">
                        <div
                            class="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2 text-sm text-white">
                            {{ message.content }}
                        </div>
                    </div>

                    <!-- Assistant message -->
                    <div v-else class="flex justify-start">
                        <div
                            class="w-full max-w-[95%] rounded-2xl rounded-bl-sm border bg-neutral-50 px-3.5 py-2.5 dark:bg-neutral-900"
                            :class="
                                message.status === 'failed'
                                    ? 'border-red-300 dark:border-red-900/60'
                                    : 'border-neutral-200 dark:border-neutral-800'
                            ">
                            <!-- Failed marker -->
                            <p
                                v-if="message.status === 'failed'"
                                class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                                <svg
                                    class="h-3.5 w-3.5 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l8.354 14.598zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Response failed
                            </p>

                            <!-- Reasoning (only when the model emitted any) -->
                            <div
                                v-if="isLastMessage(index) && chat.reasoningBuffer"
                                class="mb-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/60">
                                <button
                                    @click="reasoningOpen = !reasoningOpen"
                                    class="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
                                    :aria-expanded="reasoningOpen">
                                    <svg
                                        class="h-3.5 w-3.5 transition-transform duration-200"
                                        :class="{ 'rotate-90': reasoningOpen }"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="2"
                                        stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                    Thinking
                                </button>
                                <div
                                    v-if="reasoningOpen"
                                    class="max-h-48 overflow-y-auto whitespace-pre-wrap border-t border-neutral-200 px-2.5 py-2 text-xs leading-relaxed text-neutral-500 dark:border-neutral-700/60 dark:text-neutral-400">
                                    {{ chat.reasoningBuffer }}
                                </div>
                            </div>

                            <!-- Tool activity (current turn) -->
                            <div
                                v-if="isLastMessage(index) && chat.toolActivity.length"
                                class="mb-2 space-y-1">
                                <div
                                    v-for="(tool, toolIndex) in chat.toolActivity"
                                    :key="toolIndex"
                                    class="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    <svg
                                        v-if="tool.status === 'running'"
                                        class="h-3.5 w-3.5 shrink-0 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24">
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
                                    <svg
                                        v-else-if="tool.status === 'completed'"
                                        class="h-3.5 w-3.5 shrink-0 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="2"
                                        stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <svg
                                        v-else
                                        class="h-3.5 w-3.5 shrink-0 text-red-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="2"
                                        stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span class="truncate font-mono">{{ tool.name }}</span>
                                    <span
                                        v-if="tool.status === 'failed'"
                                        class="text-red-500 dark:text-red-400">
                                        failed
                                    </span>
                                </div>
                            </div>

                            <!-- Content -->
                            <div v-if="message.status === 'streaming'" class="text-sm">
                                <div
                                    v-if="message.content"
                                    :class="mdClasses"
                                    v-html="streamingHtml" />
                                <div v-else class="flex items-center gap-1 py-1.5">
                                    <span
                                        class="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                                    <span
                                        class="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
                                    <span
                                        class="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
                                </div>
                            </div>
                            <div
                                v-else-if="message.content"
                                :class="mdClasses"
                                v-html="renderMarkdown(message.content)" />
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Composer -->
        <div
            class="shrink-0 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
            :class="inline ? '' : 'pb-safe'">
            <form
                class="mx-auto flex w-full max-w-2xl items-end gap-2 px-4 py-3"
                @submit.prevent="submit">
                <textarea
                    ref="composerEl"
                    v-model="draft"
                    rows="1"
                    :disabled="chat.streaming || !isOnline"
                    :placeholder="
                        chat.streaming
                            ? 'Generating…'
                            : isOnline
                              ? 'Ask about this article…'
                              : 'You are offline'
                    "
                    class="max-h-40 min-h-9 flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                    aria-label="Message"
                    @keydown="onComposerKeydown"
                    @input="autoResize" />
                <button
                    v-if="chat.streaming"
                    type="button"
                    @click="chat.abortTurn()"
                    class="shrink-0 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title="Stop generating">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                </button>
                <button
                    v-else
                    type="submit"
                    :disabled="!canSend"
                    class="shrink-0 rounded-xl bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-default disabled:opacity-40"
                    :aria-label="isOnline ? 'Send message' : 'Chat needs a connection'"
                    title="Send">
                    <svg
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
}

.pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
