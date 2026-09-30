import { q as b, z as U, p as u, o as z, a as B } from './app-CcPhvO6o.js'
import { u as H } from './useToast-15cuob1T.js'
class C extends Error {
    constructor(
        a,
        { status: o = null, code: c = null, scope: d = null, payload: w = null } = {}
    ) {
        ;(super(a),
            (this.name = 'ChatApiError'),
            (this.status = o),
            (this.code = c),
            (this.scope = d),
            (this.payload = w))
    }
}
function J() {
    const e = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return e ? decodeURIComponent(e[1]) : null
}
function S(e) {
    return e?.name === 'AbortError'
}
async function P(e) {
    let a = null
    try {
        a = await e.json()
    } catch {}
    const o = a?.error ?? a?.message ?? `Request failed (${e.status})`
    return new C(o, {
        status: e.status,
        code: a?.code ?? null,
        scope: a?.scope ?? null,
        payload: a,
    })
}
async function W(e, a, o = {}, c = null) {
    const d = {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            'X-Requested-With': 'XMLHttpRequest',
        },
        w = J()
    w && (d['X-XSRF-TOKEN'] = w)
    let s
    try {
        s = await fetch(`/api/chat/conversations/${e}/messages`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: d,
            body: JSON.stringify({ content: a }),
            signal: c,
        })
    } catch (f) {
        throw S(f)
            ? new C('Turn cancelled', { code: 'aborted' })
            : new C('Could not reach the server', { code: 'network' })
    }
    if (!s.ok) throw await P(s)
    let i = !1
    const T = Y(o, () => {
            i = !0
        }),
        m = s.body.getReader(),
        h = new TextDecoder()
    try {
        for (;;) {
            const { done: f, value: g } = await m.read()
            if (f) break
            T(h.decode(g, { stream: !0 }))
        }
    } catch (f) {
        throw S(f)
            ? new C('Turn cancelled', { code: 'aborted' })
            : new C('Connection lost during the response', { code: 'network' })
    }
    if (!i) throw new C('Connection lost during the response', { code: 'stream_ended' })
}
function Y(e, a) {
    return createSseFrame(({ event: c, data: d }) => {
        switch (c) {
            case 'delta':
                e.onDelta?.(d)
                break
            case 'delta_end':
                e.onDeltaEnd?.()
                break
            case 'reasoning':
                e.onReasoning?.(d)
                break
            case 'tool':
                e.onTool?.(d)
                break
            case 'done':
                ;(a(), e.onDone?.(d))
                break
            case 'error':
                ;(a(), e.onError?.(d))
                break
        }
    })
}
async function G() {
    const { data: e } = await b.get('/api/chat/models')
    return e
}
async function Q() {
    const { data: e } = await b.get('/api/chat/conversations')
    return e
}
async function V(e) {
    const { data: a } = await b.get(`/api/chat/conversations/${e}`)
    return a
}
async function Z({ article_id: e, provider: a = null, model: o = null }) {
    const { data: c } = await b.post('/api/chat/conversations', {
        article_id: e,
        provider: a,
        model: o,
    })
    return c
}
async function ee(e, { provider: a, model: o }) {
    const { data: c } = await b.patch(`/api/chat/conversations/${e}`, {
        provider: a,
        model: o,
    })
    return c
}
async function ne(e) {
    await b.delete(`/api/chat/conversations/${e}`)
}
const oe = U('chat', () => {
        const e = u(null),
            a = u({}),
            o = u([]),
            c = u(!1),
            d = u(!1),
            w = u(null),
            s = u(null),
            i = u([]),
            T = u(!1),
            m = u(!1),
            h = u([]),
            f = u('')
        let g = null
        const { error: E } = H()
        async function x(t = !1) {
            if (!(e.value !== null && !t))
                try {
                    const n = await G()
                    ;((e.value = n.enabled), (a.value = n.providers ?? {}))
                } catch {}
        }
        async function $() {
            ;((c.value = !0), (w.value = null))
            try {
                const t = await Q()
                ;((o.value = t.conversations ?? []), (d.value = !0))
            } catch (t) {
                w.value = t.response || navigator.onLine ? 'server' : 'offline'
            } finally {
                c.value = !1
            }
        }
        async function q(t) {
            ;((T.value = !0), (s.value = null), (i.value = []), (h.value = []), (f.value = ''))
            try {
                const n = await V(t)
                ;((s.value = n.conversation), (i.value = n.messages ?? []))
            } catch (n) {
                throw (
                    E(
                        n.response?.status === 404
                            ? 'Conversation not found.'
                            : 'Failed to load conversation.'
                    ),
                    n
                )
            } finally {
                T.value = !1
            }
        }
        async function F(t, n = null, v = null) {
            return await Z({ article_id: t, provider: n, model: v })
        }
        async function X(t, n, v) {
            const l = await ee(t, { provider: n, model: v })
            s.value?.id === t && (s.value = { ...s.value, ...l })
            const p = o.value.find(R => R.id === t)
            return (
                p &&
                    ((p.provider = l.provider),
                    (p.model = l.model),
                    (p.provider_available = l.provider_available)),
                l
            )
        }
        async function M(t) {
            ;(await ne(t),
                (o.value = o.value.filter(n => n.id !== t)),
                s.value?.id === t && ((s.value = null), (i.value = [])))
        }
        function N(t, n) {
            if (n === 'running') {
                h.value.push({ name: t, status: n })
                return
            }
            for (let v = h.value.length - 1; v >= 0; v--) {
                const l = h.value[v]
                if (l.name === t && l.status === 'running') {
                    l.status = n
                    return
                }
            }
            h.value.push({ name: t, status: n })
        }
        async function j(t) {
            const n = s.value
            if (!n || m.value) return
            if (!navigator.onLine) {
                E('You are offline. Chat needs a connection.')
                return
            }
            const v = new Date().toISOString()
            ;(i.value.push({
                id: `local-${v}`,
                role: 'user',
                content: t,
                status: 'completed',
                created_at: v,
            }),
                i.value.push({
                    id: null,
                    role: 'assistant',
                    content: '',
                    status: 'streaming',
                    created_at: v,
                }))
            const l = i.value[i.value.length - 1]
            ;((m.value = !0), (h.value = []), (f.value = ''), (g = new AbortController()))
            function p(r) {
                ;((l.status = r), (m.value = !1), (g = null))
                const y = o.value.find(_ => _.id === n.id)
                y && (y.last_message_at = v)
            }
            function R() {
                const r = i.value.indexOf(l)
                r > 0 && (i.value = i.value.slice(0, r - 1))
            }
            try {
                ;(await W(
                    n.id,
                    t,
                    {
                        onDelta: ({ text: r }) => {
                            l.content += r
                        },
                        onReasoning: ({ text: r }) => {
                            f.value += r
                        },
                        onTool: ({ name: r, status: y }) => N(r, y),
                        onDone: () => p('completed'),
                        onError: ({ message: r }) => {
                            ;(p('failed'), E(r || 'The chat response failed.'))
                        },
                    },
                    g.signal
                ),
                    l.status === 'streaming' &&
                        (p('failed'), E('Connection lost during the response.')))
            } catch (r) {
                if (r instanceof C && r.code === 'aborted') {
                    ;(R(), (m.value = !1), (g = null))
                    return
                }
                if (r.code === 'provider_unavailable') {
                    s.value?.id === n.id && (s.value.provider_available = !1)
                    const y = o.value.find(_ => _.id === n.id)
                    y && (y.provider_available = !1)
                }
                ;(r.status === 409 ? R() : p('failed'),
                    (m.value = !1),
                    (g = null),
                    E(r.message || 'The chat request failed.'))
            }
        }
        function I() {
            g?.abort()
        }
        function K() {
            ;((s.value = null), (i.value = []))
        }
        return {
            enabled: e,
            providers: a,
            loadModels: x,
            conversations: o,
            conversationsLoading: c,
            conversationsLoaded: d,
            conversationsError: w,
            fetchConversationList: $,
            currentConversation: s,
            messages: i,
            messagesLoading: T,
            openConversation: q,
            closeConversation: K,
            startConversation: F,
            switchRouting: X,
            removeConversation: M,
            streaming: m,
            toolActivity: h,
            reasoningBuffer: f,
            sendTurn: j,
            abortTurn: I,
        }
    }),
    O = u(typeof navigator < 'u' ? navigator.onLine : !0),
    A = u(O.value ? new Date() : null)
let L = 0
function D() {
    ;((O.value = !0), (A.value = new Date()))
}
function k() {
    O.value = !1
}
function re() {
    return (
        z(() => {
            ;(L === 0 &&
                (window.addEventListener('online', D), window.addEventListener('offline', k)),
                L++)
        }),
        B(() => {
            ;(L--,
                L === 0 &&
                    (window.removeEventListener('online', D),
                    window.removeEventListener('offline', k)))
        }),
        { isOnline: O, lastOnlineAt: A }
    )
}
export { re as a, oe as u }
