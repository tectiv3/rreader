import {
    o as Ae,
    a as Ie,
    p as c,
    q as p,
    w as Ee,
    y as Oe,
    D as P,
    Z as Le,
    _ as Me,
    $ as F,
    a0 as B,
    a1 as xe,
    a2 as H,
    a3 as Re,
} from './app-BO6VQ9fp.js'
import { u as E } from './useSidebarStore-CsYhynkn.js'
import { u as Z } from './useToast-w_qnOgVX.js'
const $ = c(typeof navigator < 'u' ? navigator.onLine : !0),
    ee = c($.value ? new Date() : null)
let U = 0
function X() {
    ;(($.value = !0), (ee.value = new Date()))
}
function z() {
    $.value = !1
}
function je() {
    return (
        Ae(() => {
            ;(U === 0 &&
                (window.addEventListener('online', X), window.addEventListener('offline', z)),
                U++)
        }),
        Ie(() => {
            ;(U--,
                U === 0 &&
                    (window.removeEventListener('online', X),
                    window.removeEventListener('offline', z)))
        }),
        { isOnline: $, lastOnlineAt: ee }
    )
}
const Q = 'rreader-offline-queue',
    De = 3e4,
    Fe = ['post', 'put', 'patch', 'delete'],
    Ue = 5
function $e(n) {
    return n >= 500 || n === 408 || n === 419 || n === 429
}
function te(n) {
    return !!n && typeof n.url == 'string' && /^\/(?!\/)/.test(n.url) && Fe.includes(n.method)
}
const d = c(qe())
let O = null,
    Y = null
function qe() {
    try {
        const n = localStorage.getItem(Q),
            s = n ? JSON.parse(n) : []
        return Array.isArray(s) ? s.filter(te) : []
    } catch {
        return []
    }
}
function G() {
    try {
        localStorage.setItem(Q, JSON.stringify(d.value))
        return
    } catch (n) {
        if (n?.name !== 'QuotaExceededError') return
    }
    d.value.splice(0, Math.ceil(d.value.length / 2))
    try {
        ;(localStorage.setItem(Q, JSON.stringify(d.value)),
            Z().error('Storage was full — some offline changes were dropped.'))
    } catch {}
}
function J(n, s, v = {}) {
    if (!te({ method: n, url: s })) return
    const _ =
        n === 'patch' || n === 'put' ? d.value.find(f => f.method === n && f.url === s) : null
    ;(_
        ? ((_.data = { ..._.data, ...v }), (_.queuedAt = new Date().toISOString()))
        : d.value.push({ method: n, url: s, data: v, queuedAt: new Date().toISOString() }),
        G())
}
function K({ method: n, url: s, data: v }) {
    return n === 'delete' ? p.delete(s, { data: v }) : p[n](s, v)
}
function ae() {
    return d.value.length
}
function Ne() {
    Y ||
        d.value.length === 0 ||
        (Y = setTimeout(() => {
            ;((Y = null), L())
        }, De))
}
function L() {
    return (
        O ||
        (d.value.length === 0
            ? Promise.resolve()
            : ((O = (async () => {
                  for (; d.value.length > 0; ) {
                      const n = d.value[0]
                      try {
                          await K(n)
                      } catch (s) {
                          if ((p.isAxiosError(s) && !s.response) || $e(s.response?.status)) {
                              if (((n.attempts = (n.attempts || 0) + 1), n.attempts < Ue)) {
                                  ;(G(), Ne())
                                  return
                              }
                              Z().error("Couldn't sync some offline changes.")
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
function Qe() {
    const { isOnline: n } = je()
    return (
        Ee(n, s => {
            s && L()
        }),
        n.value && d.value.length > 0 && setTimeout(L, 100),
        { queue: d, enqueue: J, flushQueue: L, queuedCount: ae }
    )
}
const Ge = Oe('articles', () => {
    const n = c([]),
        s = c(new Map()),
        v = new Map(),
        o = c({ type: 'all' }),
        _ = c(!1),
        f = c(!1),
        m = c('All Feeds'),
        h = c(!1),
        g = c(null),
        M = c(!1),
        b = c(!1),
        S = c(null),
        x = new Map(),
        ne = 20
    let R = 0,
        y = 0
    const re = P(() => n.value.filter(e => !e.is_read).length),
        le = P(() => n.value.filter(e => e.is_read_later).length),
        se = P(() => {
            const e = {}
            for (const t of n.value) t.is_read || (e[t.feed_id] = (e[t.feed_id] || 0) + 1)
            return e
        })
    function ie(e) {
        return s.value.get(e) || null
    }
    function V(e) {
        const t = n.value.findIndex(a => a.id === e)
        return t === -1
            ? { prev: null, next: null }
            : {
                  prev: t > 0 ? n.value[t - 1].id : null,
                  next: t < n.value.length - 1 ? n.value[t + 1].id : null,
              }
    }
    function C(e, t, a, r, { queueable: i = !0 } = {}) {
        return i
            ? !navigator.onLine || ae() > 0
                ? (J(e, t, a), navigator.onLine && L(), Promise.resolve())
                : K({ method: e, url: t, data: a }).catch(l => {
                      if (!l.response) {
                          J(e, t, a)
                          return
                      }
                      r?.()
                  })
            : K({ method: e, url: t, data: a }).catch(() => r?.())
    }
    const ue = ['today', 'read_later', 'recently_read']
    function q(e) {
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
    function N(e, t) {
        Re(e, { articles: JSON.parse(JSON.stringify(t)), filterTitle: m.value })
    }
    const k = new Map()
    function T() {
        const e = I(o.value)
        ;(clearTimeout(k.get(e)),
            k.set(
                e,
                setTimeout(() => {
                    ;(k.delete(e), !(!f.value || _.value) && e === I(o.value) && N(e, n.value))
                }, 1e3)
            ))
    }
    function w(e, t) {
        for (const r of x.values()) {
            const i = r.articles.find(l => l.id === e)
            i && Object.assign(i, t)
        }
        const a = s.value.get(e)
        a && Object.assign(a, t)
    }
    function oe() {
        if (!f.value || n.value.length === 0) return
        const e = I(o.value)
        x.set(e, {
            articles: n.value,
            filterTitle: m.value,
            hasMore: h.value,
            nextCursor: g.value,
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
            a = x.get(t)
        if (a) {
            ;((n.value = a.articles),
                (m.value = a.filterTitle),
                (h.value = a.hasMore),
                (g.value = a.nextCursor),
                (o.value = e),
                (f.value = !0),
                (b.value = !1),
                (S.value = null))
            return
        }
        const r = ++y
        ;((_.value = !0),
            (n.value = []),
            (o.value = e),
            (g.value = null),
            (h.value = !1),
            (S.value = null),
            (b.value = !1))
        const i = q(e)
        try {
            const l = await p.get('/api/articles?' + i.toString())
            if (r !== y) return
            ;((n.value = l.data.articles),
                (m.value = l.data.filter_title),
                (h.value = l.data.has_more),
                (g.value = l.data.next_cursor),
                (f.value = !0),
                (b.value = !1),
                N(t, l.data.articles))
        } catch (l) {
            if (r !== y) return
            if (((h.value = !1), (g.value = null), l.response)) {
                S.value = 'server'
                return
            }
            const u = await Le(t)
            if (r !== y) return
            u
                ? ((n.value = u.articles),
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
            t = q(e),
            a = ++y
        _.value = !0
        try {
            const r = await p.get('/api/articles?' + t.toString())
            if (a !== y) return
            ;((n.value = r.data.articles),
                (m.value = r.data.filter_title),
                (h.value = r.data.has_more),
                (g.value = r.data.next_cursor),
                (o.value = e),
                (f.value = !0),
                (b.value = !1),
                (S.value = null),
                N(I(e), r.data.articles))
        } catch {
        } finally {
            a === y && (_.value = !1)
        }
    }
    async function de() {
        if (!(!h.value || M.value || !g.value) && navigator.onLine) {
            M.value = !0
            try {
                const e = q(o.value)
                e.set('cursor', g.value)
                const t = await p.get('/api/articles?' + e.toString())
                ;((n.value = [...n.value, ...t.data.articles]),
                    (h.value = t.data.has_more),
                    (g.value = t.data.next_cursor))
            } catch {
                h.value = !1
            } finally {
                M.value = !1
            }
        }
    }
    function j() {
        for (; s.value.size > ne; ) {
            const e = s.value.keys().next().value
            s.value.delete(e)
        }
    }
    async function D(e) {
        const t = s.value.get(e)
        if (t) return (s.value.delete(e), s.value.set(e, t), t)
        if (v.has(e)) return v.get(e)
        const a = (async () => {
            try {
                const r = await Me(e)
                if (r && !(r._partial && navigator.onLine)) {
                    const l = n.value.find(u => u.id === e)
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
                        const u = (await p.get(`/api/articles/${e}`)).data
                        return (s.value.set(e, u), await F(e, u), j(), u)
                    } catch (l) {
                        if (l.response) throw l
                    }
                const i = n.value.find(l => l.id === e)
                if (i) {
                    const l = { ...i, _offline: !0, _partial: !0 }
                    return (await F(e, l), s.value.set(e, l), j(), l)
                }
                throw new Error('Article not available offline')
            } finally {
                v.delete(e)
            }
        })()
        return (v.set(e, a), a)
    }
    function fe(e) {
        const { prev: t, next: a } = V(e)
        ;(a && D(a).catch(() => {}), t && D(t).catch(() => {}))
    }
    function ve() {
        R++
    }
    const _e = 5
    async function he() {
        const e = ++R,
            t = new Set(await B())
        if (e !== R) return
        const a = n.value
            .filter(r => !r.is_read && !s.value.has(r.id) && !t.has(r.id))
            .map(r => r.id)
            .slice(0, 50)
        if (a.length !== 0)
            for (let r = 0; r < a.length; r++) {
                if (e !== R) return
                const i = a[r]
                try {
                    const l = await p.get(`/api/articles/${i}`)
                    ;(r < _e && (s.value.set(i, l.data), j()), await F(i, l.data))
                } catch {
                    return
                }
            }
    }
    async function ge() {
        const e = new Set(await B()),
            t = n.value.filter(a => a.is_read_later && !e.has(a.id)).map(a => a.id)
        for (const a of t)
            try {
                const r = await p.get(`/api/articles/${a}`)
                await F(a, r.data)
            } catch {
                return
            }
    }
    function A(e) {
        const t = new Date(e),
            a = new Date()
        return (
            t.getFullYear() === a.getFullYear() &&
            t.getMonth() === a.getMonth() &&
            t.getDate() === a.getDate()
        )
    }
    function pe(e) {
        const t = n.value.find(r => r.id === e)
        if (!t || t.is_read) return
        ;((t.is_read = !0), (t.read_at = new Date().toISOString()))
        const a = E()
        ;(a.decrementFeedUnread(t.feed_id),
            A(t.published_at) && a.adjustTodayCount(-1),
            xe(e),
            w(e, { is_read: !0, read_at: t.read_at }),
            T(),
            C('patch', `/api/articles/${e}`, { is_read: !0 }, () => {
                ;((t.is_read = !1),
                    (t.read_at = null),
                    w(e, { is_read: !1, read_at: null }),
                    a.incrementFeedUnread(t.feed_id),
                    A(t.published_at) && a.adjustTodayCount(1))
            }))
    }
    function ye(e) {
        const t = n.value.find(r => r.id === e)
        if (!t || !t.is_read) return
        ;((t.is_read = !1), (t.read_at = null))
        const a = E()
        ;(a.incrementFeedUnread(t.feed_id),
            A(t.published_at) && a.adjustTodayCount(1),
            w(e, { is_read: !1, read_at: null }),
            T(),
            C('patch', `/api/articles/${e}`, { is_read: !1 }, () => {
                ;((t.is_read = !0),
                    w(e, { is_read: !0 }),
                    a.decrementFeedUnread(t.feed_id),
                    A(t.published_at) && a.adjustTodayCount(-1))
            }))
    }
    function me(e, t = null) {
        const a = n.value.find(Te => Te.id === e)
        if (!a) return
        const r = a.is_read_later
        a.is_read_later = !r
        const i = E()
        i.adjustReadLaterCount(r ? -1 : 1)
        const l = { is_read_later: !r },
            u = { is_read_later: !r }
        ;(!r &&
            t !== null &&
            ((l.reading_progress = t), (a.reading_progress = t), (u.reading_progress = t)),
            H(e, u),
            w(e, u),
            T(),
            r || D(e).catch(() => {}),
            C('patch', `/api/articles/${e}`, l, () => {
                ;((a.is_read_later = r),
                    w(e, { is_read_later: r }),
                    i.adjustReadLaterCount(r ? 1 : -1))
            }))
    }
    function we(e, t) {
        const a = n.value.find(r => r.id === e)
        ;(a && (a.reading_progress = t),
            w(e, { reading_progress: t }),
            H(e, { reading_progress: t }),
            T(),
            C('patch', `/api/articles/${e}`, { reading_progress: t }))
    }
    function be(e = null) {
        if (!navigator.onLine) return !1
        const t = e
                ? n.value.filter(l => l.feed_id === e && !l.is_read)
                : n.value.filter(l => !l.is_read),
            a = {}
        let r = 0
        ;(t.forEach(l => {
            ;((a[l.feed_id] = (a[l.feed_id] || 0) + 1), A(l.published_at) && r++)
        }),
            t.forEach(l => {
                ;((l.is_read = !0), (l.read_at = new Date().toISOString()))
            }))
        const i = E()
        for (const [l, u] of Object.entries(a)) i.decrementFeedUnread(Number(l), u)
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
                    for (const [l, u] of Object.entries(a)) i.incrementFeedUnread(Number(l), u)
                    r && i.adjustTodayCount(r)
                },
                { queueable: !1 }
            ),
            !0
        )
    }
    function Se(e) {
        const t = n.value.findIndex(u => u.id === e)
        if (t === -1) return
        const a = n.value[t],
            r = !a.is_read,
            i = a.feed_id,
            l = A(a.published_at)
        if ((n.value.splice(t, 1), T(), r)) {
            const u = E()
            ;(u.decrementFeedUnread(i),
                l && u.adjustTodayCount(-1),
                C('patch', `/api/articles/${e}`, { is_read: !0 }))
        }
    }
    function Ce() {
        return (x.clear(), (f.value = !1), (g.value = null), (h.value = !1), W(o.value))
    }
    return {
        articles: n,
        contentCache: s,
        activeView: o,
        loading: _,
        loaded: f,
        filterTitle: m,
        hasMore: h,
        loadingMore: M,
        nextCursor: g,
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
        fetchContent: D,
        prefetchAdjacent: fe,
        warmCache: he,
        cacheReadLater: ge,
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
