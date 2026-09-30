import { ref, watch, onUnmounted, toValue } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Render markdown to sanitized HTML. Assistant output is model-generated and
 * model output is untrusted input — it goes through DOMPurify before any
 * v-html, always.
 */
export function renderMarkdown(text) {
    return DOMPurify.sanitize(marked.parse(toValue(text) ?? '', { async: false }))
}

/**
 * Debounced markdown rendering for a streaming message source.
 *
 * Re-parsing the whole message on every delta is wasted work while tokens
 * arrive in bursts; this re-renders at most every `delay` ms, with a final
 * trailing render once the stream settles.
 */
export function useStreamingMarkdown(source, { delay = 150 } = {}) {
    const html = ref(renderMarkdown(source))
    let timer = null

    watch(source, value => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            timer = null
            html.value = renderMarkdown(value)
        }, delay)
    })

    onUnmounted(() => {
        clearTimeout(timer)
    })

    return { html }
}
