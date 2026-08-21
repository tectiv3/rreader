import {
    o as Ce,
    a as Te,
    p as c,
    q as y,
    w as Ae,
    y as Ee,
    D as k,
    Z as Ie,
    _ as Oe,
    $ as P,
    a0 as Me,
    a1 as Le,
    a2 as B,
    a3 as xe,
} from './app-BfCHckOi.js'
import { u as I } from './useSidebarStore-C8sh_S9C.js'
import { u as z } from './useToast-926xj_cD.js'
const F = c(typeof navigator < 'u' ? navigator.onLine : !0),
    Z = c(F.value ? new Date() : null)
let D = 0
function H() {
    ;((F.value = !0), (Z.value = new Date()))
}
function X() {
    F.value = !1
}
function Re() {
    return (
        Ce(() => {
            ;(D === 0 &&
                (window.addEventListener('online', H), window.addEventListener('offline', X)),
                D++)
        }),
        Te(() => {
            ;(D--,
                D === 0 &&
                    (window.removeEventListener('online', H),
                    window.removeEventListener('offline', X)))
        }),
        { isOnline: F, lastOnlineAt: Z }
    )
}
const Q = 'rreader-offline-queue',
    je = 3e4,
    De = ['post', 'put', 'patch', 'delete'],
    Fe = 5
function Ue(a) {
    return a >= 500 || a === 408 || a === 419 || a === 429
}
function ee(a) {
    return !!a && typeof a.url == 'string' && /^\/(?!\/)/.test(a.url) && De.includes(a.method)
}
const d = c($e())
let O = null,
    Y = null
function $e() {
    try {
        const a = localStorage.getItem(Q),
            s = a ? JSON.parse(a) : []
        return Array.isArray(s) ? s.filter(ee) : []
    } catch {
        return []
    }
}
function G() {
    try {
        localStorage.setItem(Q, JSON.stringify(d.value))
        return
    } catch (a) {
        if (a?.name !== 'QuotaExceededError') return
    }
    d.value.splice(0, Math.ceil(d.value.length / 2))
    try {
        ;(localStorage.setItem(Q, JSON.stringify(d.value)),
            z().error('Storage was full — some offline changes were dropped.'))
    } catch {}
}
function J(a, s, v = {}) {
    if (!ee({ method: a, url: s })) return
    const _ =
        a === 'patch' || a === 'put' ? d.value.find(f => f.method === a && f.url === s) : null
    ;(_
        ? ((_.data = { ..._.data, ...v }), (_.queuedAt = new Date().toISOString()))
        : d.value.push({ method: a, url: s, data: v, queuedAt: new Date().toISOString() }),
        G())
}
function K({ method: a, url: s, data: v }) {
    return a === 'delete' ? y.delete(s, { data: v }) : y[a](s, v)
}
function te() {
    return d.value.length
}
function qe() {
    Y ||
        d.value.length === 0 ||
        (Y = setTimeout(() => {
            ;((Y = null), M())
        }, je))
}
function M() {
    return (
        O ||
        (d.value.length === 0
            ? Promise.resolve()
            : ((O = (async () => {
                  for (; d.value.length > 0; ) {
                      const a = d.value[0]
                      try {
                          await K(a)
                      } catch (s) {
                          if ((y.isAxiosError(s) && !s.response) || Ue(s.response?.status)) {
                              if (((a.attempts = (a.attempts || 0) + 1), a.attempts < Fe)) {
                                  ;(G(), qe())
                                  return
                              }
                              z().error("Couldn't sync some offline changes.")
                          }
                      }
                      ;(d.value.shift(), G())
                  }
              })().finally(() => {
                  O = null
              })),
              O))
    )
}
function Ye() {
    const { isOnline: a } = Re()
    return (
        Ae(a, s => {
            s && M()
        }),
        a.value && d.value.length > 0 && setTimeout(M, 100),
        { queue: d, enqueue: J, flushQueue: M, queuedCount: te }
    )
}
const Qe = Ee('articles', () => {
    const a = c([]),
        s = c(new Map()),
        v = new Map(),
        o = c({ type: 'all' }),
        _ = c(!1),
        f = c(!1),
        m = c('All Feeds'),
        g = c(!1),
        p = c(null),
        L = c(!1),
        b = c(!1),
        S = c(null),
        x = new Map(),
        ae = 20
    let R = 0,
        h = 0
    const ne = k(() => a.value.filter(e => !e.is_read).length),
        re = k(() => a.value.filter(e => e.is_read_later).length),
        le = k(() => {
            const e = {}
            for (const t of a.value) t.is_read || (e[t.feed_id] = (e[t.feed_id] || 0) + 1)
            return e
        })
    function se(e) {
        return s.value.get(e) || null
    }
    function V(e) {
        const t = a.value.findIndex(n => n.id === e)
        return t === -1
            ? { prev: null, next: null }
            : {
                  prev: t > 0 ? a.value[t - 1].id : null,
                  next: t < a.value.length - 1 ? a.value[t + 1].id : null,
              }
    }
    function C(e, t, n, r, { queueable: i = !0 } = {}) {
        return i
            ? !navigator.onLine || te() > 0
                ? (J(e, t, n), navigator.onLine && M(), Promise.resolve())
                : K({ method: e, url: t, data: n }).catch(l => {
                      if (!l.response) {
                          J(e, t, n)
                          return
                      }
                      r?.()
                  })
            : K({ method: e, url: t, data: n }).catch(() => r?.())
    }
    const ie = ['today', 'read_later', 'recently_read']
    function U(e) {
        const t = new URLSearchParams()
        return (
            e.feedId && t.set('feed_id', e.feedId),
            e.categoryId && t.set('category_id', e.categoryId),
            ie.includes(e.type) && t.set('filter', e.type),
            e.showAll && t.set('show_all', '1'),
            t
        )
    }
    function E(e) {
        const t = e.feedId
            ? `feed:${e.feedId}`
            : e.categoryId
              ? `category:${e.categoryId}`
              : e.type
        return e.showAll ? `${t}:all` : t
    }
    function $(e, t) {
        xe(e, { articles: JSON.parse(JSON.stringify(t)), filterTitle: m.value })
    }
    const q = new Map()
    function T() {
        const e = E(o.value)
        ;(clearTimeout(q.get(e)),
            q.set(
                e,
                setTimeout(() => {
                    ;(q.delete(e), !(!f.value || _.value) && e === E(o.value) && $(e, a.value))
                }, 1e3)
            ))
    }
    function w(e, t) {
        for (const r of x.values()) {
            const i = r.articles.find(l => l.id === e)
            i && Object.assign(i, t)
        }
        const n = s.value.get(e)
        n && Object.assign(n, t)
    }
    function ue() {
        if (!f.value || a.value.length === 0) return
        const e = E(o.value)
        x.set(e, {
            articles: a.value,
            filterTitle: m.value,
            hasMore: g.value,
            nextCursor: p.value,
        })
    }
    async function W(e) {
        if (
            f.value &&
            o.value.type === e.type &&
            o.value.feedId === e.feedId &&
            o.value.categoryId === e.categoryId &&
            !o.value.showAll == !e.showAll
        )
            return
        ue()
        const t = E(e),
            n = x.get(t)
        if (n) {
            ;((a.value = n.articles),
                (m.value = n.filterTitle),
                (g.value = n.hasMore),
                (p.value = n.nextCursor),
                (o.value = e),
                (f.value = !0),
                (b.value = !1),
                (S.value = null))
            return
        }
        const r = ++h
        ;((_.value = !0),
            (a.value = []),
            (o.value = e),
            (p.value = null),
            (g.value = !1),
            (S.value = null),
            (b.value = !1))
        const i = U(e)
        try {
            const l = await y.get('/api/articles?' + i.toString())
            if (r !== h) return
            ;((a.value = l.data.articles),
                (m.value = l.data.filter_title),
                (g.value = l.data.has_more),
                (p.value = l.data.next_cursor),
                (f.value = !0),
                (b.value = !1),
                $(t, l.data.articles))
        } catch (l) {
            if (r !== h) return
            if (((g.value = !1), (p.value = null), l.response)) {
                S.value = 'server'
                return
            }
            const u = await Ie(t)
            if (r !== h) return
            u
                ? ((a.value = u.articles),
                  (m.value = u.filterTitle),
                  (f.value = !0),
                  (b.value = !0))
                : (S.value = 'offline')
        } finally {
            r === h && (_.value = !1)
        }
    }
    async function oe() {
        const e = { ...o.value, showAll: !0 },
            t = U(e),
            n = ++h
        _.value = !0
        try {
            const r = await y.get('/api/articles?' + t.toString())
            if (n !== h) return
            ;((a.value = r.data.articles),
                (m.value = r.data.filter_title),
                (g.value = r.data.has_more),
                (p.value = r.data.next_cursor),
                (o.value = e),
                (f.value = !0),
                (b.value = !1),
                (S.value = null),
                $(E(e), r.data.articles))
        } catch {
        } finally {
            n === h && (_.value = !1)
        }
    }
    async function ce() {
        if (!(!g.value || L.value || !p.value) && navigator.onLine) {
            L.value = !0
            try {
                const e = U(o.value)
                e.set('cursor', p.value)
                const t = await y.get('/api/articles?' + e.toString())
                ;((a.value = [...a.value, ...t.data.articles]),
                    (g.value = t.data.has_more),
                    (p.value = t.data.next_cursor))
            } catch {
                g.value = !1
            } finally {
                L.value = !1
            }
        }
    }
    function j() {
        for (; s.value.size > ae; ) {
            const e = s.value.keys().next().value
            s.value.delete(e)
        }
    }
    async function N(e) {
        const t = s.value.get(e)
        if (t) return (s.value.delete(e), s.value.set(e, t), t)
        if (v.has(e)) return v.get(e)
        const n = (async () => {
            try {
                const r = await Oe(e)
                if (r && !(r._partial && navigator.onLine)) {
                    const l = a.value.find(u => u.id === e)
                    return (
                        l &&
                            ((r.is_read_later = l.is_read_later),
                            (r.is_read = l.is_read),
                            l.reading_progress != null &&
                                (r.reading_progress = l.reading_progress)),
                        s.value.set(e, r),
                        j(),
                        r
                    )
                }
                if (navigator.onLine)
                    try {
                        const u = (await y.get(`/api/articles/${e}`)).data
                        return (s.value.set(e, u), await P(e, u), j(), u)
                    } catch (l) {
                        if (l.response) throw l
                    }
                const i = a.value.find(l => l.id === e)
                if (i) {
                    const l = { ...i, _offline: !0, _partial: !0 }
                    return (await P(e, l), s.value.set(e, l), j(), l)
                }
                throw new Error('Article not available offline')
            } finally {
                v.delete(e)
            }
        })()
        return (v.set(e, n), n)
    }
    function de(e) {
        const { prev: t, next: n } = V(e)
        ;(n && N(n).catch(() => {}), t && N(t).catch(() => {}))
    }
    function fe() {
        R++
    }
    const ve = 5
    async function _e() {
        const e = ++R,
            t = new Set(await Me())
        if (e !== R) return
        const n = a.value
            .filter(r => !r.is_read && !s.value.has(r.id) && !t.has(r.id))
            .map(r => r.id)
            .slice(0, 50)
        if (n.length !== 0)
            for (let r = 0; r < n.length; r++) {
                if (e !== R) return
                const i = n[r]
                try {
                    const l = await y.get(`/api/articles/${i}`)
                    ;(r < ve && (s.value.set(i, l.data), j()), await P(i, l.data))
                } catch {
                    return
                }
            }
    }
    function A(e) {
        const t = new Date(e),
            n = new Date()
        return (
            t.getFullYear() === n.getFullYear() &&
            t.getMonth() === n.getMonth() &&
            t.getDate() === n.getDate()
        )
    }
    function ge(e) {
        const t = a.value.find(r => r.id === e)
        if (!t || t.is_read) return
        ;((t.is_read = !0), (t.read_at = new Date().toISOString()))
        const n = I()
        ;(n.decrementFeedUnread(t.feed_id),
            A(t.published_at) && n.adjustTodayCount(-1),
            Le(e),
            w(e, { is_read: !0, read_at: t.read_at }),
            T(),
            C('patch', `/api/articles/${e}`, { is_read: !0 }, () => {
                ;((t.is_read = !1),
                    (t.read_at = null),
                    w(e, { is_read: !1, read_at: null }),
                    n.incrementFeedUnread(t.feed_id),
                    A(t.published_at) && n.adjustTodayCount(1))
            }))
    }
    function pe(e) {
        const t = a.value.find(r => r.id === e)
        if (!t || !t.is_read) return
        ;((t.is_read = !1), (t.read_at = null))
        const n = I()
        ;(n.incrementFeedUnread(t.feed_id),
            A(t.published_at) && n.adjustTodayCount(1),
            w(e, { is_read: !1, read_at: null }),
            T(),
            C('patch', `/api/articles/${e}`, { is_read: !1 }, () => {
                ;((t.is_read = !0),
                    w(e, { is_read: !0 }),
                    n.decrementFeedUnread(t.feed_id),
                    A(t.published_at) && n.adjustTodayCount(-1))
            }))
    }
    function he(e, t = null) {
        const n = a.value.find(Se => Se.id === e)
        if (!n) return
        const r = n.is_read_later
        n.is_read_later = !r
        const i = I()
        i.adjustReadLaterCount(r ? -1 : 1)
        const l = { is_read_later: !r },
            u = { is_read_later: !r }
        ;(!r &&
            t !== null &&
            ((l.reading_progress = t), (n.reading_progress = t), (u.reading_progress = t)),
            B(e, u),
            w(e, u),
            T(),
            C('patch', `/api/articles/${e}`, l, () => {
                ;((n.is_read_later = r),
                    w(e, { is_read_later: r }),
                    i.adjustReadLaterCount(r ? 1 : -1))
            }))
    }
    function ye(e, t) {
        const n = a.value.find(r => r.id === e)
        ;(n && (n.reading_progress = t),
            w(e, { reading_progress: t }),
            B(e, { reading_progress: t }),
            T(),
            C('patch', `/api/articles/${e}`, { reading_progress: t }))
    }
    function me(e = null) {
        if (!navigator.onLine) return !1
        const t = e
                ? a.value.filter(l => l.feed_id === e && !l.is_read)
                : a.value.filter(l => !l.is_read),
            n = {}
        let r = 0
        ;(t.forEach(l => {
            ;((n[l.feed_id] = (n[l.feed_id] || 0) + 1), A(l.published_at) && r++)
        }),
            t.forEach(l => {
                ;((l.is_read = !0), (l.read_at = new Date().toISOString()))
            }))
        const i = I()
        for (const [l, u] of Object.entries(n)) i.decrementFeedUnread(Number(l), u)
        return (
            r && i.adjustTodayCount(-r),
            T(),
            C(
                'post',
                '/api/articles/mark-all-read',
                {
                    feed_id: o.value.feedId || null,
                    category_id: o.value.categoryId || null,
                    filter: o.value.type === 'today' ? 'today' : null,
                },
                () => {
                    t.forEach(l => {
                        ;((l.is_read = !1), (l.read_at = null))
                    })
                    for (const [l, u] of Object.entries(n)) i.incrementFeedUnread(Number(l), u)
                    r && i.adjustTodayCount(r)
                },
                { queueable: !1 }
            ),
            !0
        )
    }
    function we(e) {
        const t = a.value.findIndex(u => u.id === e)
        if (t === -1) return
        const n = a.value[t],
            r = !n.is_read,
            i = n.feed_id,
            l = A(n.published_at)
        if ((a.value.splice(t, 1), T(), r)) {
            const u = I()
            ;(u.decrementFeedUnread(i),
                l && u.adjustTodayCount(-1),
                C('patch', `/api/articles/${e}`, { is_read: !0 }))
        }
    }
    function be() {
        return (x.clear(), (f.value = !1), (p.value = null), (g.value = !1), W(o.value))
    }
    return {
        articles: a,
        contentCache: s,
        activeView: o,
        loading: _,
        loaded: f,
        filterTitle: m,
        hasMore: g,
        loadingMore: L,
        nextCursor: p,
        showingCached: b,
        loadError: S,
        unreadCount: ne,
        readLaterCount: re,
        unreadByFeed: le,
        getContent: se,
        adjacentIds: V,
        fetchArticles: W,
        showAllArticles: oe,
        loadMore: ce,
        fetchContent: N,
        prefetchAdjacent: de,
        warmCache: _e,
        cancelWarmCache: fe,
        markRead: ge,
        markUnread: pe,
        toggleReadLater: he,
        saveReadingProgress: ye,
        markAllRead: me,
        dismissArticle: we,
        forceRefresh: be,
    }
})
export { Ye as a, Qe as b, Re as u }
