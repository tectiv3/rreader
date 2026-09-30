import {
    b as n,
    f as a,
    g as t,
    t as p,
    j as u,
    F as f,
    y as x,
    s as rt,
    x as nt,
    R as at,
    S as lt,
    n as Q,
    w as se,
    U as ot,
    p as h,
    o as st,
    a as it,
    V as ut,
    W as dt,
    X as ct,
    u as d,
    k as ie,
    h as y,
    l as vt,
    M as ft,
    D as Y,
    r as Z,
    c as Ee,
    Y as pt,
    q as De,
    i as C,
    Z as kt,
    d as ht,
} from './app-DlJZqWT7.js'
import { p as xt } from './purify.es-J9PU_gBl.js'
import { C as mt } from './ChatPanel-DpINk8Hc.js'
import { a as gt } from './useArticleStore-oUIez41C.js'
import { u as bt, a as wt } from './useOnlineStatus-Bn9_XpL5.js'
import { u as yt } from './useSidebarStore-ChK8O9o0.js'
import { u as Ct } from './useToast-CgxITCA8.js'
import { u as _t } from './useAddFeedModal-kDpp3crX.js'
import { _ as Mt } from './_plugin-vue_export-helper-DlAUqK2U.js'
const At = { class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300' },
    St = { class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500' },
    Tt = {
        key: 0,
        href: '/login',
        class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors',
    },
    $e = {
        __name: 'ArticleListErrorState',
        props: { reason: { type: String, required: !0 } },
        setup(ce) {
            const o = ce,
                _ = x(() => o.reason === 'offline')
            return (g, L) => (
                n(),
                a(
                    f,
                    null,
                    [
                        L[0] ||
                            (L[0] = t(
                                'svg',
                                {
                                    class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                    fill: 'none',
                                    viewBox: '0 0 24 24',
                                    'stroke-width': '1',
                                    stroke: 'currentColor',
                                },
                                [
                                    t('path', {
                                        'stroke-linecap': 'round',
                                        'stroke-linejoin': 'round',
                                        d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                    }),
                                ],
                                -1
                            )),
                        t(
                            'h3',
                            At,
                            p(
                                _.value
                                    ? 'Nothing cached for this view'
                                    : "Couldn't load articles"
                            ),
                            1
                        ),
                        t(
                            'p',
                            St,
                            p(
                                _.value
                                    ? "You're offline and haven't opened this view before."
                                    : 'The server returned an error. Try refreshing, or sign in again.'
                            ),
                            1
                        ),
                        _.value ? u('', !0) : (n(), a('a', Tt, ' Sign in ')),
                    ],
                    64
                )
            )
        },
    },
    Lt = {
        class: 'flex h-11 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4',
    },
    jt = { class: 'flex items-center gap-2 min-w-0' },
    Rt = { class: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate' },
    Bt = {
        key: 0,
        class: 'ml-1 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white',
    },
    zt = { class: 'flex items-center gap-1 shrink-0' },
    Et = ['disabled', 'title', 'aria-label'],
    Dt = ['disabled'],
    $t = { class: 'flex items-start gap-3' },
    It = ['src'],
    Vt = { class: 'min-w-0 flex-1' },
    Ft = { class: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100' },
    Ht = { key: 0, class: 'mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3' },
    Nt = ['href'],
    qt = {
        key: 2,
        class: 'flex',
        style: { height: 'calc(100vh - 2.75rem - env(safe-area-inset-top, 0px))' },
    },
    Pt = {
        class: 'sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur',
    },
    Yt = {
        class: 'text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500',
    },
    Ut = ['id', 'onClick'],
    Ot = ['src'],
    Xt = ['onClick'],
    Wt = ['href'],
    Qt = { class: 'w-12 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-600' },
    Zt = ['onClick'],
    Gt = { key: 2, class: 'flex shrink-0 items-center gap-0.5' },
    Kt = ['title'],
    Jt = ['fill'],
    er = ['disabled', 'title'],
    tr = ['href'],
    rr = ['id'],
    nr = { key: 0, class: 'flex items-center justify-center py-12' },
    ar = { class: 'mx-auto max-w-3xl px-6 pt-5 pb-6' },
    lr = {
        class: 'flex flex-wrap items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-500 mb-4',
    },
    or = { key: 0 },
    sr = { key: 1 },
    ir = ['src', 'alt'],
    ur = ['innerHTML'],
    dr = { key: 1, class: 'py-12 text-center' },
    cr = { class: 'text-neutral-500 dark:text-neutral-400' },
    vr = ['href'],
    fr = { key: 0, class: 'mx-auto max-w-3xl px-6 pb-6' },
    pr = { key: 0, class: 'flex justify-center py-6' },
    kr = { key: 1, class: 'py-6 text-center text-sm text-neutral-500 dark:text-neutral-600' },
    hr = { key: 1, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    xr = { class: 'flex flex-col items-center gap-1' },
    mr = { key: 0, class: 'text-[10px] text-neutral-600 dark:text-neutral-500' },
    gr = { key: 1, class: 'text-[10px] text-neutral-600 dark:text-neutral-500' },
    br = { key: 0, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    wr = { key: 1 },
    yr = {
        class: 'sticky z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur',
        style: { top: 'calc(2.75rem + env(safe-area-inset-top, 0px))' },
    },
    Cr = {
        class: 'text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500',
    },
    _r = { key: 0, class: 'absolute inset-0 flex items-center bg-neutral-800 px-6' },
    Mr = { class: 'ml-2 text-sm font-medium text-white uppercase tracking-wide' },
    Ar = {
        key: 1,
        class: 'absolute inset-0 flex items-center justify-end bg-neutral-800 px-6',
    },
    Sr = { class: 'ml-2 text-sm font-medium text-white uppercase tracking-wide' },
    Tr = ['onClick', 'onTouchstart', 'onTouchmove', 'onTouchend'],
    Lr = { class: 'min-w-0 flex-1' },
    jr = {
        class: 'mt-1 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500',
    },
    Rr = ['src'],
    Br = ['onClick'],
    zr = { class: 'shrink-0' },
    Er = ['src', 'alt'],
    Dr = {
        key: 1,
        class: 'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-neutral-400',
        fill: 'none',
        viewBox: '0 0 24 24',
    },
    $r = { key: 0, class: 'flex justify-center py-6' },
    Ir = { key: 1, class: 'py-6 text-center text-sm text-neutral-500 dark:text-neutral-600' },
    ue = 80,
    Ie = 80,
    de = 10,
    Vr = Object.assign(
        { name: 'ArticleListView' },
        {
            __name: 'ArticleListView',
            setup(ce) {
                const o = gt(),
                    _ = bt(),
                    g = yt(),
                    L = rt(),
                    b = nt(),
                    { isOnline: G } = wt(),
                    { success: F, error: H } = Ct(),
                    { openAddFeedModal: K } = _t(),
                    Ve = at('toggleSidebar')
                function ve() {
                    const r = b.query
                    return r.filter
                        ? { type: r.filter }
                        : r.feed_id
                          ? { type: 'feed', feedId: Number(r.feed_id) }
                          : r.category_id
                            ? { type: 'category', categoryId: Number(r.category_id) }
                            : { type: 'all' }
                }
                const fe = b.query['save-url']
                fe && (L.replace({ query: {} }), K('article', fe))
                const pe = lt()?.scrollTop ?? 0
                ;(o.fetchArticles(ve()).then(async () => {
                    const r = Number(b.query.article)
                    if (r && j.value) {
                        if (!o.articles.some(e => e.id === r))
                            try {
                                const e = await o.fetchContent(r)
                                e && !e._offline && o.articles.unshift(e)
                            } catch {}
                        ;((k.value = r),
                            await ye(r),
                            pe &&
                                (await Q(),
                                setTimeout(() => {
                                    R.value && (R.value.scrollTop = pe)
                                }, 100)))
                    }
                    ;(o.warmCache(), o.cacheReadLater())
                }),
                    se(
                        () => o.filterTitle,
                        r => ot(r),
                        { immediate: !0 }
                    ),
                    se(
                        () => b.query,
                        () => {
                            b.name === 'articles.index' &&
                                (I(),
                                (N.value = !1),
                                o.fetchArticles(ve()).then(() => {
                                    ;(o.warmCache(), o.cacheReadLater())
                                }))
                        },
                        { deep: !0 }
                    ))
                const w = x(() => (b.query.feed_id ? Number(b.query.feed_id) : null)),
                    ke = x(() => (b.query.category_id ? Number(b.query.category_id) : null)),
                    E = x(() => b.query.filter || null),
                    he = x(() => {
                        if (E.value === 'read_later') return g.readLaterCount
                        if (E.value === 'today') return g.todayCount
                        if (E.value === 'recently_read') return 0
                        if (w.value) {
                            for (const e of g.categories) {
                                const s = e.feeds.find(c => c.id === w.value)
                                if (s) return s.unread_count || 0
                            }
                            return (
                                g.uncategorizedFeeds.find(e => e.id === w.value)
                                    ?.unread_count || 0
                            )
                        }
                        return ke.value
                            ? g.categories.find(e => e.id === ke.value)?.unread_count || 0
                            : g.totalUnread
                    }),
                    D = x(() => !!w.value),
                    m = x(() => {
                        if (!w.value) return null
                        for (const r of g.categories) {
                            const e = r.feeds.find(s => s.id === w.value)
                            if (e) return e
                        }
                        return g.uncategorizedFeeds.find(r => r.id === w.value) || null
                    }),
                    N = h(!1),
                    xe = x(() => {
                        let r = g.uncategorizedFeeds.length
                        for (const e of g.categories) r += e.feeds?.length || 0
                        return r
                    }),
                    Fe = x(() => E.value === 'recently_read'),
                    $ = x(() => {
                        const r = {},
                            e = new Date()
                        e.setHours(0, 0, 0, 0)
                        const s = new Date(e)
                        s.setDate(s.getDate() - 1)
                        for (const c of o.articles) {
                            const l = Fe.value ? c.read_at : c.published_at,
                                v = new Date(l)
                            v.setHours(0, 0, 0, 0)
                            let T
                            if (v.getTime() === e.getTime()) T = 'Today'
                            else if (v.getTime() === s.getTime()) T = 'Yesterday'
                            else {
                                const ze = { weekday: 'short', month: 'short', day: 'numeric' }
                                ;(v.getFullYear() !== e.getFullYear() && (ze.year = 'numeric'),
                                    (T = v.toLocaleDateString('en-US', ze)))
                            }
                            ;(r[T] || (r[T] = []), r[T].push(c))
                        }
                        return r
                    })
                function me(r) {
                    const e = new Date(),
                        s = new Date(r),
                        c = Math.floor((e - s) / 1e3)
                    if (c < 60) return 'just now'
                    const l = Math.floor(c / 60)
                    if (l < 60) return `${l}m`
                    const v = Math.floor(l / 60)
                    if (v < 24) return `${v}h`
                    const T = Math.floor(v / 24)
                    return T < 7
                        ? `${T}d`
                        : s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
                const j = h(typeof window < 'u' && window.screen.width >= 1024)
                function ge(r, e = 0) {
                    const s = new URLSearchParams(window.location.search)
                    s.set('article', r)
                    const c = o.articles.find(l => l.id === r)?.title ?? null
                    pt(`/articles?${s.toString()}`, e, c)
                }
                let J = null
                function be() {
                    if (!k.value) return 0
                    const r = document.getElementById(`article-expanded-${k.value}`),
                        e = R.value
                    if (!r || !e) return 0
                    const s = r.offsetTop,
                        l = r.offsetHeight - e.clientHeight
                    if (l <= 0) return 0
                    const v = e.scrollTop - s
                    return Math.min(100, Math.max(0, Math.round((v / l) * 100)))
                }
                function He() {
                    k.value &&
                        (clearTimeout(J),
                        (J = setTimeout(() => {
                            const r = R.value?.scrollTop ?? 0
                            ;(ge(k.value, r), M.value && o.saveReadingProgress(k.value, be()))
                        }, 500)))
                }
                const k = h(null),
                    i = h(null),
                    ee = h(null),
                    U = h(!1),
                    M = h(!1),
                    te = h(null),
                    R = h(null),
                    q = h(null)
                function we() {
                    j.value = window.screen.width >= 1024
                }
                let P = null
                ;(st(() => {
                    ;(_.loadModels(),
                        window.addEventListener('resize', we),
                        window.addEventListener('keydown', Le),
                        document.addEventListener('selectionchange', Te),
                        (P = new IntersectionObserver(
                            r => {
                                r[0].isIntersecting &&
                                    o.hasMore &&
                                    !o.loadingMore &&
                                    o.loadMore()
                            },
                            { rootMargin: '200px' }
                        )),
                        q.value && P.observe(q.value))
                }),
                    it(() => {
                        ;(clearTimeout(ne),
                            clearTimeout(J),
                            window.removeEventListener('resize', we),
                            window.removeEventListener('keydown', Le),
                            document.removeEventListener('selectionchange', Te),
                            P?.disconnect())
                    }),
                    ut(() => {
                        te.value = null
                    }),
                    dt(() => {
                        X()
                    }),
                    se(q, r => {
                        ;(P?.disconnect(), r && P?.observe(r))
                    }))
                function O(r) {
                    if ((r.is_read || o.markRead(r.id), j.value)) {
                        if (k.value === r.id) {
                            I()
                            return
                        }
                        ;(X(), (k.value = r.id), ye(r.id))
                    } else
                        ((te.value = r.id),
                            o.cancelWarmCache(),
                            L.push({ name: 'articles.show', params: { id: r.id } }))
                }
                async function ye(r) {
                    ge(r)
                    const e = o.getContent(r)
                    if (e) {
                        ;((i.value = e),
                            (M.value = e.is_read_later || !1),
                            (U.value = !1),
                            await Q(),
                            _e(r),
                            Ce(e),
                            o.prefetchAdjacent(r),
                            R.value?.focus({ preventScroll: !0 }))
                        return
                    }
                    ;((i.value = null), (U.value = !0), o.cancelWarmCache())
                    try {
                        const s = await o.fetchContent(r)
                        ;((i.value = s),
                            (M.value = s.is_read_later || !1),
                            await Q(),
                            _e(r),
                            Ce(s),
                            o.prefetchAdjacent(r))
                    } catch {
                        L.push({ name: 'articles.show', params: { id: r } })
                    } finally {
                        ;((U.value = !1), R.value?.focus({ preventScroll: !0 }))
                    }
                }
                function Ce(r) {
                    const e = r.reading_progress
                    !r.is_read_later ||
                        !e ||
                        e <= 0 ||
                        setTimeout(() => {
                            const s = document.getElementById(`article-expanded-${r.id}`),
                                c = R.value
                            if (!s || !c) return
                            const l = s.offsetTop,
                                v = s.offsetHeight - c.clientHeight
                            v <= 0 || (c.scrollTop = l + Math.round((e / 100) * v))
                        }, 600)
                }
                function _e(r) {
                    const e = document.getElementById(`article-expanded-${r}`)
                    e && e.scrollIntoView({ block: 'start', behavior: 'smooth' })
                }
                function I() {
                    ;((i.value = null), (k.value = null), (B.value = !1), X(), ct())
                }
                function Me(r) {
                    ;(I(), L.push({ name: 'articles.index', query: { feed_id: r } }))
                }
                function Ae() {
                    i.value &&
                        (o.toggleReadLater(i.value.id, be()),
                        (M.value = !M.value),
                        F(M.value ? 'Article saved' : 'Removed from Read Later'))
                }
                function Se() {
                    i.value && (o.markUnread(i.value.id), F('Marked as unread'))
                }
                function Ne() {
                    i.value &&
                        (navigator.share
                            ? navigator
                                  .share({ title: i.value.title, url: i.value.url })
                                  .catch(() => {})
                            : i.value.url &&
                              navigator.clipboard
                                  .writeText(i.value.url)
                                  .then(() => F('Link copied to clipboard'))
                                  .catch(() => {}))
                }
                async function qe() {
                    if (!i.value) return
                    let r
                    try {
                        r = await _.startConversation(i.value.id)
                    } catch {
                        H('Failed to start chat')
                        return
                    }
                    try {
                        ;(await _.openConversation(r.id), (ee.value = i.value.id))
                    } catch {}
                }
                function X() {
                    ;((ee.value = null), _.closeConversation())
                }
                const Pe = x(() =>
                        i.value?.image_url
                            ? !(i.value.content || i.value.summary || '').includes(
                                  i.value.image_url
                              )
                            : !1
                    ),
                    Ye = x(() =>
                        i.value
                            ? new Date(i.value.published_at).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              })
                            : ''
                    ),
                    Ue = x(() =>
                        i.value
                            ? new Date(i.value.published_at).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : ''
                    ),
                    Oe = x(() => {
                        const e = (i.value?.content || i.value?.summary || '').replace(
                            /(href|src)=(["'])http:\/\//gi,
                            '$1=$2https://'
                        )
                        return xt.sanitize(e, { USE_PROFILES: { html: !0 } })
                    }),
                    B = h(!1)
                let re = '',
                    ne = null
                function Te() {
                    ;(clearTimeout(ne),
                        (ne = setTimeout(() => {
                            const r = window.getSelection()
                            if (!r || r.isCollapsed || !r.toString().trim()) {
                                B.value = !1
                                return
                            }
                            const e = document.querySelector('.article-content')
                            if (!e) {
                                B.value = !1
                                return
                            }
                            const s = r.getRangeAt(0),
                                c = e.contains(s.commonAncestorContainer)
                            ;((B.value = c), c && (re = r.toString().trim()))
                        }, 100)))
                }
                async function Xe() {
                    const r = re
                    if (!r || !i.value) return
                    const e = i.value.id
                    ;((re = ''), window.getSelection()?.removeAllRanges(), (B.value = !1))
                    try {
                        ;(await De.post('/api/highlights', { article_id: e, text: r }),
                            F('Quote saved'))
                    } catch {
                        H('Failed to save quote')
                    }
                }
                const ae = x(() =>
                    k.value ? o.articles.findIndex(r => r.id === k.value) : -1
                )
                function Le(r) {
                    if (
                        j.value &&
                        !(
                            r.target.tagName === 'INPUT' ||
                            r.target.tagName === 'TEXTAREA' ||
                            r.target.isContentEditable
                        ) &&
                        b.name === 'articles.index'
                    )
                        switch (r.key) {
                            case 'ArrowRight':
                            case 'j': {
                                r.preventDefault()
                                const e = ae.value + 1
                                e < o.articles.length && O(o.articles[e])
                                break
                            }
                            case 'ArrowLeft':
                            case 'k': {
                                r.preventDefault()
                                const e = ae.value - 1
                                e >= 0 && O(o.articles[e])
                                break
                            }
                            case 's': {
                                ;(r.preventDefault(), i.value && Ae())
                                break
                            }
                            case 'm': {
                                if ((r.preventDefault(), i.value)) {
                                    const e = ae.value
                                    ;(Se(), I())
                                    const s = o.articles[e + 1]
                                    s &&
                                        ((k.value = s.id),
                                        Q(() => {
                                            document
                                                .getElementById(`article-row-${s.id}`)
                                                ?.scrollIntoView({
                                                    block: 'nearest',
                                                    behavior: 'smooth',
                                                })
                                        }))
                                }
                                break
                            }
                            case 'Escape': {
                                ;(r.preventDefault(), I())
                                break
                            }
                        }
                }
                const le = h(!1)
                function We() {
                    le.value = !0
                    const r = o.markAllRead(w.value)
                    if (((le.value = !1), !r)) {
                        H("You're offline — marking all as read needs a connection.")
                        return
                    }
                    F('All marked as read')
                }
                const W = h(!1)
                async function je() {
                    if (!G.value) {
                        H("You're offline — showing cached articles.")
                        return
                    }
                    W.value = !0
                    try {
                        if (w.value) {
                            const r = m.value?.disabled_at
                                ? `/api/feeds/${w.value}/reenable`
                                : `/api/feeds/${w.value}/refresh`
                            await De.post(r)
                        }
                        await Promise.all([o.forceRefresh(), g.fetchSidebar().catch(() => {})])
                    } catch {
                        H("Couldn't refresh — check your connection.")
                    } finally {
                        W.value = !1
                    }
                }
                const A = h(0),
                    V = h(!1),
                    S = h(!1)
                let Re = 0
                function Qe(r) {
                    window.scrollY > 0 ||
                        S.value ||
                        ((Re = r.touches[0].clientY), (V.value = !0))
                }
                function Ze(r) {
                    if (!V.value || S.value) return
                    if (window.scrollY > 0) {
                        ;((V.value = !1), (A.value = 0))
                        return
                    }
                    const e = r.touches[0].clientY - Re
                    e > 0 && (A.value = Math.min(e * 0.5, 120))
                }
                async function Ge() {
                    V.value &&
                        ((V.value = !1),
                        A.value >= ue &&
                            !S.value &&
                            ((S.value = !0), (A.value = 60), await je(), (S.value = !1)),
                        (A.value = 0))
                }
                const z = h({})
                function Ke(r, e) {
                    z.value[r] = {
                        startX: e.touches[0].clientX,
                        startY: e.touches[0].clientY,
                        currentX: 0,
                        swiping: !1,
                        directionLocked: !1,
                    }
                }
                function Je(r, e) {
                    const s = z.value[r]
                    if (!s) return
                    const c = e.touches[0].clientX - s.startX,
                        l = e.touches[0].clientY - s.startY
                    if (
                        !s.directionLocked &&
                        (Math.abs(c) > de || Math.abs(l) > de) &&
                        ((s.directionLocked = !0), Math.abs(l) > Math.abs(c))
                    ) {
                        delete z.value[r]
                        return
                    }
                    s.directionLocked &&
                        Math.abs(c) > de &&
                        (e.preventDefault(),
                        (s.swiping = !0),
                        (s.currentX = Math.max(Math.min(c, 200), -200)))
                }
                function et(r, e) {
                    const s = z.value[r]
                    s &&
                        (s.currentX < -Ie
                            ? e.is_read
                                ? o.markUnread(e.id)
                                : o.markRead(e.id)
                            : s.currentX > Ie && o.toggleReadLater(e.id),
                        delete z.value[r])
                }
                function tt(r) {
                    const e = z.value[r]
                    return !e || !e.swiping
                        ? {}
                        : { transform: `translateX(${e.currentX}px)`, transition: 'none' }
                }
                function oe(r) {
                    return z.value[r]?.swiping || !1
                }
                function Be(r) {
                    const e = z.value[r]
                    return !e || !e.swiping ? null : e.currentX > 0 ? 'right' : 'left'
                }
                return (r, e) => (
                    n(),
                    a(
                        f,
                        null,
                        [
                            t(
                                'header',
                                {
                                    class: y(
                                        j.value
                                            ? 'sticky top-0 z-30 bg-white dark:bg-neutral-900 pt-safe'
                                            : 'fixed top-0 inset-x-0 z-30 bg-white dark:bg-neutral-900 pt-safe'
                                    ),
                                },
                                [
                                    t('div', Lt, [
                                        t('div', jt, [
                                            t(
                                                'button',
                                                {
                                                    onClick: e[0] || (e[0] = s => d(Ve)()),
                                                    class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2',
                                                    title: 'Open sidebar',
                                                    'aria-label': 'Open sidebar',
                                                },
                                                [
                                                    ...(e[11] ||
                                                        (e[11] = [
                                                            t(
                                                                'svg',
                                                                {
                                                                    class: 'h-5 w-5',
                                                                    fill: 'none',
                                                                    viewBox: '0 0 24 24',
                                                                    'stroke-width': '1.5',
                                                                    stroke: 'currentColor',
                                                                },
                                                                [
                                                                    t('path', {
                                                                        'stroke-linecap':
                                                                            'round',
                                                                        'stroke-linejoin':
                                                                            'round',
                                                                        d: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
                                                                    }),
                                                                ],
                                                                -1
                                                            ),
                                                        ])),
                                                ]
                                            ),
                                            t('h1', Rt, [
                                                ie(p(d(o).filterTitle) + ' ', 1),
                                                he.value > 0
                                                    ? (n(), a('span', Bt, p(he.value), 1))
                                                    : u('', !0),
                                            ]),
                                        ]),
                                        t('div', zt, [
                                            t(
                                                'button',
                                                {
                                                    onClick:
                                                        e[1] ||
                                                        (e[1] = s =>
                                                            d(L).push({
                                                                name: 'articles.search',
                                                            })),
                                                    class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                    title: 'Search',
                                                    'aria-label': 'Search articles',
                                                },
                                                [
                                                    ...(e[12] ||
                                                        (e[12] = [
                                                            t(
                                                                'svg',
                                                                {
                                                                    class: 'h-5 w-5',
                                                                    fill: 'none',
                                                                    viewBox: '0 0 24 24',
                                                                    'stroke-width': '1.5',
                                                                    stroke: 'currentColor',
                                                                },
                                                                [
                                                                    t('path', {
                                                                        'stroke-linecap':
                                                                            'round',
                                                                        'stroke-linejoin':
                                                                            'round',
                                                                        d: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
                                                                    }),
                                                                ],
                                                                -1
                                                            ),
                                                        ])),
                                                ]
                                            ),
                                            D.value
                                                ? (n(),
                                                  a(
                                                      'button',
                                                      {
                                                          key: 0,
                                                          onClick:
                                                              e[2] ||
                                                              (e[2] = s =>
                                                                  (N.value = !N.value)),
                                                          class: y([
                                                              'rounded-lg p-2 transition-colors cursor-pointer',
                                                              N.value
                                                                  ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                                                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                          ]),
                                                          title: 'Feed info',
                                                          'aria-label': 'Feed info',
                                                      },
                                                      [
                                                          ...(e[13] ||
                                                              (e[13] = [
                                                                  t(
                                                                      'svg',
                                                                      {
                                                                          class: 'h-5 w-5',
                                                                          fill: 'none',
                                                                          viewBox: '0 0 24 24',
                                                                          'stroke-width':
                                                                              '1.5',
                                                                          stroke: 'currentColor',
                                                                      },
                                                                      [
                                                                          t('path', {
                                                                              'stroke-linecap':
                                                                                  'round',
                                                                              'stroke-linejoin':
                                                                                  'round',
                                                                              d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
                                                                          }),
                                                                      ],
                                                                      -1
                                                                  ),
                                                              ])),
                                                      ],
                                                      2
                                                  ))
                                                : u('', !0),
                                            vt(
                                                t(
                                                    'button',
                                                    {
                                                        onClick: je,
                                                        disabled: W.value,
                                                        class: y([
                                                            'rounded-lg p-2 transition-colors cursor-pointer',
                                                            m.value?.disabled_at
                                                                ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                                                                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                        ]),
                                                        title: m.value?.disabled_at
                                                            ? 'Feed is broken — click to retry'
                                                            : 'Refresh feed',
                                                        'aria-label': m.value?.disabled_at
                                                            ? 'Retry broken feed'
                                                            : 'Refresh feed',
                                                    },
                                                    [
                                                        (n(),
                                                        a(
                                                            'svg',
                                                            {
                                                                class: y([
                                                                    'h-5 w-5 transition-transform',
                                                                    {
                                                                        'animate-spin':
                                                                            W.value,
                                                                    },
                                                                ]),
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '1.5',
                                                                stroke: 'currentColor',
                                                            },
                                                            [
                                                                ...(e[14] ||
                                                                    (e[14] = [
                                                                        t(
                                                                            'path',
                                                                            {
                                                                                'stroke-linecap':
                                                                                    'round',
                                                                                'stroke-linejoin':
                                                                                    'round',
                                                                                d: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182',
                                                                            },
                                                                            null,
                                                                            -1
                                                                        ),
                                                                    ])),
                                                            ],
                                                            2
                                                        )),
                                                    ],
                                                    10,
                                                    Et
                                                ),
                                                [
                                                    [
                                                        ft,
                                                        d(o).articles.length > 0 ||
                                                            !d(o).loading,
                                                    ],
                                                ]
                                            ),
                                            D.value && d(o).unreadCount > 0
                                                ? (n(),
                                                  a(
                                                      'button',
                                                      {
                                                          key: 1,
                                                          onClick: We,
                                                          disabled: le.value,
                                                          class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                          title: 'Mark all as read',
                                                          'aria-label': 'Mark all as read',
                                                      },
                                                      [
                                                          ...(e[15] ||
                                                              (e[15] = [
                                                                  t(
                                                                      'svg',
                                                                      {
                                                                          class: 'h-5 w-5',
                                                                          fill: 'none',
                                                                          viewBox: '0 0 24 24',
                                                                          'stroke-width':
                                                                              '1.5',
                                                                          stroke: 'currentColor',
                                                                      },
                                                                      [
                                                                          t('path', {
                                                                              'stroke-linecap':
                                                                                  'round',
                                                                              'stroke-linejoin':
                                                                                  'round',
                                                                              d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                                                          }),
                                                                      ],
                                                                      -1
                                                                  ),
                                                              ])),
                                                      ],
                                                      8,
                                                      Dt
                                                  ))
                                                : u('', !0),
                                        ]),
                                    ]),
                                ],
                                2
                            ),
                            N.value && m.value
                                ? (n(),
                                  a(
                                      'div',
                                      {
                                          key: 0,
                                          class: 'border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3',
                                          style: Y(
                                              j.value
                                                  ? ''
                                                  : 'margin-top: calc(2.75rem + env(safe-area-inset-top, 0px))'
                                          ),
                                      },
                                      [
                                          t('div', $t, [
                                              m.value.favicon_url
                                                  ? (n(),
                                                    a(
                                                        'img',
                                                        {
                                                            key: 0,
                                                            src: m.value.favicon_url,
                                                            class: 'h-8 w-8 shrink-0 rounded-md mt-0.5',
                                                            alt: '',
                                                        },
                                                        null,
                                                        8,
                                                        It
                                                    ))
                                                  : u('', !0),
                                              t('div', Vt, [
                                                  t('h2', Ft, p(m.value.title), 1),
                                                  m.value.description
                                                      ? (n(),
                                                        a('p', Ht, p(m.value.description), 1))
                                                      : u('', !0),
                                                  m.value.site_url
                                                      ? (n(),
                                                        a(
                                                            'a',
                                                            {
                                                                key: 1,
                                                                href: m.value.site_url,
                                                                target: '_blank',
                                                                rel: 'noopener noreferrer',
                                                                class: 'mt-1.5 inline-flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 hover:underline',
                                                            },
                                                            [
                                                                e[16] ||
                                                                    (e[16] = t(
                                                                        'svg',
                                                                        {
                                                                            class: 'h-3 w-3',
                                                                            fill: 'none',
                                                                            viewBox:
                                                                                '0 0 24 24',
                                                                            'stroke-width':
                                                                                '1.5',
                                                                            stroke: 'currentColor',
                                                                        },
                                                                        [
                                                                            t('path', {
                                                                                'stroke-linecap':
                                                                                    'round',
                                                                                'stroke-linejoin':
                                                                                    'round',
                                                                                d: 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
                                                                            }),
                                                                        ],
                                                                        -1
                                                                    )),
                                                                ie(
                                                                    ' ' +
                                                                        p(
                                                                            m.value.site_url
                                                                                .replace(
                                                                                    /^https?:\/\//,
                                                                                    ''
                                                                                )
                                                                                .replace(
                                                                                    /\/$/,
                                                                                    ''
                                                                                )
                                                                        ),
                                                                    1
                                                                ),
                                                            ],
                                                            8,
                                                            Nt
                                                        ))
                                                      : u('', !0),
                                              ]),
                                          ]),
                                      ],
                                      4
                                  ))
                                : u('', !0),
                            d(o).loading && d(o).articles.length === 0
                                ? (n(),
                                  a(
                                      'div',
                                      {
                                          key: 1,
                                          class: 'flex items-center justify-center py-20',
                                          style: Y(
                                              j.value
                                                  ? ''
                                                  : 'margin-top: calc(2.75rem + env(safe-area-inset-top, 0px))'
                                          ),
                                      },
                                      [
                                          ...(e[17] ||
                                              (e[17] = [
                                                  t(
                                                      'svg',
                                                      {
                                                          class: 'h-8 w-8 animate-spin text-neutral-400',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                      },
                                                      [
                                                          t('circle', {
                                                              class: 'opacity-25',
                                                              cx: '12',
                                                              cy: '12',
                                                              r: '10',
                                                              stroke: 'currentColor',
                                                              'stroke-width': '4',
                                                          }),
                                                          t('path', {
                                                              class: 'opacity-75',
                                                              fill: 'currentColor',
                                                              d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                          }),
                                                      ],
                                                      -1
                                                  ),
                                              ])),
                                      ],
                                      4
                                  ))
                                : j.value
                                  ? (n(),
                                    a('div', qt, [
                                        t(
                                            'div',
                                            {
                                                ref_key: 'articleListEl',
                                                ref: R,
                                                tabindex: '-1',
                                                class: 'flex-1 flex flex-col overflow-y-auto pr-2 outline-none',
                                                onScrollPassive: He,
                                            },
                                            [
                                                d(o).articles.length > 0
                                                    ? (n(),
                                                      a(
                                                          f,
                                                          { key: 0 },
                                                          [
                                                              (n(!0),
                                                              a(
                                                                  f,
                                                                  null,
                                                                  Z(
                                                                      $.value,
                                                                      (s, c) => (
                                                                          n(),
                                                                          a(
                                                                              f,
                                                                              { key: c },
                                                                              [
                                                                                  t(
                                                                                      'div',
                                                                                      Pt,
                                                                                      [
                                                                                          t(
                                                                                              'h2',
                                                                                              Yt,
                                                                                              p(
                                                                                                  c
                                                                                              ),
                                                                                              1
                                                                                          ),
                                                                                      ]
                                                                                  ),
                                                                                  t(
                                                                                      'div',
                                                                                      null,
                                                                                      [
                                                                                          (n(
                                                                                              !0
                                                                                          ),
                                                                                          a(
                                                                                              f,
                                                                                              null,
                                                                                              Z(
                                                                                                  s,
                                                                                                  l => (
                                                                                                      n(),
                                                                                                      a(
                                                                                                          f,
                                                                                                          {
                                                                                                              key: l.id,
                                                                                                          },
                                                                                                          [
                                                                                                              t(
                                                                                                                  'div',
                                                                                                                  {
                                                                                                                      id: `article-row-${l.id}`,
                                                                                                                      class: y(
                                                                                                                          [
                                                                                                                              'flex w-full items-center gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-2.5 text-left transition-colors',
                                                                                                                              [
                                                                                                                                  k.value ===
                                                                                                                                  l.id
                                                                                                                                      ? 'sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b-neutral-200 dark:border-b-neutral-800'
                                                                                                                                      : 'group/row cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
                                                                                                                              ],
                                                                                                                          ]
                                                                                                                      ),
                                                                                                                      onClick:
                                                                                                                          v =>
                                                                                                                              k.value !==
                                                                                                                                  l.id &&
                                                                                                                              O(
                                                                                                                                  l
                                                                                                                              ),
                                                                                                                  },
                                                                                                                  [
                                                                                                                      D.value
                                                                                                                          ? u(
                                                                                                                                '',
                                                                                                                                !0
                                                                                                                            )
                                                                                                                          : (n(),
                                                                                                                            a(
                                                                                                                                f,
                                                                                                                                {
                                                                                                                                    key: 0,
                                                                                                                                },
                                                                                                                                [
                                                                                                                                    l.feed_favicon_url
                                                                                                                                        ? (n(),
                                                                                                                                          a(
                                                                                                                                              'img',
                                                                                                                                              {
                                                                                                                                                  key: 0,
                                                                                                                                                  src: l.feed_favicon_url,
                                                                                                                                                  class: 'h-4 w-4 shrink-0 rounded-sm',
                                                                                                                                                  alt: '',
                                                                                                                                              },
                                                                                                                                              null,
                                                                                                                                              8,
                                                                                                                                              Ot
                                                                                                                                          ))
                                                                                                                                        : u(
                                                                                                                                              '',
                                                                                                                                              !0
                                                                                                                                          ),
                                                                                                                                    t(
                                                                                                                                        'span',
                                                                                                                                        {
                                                                                                                                            class: 'w-32 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-500 hover:underline cursor-pointer',
                                                                                                                                            onClick:
                                                                                                                                                C(
                                                                                                                                                    v =>
                                                                                                                                                        Me(
                                                                                                                                                            l.feed_id
                                                                                                                                                        ),
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                        },
                                                                                                                                        p(
                                                                                                                                            l.feed_title
                                                                                                                                        ),
                                                                                                                                        9,
                                                                                                                                        Xt
                                                                                                                                    ),
                                                                                                                                ],
                                                                                                                                64
                                                                                                                            )),
                                                                                                                      t(
                                                                                                                          'h3',
                                                                                                                          {
                                                                                                                              class: y(
                                                                                                                                  [
                                                                                                                                      'min-w-0 flex-1 truncate text-sm',
                                                                                                                                      l.is_read
                                                                                                                                          ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                                                                                                                                          : 'text-neutral-900 dark:text-neutral-100 font-medium',
                                                                                                                                  ]
                                                                                                                              ),
                                                                                                                          },
                                                                                                                          [
                                                                                                                              k.value ===
                                                                                                                                  l.id &&
                                                                                                                              l.url
                                                                                                                                  ? (n(),
                                                                                                                                    a(
                                                                                                                                        'a',
                                                                                                                                        {
                                                                                                                                            key: 0,
                                                                                                                                            href: l.url,
                                                                                                                                            target: '_blank',
                                                                                                                                            rel: 'noopener noreferrer',
                                                                                                                                            class: 'hover:underline',
                                                                                                                                            onClick:
                                                                                                                                                e[3] ||
                                                                                                                                                (e[3] =
                                                                                                                                                    C(() => {}, [
                                                                                                                                                        'stop',
                                                                                                                                                    ])),
                                                                                                                                        },
                                                                                                                                        p(
                                                                                                                                            l.title
                                                                                                                                        ),
                                                                                                                                        9,
                                                                                                                                        Wt
                                                                                                                                    ))
                                                                                                                                  : (n(),
                                                                                                                                    a(
                                                                                                                                        f,
                                                                                                                                        {
                                                                                                                                            key: 1,
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            ie(
                                                                                                                                                p(
                                                                                                                                                    l.title
                                                                                                                                                ),
                                                                                                                                                1
                                                                                                                                            ),
                                                                                                                                        ],
                                                                                                                                        64
                                                                                                                                    )),
                                                                                                                          ],
                                                                                                                          2
                                                                                                                      ),
                                                                                                                      k.value !==
                                                                                                                      l.id
                                                                                                                          ? (n(),
                                                                                                                            a(
                                                                                                                                f,
                                                                                                                                {
                                                                                                                                    key: 1,
                                                                                                                                },
                                                                                                                                [
                                                                                                                                    t(
                                                                                                                                        'span',
                                                                                                                                        Qt,
                                                                                                                                        p(
                                                                                                                                            me(
                                                                                                                                                l.published_at
                                                                                                                                            )
                                                                                                                                        ),
                                                                                                                                        1
                                                                                                                                    ),
                                                                                                                                    t(
                                                                                                                                        'span',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                C(
                                                                                                                                                    v =>
                                                                                                                                                        d(
                                                                                                                                                            o
                                                                                                                                                        ).dismissArticle(
                                                                                                                                                            l.id
                                                                                                                                                        ),
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            class: 'w-6 shrink-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-opacity cursor-pointer',
                                                                                                                                            title: 'Dismiss — mark read & hide',
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            ...(e[18] ||
                                                                                                                                                (e[18] =
                                                                                                                                                    [
                                                                                                                                                        t(
                                                                                                                                                            'svg',
                                                                                                                                                            {
                                                                                                                                                                class: 'h-3.5 w-3.5',
                                                                                                                                                                fill: 'none',
                                                                                                                                                                viewBox:
                                                                                                                                                                    '0 0 24 24',
                                                                                                                                                                'stroke-width':
                                                                                                                                                                    '2',
                                                                                                                                                                stroke: 'currentColor',
                                                                                                                                                            },
                                                                                                                                                            [
                                                                                                                                                                t(
                                                                                                                                                                    'path',
                                                                                                                                                                    {
                                                                                                                                                                        'stroke-linecap':
                                                                                                                                                                            'round',
                                                                                                                                                                        'stroke-linejoin':
                                                                                                                                                                            'round',
                                                                                                                                                                        d: 'M6 18L18 6M6 6l12 12',
                                                                                                                                                                    }
                                                                                                                                                                ),
                                                                                                                                                            ],
                                                                                                                                                            -1
                                                                                                                                                        ),
                                                                                                                                                    ])),
                                                                                                                                        ],
                                                                                                                                        8,
                                                                                                                                        Zt
                                                                                                                                    ),
                                                                                                                                ],
                                                                                                                                64
                                                                                                                            ))
                                                                                                                          : (n(),
                                                                                                                            a(
                                                                                                                                'div',
                                                                                                                                Gt,
                                                                                                                                [
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                C(
                                                                                                                                                    Ae,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            class: y(
                                                                                                                                                [
                                                                                                                                                    'rounded-lg p-1.5 transition-colors cursor-pointer',
                                                                                                                                                    M.value
                                                                                                                                                        ? 'text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                                                                                                                        : 'text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300',
                                                                                                                                                ]
                                                                                                                                            ),
                                                                                                                                            title: M.value
                                                                                                                                                ? 'Remove from Read Later'
                                                                                                                                                : 'Save to Read Later',
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            (n(),
                                                                                                                                            a(
                                                                                                                                                'svg',
                                                                                                                                                {
                                                                                                                                                    class: 'h-4 w-4',
                                                                                                                                                    fill: M.value
                                                                                                                                                        ? 'currentColor'
                                                                                                                                                        : 'none',
                                                                                                                                                    viewBox:
                                                                                                                                                        '0 0 24 24',
                                                                                                                                                    'stroke-width':
                                                                                                                                                        '1.5',
                                                                                                                                                    stroke: 'currentColor',
                                                                                                                                                },
                                                                                                                                                [
                                                                                                                                                    ...(e[19] ||
                                                                                                                                                        (e[19] =
                                                                                                                                                            [
                                                                                                                                                                t(
                                                                                                                                                                    'path',
                                                                                                                                                                    {
                                                                                                                                                                        'stroke-linecap':
                                                                                                                                                                            'round',
                                                                                                                                                                        'stroke-linejoin':
                                                                                                                                                                            'round',
                                                                                                                                                                        d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
                                                                                                                                                                    },
                                                                                                                                                                    null,
                                                                                                                                                                    -1
                                                                                                                                                                ),
                                                                                                                                                            ])),
                                                                                                                                                ],
                                                                                                                                                8,
                                                                                                                                                Jt
                                                                                                                                            )),
                                                                                                                                        ],
                                                                                                                                        10,
                                                                                                                                        Kt
                                                                                                                                    ),
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                C(
                                                                                                                                                    Se,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            class: 'rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                                                                            title: 'Mark as unread',
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            ...(e[20] ||
                                                                                                                                                (e[20] =
                                                                                                                                                    [
                                                                                                                                                        t(
                                                                                                                                                            'svg',
                                                                                                                                                            {
                                                                                                                                                                class: 'h-4 w-4',
                                                                                                                                                                fill: 'none',
                                                                                                                                                                viewBox:
                                                                                                                                                                    '0 0 24 24',
                                                                                                                                                                'stroke-width':
                                                                                                                                                                    '1.5',
                                                                                                                                                                stroke: 'currentColor',
                                                                                                                                                            },
                                                                                                                                                            [
                                                                                                                                                                t(
                                                                                                                                                                    'path',
                                                                                                                                                                    {
                                                                                                                                                                        'stroke-linecap':
                                                                                                                                                                            'round',
                                                                                                                                                                        'stroke-linejoin':
                                                                                                                                                                            'round',
                                                                                                                                                                        d: 'M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18',
                                                                                                                                                                    }
                                                                                                                                                                ),
                                                                                                                                                            ],
                                                                                                                                                            -1
                                                                                                                                                        ),
                                                                                                                                                    ])),
                                                                                                                                        ]
                                                                                                                                    ),
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                C(
                                                                                                                                                    Xe,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            disabled:
                                                                                                                                                !B.value,
                                                                                                                                            class: y(
                                                                                                                                                [
                                                                                                                                                    'rounded-lg p-1.5 transition-colors cursor-pointer',
                                                                                                                                                    B.value
                                                                                                                                                        ? 'text-amber-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                                                                                                                        : 'text-neutral-300 dark:text-neutral-600 cursor-default',
                                                                                                                                                ]
                                                                                                                                            ),
                                                                                                                                            title: B.value
                                                                                                                                                ? 'Save quote'
                                                                                                                                                : 'Select text first',
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            ...(e[21] ||
                                                                                                                                                (e[21] =
                                                                                                                                                    [
                                                                                                                                                        t(
                                                                                                                                                            'svg',
                                                                                                                                                            {
                                                                                                                                                                class: 'h-4 w-4',
                                                                                                                                                                fill: 'none',
                                                                                                                                                                viewBox:
                                                                                                                                                                    '0 0 24 24',
                                                                                                                                                                'stroke-width':
                                                                                                                                                                    '1.5',
                                                                                                                                                                stroke: 'currentColor',
                                                                                                                                                            },
                                                                                                                                                            [
                                                                                                                                                                t(
                                                                                                                                                                    'path',
                                                                                                                                                                    {
                                                                                                                                                                        'stroke-linecap':
                                                                                                                                                                            'round',
                                                                                                                                                                        'stroke-linejoin':
                                                                                                                                                                            'round',
                                                                                                                                                                        d: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
                                                                                                                                                                    }
                                                                                                                                                                ),
                                                                                                                                                            ],
                                                                                                                                                            -1
                                                                                                                                                        ),
                                                                                                                                                    ])),
                                                                                                                                        ],
                                                                                                                                        10,
                                                                                                                                        er
                                                                                                                                    ),
                                                                                                                                    i
                                                                                                                                        .value
                                                                                                                                        ?.url
                                                                                                                                        ? (n(),
                                                                                                                                          a(
                                                                                                                                              'a',
                                                                                                                                              {
                                                                                                                                                  key: 0,
                                                                                                                                                  href: i
                                                                                                                                                      .value
                                                                                                                                                      .url,
                                                                                                                                                  target: '_blank',
                                                                                                                                                  rel: 'noopener noreferrer',
                                                                                                                                                  onClick:
                                                                                                                                                      e[4] ||
                                                                                                                                                      (e[4] =
                                                                                                                                                          C(() => {}, [
                                                                                                                                                              'stop',
                                                                                                                                                          ])),
                                                                                                                                                  class: 'rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors',
                                                                                                                                                  title: 'Open original',
                                                                                                                                              },
                                                                                                                                              [
                                                                                                                                                  ...(e[22] ||
                                                                                                                                                      (e[22] =
                                                                                                                                                          [
                                                                                                                                                              t(
                                                                                                                                                                  'svg',
                                                                                                                                                                  {
                                                                                                                                                                      class: 'h-4 w-4',
                                                                                                                                                                      fill: 'none',
                                                                                                                                                                      viewBox:
                                                                                                                                                                          '0 0 24 24',
                                                                                                                                                                      'stroke-width':
                                                                                                                                                                          '1.5',
                                                                                                                                                                      stroke: 'currentColor',
                                                                                                                                                                  },
                                                                                                                                                                  [
                                                                                                                                                                      t(
                                                                                                                                                                          'path',
                                                                                                                                                                          {
                                                                                                                                                                              'stroke-linecap':
                                                                                                                                                                                  'round',
                                                                                                                                                                              'stroke-linejoin':
                                                                                                                                                                                  'round',
                                                                                                                                                                              d: 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
                                                                                                                                                                          }
                                                                                                                                                                      ),
                                                                                                                                                                  ],
                                                                                                                                                                  -1
                                                                                                                                                              ),
                                                                                                                                                          ])),
                                                                                                                                              ],
                                                                                                                                              8,
                                                                                                                                              tr
                                                                                                                                          ))
                                                                                                                                        : u(
                                                                                                                                              '',
                                                                                                                                              !0
                                                                                                                                          ),
                                                                                                                                    i.value
                                                                                                                                        ? (n(),
                                                                                                                                          a(
                                                                                                                                              'button',
                                                                                                                                              {
                                                                                                                                                  key: 1,
                                                                                                                                                  onClick:
                                                                                                                                                      C(
                                                                                                                                                          Ne,
                                                                                                                                                          [
                                                                                                                                                              'stop',
                                                                                                                                                          ]
                                                                                                                                                      ),
                                                                                                                                                  class: 'rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                                                                                  title: 'Share article',
                                                                                                                                              },
                                                                                                                                              [
                                                                                                                                                  ...(e[23] ||
                                                                                                                                                      (e[23] =
                                                                                                                                                          [
                                                                                                                                                              t(
                                                                                                                                                                  'svg',
                                                                                                                                                                  {
                                                                                                                                                                      class: 'h-[18px] w-[18px]',
                                                                                                                                                                      fill: 'none',
                                                                                                                                                                      viewBox:
                                                                                                                                                                          '0 0 24 24',
                                                                                                                                                                      'stroke-width':
                                                                                                                                                                          '1.5',
                                                                                                                                                                      stroke: 'currentColor',
                                                                                                                                                                  },
                                                                                                                                                                  [
                                                                                                                                                                      t(
                                                                                                                                                                          'path',
                                                                                                                                                                          {
                                                                                                                                                                              'stroke-linecap':
                                                                                                                                                                                  'round',
                                                                                                                                                                              'stroke-linejoin':
                                                                                                                                                                                  'round',
                                                                                                                                                                              d: 'M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15',
                                                                                                                                                                          }
                                                                                                                                                                      ),
                                                                                                                                                                  ],
                                                                                                                                                                  -1
                                                                                                                                                              ),
                                                                                                                                                          ])),
                                                                                                                                              ]
                                                                                                                                          ))
                                                                                                                                        : u(
                                                                                                                                              '',
                                                                                                                                              !0
                                                                                                                                          ),
                                                                                                                                    i.value &&
                                                                                                                                    d(
                                                                                                                                        _
                                                                                                                                    )
                                                                                                                                        .enabled ===
                                                                                                                                        !0 &&
                                                                                                                                    d(
                                                                                                                                        G
                                                                                                                                    )
                                                                                                                                        ? (n(),
                                                                                                                                          a(
                                                                                                                                              'button',
                                                                                                                                              {
                                                                                                                                                  key: 2,
                                                                                                                                                  onClick:
                                                                                                                                                      C(
                                                                                                                                                          qe,
                                                                                                                                                          [
                                                                                                                                                              'stop',
                                                                                                                                                          ]
                                                                                                                                                      ),
                                                                                                                                                  class: 'rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                                                                                  title: 'Chat about this article',
                                                                                                                                              },
                                                                                                                                              [
                                                                                                                                                  ...(e[24] ||
                                                                                                                                                      (e[24] =
                                                                                                                                                          [
                                                                                                                                                              t(
                                                                                                                                                                  'svg',
                                                                                                                                                                  {
                                                                                                                                                                      class: 'h-4 w-4',
                                                                                                                                                                      fill: 'none',
                                                                                                                                                                      viewBox:
                                                                                                                                                                          '0 0 24 24',
                                                                                                                                                                      'stroke-width':
                                                                                                                                                                          '1.5',
                                                                                                                                                                      stroke: 'currentColor',
                                                                                                                                                                  },
                                                                                                                                                                  [
                                                                                                                                                                      t(
                                                                                                                                                                          'path',
                                                                                                                                                                          {
                                                                                                                                                                              'stroke-linecap':
                                                                                                                                                                                  'round',
                                                                                                                                                                              'stroke-linejoin':
                                                                                                                                                                                  'round',
                                                                                                                                                                              d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
                                                                                                                                                                          }
                                                                                                                                                                      ),
                                                                                                                                                                  ],
                                                                                                                                                                  -1
                                                                                                                                                              ),
                                                                                                                                                          ])),
                                                                                                                                              ]
                                                                                                                                          ))
                                                                                                                                        : u(
                                                                                                                                              '',
                                                                                                                                              !0
                                                                                                                                          ),
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                C(
                                                                                                                                                    I,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            class: 'rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                                                                            title: 'Collapse (Esc)',
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            ...(e[25] ||
                                                                                                                                                (e[25] =
                                                                                                                                                    [
                                                                                                                                                        t(
                                                                                                                                                            'svg',
                                                                                                                                                            {
                                                                                                                                                                class: 'h-4 w-4',
                                                                                                                                                                fill: 'none',
                                                                                                                                                                viewBox:
                                                                                                                                                                    '0 0 24 24',
                                                                                                                                                                'stroke-width':
                                                                                                                                                                    '1.5',
                                                                                                                                                                stroke: 'currentColor',
                                                                                                                                                            },
                                                                                                                                                            [
                                                                                                                                                                t(
                                                                                                                                                                    'path',
                                                                                                                                                                    {
                                                                                                                                                                        'stroke-linecap':
                                                                                                                                                                            'round',
                                                                                                                                                                        'stroke-linejoin':
                                                                                                                                                                            'round',
                                                                                                                                                                        d: 'M4.5 15.75l7.5-7.5 7.5 7.5',
                                                                                                                                                                    }
                                                                                                                                                                ),
                                                                                                                                                            ],
                                                                                                                                                            -1
                                                                                                                                                        ),
                                                                                                                                                    ])),
                                                                                                                                        ]
                                                                                                                                    ),
                                                                                                                                ]
                                                                                                                            )),
                                                                                                                  ],
                                                                                                                  10,
                                                                                                                  Ut
                                                                                                              ),
                                                                                                              k.value ===
                                                                                                              l.id
                                                                                                                  ? (n(),
                                                                                                                    a(
                                                                                                                        'div',
                                                                                                                        {
                                                                                                                            key: 0,
                                                                                                                            id: `article-expanded-${l.id}`,
                                                                                                                            class: 'border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50',
                                                                                                                        },
                                                                                                                        [
                                                                                                                            U.value &&
                                                                                                                            !i.value
                                                                                                                                ? (n(),
                                                                                                                                  a(
                                                                                                                                      'div',
                                                                                                                                      nr,
                                                                                                                                      [
                                                                                                                                          ...(e[26] ||
                                                                                                                                              (e[26] =
                                                                                                                                                  [
                                                                                                                                                      t(
                                                                                                                                                          'svg',
                                                                                                                                                          {
                                                                                                                                                              class: 'h-8 w-8 animate-spin text-neutral-400',
                                                                                                                                                              fill: 'none',
                                                                                                                                                              viewBox:
                                                                                                                                                                  '0 0 24 24',
                                                                                                                                                          },
                                                                                                                                                          [
                                                                                                                                                              t(
                                                                                                                                                                  'circle',
                                                                                                                                                                  {
                                                                                                                                                                      class: 'opacity-25',
                                                                                                                                                                      cx: '12',
                                                                                                                                                                      cy: '12',
                                                                                                                                                                      r: '10',
                                                                                                                                                                      stroke: 'currentColor',
                                                                                                                                                                      'stroke-width':
                                                                                                                                                                          '4',
                                                                                                                                                                  }
                                                                                                                                                              ),
                                                                                                                                                              t(
                                                                                                                                                                  'path',
                                                                                                                                                                  {
                                                                                                                                                                      class: 'opacity-75',
                                                                                                                                                                      fill: 'currentColor',
                                                                                                                                                                      d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                                                                                                                                  }
                                                                                                                                                              ),
                                                                                                                                                          ],
                                                                                                                                                          -1
                                                                                                                                                      ),
                                                                                                                                                  ])),
                                                                                                                                      ]
                                                                                                                                  ))
                                                                                                                                : u(
                                                                                                                                      '',
                                                                                                                                      !0
                                                                                                                                  ),
                                                                                                                            i.value
                                                                                                                                ? (n(),
                                                                                                                                  a(
                                                                                                                                      f,
                                                                                                                                      {
                                                                                                                                          key: 1,
                                                                                                                                      },
                                                                                                                                      [
                                                                                                                                          t(
                                                                                                                                              'article',
                                                                                                                                              ar,
                                                                                                                                              [
                                                                                                                                                  t(
                                                                                                                                                      'div',
                                                                                                                                                      lr,
                                                                                                                                                      [
                                                                                                                                                          i
                                                                                                                                                              .value
                                                                                                                                                              .author
                                                                                                                                                              ? (n(),
                                                                                                                                                                a(
                                                                                                                                                                    'span',
                                                                                                                                                                    or,
                                                                                                                                                                    p(
                                                                                                                                                                        i
                                                                                                                                                                            .value
                                                                                                                                                                            .author
                                                                                                                                                                    ),
                                                                                                                                                                    1
                                                                                                                                                                ))
                                                                                                                                                              : u(
                                                                                                                                                                    '',
                                                                                                                                                                    !0
                                                                                                                                                                ),
                                                                                                                                                          i
                                                                                                                                                              .value
                                                                                                                                                              .author
                                                                                                                                                              ? (n(),
                                                                                                                                                                a(
                                                                                                                                                                    'span',
                                                                                                                                                                    sr,
                                                                                                                                                                    '·'
                                                                                                                                                                ))
                                                                                                                                                              : u(
                                                                                                                                                                    '',
                                                                                                                                                                    !0
                                                                                                                                                                ),
                                                                                                                                                          t(
                                                                                                                                                              'span',
                                                                                                                                                              null,
                                                                                                                                                              p(
                                                                                                                                                                  Ye.value
                                                                                                                                                              ) +
                                                                                                                                                                  ' at ' +
                                                                                                                                                                  p(
                                                                                                                                                                      Ue.value
                                                                                                                                                                  ),
                                                                                                                                                              1
                                                                                                                                                          ),
                                                                                                                                                      ]
                                                                                                                                                  ),
                                                                                                                                                  Pe.value
                                                                                                                                                      ? (n(),
                                                                                                                                                        a(
                                                                                                                                                            'img',
                                                                                                                                                            {
                                                                                                                                                                key: 0,
                                                                                                                                                                src: i
                                                                                                                                                                    .value
                                                                                                                                                                    .image_url,
                                                                                                                                                                alt: i
                                                                                                                                                                    .value
                                                                                                                                                                    .title,
                                                                                                                                                                class: 'mb-6 w-full max-h-80 object-cover rounded-lg',
                                                                                                                                                                loading:
                                                                                                                                                                    'lazy',
                                                                                                                                                            },
                                                                                                                                                            null,
                                                                                                                                                            8,
                                                                                                                                                            ir
                                                                                                                                                        ))
                                                                                                                                                      : u(
                                                                                                                                                            '',
                                                                                                                                                            !0
                                                                                                                                                        ),
                                                                                                                                                  t(
                                                                                                                                                      'div',
                                                                                                                                                      {
                                                                                                                                                          class: 'article-content prose max-w-none dark:prose-invert prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-pre:bg-white dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-img:rounded-lg prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-500 dark:prose-blockquote:text-neutral-400',
                                                                                                                                                          innerHTML:
                                                                                                                                                              Oe.value,
                                                                                                                                                      },
                                                                                                                                                      null,
                                                                                                                                                      8,
                                                                                                                                                      ur
                                                                                                                                                  ),
                                                                                                                                                  !i
                                                                                                                                                      .value
                                                                                                                                                      .content &&
                                                                                                                                                  !i
                                                                                                                                                      .value
                                                                                                                                                      .summary
                                                                                                                                                      ? (n(),
                                                                                                                                                        a(
                                                                                                                                                            'div',
                                                                                                                                                            dr,
                                                                                                                                                            [
                                                                                                                                                                t(
                                                                                                                                                                    'p',
                                                                                                                                                                    cr,
                                                                                                                                                                    p(
                                                                                                                                                                        i
                                                                                                                                                                            .value
                                                                                                                                                                            ._offline
                                                                                                                                                                            ? "This article wasn't downloaded for offline reading."
                                                                                                                                                                            : 'No article content available.'
                                                                                                                                                                    ),
                                                                                                                                                                    1
                                                                                                                                                                ),
                                                                                                                                                                i
                                                                                                                                                                    .value
                                                                                                                                                                    .url &&
                                                                                                                                                                d(
                                                                                                                                                                    G
                                                                                                                                                                )
                                                                                                                                                                    ? (n(),
                                                                                                                                                                      a(
                                                                                                                                                                          'a',
                                                                                                                                                                          {
                                                                                                                                                                              key: 0,
                                                                                                                                                                              href: i
                                                                                                                                                                                  .value
                                                                                                                                                                                  .url,
                                                                                                                                                                              target: '_blank',
                                                                                                                                                                              rel: 'noopener noreferrer',
                                                                                                                                                                              class: 'mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors',
                                                                                                                                                                          },
                                                                                                                                                                          ' Read on original site ',
                                                                                                                                                                          8,
                                                                                                                                                                          vr
                                                                                                                                                                      ))
                                                                                                                                                                    : u(
                                                                                                                                                                          '',
                                                                                                                                                                          !0
                                                                                                                                                                      ),
                                                                                                                                                            ]
                                                                                                                                                        ))
                                                                                                                                                      : u(
                                                                                                                                                            '',
                                                                                                                                                            !0
                                                                                                                                                        ),
                                                                                                                                                  e[27] ||
                                                                                                                                                      (e[27] =
                                                                                                                                                          kt(
                                                                                                                                                              '<div class="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs text-neutral-400 dark:text-neutral-600" data-v-0c3622a1><span class="font-medium text-neutral-500" data-v-0c3622a1>Shortcuts:</span><span class="ml-2" data-v-0c3622a1><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>j</kbd>/<kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>k</kbd> or <kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>←</kbd>/<kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>→</kbd> navigate</span><span class="ml-2" data-v-0c3622a1><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>s</kbd> save</span><span class="ml-2" data-v-0c3622a1><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>m</kbd> mark unread</span><span class="ml-2" data-v-0c3622a1><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-0c3622a1>Esc</kbd> close</span></div>',
                                                                                                                                                              1
                                                                                                                                                          )),
                                                                                                                                              ]
                                                                                                                                          ),
                                                                                                                                          ee.value ===
                                                                                                                                          l.id
                                                                                                                                              ? (n(),
                                                                                                                                                a(
                                                                                                                                                    'div',
                                                                                                                                                    fr,
                                                                                                                                                    [
                                                                                                                                                        ht(
                                                                                                                                                            mt,
                                                                                                                                                            {
                                                                                                                                                                inline: '',
                                                                                                                                                                onClose:
                                                                                                                                                                    X,
                                                                                                                                                            }
                                                                                                                                                        ),
                                                                                                                                                    ]
                                                                                                                                                ))
                                                                                                                                              : u(
                                                                                                                                                    '',
                                                                                                                                                    !0
                                                                                                                                                ),
                                                                                                                                      ],
                                                                                                                                      64
                                                                                                                                  ))
                                                                                                                                : u(
                                                                                                                                      '',
                                                                                                                                      !0
                                                                                                                                  ),
                                                                                                                        ],
                                                                                                                        8,
                                                                                                                        rr
                                                                                                                    ))
                                                                                                                  : u(
                                                                                                                        '',
                                                                                                                        !0
                                                                                                                    ),
                                                                                                          ],
                                                                                                          64
                                                                                                      )
                                                                                                  )
                                                                                              ),
                                                                                              128
                                                                                          )),
                                                                                      ]
                                                                                  ),
                                                                              ],
                                                                              64
                                                                          )
                                                                      )
                                                                  ),
                                                                  128
                                                              )),
                                                              t(
                                                                  'div',
                                                                  {
                                                                      ref_key:
                                                                          'loadMoreSentinel',
                                                                      ref: q,
                                                                      class: 'h-px',
                                                                  },
                                                                  null,
                                                                  512
                                                              ),
                                                              d(o).loadingMore
                                                                  ? (n(),
                                                                    a('div', pr, [
                                                                        ...(e[28] ||
                                                                            (e[28] = [
                                                                                t(
                                                                                    'svg',
                                                                                    {
                                                                                        class: 'h-6 w-6 animate-spin text-neutral-400',
                                                                                        viewBox:
                                                                                            '0 0 24 24',
                                                                                        fill: 'none',
                                                                                    },
                                                                                    [
                                                                                        t(
                                                                                            'circle',
                                                                                            {
                                                                                                class: 'opacity-25',
                                                                                                cx: '12',
                                                                                                cy: '12',
                                                                                                r: '10',
                                                                                                stroke: 'currentColor',
                                                                                                'stroke-width':
                                                                                                    '4',
                                                                                            }
                                                                                        ),
                                                                                        t(
                                                                                            'path',
                                                                                            {
                                                                                                class: 'opacity-75',
                                                                                                fill: 'currentColor',
                                                                                                d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z',
                                                                                            }
                                                                                        ),
                                                                                    ],
                                                                                    -1
                                                                                ),
                                                                            ])),
                                                                    ]))
                                                                  : u('', !0),
                                                              !d(o).hasMore &&
                                                              d(o).loaded &&
                                                              $.value &&
                                                              Object.keys($.value).length > 0
                                                                  ? (n(),
                                                                    a(
                                                                        'div',
                                                                        kr,
                                                                        ' No more articles '
                                                                    ))
                                                                  : u('', !0),
                                                          ],
                                                          64
                                                      ))
                                                    : (n(),
                                                      a('div', hr, [
                                                          d(o).loadError
                                                              ? (n(),
                                                                Ee(
                                                                    $e,
                                                                    {
                                                                        key: 0,
                                                                        reason: d(o).loadError,
                                                                    },
                                                                    null,
                                                                    8,
                                                                    ['reason']
                                                                ))
                                                              : E.value === 'read_later'
                                                                ? (n(),
                                                                  a(
                                                                      f,
                                                                      { key: 1 },
                                                                      [
                                                                          e[29] ||
                                                                              (e[29] = t(
                                                                                  'svg',
                                                                                  {
                                                                                      class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                      fill: 'none',
                                                                                      viewBox:
                                                                                          '0 0 24 24',
                                                                                      'stroke-width':
                                                                                          '1',
                                                                                      stroke: 'currentColor',
                                                                                  },
                                                                                  [
                                                                                      t(
                                                                                          'path',
                                                                                          {
                                                                                              'stroke-linecap':
                                                                                                  'round',
                                                                                              'stroke-linejoin':
                                                                                                  'round',
                                                                                              d: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
                                                                                          }
                                                                                      ),
                                                                                  ],
                                                                                  -1
                                                                              )),
                                                                          e[30] ||
                                                                              (e[30] = t(
                                                                                  'h3',
                                                                                  {
                                                                                      class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                  },
                                                                                  ' No saved articles ',
                                                                                  -1
                                                                              )),
                                                                          e[31] ||
                                                                              (e[31] = t(
                                                                                  'p',
                                                                                  {
                                                                                      class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                  },
                                                                                  ' Save articles from your feeds to read later. ',
                                                                                  -1
                                                                              )),
                                                                      ],
                                                                      64
                                                                  ))
                                                                : xe.value === 0
                                                                  ? (n(),
                                                                    a(
                                                                        f,
                                                                        { key: 2 },
                                                                        [
                                                                            e[32] ||
                                                                                (e[32] = t(
                                                                                    'svg',
                                                                                    {
                                                                                        class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                        fill: 'none',
                                                                                        viewBox:
                                                                                            '0 0 24 24',
                                                                                        'stroke-width':
                                                                                            '1',
                                                                                        stroke: 'currentColor',
                                                                                    },
                                                                                    [
                                                                                        t(
                                                                                            'path',
                                                                                            {
                                                                                                'stroke-linecap':
                                                                                                    'round',
                                                                                                'stroke-linejoin':
                                                                                                    'round',
                                                                                                d: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
                                                                                            }
                                                                                        ),
                                                                                    ],
                                                                                    -1
                                                                                )),
                                                                            e[33] ||
                                                                                (e[33] = t(
                                                                                    'h3',
                                                                                    {
                                                                                        class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                    },
                                                                                    ' No articles yet ',
                                                                                    -1
                                                                                )),
                                                                            e[34] ||
                                                                                (e[34] = t(
                                                                                    'p',
                                                                                    {
                                                                                        class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                    },
                                                                                    ' Subscribe to feeds to start seeing articles here. ',
                                                                                    -1
                                                                                )),
                                                                            t(
                                                                                'button',
                                                                                {
                                                                                    type: 'button',
                                                                                    onClick:
                                                                                        e[5] ||
                                                                                        (e[5] =
                                                                                            s =>
                                                                                                d(
                                                                                                    K
                                                                                                )()),
                                                                                    class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                                                },
                                                                                ' Add a Feed '
                                                                            ),
                                                                        ],
                                                                        64
                                                                    ))
                                                                  : D.value
                                                                    ? (n(),
                                                                      a(
                                                                          f,
                                                                          { key: 3 },
                                                                          [
                                                                              e[35] ||
                                                                                  (e[35] = t(
                                                                                      'svg',
                                                                                      {
                                                                                          class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                          fill: 'none',
                                                                                          viewBox:
                                                                                              '0 0 24 24',
                                                                                          'stroke-width':
                                                                                              '1',
                                                                                          stroke: 'currentColor',
                                                                                      },
                                                                                      [
                                                                                          t(
                                                                                              'path',
                                                                                              {
                                                                                                  'stroke-linecap':
                                                                                                      'round',
                                                                                                  'stroke-linejoin':
                                                                                                      'round',
                                                                                                  d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                                                                              }
                                                                                          ),
                                                                                      ],
                                                                                      -1
                                                                                  )),
                                                                              e[36] ||
                                                                                  (e[36] = t(
                                                                                      'h3',
                                                                                      {
                                                                                          class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                      },
                                                                                      ' All caught up ',
                                                                                      -1
                                                                                  )),
                                                                              e[37] ||
                                                                                  (e[37] = t(
                                                                                      'p',
                                                                                      {
                                                                                          class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                      },
                                                                                      ' No unread articles in this feed. ',
                                                                                      -1
                                                                                  )),
                                                                              t(
                                                                                  'button',
                                                                                  {
                                                                                      type: 'button',
                                                                                      onClick:
                                                                                          e[6] ||
                                                                                          (e[6] =
                                                                                              s =>
                                                                                                  d(
                                                                                                      o
                                                                                                  ).showAllArticles()),
                                                                                      class: 'mt-4 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                                                  },
                                                                                  ' Show all articles '
                                                                              ),
                                                                          ],
                                                                          64
                                                                      ))
                                                                    : (n(),
                                                                      a(
                                                                          f,
                                                                          { key: 4 },
                                                                          [
                                                                              e[38] ||
                                                                                  (e[38] = t(
                                                                                      'svg',
                                                                                      {
                                                                                          class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                          fill: 'none',
                                                                                          viewBox:
                                                                                              '0 0 24 24',
                                                                                          'stroke-width':
                                                                                              '1',
                                                                                          stroke: 'currentColor',
                                                                                      },
                                                                                      [
                                                                                          t(
                                                                                              'path',
                                                                                              {
                                                                                                  'stroke-linecap':
                                                                                                      'round',
                                                                                                  'stroke-linejoin':
                                                                                                      'round',
                                                                                                  d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                                                                              }
                                                                                          ),
                                                                                      ],
                                                                                      -1
                                                                                  )),
                                                                              e[39] ||
                                                                                  (e[39] = t(
                                                                                      'h3',
                                                                                      {
                                                                                          class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                      },
                                                                                      ' All caught up ',
                                                                                      -1
                                                                                  )),
                                                                              e[40] ||
                                                                                  (e[40] = t(
                                                                                      'p',
                                                                                      {
                                                                                          class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                      },
                                                                                      ' No unread articles. ',
                                                                                      -1
                                                                                  )),
                                                                              t(
                                                                                  'button',
                                                                                  {
                                                                                      type: 'button',
                                                                                      onClick:
                                                                                          e[7] ||
                                                                                          (e[7] =
                                                                                              s =>
                                                                                                  d(
                                                                                                      o
                                                                                                  ).showAllArticles()),
                                                                                      class: 'mt-4 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                                                  },
                                                                                  ' Show all articles '
                                                                              ),
                                                                          ],
                                                                          64
                                                                      )),
                                                      ])),
                                            ],
                                            544
                                        ),
                                    ]))
                                  : (n(),
                                    a(
                                        f,
                                        { key: 3 },
                                        [
                                            e[59] ||
                                                (e[59] = t(
                                                    'div',
                                                    {
                                                        style: {
                                                            height: 'calc(2.75rem + env(safe-area-inset-top, 0px))',
                                                        },
                                                    },
                                                    null,
                                                    -1
                                                )),
                                            t(
                                                'div',
                                                {
                                                    class: y([
                                                        'flex items-center justify-center overflow-hidden transition-all duration-200',
                                                        { 'transition-none': V.value },
                                                    ]),
                                                    style: Y({ height: A.value + 'px' }),
                                                },
                                                [
                                                    t('div', xr, [
                                                        (n(),
                                                        a(
                                                            'svg',
                                                            {
                                                                class: y([
                                                                    'h-5 w-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200',
                                                                    {
                                                                        'animate-spin':
                                                                            S.value,
                                                                    },
                                                                ]),
                                                                style: Y(
                                                                    S.value
                                                                        ? {}
                                                                        : {
                                                                              transform: `rotate(${Math.min(A.value / ue, 1) * 360}deg)`,
                                                                          }
                                                                ),
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '1.5',
                                                                stroke: 'currentColor',
                                                            },
                                                            [
                                                                ...(e[41] ||
                                                                    (e[41] = [
                                                                        t(
                                                                            'path',
                                                                            {
                                                                                'stroke-linecap':
                                                                                    'round',
                                                                                'stroke-linejoin':
                                                                                    'round',
                                                                                d: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182',
                                                                            },
                                                                            null,
                                                                            -1
                                                                        ),
                                                                    ])),
                                                            ],
                                                            6
                                                        )),
                                                        !S.value && A.value >= ue
                                                            ? (n(),
                                                              a(
                                                                  'span',
                                                                  mr,
                                                                  'Release to refresh'
                                                              ))
                                                            : S.value
                                                              ? (n(),
                                                                a('span', gr, 'Refreshing...'))
                                                              : u('', !0),
                                                    ]),
                                                ],
                                                6
                                            ),
                                            t(
                                                'div',
                                                {
                                                    class: 'touch-pan-y',
                                                    onTouchstartPassive: Qe,
                                                    onTouchmovePassive: Ze,
                                                    onTouchend: Ge,
                                                },
                                                [
                                                    d(o).articles.length === 0 && !d(o).loading
                                                        ? (n(),
                                                          a('div', br, [
                                                              d(o).loadError
                                                                  ? (n(),
                                                                    Ee(
                                                                        $e,
                                                                        {
                                                                            key: 0,
                                                                            reason: d(o)
                                                                                .loadError,
                                                                        },
                                                                        null,
                                                                        8,
                                                                        ['reason']
                                                                    ))
                                                                  : E.value === 'read_later'
                                                                    ? (n(),
                                                                      a(
                                                                          f,
                                                                          { key: 1 },
                                                                          [
                                                                              e[42] ||
                                                                                  (e[42] = t(
                                                                                      'svg',
                                                                                      {
                                                                                          class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                          fill: 'none',
                                                                                          viewBox:
                                                                                              '0 0 24 24',
                                                                                          'stroke-width':
                                                                                              '1',
                                                                                          stroke: 'currentColor',
                                                                                      },
                                                                                      [
                                                                                          t(
                                                                                              'path',
                                                                                              {
                                                                                                  'stroke-linecap':
                                                                                                      'round',
                                                                                                  'stroke-linejoin':
                                                                                                      'round',
                                                                                                  d: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
                                                                                              }
                                                                                          ),
                                                                                      ],
                                                                                      -1
                                                                                  )),
                                                                              e[43] ||
                                                                                  (e[43] = t(
                                                                                      'h3',
                                                                                      {
                                                                                          class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                      },
                                                                                      ' No saved articles ',
                                                                                      -1
                                                                                  )),
                                                                              e[44] ||
                                                                                  (e[44] = t(
                                                                                      'p',
                                                                                      {
                                                                                          class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                      },
                                                                                      ' Save articles from your feeds to read later. ',
                                                                                      -1
                                                                                  )),
                                                                          ],
                                                                          64
                                                                      ))
                                                                    : xe.value === 0
                                                                      ? (n(),
                                                                        a(
                                                                            f,
                                                                            { key: 2 },
                                                                            [
                                                                                e[45] ||
                                                                                    (e[45] = t(
                                                                                        'svg',
                                                                                        {
                                                                                            class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                            fill: 'none',
                                                                                            viewBox:
                                                                                                '0 0 24 24',
                                                                                            'stroke-width':
                                                                                                '1',
                                                                                            stroke: 'currentColor',
                                                                                        },
                                                                                        [
                                                                                            t(
                                                                                                'path',
                                                                                                {
                                                                                                    'stroke-linecap':
                                                                                                        'round',
                                                                                                    'stroke-linejoin':
                                                                                                        'round',
                                                                                                    d: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
                                                                                                }
                                                                                            ),
                                                                                        ],
                                                                                        -1
                                                                                    )),
                                                                                e[46] ||
                                                                                    (e[46] = t(
                                                                                        'h3',
                                                                                        {
                                                                                            class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                        },
                                                                                        ' No articles yet ',
                                                                                        -1
                                                                                    )),
                                                                                e[47] ||
                                                                                    (e[47] = t(
                                                                                        'p',
                                                                                        {
                                                                                            class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                        },
                                                                                        ' Subscribe to feeds to start seeing articles here. ',
                                                                                        -1
                                                                                    )),
                                                                                t(
                                                                                    'button',
                                                                                    {
                                                                                        type: 'button',
                                                                                        onClick:
                                                                                            e[8] ||
                                                                                            (e[8] =
                                                                                                s =>
                                                                                                    d(
                                                                                                        K
                                                                                                    )()),
                                                                                        class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                                                    },
                                                                                    ' Add a Feed '
                                                                                ),
                                                                            ],
                                                                            64
                                                                        ))
                                                                      : D.value
                                                                        ? (n(),
                                                                          a(
                                                                              f,
                                                                              { key: 3 },
                                                                              [
                                                                                  e[48] ||
                                                                                      (e[48] =
                                                                                          t(
                                                                                              'svg',
                                                                                              {
                                                                                                  class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                                  fill: 'none',
                                                                                                  viewBox:
                                                                                                      '0 0 24 24',
                                                                                                  'stroke-width':
                                                                                                      '1',
                                                                                                  stroke: 'currentColor',
                                                                                              },
                                                                                              [
                                                                                                  t(
                                                                                                      'path',
                                                                                                      {
                                                                                                          'stroke-linecap':
                                                                                                              'round',
                                                                                                          'stroke-linejoin':
                                                                                                              'round',
                                                                                                          d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                                                                                      }
                                                                                                  ),
                                                                                              ],
                                                                                              -1
                                                                                          )),
                                                                                  e[49] ||
                                                                                      (e[49] =
                                                                                          t(
                                                                                              'h3',
                                                                                              {
                                                                                                  class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                              },
                                                                                              ' All caught up ',
                                                                                              -1
                                                                                          )),
                                                                                  e[50] ||
                                                                                      (e[50] =
                                                                                          t(
                                                                                              'p',
                                                                                              {
                                                                                                  class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                              },
                                                                                              ' No unread articles in this feed. ',
                                                                                              -1
                                                                                          )),
                                                                                  t(
                                                                                      'button',
                                                                                      {
                                                                                          type: 'button',
                                                                                          onClick:
                                                                                              e[9] ||
                                                                                              (e[9] =
                                                                                                  s =>
                                                                                                      d(
                                                                                                          o
                                                                                                      ).showAllArticles()),
                                                                                          class: 'mt-4 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                                                      },
                                                                                      ' Show all articles '
                                                                                  ),
                                                                              ],
                                                                              64
                                                                          ))
                                                                        : (n(),
                                                                          a(
                                                                              f,
                                                                              { key: 4 },
                                                                              [
                                                                                  e[51] ||
                                                                                      (e[51] =
                                                                                          t(
                                                                                              'svg',
                                                                                              {
                                                                                                  class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                                                                  fill: 'none',
                                                                                                  viewBox:
                                                                                                      '0 0 24 24',
                                                                                                  'stroke-width':
                                                                                                      '1',
                                                                                                  stroke: 'currentColor',
                                                                                              },
                                                                                              [
                                                                                                  t(
                                                                                                      'path',
                                                                                                      {
                                                                                                          'stroke-linecap':
                                                                                                              'round',
                                                                                                          'stroke-linejoin':
                                                                                                              'round',
                                                                                                          d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                                                                                      }
                                                                                                  ),
                                                                                              ],
                                                                                              -1
                                                                                          )),
                                                                                  e[52] ||
                                                                                      (e[52] =
                                                                                          t(
                                                                                              'h3',
                                                                                              {
                                                                                                  class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                              },
                                                                                              ' All caught up ',
                                                                                              -1
                                                                                          )),
                                                                                  e[53] ||
                                                                                      (e[53] =
                                                                                          t(
                                                                                              'p',
                                                                                              {
                                                                                                  class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                                                              },
                                                                                              ' No unread articles. ',
                                                                                              -1
                                                                                          )),
                                                                                  t(
                                                                                      'button',
                                                                                      {
                                                                                          type: 'button',
                                                                                          onClick:
                                                                                              e[10] ||
                                                                                              (e[10] =
                                                                                                  s =>
                                                                                                      d(
                                                                                                          o
                                                                                                      ).showAllArticles()),
                                                                                          class: 'mt-4 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                                                      },
                                                                                      ' Show all articles '
                                                                                  ),
                                                                              ],
                                                                              64
                                                                          )),
                                                          ]))
                                                        : d(o).articles.length > 0
                                                          ? (n(),
                                                            a('div', wr, [
                                                                (n(!0),
                                                                a(
                                                                    f,
                                                                    null,
                                                                    Z(
                                                                        $.value,
                                                                        (s, c) => (
                                                                            n(),
                                                                            a(
                                                                                f,
                                                                                { key: c },
                                                                                [
                                                                                    t(
                                                                                        'div',
                                                                                        yr,
                                                                                        [
                                                                                            t(
                                                                                                'h2',
                                                                                                Cr,
                                                                                                p(
                                                                                                    c
                                                                                                ),
                                                                                                1
                                                                                            ),
                                                                                        ]
                                                                                    ),
                                                                                    t(
                                                                                        'div',
                                                                                        null,
                                                                                        [
                                                                                            (n(
                                                                                                !0
                                                                                            ),
                                                                                            a(
                                                                                                f,
                                                                                                null,
                                                                                                Z(
                                                                                                    s,
                                                                                                    l => (
                                                                                                        n(),
                                                                                                        a(
                                                                                                            'div',
                                                                                                            {
                                                                                                                key: l.id,
                                                                                                                class: 'relative overflow-hidden border-b border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-200 dark:bg-neutral-800',
                                                                                                            },
                                                                                                            [
                                                                                                                oe(
                                                                                                                    l.id
                                                                                                                ) &&
                                                                                                                Be(
                                                                                                                    l.id
                                                                                                                ) ===
                                                                                                                    'right'
                                                                                                                    ? (n(),
                                                                                                                      a(
                                                                                                                          'div',
                                                                                                                          _r,
                                                                                                                          [
                                                                                                                              e[54] ||
                                                                                                                                  (e[54] =
                                                                                                                                      t(
                                                                                                                                          'svg',
                                                                                                                                          {
                                                                                                                                              class: 'h-5 w-5 text-white',
                                                                                                                                              fill: 'none',
                                                                                                                                              viewBox:
                                                                                                                                                  '0 0 24 24',
                                                                                                                                              'stroke-width':
                                                                                                                                                  '1.5',
                                                                                                                                              stroke: 'currentColor',
                                                                                                                                          },
                                                                                                                                          [
                                                                                                                                              t(
                                                                                                                                                  'path',
                                                                                                                                                  {
                                                                                                                                                      'stroke-linecap':
                                                                                                                                                          'round',
                                                                                                                                                      'stroke-linejoin':
                                                                                                                                                          'round',
                                                                                                                                                      d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
                                                                                                                                                  }
                                                                                                                                              ),
                                                                                                                                          ],
                                                                                                                                          -1
                                                                                                                                      )),
                                                                                                                              t(
                                                                                                                                  'span',
                                                                                                                                  Mr,
                                                                                                                                  p(
                                                                                                                                      l.is_read_later
                                                                                                                                          ? 'Saved'
                                                                                                                                          : 'Read Later'
                                                                                                                                  ),
                                                                                                                                  1
                                                                                                                              ),
                                                                                                                          ]
                                                                                                                      ))
                                                                                                                    : u(
                                                                                                                          '',
                                                                                                                          !0
                                                                                                                      ),
                                                                                                                oe(
                                                                                                                    l.id
                                                                                                                ) &&
                                                                                                                Be(
                                                                                                                    l.id
                                                                                                                ) ===
                                                                                                                    'left'
                                                                                                                    ? (n(),
                                                                                                                      a(
                                                                                                                          'div',
                                                                                                                          Ar,
                                                                                                                          [
                                                                                                                              e[55] ||
                                                                                                                                  (e[55] =
                                                                                                                                      t(
                                                                                                                                          'svg',
                                                                                                                                          {
                                                                                                                                              class: 'h-5 w-5 text-white',
                                                                                                                                              fill: 'none',
                                                                                                                                              viewBox:
                                                                                                                                                  '0 0 24 24',
                                                                                                                                              'stroke-width':
                                                                                                                                                  '1.5',
                                                                                                                                              stroke: 'currentColor',
                                                                                                                                          },
                                                                                                                                          [
                                                                                                                                              t(
                                                                                                                                                  'path',
                                                                                                                                                  {
                                                                                                                                                      'stroke-linecap':
                                                                                                                                                          'round',
                                                                                                                                                      'stroke-linejoin':
                                                                                                                                                          'round',
                                                                                                                                                      d: 'M4.5 12.75l6 6 9-13.5',
                                                                                                                                                  }
                                                                                                                                              ),
                                                                                                                                          ],
                                                                                                                                          -1
                                                                                                                                      )),
                                                                                                                              t(
                                                                                                                                  'span',
                                                                                                                                  Sr,
                                                                                                                                  p(
                                                                                                                                      l.is_read
                                                                                                                                          ? 'Mark as Unread'
                                                                                                                                          : 'Mark as Read'
                                                                                                                                  ),
                                                                                                                                  1
                                                                                                                              ),
                                                                                                                          ]
                                                                                                                      ))
                                                                                                                    : u(
                                                                                                                          '',
                                                                                                                          !0
                                                                                                                      ),
                                                                                                                t(
                                                                                                                    'button',
                                                                                                                    {
                                                                                                                        onClick:
                                                                                                                            v =>
                                                                                                                                !oe(
                                                                                                                                    l.id
                                                                                                                                ) &&
                                                                                                                                O(
                                                                                                                                    l
                                                                                                                                ),
                                                                                                                        onTouchstart:
                                                                                                                            v =>
                                                                                                                                Ke(
                                                                                                                                    l.id,
                                                                                                                                    v
                                                                                                                                ),
                                                                                                                        onTouchmove:
                                                                                                                            v =>
                                                                                                                                Je(
                                                                                                                                    l.id,
                                                                                                                                    v
                                                                                                                                ),
                                                                                                                        onTouchend:
                                                                                                                            v =>
                                                                                                                                et(
                                                                                                                                    l.id,
                                                                                                                                    l
                                                                                                                                ),
                                                                                                                        class: 'relative flex w-full gap-3 bg-white dark:bg-neutral-950 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:bg-neutral-100 dark:active:bg-neutral-800/50',
                                                                                                                        style: Y(
                                                                                                                            tt(
                                                                                                                                l.id
                                                                                                                            )
                                                                                                                        ),
                                                                                                                    },
                                                                                                                    [
                                                                                                                        t(
                                                                                                                            'div',
                                                                                                                            Lr,
                                                                                                                            [
                                                                                                                                t(
                                                                                                                                    'h3',
                                                                                                                                    {
                                                                                                                                        class: y(
                                                                                                                                            [
                                                                                                                                                'text-sm leading-snug',
                                                                                                                                                l.is_read
                                                                                                                                                    ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                                                                                                                                                    : 'text-neutral-900 dark:text-neutral-100 font-semibold',
                                                                                                                                            ]
                                                                                                                                        ),
                                                                                                                                    },
                                                                                                                                    p(
                                                                                                                                        l.title
                                                                                                                                    ),
                                                                                                                                    3
                                                                                                                                ),
                                                                                                                                t(
                                                                                                                                    'div',
                                                                                                                                    jr,
                                                                                                                                    [
                                                                                                                                        D.value
                                                                                                                                            ? u(
                                                                                                                                                  '',
                                                                                                                                                  !0
                                                                                                                                              )
                                                                                                                                            : (n(),
                                                                                                                                              a(
                                                                                                                                                  f,
                                                                                                                                                  {
                                                                                                                                                      key: 0,
                                                                                                                                                  },
                                                                                                                                                  [
                                                                                                                                                      l.feed_favicon_url
                                                                                                                                                          ? (n(),
                                                                                                                                                            a(
                                                                                                                                                                'img',
                                                                                                                                                                {
                                                                                                                                                                    key: 0,
                                                                                                                                                                    src: l.feed_favicon_url,
                                                                                                                                                                    class: 'h-3.5 w-3.5 rounded-sm',
                                                                                                                                                                    alt: '',
                                                                                                                                                                },
                                                                                                                                                                null,
                                                                                                                                                                8,
                                                                                                                                                                Rr
                                                                                                                                                            ))
                                                                                                                                                          : u(
                                                                                                                                                                '',
                                                                                                                                                                !0
                                                                                                                                                            ),
                                                                                                                                                      t(
                                                                                                                                                          'span',
                                                                                                                                                          {
                                                                                                                                                              class: 'truncate hover:underline',
                                                                                                                                                              onClick:
                                                                                                                                                                  C(
                                                                                                                                                                      v =>
                                                                                                                                                                          Me(
                                                                                                                                                                              l.feed_id
                                                                                                                                                                          ),
                                                                                                                                                                      [
                                                                                                                                                                          'stop',
                                                                                                                                                                      ]
                                                                                                                                                                  ),
                                                                                                                                                          },
                                                                                                                                                          p(
                                                                                                                                                              l.feed_title
                                                                                                                                                          ),
                                                                                                                                                          9,
                                                                                                                                                          Br
                                                                                                                                                      ),
                                                                                                                                                      e[56] ||
                                                                                                                                                          (e[56] =
                                                                                                                                                              t(
                                                                                                                                                                  'span',
                                                                                                                                                                  null,
                                                                                                                                                                  '·',
                                                                                                                                                                  -1
                                                                                                                                                              )),
                                                                                                                                                  ],
                                                                                                                                                  64
                                                                                                                                              )),
                                                                                                                                        t(
                                                                                                                                            'span',
                                                                                                                                            zr,
                                                                                                                                            p(
                                                                                                                                                me(
                                                                                                                                                    l.published_at
                                                                                                                                                )
                                                                                                                                            ),
                                                                                                                                            1
                                                                                                                                        ),
                                                                                                                                    ]
                                                                                                                                ),
                                                                                                                            ]
                                                                                                                        ),
                                                                                                                        l.image_url
                                                                                                                            ? (n(),
                                                                                                                              a(
                                                                                                                                  'img',
                                                                                                                                  {
                                                                                                                                      key: 0,
                                                                                                                                      src: l.image_url,
                                                                                                                                      class: 'h-16 w-16 shrink-0 rounded-lg object-cover',
                                                                                                                                      alt: l.title,
                                                                                                                                      loading:
                                                                                                                                          'lazy',
                                                                                                                                  },
                                                                                                                                  null,
                                                                                                                                  8,
                                                                                                                                  Er
                                                                                                                              ))
                                                                                                                            : u(
                                                                                                                                  '',
                                                                                                                                  !0
                                                                                                                              ),
                                                                                                                        te.value ===
                                                                                                                        l.id
                                                                                                                            ? (n(),
                                                                                                                              a(
                                                                                                                                  'svg',
                                                                                                                                  Dr,
                                                                                                                                  [
                                                                                                                                      ...(e[57] ||
                                                                                                                                          (e[57] =
                                                                                                                                              [
                                                                                                                                                  t(
                                                                                                                                                      'circle',
                                                                                                                                                      {
                                                                                                                                                          class: 'opacity-25',
                                                                                                                                                          cx: '12',
                                                                                                                                                          cy: '12',
                                                                                                                                                          r: '10',
                                                                                                                                                          stroke: 'currentColor',
                                                                                                                                                          'stroke-width':
                                                                                                                                                              '4',
                                                                                                                                                      },
                                                                                                                                                      null,
                                                                                                                                                      -1
                                                                                                                                                  ),
                                                                                                                                                  t(
                                                                                                                                                      'path',
                                                                                                                                                      {
                                                                                                                                                          class: 'opacity-75',
                                                                                                                                                          fill: 'currentColor',
                                                                                                                                                          d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                                                                                                                      },
                                                                                                                                                      null,
                                                                                                                                                      -1
                                                                                                                                                  ),
                                                                                                                                              ])),
                                                                                                                                  ]
                                                                                                                              ))
                                                                                                                            : u(
                                                                                                                                  '',
                                                                                                                                  !0
                                                                                                                              ),
                                                                                                                    ],
                                                                                                                    44,
                                                                                                                    Tr
                                                                                                                ),
                                                                                                            ]
                                                                                                        )
                                                                                                    )
                                                                                                ),
                                                                                                128
                                                                                            )),
                                                                                        ]
                                                                                    ),
                                                                                ],
                                                                                64
                                                                            )
                                                                        )
                                                                    ),
                                                                    128
                                                                )),
                                                                t(
                                                                    'div',
                                                                    {
                                                                        ref_key:
                                                                            'loadMoreSentinel',
                                                                        ref: q,
                                                                        class: 'h-px',
                                                                    },
                                                                    null,
                                                                    512
                                                                ),
                                                                d(o).loadingMore
                                                                    ? (n(),
                                                                      a('div', $r, [
                                                                          ...(e[58] ||
                                                                              (e[58] = [
                                                                                  t(
                                                                                      'svg',
                                                                                      {
                                                                                          class: 'h-6 w-6 animate-spin text-neutral-400',
                                                                                          viewBox:
                                                                                              '0 0 24 24',
                                                                                          fill: 'none',
                                                                                      },
                                                                                      [
                                                                                          t(
                                                                                              'circle',
                                                                                              {
                                                                                                  class: 'opacity-25',
                                                                                                  cx: '12',
                                                                                                  cy: '12',
                                                                                                  r: '10',
                                                                                                  stroke: 'currentColor',
                                                                                                  'stroke-width':
                                                                                                      '4',
                                                                                              }
                                                                                          ),
                                                                                          t(
                                                                                              'path',
                                                                                              {
                                                                                                  class: 'opacity-75',
                                                                                                  fill: 'currentColor',
                                                                                                  d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z',
                                                                                              }
                                                                                          ),
                                                                                      ],
                                                                                      -1
                                                                                  ),
                                                                              ])),
                                                                      ]))
                                                                    : u('', !0),
                                                                !d(o).hasMore &&
                                                                d(o).loaded &&
                                                                $.value &&
                                                                Object.keys($.value).length > 0
                                                                    ? (n(),
                                                                      a(
                                                                          'div',
                                                                          Ir,
                                                                          ' No more articles '
                                                                      ))
                                                                    : u('', !0),
                                                            ]))
                                                          : u('', !0),
                                                ],
                                                32
                                            ),
                                        ],
                                        64
                                    )),
                        ],
                        64
                    )
                )
            },
        }
    ),
    Wr = Mt(Vr, [['__scopeId', 'data-v-0c3622a1']])
export { Wr as default }
