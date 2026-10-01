import axios from 'axios'

/**
 * Chat API client. The JSON endpoints go through axios like every other
 * module in the app; only the SSE turn endpoint needs fetch, because axios
 * cannot expose a streamed response body incrementally.
 *
 * Backend contract (routes/api.php): conversation ids are UUID strings.
 */

export class ChatApiError extends Error {
    constructor(message, { status = null, code = null, scope = null, payload = null } = {}) {
        super(message)
        this.name = 'ChatApiError'
        this.status = status
        this.code = code
        this.scope = scope
        this.payload = payload
    }
}

// --- SSE parsing -------------------------------------------------------------

/**
 * Parse one raw SSE frame (the block between two \n\n separators) into
 * `{ event, data }`. Data is JSON.parsed when possible (our frames always
 * are); a non-JSON payload is passed through as the raw string so a parsing
 * glitch degrades to an odd message instead of a dropped stream.
 *
 * Handles: `event:`/`data:` fields with the optional single space after the
 * colon, multiple `data:` lines (joined with \n per the SSE spec), comment
 * lines (leading `:`, used by proxies as keepalives — skipped), missing event
 * name (spec default: 'message'), and stray \r line endings.
 *
 * Returns null when the frame carries no dispatchable field at all.
 */
export function parseSseFrame(rawFrame) {
    let event = null
    const dataLines = []

    for (let line of rawFrame.split('\n')) {
        if (line.endsWith('\r')) line = line.slice(0, -1)
        if (line === '' || line.startsWith(':')) continue

        const colon = line.indexOf(':')
        const field = colon === -1 ? line : line.slice(0, colon)
        let value = colon === -1 ? '' : line.slice(colon + 1)
        if (value.startsWith(' ')) value = value.slice(1)

        if (field === 'event') event = value
        else if (field === 'data') dataLines.push(value)
    }

    if (event === null && dataLines.length === 0) return null

    const raw = dataLines.join('\n')
    let data = raw
    if (raw !== '') {
        try {
            data = JSON.parse(raw)
        } catch {
            // keep the raw string
        }
    } else {
        data = {}
    }

    return { event: event ?? 'message', data }
}

/**
 * Incremental frame feeder. Chunks may split a frame anywhere, including
 * between the two newlines of the separator, so nothing is dispatched until a
 * full `\n\n` has arrived. Our server frames with `\n\n` (ChatTurnService),
 * which is what the buffer splits on.
 */
export function createSseParser(onFrame) {
    let buffer = ''

    return chunk => {
        // SSE allows CR, LF or CRLF line endings. The server emits LF, but a
        // proxy may normalize to CRLF; folding to LF keeps one boundary form.
        buffer = (buffer + chunk).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        let separator = buffer.indexOf('\n\n')
        while (separator !== -1) {
            const rawFrame = buffer.slice(0, separator)
            buffer = buffer.slice(separator + 2)
            const frame = parseSseFrame(rawFrame)
            if (frame) onFrame(frame)
            separator = buffer.indexOf('\n\n')
        }
    }
}

// --- Turn streaming ------------------------------------------------------------

/**
 * Laravel's statefulApi() CSRF flow: the session middleware sets an
 * XSRF-TOKEN cookie, which axios echoes back as the X-XSRF-TOKEN header
 * automatically. fetch does not, so read the cookie the same way axios does
 * (including the decodeURIComponent).
 */
function xsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
}

function isAbort(error) {
    return error?.name === 'AbortError'
}

async function httpError(response) {
    let payload = null
    try {
        payload = await response.json()
    } catch {
        // non-JSON error body
    }
    // 409 conflicts use {error, code, scope}; Laravel defaults use {message}
    const message = payload?.error ?? payload?.message ?? `Request failed (${response.status})`
    return new ChatApiError(message, {
        status: response.status,
        code: payload?.code ?? null,
        scope: payload?.scope ?? null,
        payload,
    })
}

/**
 * Send one chat turn and dispatch its SSE stream.
 *
 * `callbacks` may provide onDelta({text}), onReasoning({text}),
 * onTool({name, status}), onDone({reason}) and onError({message, code}).
 * Unknown event names are ignored, mirroring the server's own tolerance.
 *
 * The promise resolves when the stream ends after a done or error frame;
 * an in-stream error is delivered via onError (the server ends the stream
 * itself after emitting one). It rejects with ChatApiError for non-200
 * responses (409 conflict body, 422 validation, …), network failures and —
 * with code 'aborted' — when `signal` aborts.
 */
// A dead stream must not hold the turn open forever. The agent's per-step
// HTTP timeout is 120s, so a one-step silent gap can legitimately approach
// that; 180s leaves headroom before we abort.
const STALL_TIMEOUT_MS = 180_000

export async function streamTurn(conversationId, content, callbacks = {}, signal = null) {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-Requested-With': 'XMLHttpRequest',
    }
    const token = xsrfToken()
    if (token) headers['X-XSRF-TOKEN'] = token

    // The caller's signal covers user aborts only; a local controller adds the
    // stall abort without consuming the caller's signal.
    const controller = new AbortController()
    const abortFromCaller = () => controller.abort()
    if (signal) {
        if (signal.aborted) controller.abort()
        else signal.addEventListener('abort', abortFromCaller, { once: true })
    }

    let stallTimer = null
    let stalled = false
    function armStall() {
        clearTimeout(stallTimer)
        stallTimer = setTimeout(() => {
            stalled = true
            controller.abort()
        }, STALL_TIMEOUT_MS)
    }
    function cleanup() {
        clearTimeout(stallTimer)
        signal?.removeEventListener('abort', abortFromCaller)
    }

    let response
    armStall()
    try {
        response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ content }),
            signal: controller.signal,
        })
    } catch (error) {
        cleanup()
        if (stalled)
            throw new ChatApiError('The response stalled. Try again.', { code: 'stalled' })
        if (isAbort(error)) throw new ChatApiError('Turn cancelled', { code: 'aborted' })
        throw new ChatApiError('Could not reach the server', { code: 'network' })
    }

    if (!response.ok) {
        cleanup()
        throw await httpError(response)
    }

    let sawTerminalFrame = false
    let terminalFrame = null
    const decoder = new TextDecoder()
    try {
        // Parser and reader live inside the guard so a malformed 200 (null
        // body, failed reader) surfaces as a ChatApiError, not a raw TypeError.
        const parse = createSseFrameDispatcher(callbacks, (event, data) => {
            sawTerminalFrame = true
            terminalFrame = { event, data }
        })
        const reader = response.body?.getReader()
        if (!reader) {
            throw new ChatApiError('The server returned an empty response.', {
                code: 'empty_body',
            })
        }

        for (;;) {
            armStall()
            const { done, value } = await reader.read()
            clearTimeout(stallTimer)
            if (done) break
            parse(decoder.decode(value, { stream: true }))
            if (sawTerminalFrame) {
                // Stop reading: a reset after done/error must not undo the
                // terminal state the store already recorded.
                reader.cancel().catch(() => {})
                break
            }
        }
    } catch (error) {
        // A read error after the terminal frame must not downgrade the turn;
        // fall through so the recorded callback still dispatches below.
        if (!sawTerminalFrame) {
            if (stalled) {
                throw new ChatApiError('The response stalled. Try again.', { code: 'stalled' })
            }
            if (error instanceof ChatApiError) throw error
            if (isAbort(error)) throw new ChatApiError('Turn cancelled', { code: 'aborted' })
            throw new ChatApiError('Connection lost during the response', { code: 'network' })
        }
    } finally {
        cleanup()
    }

    if (!sawTerminalFrame) {
        // The stream ended without done/error — a dropped connection, not a
        // completed turn.
        throw new ChatApiError('Connection lost during the response', { code: 'stream_ended' })
    }

    // Dispatch outside the read-loop guard: a throwing terminal callback must
    // propagate to the caller instead of being swallowed as a post-terminal
    // read error.
    if (terminalFrame.event === 'done') callbacks.onDone?.(terminalFrame.data)
    else callbacks.onError?.(terminalFrame.data)
}

function createSseFrameDispatcher(callbacks, onTerminalFrame) {
    const parse = createSseParser(({ event, data }) => {
        switch (event) {
            case 'delta':
                callbacks.onDelta?.(data)
                break
            case 'reasoning':
                callbacks.onReasoning?.(data)
                break
            case 'tool':
                callbacks.onTool?.(data)
                break
            case 'done':
            case 'error':
                // Recorded, not dispatched: the terminal callback runs after
                // the read loop so a throw is not mistaken for a read error.
                onTerminalFrame(event, data)
                break
            default:
            // unknown events are ignored, never fatal
        }
    })
    return parse
}

// --- JSON endpoints (axios, like the rest of the app) --------------------------

export async function fetchChatModels() {
    const { data } = await axios.get('/api/chat/models')
    return data // {enabled, providers: {name: {models: [...]}}}
}

export async function fetchConversations() {
    const { data } = await axios.get('/api/chat/conversations')
    return data // {conversations: [...]}
}

export async function fetchConversation(id) {
    const { data } = await axios.get(`/api/chat/conversations/${id}`)
    return data // {conversation: {...}, messages: [...]}
}

export async function createConversation({ article_id, provider = null, model = null }) {
    // 201 both when created and when an existing conversation is returned
    const { data } = await axios.post('/api/chat/conversations', {
        article_id,
        provider,
        model,
    })
    return data
}

export async function updateConversation(id, { provider, model }) {
    const { data } = await axios.patch(`/api/chat/conversations/${id}`, { provider, model })
    return data
}

export async function deleteConversation(id) {
    await axios.delete(`/api/chat/conversations/${id}`)
}
