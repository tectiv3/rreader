import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from '@/Composables/useToast.js'
import {
    ChatApiError,
    fetchChatModels,
    fetchConversations,
    fetchConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    streamTurn,
} from '@/api/chat.js'

/**
 * Chat state shared by the hub, the conversation view (Task 7) and the
 * article chat button (Task 7).
 *
 * Chat is strictly online: no IndexedDB snapshots or offline queueing here —
 * a replayed chat turn against a server whose state moved on is worse than
 * a turn the reader has to retype.
 */
export const useChatStore = defineStore('chat', () => {
    // --- Entry gating (GET /chat/models) ---
    // null = not yet answered; the nav (Task 7) treats non-true as hidden.
    const enabled = ref(null)
    const providers = ref({})
    let modelsRequest = null

    // --- Hub list ---
    const conversations = ref([])
    const conversationsLoading = ref(false)
    const conversationsLoaded = ref(false)
    const conversationsError = ref(null) // 'offline' | 'server'

    // --- Current conversation ---
    const currentConversation = ref(null)
    const messages = ref([])
    const messagesLoading = ref(false)

    // --- Streaming turn ---
    const streaming = ref(false)
    const toolActivity = ref([]) // [{name, status}] for the running turn
    const reasoningBuffer = ref('') // reasoning deltas of the running turn
    let abortController = null
    // Generation token for the single in-flight turn. Callbacks compare against
    // it so a turn that was switched away from cannot write shared state.
    let activeTurnId = null
    let turnSeq = 0

    const { error: showError } = useToast()

    async function loadModels(force = false) {
        if (enabled.value !== null && !force) return
        // Cold boot can fire this from the layout, the article list and the
        // conversation view in the same tick; share the one request.
        if (modelsRequest) return modelsRequest
        modelsRequest = (async () => {
            try {
                const data = await fetchChatModels()
                enabled.value = data.enabled
                providers.value = data.providers ?? {}
            } catch {
                // Leave enabled at null: gating falls back to "hidden", which is
                // safe. The hub surfaces its own load errors.
            } finally {
                modelsRequest = null
            }
        })()
        return modelsRequest
    }

    async function fetchConversationList() {
        conversationsLoading.value = true
        conversationsError.value = null
        try {
            const data = await fetchConversations()
            conversations.value = data.conversations ?? []
            conversationsLoaded.value = true
        } catch (e) {
            // A response means the server answered (even with an error); no
            // response while offline is a connection problem. Online with no
            // response is the server being unreachable — still "server".
            conversationsError.value = e.response || navigator.onLine ? 'server' : 'offline'
        } finally {
            conversationsLoading.value = false
        }
    }

    async function openConversation(id) {
        // Any turn still running belongs to the conversation being left; abort
        // it so it cannot keep writing into this one's messages/buffers.
        cancelActiveTurn()
        messagesLoading.value = true
        currentConversation.value = null
        messages.value = []
        // Per-turn state belongs to the conversation that produced it; without
        // these resets the previous turn's Thinking block / tool rows render
        // against the new conversation's last message.
        toolActivity.value = []
        reasoningBuffer.value = ''
        try {
            const data = await fetchConversation(id)
            currentConversation.value = data.conversation
            messages.value = data.messages ?? []
        } catch (e) {
            showError(
                e.response?.status === 404
                    ? 'Conversation not found.'
                    : 'Failed to load conversation.'
            )
            throw e
        } finally {
            messagesLoading.value = false
        }
    }

    /**
     * Create (or resume) the conversation for an article and expose it for
     * navigation. Returns the conversation object; the caller navigates.
     */
    async function startConversation(articleId, provider = null, model = null) {
        return await createConversation({ article_id: articleId, provider, model })
    }

    /**
     * Switch the conversation's routing metadata. Applies from the next turn;
     * history is untouched (server-side PATCH semantics).
     */
    async function switchRouting(id, provider, model) {
        const conversation = await updateConversation(id, { provider, model })
        if (currentConversation.value?.id === id) {
            currentConversation.value = { ...currentConversation.value, ...conversation }
        }
        const hubRow = conversations.value.find(c => c.id === id)
        if (hubRow) {
            hubRow.provider = conversation.provider
            hubRow.model = conversation.model
            hubRow.provider_available = conversation.provider_available
        }
        return conversation
    }

    async function removeConversation(id) {
        await deleteConversation(id)
        conversations.value = conversations.value.filter(c => c.id !== id)
        if (currentConversation.value?.id === id) {
            cancelActiveTurn()
            currentConversation.value = null
            messages.value = []
            toolActivity.value = []
            reasoningBuffer.value = ''
        }
    }

    /**
     * A tool event names the tool but not the call, and one tool can run
     * several times per turn — so a terminal status closes the most recent
     * still-running entry for that name, or is recorded standalone if no
     * running entry is found (server restart mid-turn and similar).
     */
    function recordTool(name, status) {
        if (status === 'running') {
            toolActivity.value.push({ name, status })
            return
        }
        for (let i = toolActivity.value.length - 1; i >= 0; i--) {
            const entry = toolActivity.value[i]
            if (entry.name === name && entry.status === 'running') {
                entry.status = status
                return
            }
        }
        toolActivity.value.push({ name, status })
    }

    /**
     * Send one turn and wire the SSE stream into reactive message state.
     *
     * The user message and the streaming assistant message are optimistic:
     * the server persists rows only when the stream drains, so on a rejected
     * 409 or an abort nothing was stored and the optimistic rows are dropped.
     */
    async function sendTurn(content) {
        const conversation = currentConversation.value
        if (!conversation || streaming.value) return
        if (!navigator.onLine) {
            showError('You are offline. Chat needs a connection.')
            return
        }

        const conversationId = conversation.id

        const now = new Date().toISOString()
        messages.value.push({
            id: `local-${now}`,
            role: 'user',
            content,
            status: 'completed',
            created_at: now,
        })
        messages.value.push({
            id: null,
            role: 'assistant',
            content: '',
            status: 'streaming',
            created_at: now,
        })
        // Mutate the reactive proxies, not the raw objects just pushed
        const assistant = messages.value[messages.value.length - 1]

        // A turn owns both its conversation and a generation token: callbacks
        // arriving after the user switched conversations or started a newer turn
        // must not touch shared state.
        const turnId = ++turnSeq
        activeTurnId = turnId
        const isActiveTurn = () => activeTurnId === turnId

        const controller = new AbortController()
        abortController = controller
        streaming.value = true

        // The previous turn's Thinking block / tool rows stay visible until the
        // replacement actually streams, so a rejected 409 does not erase them.
        let turnStarted = false
        function markTurnStarted() {
            if (turnStarted) return
            turnStarted = true
            toolActivity.value = []
            reasoningBuffer.value = ''
        }

        function releaseTurn() {
            if (!isActiveTurn()) return false
            streaming.value = false
            abortController = null
            activeTurnId = null
            return true
        }

        function finish(status) {
            if (!isActiveTurn()) return
            assistant.status = status
            // A turn that streamed nothing would otherwise leave the previous
            // turn's Thinking/tool rows attached to this message.
            if (!turnStarted) {
                toolActivity.value = []
                reasoningBuffer.value = ''
            }
            releaseTurn()
            // Recorded on drain, not on send: the hub's "just now" should date
            // the answer, not the question.
            const hubRow = conversations.value.find(c => c.id === conversationId)
            if (hubRow) hubRow.last_message_at = new Date().toISOString()
        }

        function discardOptimisticTurn() {
            // Keep any earlier local turns; only this turn's two rows go
            const cutoff = messages.value.indexOf(assistant)
            if (cutoff > 0) messages.value = messages.value.slice(0, cutoff - 1)
        }

        try {
            await streamTurn(
                conversationId,
                content,
                {
                    onDelta: ({ text }) => {
                        if (!isActiveTurn()) return
                        markTurnStarted()
                        assistant.content += text
                    },
                    onReasoning: ({ text }) => {
                        if (!isActiveTurn()) return
                        markTurnStarted()
                        reasoningBuffer.value += text
                    },
                    onTool: ({ name, status }) => {
                        if (!isActiveTurn()) return
                        markTurnStarted()
                        recordTool(name, status)
                    },
                    onDone: ({ reason }) =>
                        finish(reason === 'cancelled' ? 'interrupted' : 'completed'),
                    onError: ({ message }) => {
                        if (!isActiveTurn()) return
                        finish('failed')
                        showError(message || 'The chat response failed.')
                    },
                },
                controller.signal
            )
            if (isActiveTurn() && assistant.status === 'streaming') {
                // Resolved without a terminal frame — the stream was cut short
                finish('failed')
                showError('Connection lost during the response.')
            }
        } catch (e) {
            const wasActive = isActiveTurn()
            if (e instanceof ChatApiError && e.code === 'aborted') {
                // Abort leaves zero rows server-side — retry is clean
                if (wasActive) discardOptimisticTurn()
                releaseTurn()
                return
            }
            if (e.code === 'provider_unavailable') {
                if (currentConversation.value?.id === conversationId) {
                    currentConversation.value.provider_available = false
                }
                const hubRow = conversations.value.find(c => c.id === conversationId)
                if (hubRow) hubRow.provider_available = false
            }
            if (e.status === 409) {
                // Never reached the server — no rows were persisted
                if (wasActive) discardOptimisticTurn()
            } else if (wasActive) {
                finish('failed')
            }
            releaseTurn()
            if (wasActive) showError(e.message || 'The chat request failed.')
        }
    }

    function abortTurn() {
        abortController?.abort()
    }

    /** Abort and forget the in-flight turn (used when the view leaves it). */
    function cancelActiveTurn() {
        abortController?.abort()
        abortController = null
        activeTurnId = null
        streaming.value = false
    }

    function closeConversation() {
        cancelActiveTurn()
        currentConversation.value = null
        messages.value = []
        toolActivity.value = []
        reasoningBuffer.value = ''
    }

    return {
        // entry gating
        enabled,
        providers,
        loadModels,
        // hub
        conversations,
        conversationsLoading,
        conversationsLoaded,
        conversationsError,
        fetchConversationList,
        // conversation
        currentConversation,
        messages,
        messagesLoading,
        openConversation,
        closeConversation,
        startConversation,
        switchRouting,
        removeConversation,
        // streaming turn
        streaming,
        toolActivity,
        reasoningBuffer,
        sendTurn,
        abortTurn,
    }
})
