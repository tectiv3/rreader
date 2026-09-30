import { q as _, z as ee, p as v, o as ne, a as te } from './app-DlJZqWT7.js'
import { u as ae } from './useToast-CgxITCA8.js'
class m extends Error {
    constructor(
        n,
        { status: r = null, code: t = null, scope: i = null, payload: l = null } = {}
    ) {
        ;(super(n),
            (this.name = 'ChatApiError'),
            (this.status = r),
            (this.code = t),
            (this.scope = i),
            (this.payload = l))
    }
}
function oe(e) {
    let n = null
    const r = []
    for (let l of e.split(`
`)) {
        if ((l.endsWith('\r') && (l = l.slice(0, -1)), l === '' || l.startsWith(':'))) continue
        const h = l.indexOf(':'),
            u = h === -1 ? l : l.slice(0, h)
        let o = h === -1 ? '' : l.slice(h + 1)
        ;(o.startsWith(' ') && (o = o.slice(1)),
            u === 'event' ? (n = o) : u === 'data' && r.push(o))
    }
    if (n === null && r.length === 0) return null
    const t = r.join(`
`)
    let i = t
    if (t !== '')
        try {
            i = JSON.parse(t)
        } catch {}
    else i = {}
    return { event: n ?? 'message', data: i }
}
function re(e) {
    let n = ''
    return r => {
        n = (n + r)
            .replace(
                /\r\n/g,
                `
`
            )
            .replace(
                /\r/g,
                `
`
            )
        let t = n.indexOf(`

`)
        for (; t !== -1; ) {
            const i = n.slice(0, t)
            n = n.slice(t + 2)
            const l = oe(i)
            ;(l && e(l),
                (t = n.indexOf(`

`)))
        }
    }
}
function se() {
    const e = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return e ? decodeURIComponent(e[1]) : null
}
function U(e) {
    return e?.name === 'AbortError'
}
async function ie(e) {
    let n = null
    try {
        n = await e.json()
    } catch {}
    const r = n?.error ?? n?.message ?? `Request failed (${e.status})`
    return new m(r, {
        status: e.status,
        code: n?.code ?? null,
        scope: n?.scope ?? null,
        payload: n,
    })
}
const le = 18e4
async function ue(e, n, r = {}, t = null) {
    const i = {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            'X-Requested-With': 'XMLHttpRequest',
        },
        l = se()
    l && (i['X-XSRF-TOKEN'] = l)
    const h = new AbortController(),
        u = () => h.abort()
    t && (t.aborted ? h.abort() : t.addEventListener('abort', u, { once: !0 }))
    let o = null,
        C = !1
    function S() {
        ;(clearTimeout(o),
            (o = setTimeout(() => {
                ;((C = !0), h.abort())
            }, le)))
    }
    function f() {
        ;(clearTimeout(o), t?.removeEventListener('abort', u))
    }
    let w
    try {
        w = await fetch(`/api/chat/conversations/${e}/messages`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: i,
            body: JSON.stringify({ content: n }),
            signal: h.signal,
        })
    } catch (y) {
        throw (
            f(),
            C
                ? new m('The response stalled. Try again.', { code: 'stalled' })
                : U(y)
                  ? new m('Turn cancelled', { code: 'aborted' })
                  : new m('Could not reach the server', { code: 'network' })
        )
    }
    if (!w.ok) throw (f(), await ie(w))
    let g = !1
    const L = new TextDecoder()
    try {
        const y = ce(r, () => {
                g = !0
            }),
            T = w.body?.getReader()
        if (!T) throw new m('The server returned an empty response.', { code: 'empty_body' })
        for (;;) {
            S()
            const { done: x, value: D } = await T.read()
            if ((clearTimeout(o), x)) break
            if ((y(L.decode(D, { stream: !0 })), g)) {
                T.cancel().catch(() => {})
                break
            }
        }
    } catch (y) {
        if (g) return
        throw C
            ? new m('The response stalled. Try again.', { code: 'stalled' })
            : y instanceof m
              ? y
              : U(y)
                ? new m('Turn cancelled', { code: 'aborted' })
                : new m('Connection lost during the response', { code: 'network' })
    } finally {
        f()
    }
    if (!g) throw new m('Connection lost during the response', { code: 'stream_ended' })
}
function ce(e, n) {
    return re(({ event: t, data: i }) => {
        switch (t) {
            case 'delta':
                e.onDelta?.(i)
                break
            case 'reasoning':
                e.onReasoning?.(i)
                break
            case 'tool':
                e.onTool?.(i)
                break
            case 'done':
                ;(n(), e.onDone?.(i))
                break
            case 'error':
                ;(n(), e.onError?.(i))
                break
        }
    })
}
async function fe() {
    const { data: e } = await _.get('/api/chat/models')
    return e
}
async function de() {
    const { data: e } = await _.get('/api/chat/conversations')
    return e
}
async function ve(e) {
    const { data: n } = await _.get(`/api/chat/conversations/${e}`)
    return n
}
async function he({ article_id: e, provider: n = null, model: r = null }) {
    const { data: t } = await _.post('/api/chat/conversations', {
        article_id: e,
        provider: n,
        model: r,
    })
    return t
}
async function pe(e, { provider: n, model: r }) {
    const { data: t } = await _.patch(`/api/chat/conversations/${e}`, {
        provider: n,
        model: r,
    })
    return t
}
async function we(e) {
    await _.delete(`/api/chat/conversations/${e}`)
}
const ye = ee('chat', () => {
        const e = v(null),
            n = v({})
        let r = null
        const t = v([]),
            i = v(!1),
            l = v(!1),
            h = v(null),
            u = v(null),
            o = v([]),
            C = v(!1),
            S = v(!1),
            f = v([]),
            w = v('')
        let g = null,
            L = null,
            y = 0
        const { error: T } = ae()
        async function x(a = !1) {
            if (!(e.value !== null && !a))
                return (
                    r ||
                    ((r = (async () => {
                        try {
                            const s = await fe()
                            ;((e.value = s.enabled), (n.value = s.providers ?? {}))
                        } catch {
                        } finally {
                            r = null
                        }
                    })()),
                    r)
                )
        }
        async function D() {
            ;((i.value = !0), (h.value = null))
            try {
                const a = await de()
                ;((t.value = a.conversations ?? []), (l.value = !0))
            } catch (a) {
                h.value = a.response || navigator.onLine ? 'server' : 'offline'
            } finally {
                i.value = !1
            }
        }
        async function z(a) {
            ;(q(),
                (C.value = !0),
                (u.value = null),
                (o.value = []),
                (f.value = []),
                (w.value = ''))
            try {
                const s = await ve(a)
                ;((u.value = s.conversation), (o.value = s.messages ?? []))
            } catch (s) {
                throw (
                    T(
                        s.response?.status === 404
                            ? 'Conversation not found.'
                            : 'Failed to load conversation.'
                    ),
                    s
                )
            } finally {
                C.value = !1
            }
        }
        async function B(a, s = null, p = null) {
            return await he({ article_id: a, provider: s, model: p })
        }
        async function H(a, s, p) {
            const d = await pe(a, { provider: s, model: p })
            u.value?.id === a && (u.value = { ...u.value, ...d })
            const b = t.value.find(E => E.id === a)
            return (
                b &&
                    ((b.provider = d.provider),
                    (b.model = d.model),
                    (b.provider_available = d.provider_available)),
                d
            )
        }
        async function Y(a) {
            ;(await we(a),
                (t.value = t.value.filter(s => s.id !== a)),
                u.value?.id === a &&
                    (q(), (u.value = null), (o.value = []), (f.value = []), (w.value = '')))
        }
        function G(a, s) {
            if (s === 'running') {
                f.value.push({ name: a, status: s })
                return
            }
            for (let p = f.value.length - 1; p >= 0; p--) {
                const d = f.value[p]
                if (d.name === a && d.status === 'running') {
                    d.status = s
                    return
                }
            }
            f.value.push({ name: a, status: s })
        }
        async function Q(a) {
            const s = u.value
            if (!s || S.value) return
            if (!navigator.onLine) {
                T('You are offline. Chat needs a connection.')
                return
            }
            const p = s.id,
                d = () => u.value?.id === p,
                b = new Date().toISOString()
            ;(o.value.push({
                id: `local-${b}`,
                role: 'user',
                content: a,
                status: 'completed',
                created_at: b,
            }),
                o.value.push({
                    id: null,
                    role: 'assistant',
                    content: '',
                    status: 'streaming',
                    created_at: b,
                }))
            const E = o.value[o.value.length - 1],
                N = ++y
            L = N
            const R = () => L === N,
                W = new AbortController()
            ;((g = W), (S.value = !0))
            let F = !1
            function I() {
                F || ((F = !0), (f.value = []), (w.value = ''))
            }
            function M() {
                return R() ? ((S.value = !1), (g = null), (L = null), !0) : !1
            }
            function $(c) {
                if (!R()) return
                ;((E.status = c), F || ((f.value = []), (w.value = '')), M())
                const O = t.value.find(X => X.id === p)
                O && (O.last_message_at = new Date().toISOString())
            }
            function j() {
                const c = o.value.indexOf(E)
                c > 0 && (o.value = o.value.slice(0, c - 1))
            }
            try {
                ;(await ue(
                    p,
                    a,
                    {
                        onDelta: ({ text: c }) => {
                            d() && (I(), (E.content += c))
                        },
                        onReasoning: ({ text: c }) => {
                            d() && (I(), (w.value += c))
                        },
                        onTool: ({ name: c, status: O }) => {
                            d() && (I(), G(c, O))
                        },
                        onDone: () => $('completed'),
                        onError: ({ message: c }) => {
                            d() && ($('failed'), T(c || 'The chat response failed.'))
                        },
                    },
                    W.signal
                ),
                    R() &&
                        E.status === 'streaming' &&
                        ($('failed'), T('Connection lost during the response.')))
            } catch (c) {
                if (c instanceof m && c.code === 'aborted') {
                    ;(j(), M())
                    return
                }
                if (c.code === 'provider_unavailable') {
                    u.value?.id === p && (u.value.provider_available = !1)
                    const O = t.value.find(X => X.id === p)
                    O && (O.provider_available = !1)
                }
                ;(c.status === 409 ? j() : R() && (E.status = 'failed'),
                    M(),
                    T(c.message || 'The chat request failed.'))
            }
        }
        function V() {
            g?.abort()
        }
        function q() {
            ;(g?.abort(), (g = null), (L = null), (S.value = !1))
        }
        function Z() {
            ;(q(), (u.value = null), (o.value = []), (f.value = []), (w.value = ''))
        }
        return {
            enabled: e,
            providers: n,
            loadModels: x,
            conversations: t,
            conversationsLoading: i,
            conversationsLoaded: l,
            conversationsError: h,
            fetchConversationList: D,
            currentConversation: u,
            messages: o,
            messagesLoading: C,
            openConversation: z,
            closeConversation: Z,
            startConversation: B,
            switchRouting: H,
            removeConversation: Y,
            streaming: S,
            toolActivity: f,
            reasoningBuffer: w,
            sendTurn: Q,
            abortTurn: V,
        }
    }),
    k = v(typeof navigator < 'u' ? navigator.onLine : !0),
    P = v(k.value ? new Date() : null)
let A = 0
function J() {
    ;((k.value = !0), (P.value = new Date()))
}
function K() {
    k.value = !1
}
function Te() {
    return (
        ne(() => {
            ;(A === 0 &&
                (window.addEventListener('online', J), window.addEventListener('offline', K)),
                A++)
        }),
        te(() => {
            ;(A--,
                A === 0 &&
                    (window.removeEventListener('online', J),
                    window.removeEventListener('offline', K)))
        }),
        { isOnline: k, lastOnlineAt: P }
    )
}
export { Te as a, ye as u }
