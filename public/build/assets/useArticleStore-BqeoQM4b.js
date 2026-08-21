import {
    o as Ae,
    a as Ie,
    p as c,
    q as p,
    w as Ee,
    y as Le,
    D as P,
    Z as Oe,
    _ as Me,
    $ as U,
    a0 as B,
    a1 as xe,
    a2 as H,
    a3 as Re,
} from './app-CHkijDF0.js'
import { u as E } from './useSidebarStore-4cr6R-Wn.js'
import { u as Z } from './useToast-C3IzSksO.js'
const q = c(typeof navigator < 'u' ? navigator.onLine : !0),
    ee = c(q.value ? new Date() : null)
let $ = 0
function X() {
    ;((q.value = !0), (ee.value = new Date()))
}
function z() {
    q.value = !1
}
function je() {
    return (
        Ae(() => {
            ;($ === 0 &&
                (window.addEventListener('online', X), window.addEventListener('offline', z)),
                $++)
        }),
        Ie(() => {
            ;($--,
                $ === 0 &&
                    (window.removeEventListener('online', X),
                    window.removeEventListener('offline', z)))
        }),
        { isOnline: q, lastOnlineAt: ee }
    )
}
const Q = 'rreader-offline-queue',
    De = 3e4,
    Fe = ['post', 'put', 'patch', 'delete'],
    Ue = 5
function $e(a) {
    return a >= 500 || a === 408 || a === 419 || a === 429
}
function te(a) {
    return !!a && typeof a.url == 'string' && /^\/(?!\/)/.test(a.url) && Fe.includes(a.method)
}
const d = c(qe())
let L = null,
    Y = null
function qe() {
    try {
        const a = localStorage.getItem(Q),
            s = a ? JSON.parse(a) : []
        return Array.isArray(s) ? s.filter(te) : []
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
            Z().error('Storage was full — some offline changes were dropped.'))
    } catch {}
}
function J(a, s, v = {}) {
    if (!te({ method: a, url: s })) return
    const _ =
        a === 'patch' || a === 'put' ? d.value.find(f => f.method === a && f.url === s) : null
    ;(_
        ? ((_.data = { ..._.data, ...v }), (_.queuedAt = new Date().toISOString()))
        : d.value.push({ method: a, url: s, data: v, queuedAt: new Date().toISOString() }),
        G())
}
function K({ method: a, url: s, data: v }) {
    return a === 'delete' ? p.delete(s, { data: v }) : p[a](s, v)
}
function ae() {
    return d.value.length
}
function Ne() {
    Y ||
        d.value.length === 0 ||
        (Y = setTimeout(() => {
            ;((Y = null), O())
        }, De))
}
function O() {
    return (
        L ||
        (d.value.length === 0
            ? Promise.resolve()
            : ((L = (async () => {
                  for (; d.value.length > 0; ) {
                      const a = d.value[0]
                      try {
                          await K(a)
                      } catch (s) {
                          if ((p.isAxiosError(s) && !s.response) || $e(s.response?.status)) {
                              if (((a.attempts = (a.attempts || 0) + 1), a.attempts < Ue)) {
                                  ;(G(), Ne())
                                  return
                              }
                              Z().error("Couldn't sync some offline changes.")
                          }
                      }
                      ;(d.value.shift(), G())
                  }
              })().finally(() => {
                  L = null
              })),
              L))
    )
}
function Qe() {
    const { isOnline: a } = je()
    return (
        Ee(a, s => {
            s && O()
        }),
        a.value && d.value.length > 0 && setTimeout(O, 100),
        { queue: d, enqueue: J, flushQueue: O, queuedCount: ae }
    )
}
const Ge = Le('articles', () => {
    const a = c([]),
        s = c(new Map()),
        v = new Map(),
        o = c({ type: 'all' }),
        _ = c(!1),
        f = c(!1),
        m = c('All Feeds'),
        g = c(!1),
        h = c(null),
        M = c(!1),
        b = c(!1),
        S = c(null),
        x = new Map(),
        ne = 20
    let R = 0,
        y = 0
    const re = P(() => a.value.filter(e => !e.is_read).length),
        le = P(() => a.value.filter(e => e.is_read_later).length),
        se = P(() => {
            const e = {}
            for (const t of a.value) t.is_read || (e[t.feed_id] = (e[t.feed_id] || 0) + 1)
            return e
        })
    function ie(e) {
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
            ? !navigator.onLine || ae() > 0
                ? (J(e, t, n), navigator.onLine && O(), Promise.resolve())
                : K({ method: e, url: t, data: n }).catch(l => {
                      if (!l.response) {
                          J(e, t, n)
                          return
                      }
                      r?.()
                  })
            : K({ method: e, url: t, data: n }).catch(() => r?.())
    }
    const ue = ['today', 'read_later', 'recently_read']
    function N(e) {
        const t = new URLSearchParams()
        return (
            e.feedId && t.set('feed_id', e.feedId),
            e.categoryId && t.set('category_id', e.categoryId),
            ue.includes(e.type) && t.set('filter', e.type),
            e.showAll && t.set('show_all', '1'),
            t
        )
    }
    function I(e) {
        const t = e.feedId
            ? `feed:${e.feedId}`
            : e.categoryId
              ? `category:${e.categoryId}`
              : e.type
        return e.showAll ? `${t}:all` : t
    }
    function j(e, t) {
        Re(e, { articles: JSON.parse(JSON.stringify(t)), filterTitle: m.value })
    }
    const k = new Map()
    function T() {
        const e = I(o.value)
        ;(clearTimeout(k.get(e)),
            k.set(
                e,
                setTimeout(() => {
                    ;(k.delete(e), !(!f.value || _.value) && e === I(o.value) && j(e, a.value))
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
    function oe() {
        if (!f.value || a.value.length === 0) return
        const e = I(o.value)
        x.set(e, {
            articles: a.value,
            filterTitle: m.value,
            hasMore: g.value,
            nextCursor: h.value,
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
        oe()
        const t = I(e),
            n = x.get(t)
        if (n) {
            ;((a.value = n.articles),
                (m.value = n.filterTitle),
                (g.value = n.hasMore),
                (h.value = n.nextCursor),
                (o.value = e),
                (f.value = !0),
                (b.value = !1),
                (S.value = null))
            return
        }
        const r = ++y
        ;((_.value = !0),
            (a.value = []),
            (o.value = e),
            (h.value = null),
            (g.value = !1),
            (S.value = null),
            (b.value = !1))
        const i = N(e)
        try {
            const l = await p.get('/api/articles?' + i.toString())
            if (r !== y) return
            ;((a.value = l.data.articles),
                (m.value = l.data.filter_title),
                (g.value = l.data.has_more),
                (h.value = l.data.next_cursor),
                (f.value = !0),
                (b.value = !1),
                j(t, l.data.articles))
        } catch (l) {
            if (r !== y) return
            if (((g.value = !1), (h.value = null), l.response)) {
                S.value = 'server'
                return
            }
            const u = await Oe(t)
            if (r !== y) return
            u
                ? ((a.value = u.articles),
                  (m.value = u.filterTitle),
                  (f.value = !0),
                  (b.value = !0))
                : (S.value = 'offline')
        } finally {
            r === y && (_.value = !1)
        }
    }
    async function ce() {
        const e = { ...o.value, showAll: !0 },
            t = N(e),
            n = ++y
        _.value = !0
        try {
            const r = await p.get('/api/articles?' + t.toString())
            if (n !== y) return
            ;((a.value = r.data.articles),
                (m.value = r.data.filter_title),
                (g.value = r.data.has_more),
                (h.value = r.data.next_cursor),
                (o.value = e),
                (f.value = !0),
                (b.value = !1),
                (S.value = null),
                j(I(e), r.data.articles))
        } catch {
        } finally {
            n === y && (_.value = !1)
        }
    }
    async function de() {
        if (!(!g.value || M.value || !h.value) && navigator.onLine) {
            M.value = !0
            try {
                const e = N(o.value)
                e.set('cursor', h.value)
                const t = await p.get('/api/articles?' + e.toString())
                ;((a.value = [...a.value, ...t.data.articles]),
                    (g.value = t.data.has_more),
                    (h.value = t.data.next_cursor))
            } catch {
                g.value = !1
            } finally {
                M.value = !1
            }
        }
    }
    function D() {
        for (; s.value.size > ne; ) {
            const e = s.value.keys().next().value
            s.value.delete(e)
        }
    }
    async function F(e) {
        const t = s.value.get(e)
        if (t) return (s.value.delete(e), s.value.set(e, t), t)
        if (v.has(e)) return v.get(e)
        const n = (async () => {
            try {
                const r = await Me(e)
                if (r && !(r._partial && navigator.onLine)) {
                    const l = a.value.find(u => u.id === e)
                    return (
                        l &&
                            ((r.is_read_later = l.is_read_later),
                            (r.is_read = l.is_read),
                            l.reading_progress != null &&
                                (r.reading_progress = l.reading_progress)),
                        s.value.set(e, r),
                        D(),
                        r
                    )
                }
                if (navigator.onLine)
                    try {
                        const u = (await p.get(`/api/articles/${e}`)).data
                        return (s.value.set(e, u), await U(e, u), D(), u)
                    } catch (l) {
                        if (l.response) throw l
                    }
                const i = a.value.find(l => l.id === e)
                if (i) {
                    const l = { ...i, _offline: !0, _partial: !0 }
                    return (await U(e, l), s.value.set(e, l), D(), l)
                }
                throw new Error('Article not available offline')
            } finally {
                v.delete(e)
            }
        })()
        return (v.set(e, n), n)
    }
    function fe(e) {
        const { prev: t, next: n } = V(e)
        ;(n && F(n).catch(() => {}), t && F(t).catch(() => {}))
    }
    function ve() {
        R++
    }
    const _e = 5
    async function ge() {
        const e = ++R,
            t = new Set(await B())
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
                    const l = await p.get(`/api/articles/${i}`)
                    ;(r < _e && (s.value.set(i, l.data), D()), await U(i, l.data))
                } catch {
                    return
                }
            }
    }
    async function he() {
        if (navigator.onLine)
            try {
                const e = await p.get('/api/articles', { params: { filter: 'read_later' } }),
                    t = e.data.articles ?? e.data.data ?? []
                j('read_later', t)
                const n = new Set(await B())
                for (const r of t)
                    if (!n.has(r.id))
                        try {
                            const i = await p.get(`/api/articles/${r.id}`)
                            await U(r.id, i.data)
                        } catch {
                            return
                        }
            } catch {}
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
    function pe(e) {
        const t = a.value.find(r => r.id === e)
        if (!t || t.is_read) return
        ;((t.is_read = !0), (t.read_at = new Date().toISOString()))
        const n = E()
        ;(n.decrementFeedUnread(t.feed_id),
            A(t.published_at) && n.adjustTodayCount(-1),
            xe(e),
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
    function ye(e) {
        const t = a.value.find(r => r.id === e)
        if (!t || !t.is_read) return
        ;((t.is_read = !1), (t.read_at = null))
        const n = E()
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
    function me(e, t = null) {
        const n = a.value.find(Te => Te.id === e)
        if (!n) return
        const r = n.is_read_later
        n.is_read_later = !r
        const i = E()
        i.adjustReadLaterCount(r ? -1 : 1)
        const l = { is_read_later: !r },
            u = { is_read_later: !r }
        ;(!r &&
            t !== null &&
            ((l.reading_progress = t), (n.reading_progress = t), (u.reading_progress = t)),
            H(e, u),
            w(e, u),
            T(),
            r || F(e).catch(() => {}),
            C('patch', `/api/articles/${e}`, l, () => {
                ;((n.is_read_later = r),
                    w(e, { is_read_later: r }),
                    i.adjustReadLaterCount(r ? 1 : -1))
            }))
    }
    function we(e, t) {
        const n = a.value.find(r => r.id === e)
        ;(n && (n.reading_progress = t),
            w(e, { reading_progress: t }),
            H(e, { reading_progress: t }),
            T(),
            C('patch', `/api/articles/${e}`, { reading_progress: t }))
    }
    function be(e = null) {
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
        const i = E()
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
    function Se(e) {
        const t = a.value.findIndex(u => u.id === e)
        if (t === -1) return
        const n = a.value[t],
            r = !n.is_read,
            i = n.feed_id,
            l = A(n.published_at)
        if ((a.value.splice(t, 1), T(), r)) {
            const u = E()
            ;(u.decrementFeedUnread(i),
                l && u.adjustTodayCount(-1),
                C('patch', `/api/articles/${e}`, { is_read: !0 }))
        }
    }
    function Ce() {
        return (x.clear(), (f.value = !1), (h.value = null), (g.value = !1), W(o.value))
    }
    return {
        articles: a,
        contentCache: s,
        activeView: o,
        loading: _,
        loaded: f,
        filterTitle: m,
        hasMore: g,
        loadingMore: M,
        nextCursor: h,
        showingCached: b,
        loadError: S,
        unreadCount: re,
        readLaterCount: le,
        unreadByFeed: se,
        getContent: ie,
        adjacentIds: V,
        fetchArticles: W,
        showAllArticles: ce,
        loadMore: de,
        fetchContent: F,
        prefetchAdjacent: fe,
        warmCache: ge,
        cacheReadLater: he,
        cancelWarmCache: ve,
        markRead: pe,
        markUnread: ye,
        toggleReadLater: me,
        saveReadingProgress: we,
        markAllRead: be,
        dismissArticle: Se,
        forceRefresh: Ce,
    }
})
export { Qe as a, Ge as b, je as u }
