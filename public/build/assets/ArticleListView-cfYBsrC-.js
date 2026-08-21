import {
    b as n,
    f as a,
    g as t,
    t as p,
    j as u,
    F as f,
    D as g,
    s as Ke,
    x as Je,
    R as et,
    S as tt,
    n as X,
    w as ne,
    U as rt,
    p as x,
    o as nt,
    a as at,
    V as lt,
    W as ot,
    u as d,
    k as ae,
    h as y,
    l as st,
    M as it,
    C as q,
    r as W,
    c as Re,
    X as ut,
    q as Be,
    i as _,
    Y as dt,
} from './app-BnURHHqH.js'
import { p as ct } from './purify.es-J9PU_gBl.js'
import { b as vt, u as ft } from './useArticleStore-CCZ6SYej.js'
import { u as pt } from './useSidebarStore-BCMn638G.js'
import { u as kt } from './useToast-B2RcqhN9.js'
import { u as xt } from './useAddFeedModal-O49CpxzI.js'
import { _ as ht } from './_plugin-vue_export-helper-DlAUqK2U.js'
const gt = { class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300' },
    mt = { class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500' },
    bt = {
        key: 0,
        href: '/login',
        class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors',
    },
    Ee = {
        __name: 'ArticleListErrorState',
        props: { reason: { type: String, required: !0 } },
        setup(se) {
            const l = se,
                h = g(() => l.reason === 'offline')
            return (B, m) => (
                n(),
                a(
                    f,
                    null,
                    [
                        m[0] ||
                            (m[0] = t(
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
                            gt,
                            p(
                                h.value
                                    ? 'Nothing cached for this view'
                                    : "Couldn't load articles"
                            ),
                            1
                        ),
                        t(
                            'p',
                            mt,
                            p(
                                h.value
                                    ? "You're offline and haven't opened this view before."
                                    : 'The server returned an error. Try refreshing, or sign in again.'
                            ),
                            1
                        ),
                        h.value ? u('', !0) : (n(), a('a', bt, ' Sign in ')),
                    ],
                    64
                )
            )
        },
    },
    wt = {
        class: 'flex h-11 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4',
    },
    yt = { class: 'flex items-center gap-2 min-w-0' },
    _t = { class: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate' },
    Ct = {
        key: 0,
        class: 'ml-1 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white',
    },
    Mt = { class: 'flex items-center gap-1 shrink-0' },
    At = ['disabled', 'title', 'aria-label'],
    St = ['disabled'],
    Tt = { class: 'flex items-start gap-3' },
    Lt = ['src'],
    jt = { class: 'min-w-0 flex-1' },
    Rt = { class: 'text-sm font-semibold text-neutral-900 dark:text-neutral-100' },
    Bt = { key: 0, class: 'mt-1 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3' },
    Et = ['href'],
    $t = {
        key: 2,
        class: 'flex',
        style: { height: 'calc(100vh - 2.75rem - env(safe-area-inset-top, 0px))' },
    },
    zt = {
        class: 'sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur',
    },
    Dt = {
        class: 'text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500',
    },
    It = ['id', 'onClick'],
    Vt = ['src'],
    Ft = ['onClick'],
    Ht = ['href'],
    Nt = { class: 'w-12 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-600' },
    qt = ['onClick'],
    Pt = { key: 2, class: 'flex shrink-0 items-center gap-0.5' },
    Yt = ['title'],
    Ut = ['fill'],
    Ot = ['disabled', 'title'],
    Xt = ['href'],
    Wt = ['id'],
    Qt = { key: 0, class: 'flex items-center justify-center py-12' },
    Zt = { key: 1, class: 'mx-auto max-w-3xl px-6 pt-5 pb-6' },
    Gt = {
        class: 'flex flex-wrap items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-500 mb-4',
    },
    Kt = { key: 0 },
    Jt = { key: 1 },
    er = ['src', 'alt'],
    tr = ['innerHTML'],
    rr = { key: 1, class: 'py-12 text-center' },
    nr = { class: 'text-neutral-500 dark:text-neutral-400' },
    ar = ['href'],
    lr = { key: 0, class: 'flex justify-center py-6' },
    or = { key: 1, class: 'py-6 text-center text-sm text-neutral-500 dark:text-neutral-600' },
    sr = { key: 1, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    ir = { class: 'flex flex-col items-center gap-1' },
    ur = { key: 0, class: 'text-[10px] text-neutral-600 dark:text-neutral-500' },
    dr = { key: 1, class: 'text-[10px] text-neutral-600 dark:text-neutral-500' },
    cr = { key: 0, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    vr = { key: 1 },
    fr = {
        class: 'sticky z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-2 backdrop-blur',
        style: { top: 'calc(2.75rem + env(safe-area-inset-top, 0px))' },
    },
    pr = {
        class: 'text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500',
    },
    kr = { key: 0, class: 'absolute inset-0 flex items-center bg-neutral-800 px-6' },
    xr = { class: 'ml-2 text-sm font-medium text-white uppercase tracking-wide' },
    hr = {
        key: 1,
        class: 'absolute inset-0 flex items-center justify-end bg-neutral-800 px-6',
    },
    gr = { class: 'ml-2 text-sm font-medium text-white uppercase tracking-wide' },
    mr = ['onClick', 'onTouchstart', 'onTouchmove', 'onTouchend'],
    br = { class: 'min-w-0 flex-1' },
    wr = {
        class: 'mt-1 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500',
    },
    yr = ['src'],
    _r = ['onClick'],
    Cr = { class: 'shrink-0' },
    Mr = ['src', 'alt'],
    Ar = {
        key: 1,
        class: 'absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-neutral-400',
        fill: 'none',
        viewBox: '0 0 24 24',
    },
    Sr = { key: 0, class: 'flex justify-center py-6' },
    Tr = { key: 1, class: 'py-6 text-center text-sm text-neutral-500 dark:text-neutral-600' },
    le = 80,
    $e = 80,
    oe = 10,
    Lr = Object.assign(
        { name: 'ArticleListView' },
        {
            __name: 'ArticleListView',
            setup(se) {
                const l = vt(),
                    h = pt(),
                    B = Ke(),
                    m = Je(),
                    { isOnline: ie } = ft(),
                    { success: V, error: P } = kt(),
                    { openAddFeedModal: Q } = xt(),
                    ze = et('toggleSidebar')
                function ue() {
                    const r = m.query
                    return r.filter
                        ? { type: r.filter }
                        : r.feed_id
                          ? { type: 'feed', feedId: Number(r.feed_id) }
                          : r.category_id
                            ? { type: 'category', categoryId: Number(r.category_id) }
                            : { type: 'all' }
                }
                const de = m.query['save-url']
                de && (B.replace({ query: {} }), Q('article', de))
                const ce = tt()?.scrollTop ?? 0
                ;(l.fetchArticles(ue()).then(async () => {
                    const r = Number(m.query.article)
                    if (r && T.value) {
                        if (!l.articles.some(e => e.id === r))
                            try {
                                const e = await l.fetchContent(r)
                                e && !e._offline && l.articles.unshift(e)
                            } catch {}
                        ;((k.value = r),
                            await me(r),
                            ce &&
                                (await X(),
                                setTimeout(() => {
                                    L.value && (L.value.scrollTop = ce)
                                }, 100)))
                    }
                    ;(l.warmCache(), l.cacheReadLater())
                }),
                    ne(
                        () => l.filterTitle,
                        r => rt(r),
                        { immediate: !0 }
                    ),
                    ne(
                        () => m.query,
                        () => {
                            m.name === 'articles.index' &&
                                (D(),
                                (F.value = !1),
                                l.fetchArticles(ue()).then(() => {
                                    ;(l.warmCache(), l.cacheReadLater())
                                }))
                        },
                        { deep: !0 }
                    ))
                const w = g(() => (m.query.feed_id ? Number(m.query.feed_id) : null)),
                    ve = g(() => (m.query.category_id ? Number(m.query.category_id) : null)),
                    E = g(() => m.query.filter || null),
                    fe = g(() => {
                        if (E.value === 'read_later') return h.readLaterCount
                        if (E.value === 'today') return h.todayCount
                        if (E.value === 'recently_read') return 0
                        if (w.value) {
                            for (const e of h.categories) {
                                const s = e.feeds.find(c => c.id === w.value)
                                if (s) return s.unread_count || 0
                            }
                            return (
                                h.uncategorizedFeeds.find(e => e.id === w.value)
                                    ?.unread_count || 0
                            )
                        }
                        return ve.value
                            ? h.categories.find(e => e.id === ve.value)?.unread_count || 0
                            : h.totalUnread
                    }),
                    $ = g(() => !!w.value),
                    b = g(() => {
                        if (!w.value) return null
                        for (const r of h.categories) {
                            const e = r.feeds.find(s => s.id === w.value)
                            if (e) return e
                        }
                        return h.uncategorizedFeeds.find(r => r.id === w.value) || null
                    }),
                    F = x(!1),
                    pe = g(() => {
                        let r = h.uncategorizedFeeds.length
                        for (const e of h.categories) r += e.feeds?.length || 0
                        return r
                    }),
                    De = g(() => E.value === 'recently_read'),
                    z = g(() => {
                        const r = {},
                            e = new Date()
                        e.setHours(0, 0, 0, 0)
                        const s = new Date(e)
                        s.setDate(s.getDate() - 1)
                        for (const c of l.articles) {
                            const o = De.value ? c.read_at : c.published_at,
                                v = new Date(o)
                            v.setHours(0, 0, 0, 0)
                            let S
                            if (v.getTime() === e.getTime()) S = 'Today'
                            else if (v.getTime() === s.getTime()) S = 'Yesterday'
                            else {
                                const je = { weekday: 'short', month: 'short', day: 'numeric' }
                                ;(v.getFullYear() !== e.getFullYear() && (je.year = 'numeric'),
                                    (S = v.toLocaleDateString('en-US', je)))
                            }
                            ;(r[S] || (r[S] = []), r[S].push(c))
                        }
                        return r
                    })
                function ke(r) {
                    const e = new Date(),
                        s = new Date(r),
                        c = Math.floor((e - s) / 1e3)
                    if (c < 60) return 'just now'
                    const o = Math.floor(c / 60)
                    if (o < 60) return `${o}m`
                    const v = Math.floor(o / 60)
                    if (v < 24) return `${v}h`
                    const S = Math.floor(v / 24)
                    return S < 7
                        ? `${S}d`
                        : s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
                const T = x(typeof window < 'u' && window.screen.width >= 1024)
                function xe(r, e = 0) {
                    const s = new URLSearchParams(window.location.search)
                    s.set('article', r)
                    const c = l.articles.find(o => o.id === r)?.title ?? null
                    ut(`/articles?${s.toString()}`, e, c)
                }
                let Z = null
                function he() {
                    if (!k.value) return 0
                    const r = document.getElementById(`article-expanded-${k.value}`),
                        e = L.value
                    if (!r || !e) return 0
                    const s = r.offsetTop,
                        o = r.offsetHeight - e.clientHeight
                    if (o <= 0) return 0
                    const v = e.scrollTop - s
                    return Math.min(100, Math.max(0, Math.round((v / o) * 100)))
                }
                function Ie() {
                    k.value &&
                        (clearTimeout(Z),
                        (Z = setTimeout(() => {
                            const r = L.value?.scrollTop ?? 0
                            ;(xe(k.value, r), C.value && l.saveReadingProgress(k.value, he()))
                        }, 500)))
                }
                const k = x(null),
                    i = x(null),
                    Y = x(!1),
                    C = x(!1),
                    G = x(null),
                    L = x(null),
                    H = x(null)
                function ge() {
                    T.value = window.screen.width >= 1024
                }
                let N = null
                ;(nt(() => {
                    ;(window.addEventListener('resize', ge),
                        window.addEventListener('keydown', Ae),
                        document.addEventListener('selectionchange', Me),
                        (N = new IntersectionObserver(
                            r => {
                                r[0].isIntersecting &&
                                    l.hasMore &&
                                    !l.loadingMore &&
                                    l.loadMore()
                            },
                            { rootMargin: '200px' }
                        )),
                        H.value && N.observe(H.value))
                }),
                    at(() => {
                        ;(clearTimeout(J),
                            clearTimeout(Z),
                            window.removeEventListener('resize', ge),
                            window.removeEventListener('keydown', Ae),
                            document.removeEventListener('selectionchange', Me),
                            N?.disconnect())
                    }),
                    lt(() => {
                        G.value = null
                    }),
                    ne(H, r => {
                        ;(N?.disconnect(), r && N?.observe(r))
                    }))
                function U(r) {
                    if ((r.is_read || l.markRead(r.id), T.value)) {
                        if (k.value === r.id) {
                            D()
                            return
                        }
                        ;((k.value = r.id), me(r.id))
                    } else
                        ((G.value = r.id),
                            l.cancelWarmCache(),
                            B.push({ name: 'articles.show', params: { id: r.id } }))
                }
                async function me(r) {
                    xe(r)
                    const e = l.getContent(r)
                    if (e) {
                        ;((i.value = e),
                            (C.value = e.is_read_later || !1),
                            (Y.value = !1),
                            await X(),
                            we(r),
                            be(e),
                            l.prefetchAdjacent(r),
                            L.value?.focus({ preventScroll: !0 }))
                        return
                    }
                    ;((i.value = null), (Y.value = !0), l.cancelWarmCache())
                    try {
                        const s = await l.fetchContent(r)
                        ;((i.value = s),
                            (C.value = s.is_read_later || !1),
                            await X(),
                            we(r),
                            be(s),
                            l.prefetchAdjacent(r))
                    } catch {
                        B.push({ name: 'articles.show', params: { id: r } })
                    } finally {
                        ;((Y.value = !1), L.value?.focus({ preventScroll: !0 }))
                    }
                }
                function be(r) {
                    const e = r.reading_progress
                    !r.is_read_later ||
                        !e ||
                        e <= 0 ||
                        setTimeout(() => {
                            const s = document.getElementById(`article-expanded-${r.id}`),
                                c = L.value
                            if (!s || !c) return
                            const o = s.offsetTop,
                                v = s.offsetHeight - c.clientHeight
                            v <= 0 || (c.scrollTop = o + Math.round((e / 100) * v))
                        }, 600)
                }
                function we(r) {
                    const e = document.getElementById(`article-expanded-${r}`)
                    e && e.scrollIntoView({ block: 'start', behavior: 'smooth' })
                }
                function D() {
                    ;((i.value = null), (k.value = null), (j.value = !1), ot())
                }
                function ye(r) {
                    ;(D(), B.push({ name: 'articles.index', query: { feed_id: r } }))
                }
                function _e() {
                    i.value &&
                        (l.toggleReadLater(i.value.id, he()),
                        (C.value = !C.value),
                        V(C.value ? 'Article saved' : 'Removed from Read Later'))
                }
                function Ce() {
                    i.value && (l.markUnread(i.value.id), V('Marked as unread'))
                }
                function Ve() {
                    i.value &&
                        (navigator.share
                            ? navigator
                                  .share({ title: i.value.title, url: i.value.url })
                                  .catch(() => {})
                            : i.value.url &&
                              navigator.clipboard
                                  .writeText(i.value.url)
                                  .then(() => V('Link copied to clipboard'))
                                  .catch(() => {}))
                }
                const Fe = g(() =>
                        i.value?.image_url
                            ? !(i.value.content || i.value.summary || '').includes(
                                  i.value.image_url
                              )
                            : !1
                    ),
                    He = g(() =>
                        i.value
                            ? new Date(i.value.published_at).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              })
                            : ''
                    ),
                    Ne = g(() =>
                        i.value
                            ? new Date(i.value.published_at).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : ''
                    ),
                    qe = g(() => {
                        const e = (i.value?.content || i.value?.summary || '').replace(
                            /(href|src)=(["'])http:\/\//gi,
                            '$1=$2https://'
                        )
                        return ct.sanitize(e, { USE_PROFILES: { html: !0 } })
                    }),
                    j = x(!1)
                let K = '',
                    J = null
                function Me() {
                    ;(clearTimeout(J),
                        (J = setTimeout(() => {
                            const r = window.getSelection()
                            if (!r || r.isCollapsed || !r.toString().trim()) {
                                j.value = !1
                                return
                            }
                            const e = document.querySelector('.article-content')
                            if (!e) {
                                j.value = !1
                                return
                            }
                            const s = r.getRangeAt(0),
                                c = e.contains(s.commonAncestorContainer)
                            ;((j.value = c), c && (K = r.toString().trim()))
                        }, 100)))
                }
                async function Pe() {
                    const r = K
                    if (!r || !i.value) return
                    const e = i.value.id
                    ;((K = ''), window.getSelection()?.removeAllRanges(), (j.value = !1))
                    try {
                        ;(await Be.post('/api/highlights', { article_id: e, text: r }),
                            V('Quote saved'))
                    } catch {
                        P('Failed to save quote')
                    }
                }
                const ee = g(() =>
                    k.value ? l.articles.findIndex(r => r.id === k.value) : -1
                )
                function Ae(r) {
                    if (
                        T.value &&
                        !(
                            r.target.tagName === 'INPUT' ||
                            r.target.tagName === 'TEXTAREA' ||
                            r.target.isContentEditable
                        ) &&
                        m.name === 'articles.index'
                    )
                        switch (r.key) {
                            case 'ArrowRight':
                            case 'j': {
                                r.preventDefault()
                                const e = ee.value + 1
                                e < l.articles.length && U(l.articles[e])
                                break
                            }
                            case 'ArrowLeft':
                            case 'k': {
                                r.preventDefault()
                                const e = ee.value - 1
                                e >= 0 && U(l.articles[e])
                                break
                            }
                            case 's': {
                                ;(r.preventDefault(), i.value && _e())
                                break
                            }
                            case 'm': {
                                if ((r.preventDefault(), i.value)) {
                                    const e = ee.value
                                    ;(Ce(), D())
                                    const s = l.articles[e + 1]
                                    s &&
                                        ((k.value = s.id),
                                        X(() => {
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
                                ;(r.preventDefault(), D())
                                break
                            }
                        }
                }
                const te = x(!1)
                function Ye() {
                    te.value = !0
                    const r = l.markAllRead(w.value)
                    if (((te.value = !1), !r)) {
                        P("You're offline — marking all as read needs a connection.")
                        return
                    }
                    V('All marked as read')
                }
                const O = x(!1)
                async function Se() {
                    if (!ie.value) {
                        P("You're offline — showing cached articles.")
                        return
                    }
                    O.value = !0
                    try {
                        if (w.value) {
                            const r = b.value?.disabled_at
                                ? `/api/feeds/${w.value}/reenable`
                                : `/api/feeds/${w.value}/refresh`
                            await Be.post(r)
                        }
                        await Promise.all([l.forceRefresh(), h.fetchSidebar().catch(() => {})])
                    } catch {
                        P("Couldn't refresh — check your connection.")
                    } finally {
                        O.value = !1
                    }
                }
                const M = x(0),
                    I = x(!1),
                    A = x(!1)
                let Te = 0
                function Ue(r) {
                    window.scrollY > 0 ||
                        A.value ||
                        ((Te = r.touches[0].clientY), (I.value = !0))
                }
                function Oe(r) {
                    if (!I.value || A.value) return
                    if (window.scrollY > 0) {
                        ;((I.value = !1), (M.value = 0))
                        return
                    }
                    const e = r.touches[0].clientY - Te
                    e > 0 && (M.value = Math.min(e * 0.5, 120))
                }
                async function Xe() {
                    I.value &&
                        ((I.value = !1),
                        M.value >= le &&
                            !A.value &&
                            ((A.value = !0), (M.value = 60), await Se(), (A.value = !1)),
                        (M.value = 0))
                }
                const R = x({})
                function We(r, e) {
                    R.value[r] = {
                        startX: e.touches[0].clientX,
                        startY: e.touches[0].clientY,
                        currentX: 0,
                        swiping: !1,
                        directionLocked: !1,
                    }
                }
                function Qe(r, e) {
                    const s = R.value[r]
                    if (!s) return
                    const c = e.touches[0].clientX - s.startX,
                        o = e.touches[0].clientY - s.startY
                    if (
                        !s.directionLocked &&
                        (Math.abs(c) > oe || Math.abs(o) > oe) &&
                        ((s.directionLocked = !0), Math.abs(o) > Math.abs(c))
                    ) {
                        delete R.value[r]
                        return
                    }
                    s.directionLocked &&
                        Math.abs(c) > oe &&
                        (e.preventDefault(),
                        (s.swiping = !0),
                        (s.currentX = Math.max(Math.min(c, 200), -200)))
                }
                function Ze(r, e) {
                    const s = R.value[r]
                    s &&
                        (s.currentX < -$e
                            ? e.is_read
                                ? l.markUnread(e.id)
                                : l.markRead(e.id)
                            : s.currentX > $e && l.toggleReadLater(e.id),
                        delete R.value[r])
                }
                function Ge(r) {
                    const e = R.value[r]
                    return !e || !e.swiping
                        ? {}
                        : { transform: `translateX(${e.currentX}px)`, transition: 'none' }
                }
                function re(r) {
                    return R.value[r]?.swiping || !1
                }
                function Le(r) {
                    const e = R.value[r]
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
                                        T.value
                                            ? 'sticky top-0 z-30 bg-white dark:bg-neutral-900 pt-safe'
                                            : 'fixed top-0 inset-x-0 z-30 bg-white dark:bg-neutral-900 pt-safe'
                                    ),
                                },
                                [
                                    t('div', wt, [
                                        t('div', yt, [
                                            t(
                                                'button',
                                                {
                                                    onClick: e[0] || (e[0] = s => d(ze)()),
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
                                            t('h1', _t, [
                                                ae(p(d(l).filterTitle) + ' ', 1),
                                                fe.value > 0
                                                    ? (n(), a('span', Ct, p(fe.value), 1))
                                                    : u('', !0),
                                            ]),
                                        ]),
                                        t('div', Mt, [
                                            t(
                                                'button',
                                                {
                                                    onClick:
                                                        e[1] ||
                                                        (e[1] = s =>
                                                            d(B).push({
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
                                            $.value
                                                ? (n(),
                                                  a(
                                                      'button',
                                                      {
                                                          key: 0,
                                                          onClick:
                                                              e[2] ||
                                                              (e[2] = s =>
                                                                  (F.value = !F.value)),
                                                          class: y([
                                                              'rounded-lg p-2 transition-colors cursor-pointer',
                                                              F.value
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
                                            st(
                                                t(
                                                    'button',
                                                    {
                                                        onClick: Se,
                                                        disabled: O.value,
                                                        class: y([
                                                            'rounded-lg p-2 transition-colors cursor-pointer',
                                                            b.value?.disabled_at
                                                                ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                                                                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                        ]),
                                                        title: b.value?.disabled_at
                                                            ? 'Feed is broken — click to retry'
                                                            : 'Refresh feed',
                                                        'aria-label': b.value?.disabled_at
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
                                                                            O.value,
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
                                                    At
                                                ),
                                                [
                                                    [
                                                        it,
                                                        d(l).articles.length > 0 ||
                                                            !d(l).loading,
                                                    ],
                                                ]
                                            ),
                                            $.value && d(l).unreadCount > 0
                                                ? (n(),
                                                  a(
                                                      'button',
                                                      {
                                                          key: 1,
                                                          onClick: Ye,
                                                          disabled: te.value,
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
                                                      St
                                                  ))
                                                : u('', !0),
                                        ]),
                                    ]),
                                ],
                                2
                            ),
                            F.value && b.value
                                ? (n(),
                                  a(
                                      'div',
                                      {
                                          key: 0,
                                          class: 'border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3',
                                          style: q(
                                              T.value
                                                  ? ''
                                                  : 'margin-top: calc(2.75rem + env(safe-area-inset-top, 0px))'
                                          ),
                                      },
                                      [
                                          t('div', Tt, [
                                              b.value.favicon_url
                                                  ? (n(),
                                                    a(
                                                        'img',
                                                        {
                                                            key: 0,
                                                            src: b.value.favicon_url,
                                                            class: 'h-8 w-8 shrink-0 rounded-md mt-0.5',
                                                            alt: '',
                                                        },
                                                        null,
                                                        8,
                                                        Lt
                                                    ))
                                                  : u('', !0),
                                              t('div', jt, [
                                                  t('h2', Rt, p(b.value.title), 1),
                                                  b.value.description
                                                      ? (n(),
                                                        a('p', Bt, p(b.value.description), 1))
                                                      : u('', !0),
                                                  b.value.site_url
                                                      ? (n(),
                                                        a(
                                                            'a',
                                                            {
                                                                key: 1,
                                                                href: b.value.site_url,
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
                                                                ae(
                                                                    ' ' +
                                                                        p(
                                                                            b.value.site_url
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
                                                            Et
                                                        ))
                                                      : u('', !0),
                                              ]),
                                          ]),
                                      ],
                                      4
                                  ))
                                : u('', !0),
                            d(l).loading && d(l).articles.length === 0
                                ? (n(),
                                  a(
                                      'div',
                                      {
                                          key: 1,
                                          class: 'flex items-center justify-center py-20',
                                          style: q(
                                              T.value
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
                                : T.value
                                  ? (n(),
                                    a('div', $t, [
                                        t(
                                            'div',
                                            {
                                                ref_key: 'articleListEl',
                                                ref: L,
                                                tabindex: '-1',
                                                class: 'flex-1 flex flex-col overflow-y-auto pr-2 outline-none',
                                                onScrollPassive: Ie,
                                            },
                                            [
                                                d(l).articles.length > 0
                                                    ? (n(),
                                                      a(
                                                          f,
                                                          { key: 0 },
                                                          [
                                                              (n(!0),
                                                              a(
                                                                  f,
                                                                  null,
                                                                  W(
                                                                      z.value,
                                                                      (s, c) => (
                                                                          n(),
                                                                          a(
                                                                              f,
                                                                              { key: c },
                                                                              [
                                                                                  t(
                                                                                      'div',
                                                                                      zt,
                                                                                      [
                                                                                          t(
                                                                                              'h2',
                                                                                              Dt,
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
                                                                                              W(
                                                                                                  s,
                                                                                                  o => (
                                                                                                      n(),
                                                                                                      a(
                                                                                                          f,
                                                                                                          {
                                                                                                              key: o.id,
                                                                                                          },
                                                                                                          [
                                                                                                              t(
                                                                                                                  'div',
                                                                                                                  {
                                                                                                                      id: `article-row-${o.id}`,
                                                                                                                      class: y(
                                                                                                                          [
                                                                                                                              'flex w-full items-center gap-3 border-b border-neutral-200/50 dark:border-neutral-800/50 px-4 py-2.5 text-left transition-colors',
                                                                                                                              [
                                                                                                                                  k.value ===
                                                                                                                                  o.id
                                                                                                                                      ? 'sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b-neutral-200 dark:border-b-neutral-800'
                                                                                                                                      : 'group/row cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50',
                                                                                                                              ],
                                                                                                                          ]
                                                                                                                      ),
                                                                                                                      onClick:
                                                                                                                          v =>
                                                                                                                              k.value !==
                                                                                                                                  o.id &&
                                                                                                                              U(
                                                                                                                                  o
                                                                                                                              ),
                                                                                                                  },
                                                                                                                  [
                                                                                                                      $.value
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
                                                                                                                                    o.feed_favicon_url
                                                                                                                                        ? (n(),
                                                                                                                                          a(
                                                                                                                                              'img',
                                                                                                                                              {
                                                                                                                                                  key: 0,
                                                                                                                                                  src: o.feed_favicon_url,
                                                                                                                                                  class: 'h-4 w-4 shrink-0 rounded-sm',
                                                                                                                                                  alt: '',
                                                                                                                                              },
                                                                                                                                              null,
                                                                                                                                              8,
                                                                                                                                              Vt
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
                                                                                                                                                _(
                                                                                                                                                    v =>
                                                                                                                                                        ye(
                                                                                                                                                            o.feed_id
                                                                                                                                                        ),
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                        },
                                                                                                                                        p(
                                                                                                                                            o.feed_title
                                                                                                                                        ),
                                                                                                                                        9,
                                                                                                                                        Ft
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
                                                                                                                                      o.is_read
                                                                                                                                          ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                                                                                                                                          : 'text-neutral-900 dark:text-neutral-100 font-medium',
                                                                                                                                  ]
                                                                                                                              ),
                                                                                                                          },
                                                                                                                          [
                                                                                                                              k.value ===
                                                                                                                                  o.id &&
                                                                                                                              o.url
                                                                                                                                  ? (n(),
                                                                                                                                    a(
                                                                                                                                        'a',
                                                                                                                                        {
                                                                                                                                            key: 0,
                                                                                                                                            href: o.url,
                                                                                                                                            target: '_blank',
                                                                                                                                            rel: 'noopener noreferrer',
                                                                                                                                            class: 'hover:underline',
                                                                                                                                            onClick:
                                                                                                                                                e[3] ||
                                                                                                                                                (e[3] =
                                                                                                                                                    _(() => {}, [
                                                                                                                                                        'stop',
                                                                                                                                                    ])),
                                                                                                                                        },
                                                                                                                                        p(
                                                                                                                                            o.title
                                                                                                                                        ),
                                                                                                                                        9,
                                                                                                                                        Ht
                                                                                                                                    ))
                                                                                                                                  : (n(),
                                                                                                                                    a(
                                                                                                                                        f,
                                                                                                                                        {
                                                                                                                                            key: 1,
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            ae(
                                                                                                                                                p(
                                                                                                                                                    o.title
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
                                                                                                                      o.id
                                                                                                                          ? (n(),
                                                                                                                            a(
                                                                                                                                f,
                                                                                                                                {
                                                                                                                                    key: 1,
                                                                                                                                },
                                                                                                                                [
                                                                                                                                    t(
                                                                                                                                        'span',
                                                                                                                                        Nt,
                                                                                                                                        p(
                                                                                                                                            ke(
                                                                                                                                                o.published_at
                                                                                                                                            )
                                                                                                                                        ),
                                                                                                                                        1
                                                                                                                                    ),
                                                                                                                                    t(
                                                                                                                                        'span',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                _(
                                                                                                                                                    v =>
                                                                                                                                                        d(
                                                                                                                                                            l
                                                                                                                                                        ).dismissArticle(
                                                                                                                                                            o.id
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
                                                                                                                                        qt
                                                                                                                                    ),
                                                                                                                                ],
                                                                                                                                64
                                                                                                                            ))
                                                                                                                          : (n(),
                                                                                                                            a(
                                                                                                                                'div',
                                                                                                                                Pt,
                                                                                                                                [
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                _(
                                                                                                                                                    _e,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            class: y(
                                                                                                                                                [
                                                                                                                                                    'rounded-lg p-1.5 transition-colors cursor-pointer',
                                                                                                                                                    C.value
                                                                                                                                                        ? 'text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                                                                                                                        : 'text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300',
                                                                                                                                                ]
                                                                                                                                            ),
                                                                                                                                            title: C.value
                                                                                                                                                ? 'Remove from Read Later'
                                                                                                                                                : 'Save to Read Later',
                                                                                                                                        },
                                                                                                                                        [
                                                                                                                                            (n(),
                                                                                                                                            a(
                                                                                                                                                'svg',
                                                                                                                                                {
                                                                                                                                                    class: 'h-4 w-4',
                                                                                                                                                    fill: C.value
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
                                                                                                                                                Ut
                                                                                                                                            )),
                                                                                                                                        ],
                                                                                                                                        10,
                                                                                                                                        Yt
                                                                                                                                    ),
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                _(
                                                                                                                                                    Ce,
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
                                                                                                                                                _(
                                                                                                                                                    Pe,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            disabled:
                                                                                                                                                !j.value,
                                                                                                                                            class: y(
                                                                                                                                                [
                                                                                                                                                    'rounded-lg p-1.5 transition-colors cursor-pointer',
                                                                                                                                                    j.value
                                                                                                                                                        ? 'text-amber-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                                                                                                                        : 'text-neutral-300 dark:text-neutral-600 cursor-default',
                                                                                                                                                ]
                                                                                                                                            ),
                                                                                                                                            title: j.value
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
                                                                                                                                        Ot
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
                                                                                                                                                          _(() => {}, [
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
                                                                                                                                              Xt
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
                                                                                                                                                      _(
                                                                                                                                                          Ve,
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
                                                                                                                                    t(
                                                                                                                                        'button',
                                                                                                                                        {
                                                                                                                                            onClick:
                                                                                                                                                _(
                                                                                                                                                    D,
                                                                                                                                                    [
                                                                                                                                                        'stop',
                                                                                                                                                    ]
                                                                                                                                                ),
                                                                                                                                            class: 'rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                                                                            title: 'Collapse (Esc)',
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
                                                                                                                  It
                                                                                                              ),
                                                                                                              k.value ===
                                                                                                              o.id
                                                                                                                  ? (n(),
                                                                                                                    a(
                                                                                                                        'div',
                                                                                                                        {
                                                                                                                            key: 0,
                                                                                                                            id: `article-expanded-${o.id}`,
                                                                                                                            class: 'border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50',
                                                                                                                        },
                                                                                                                        [
                                                                                                                            Y.value &&
                                                                                                                            !i.value
                                                                                                                                ? (n(),
                                                                                                                                  a(
                                                                                                                                      'div',
                                                                                                                                      Qt,
                                                                                                                                      [
                                                                                                                                          ...(e[25] ||
                                                                                                                                              (e[25] =
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
                                                                                                                                      'article',
                                                                                                                                      Zt,
                                                                                                                                      [
                                                                                                                                          t(
                                                                                                                                              'div',
                                                                                                                                              Gt,
                                                                                                                                              [
                                                                                                                                                  i
                                                                                                                                                      .value
                                                                                                                                                      .author
                                                                                                                                                      ? (n(),
                                                                                                                                                        a(
                                                                                                                                                            'span',
                                                                                                                                                            Kt,
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
                                                                                                                                                            Jt,
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
                                                                                                                                                          He.value
                                                                                                                                                      ) +
                                                                                                                                                          ' at ' +
                                                                                                                                                          p(
                                                                                                                                                              Ne.value
                                                                                                                                                          ),
                                                                                                                                                      1
                                                                                                                                                  ),
                                                                                                                                              ]
                                                                                                                                          ),
                                                                                                                                          Fe.value
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
                                                                                                                                                    er
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
                                                                                                                                                      qe.value,
                                                                                                                                              },
                                                                                                                                              null,
                                                                                                                                              8,
                                                                                                                                              tr
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
                                                                                                                                                    rr,
                                                                                                                                                    [
                                                                                                                                                        t(
                                                                                                                                                            'p',
                                                                                                                                                            nr,
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
                                                                                                                                                            ie
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
                                                                                                                                                                  ar
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
                                                                                                                                          e[26] ||
                                                                                                                                              (e[26] =
                                                                                                                                                  dt(
                                                                                                                                                      '<div class="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs text-neutral-400 dark:text-neutral-600" data-v-139440e4><span class="font-medium text-neutral-500" data-v-139440e4>Shortcuts:</span><span class="ml-2" data-v-139440e4><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>j</kbd>/<kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>k</kbd> or <kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>←</kbd>/<kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>→</kbd> navigate</span><span class="ml-2" data-v-139440e4><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>s</kbd> save</span><span class="ml-2" data-v-139440e4><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>m</kbd> mark unread</span><span class="ml-2" data-v-139440e4><kbd class="rounded bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5" data-v-139440e4>Esc</kbd> close</span></div>',
                                                                                                                                                      1
                                                                                                                                                  )),
                                                                                                                                      ]
                                                                                                                                  ))
                                                                                                                                : u(
                                                                                                                                      '',
                                                                                                                                      !0
                                                                                                                                  ),
                                                                                                                        ],
                                                                                                                        8,
                                                                                                                        Wt
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
                                                                      ref: H,
                                                                      class: 'h-px',
                                                                  },
                                                                  null,
                                                                  512
                                                              ),
                                                              d(l).loadingMore
                                                                  ? (n(),
                                                                    a('div', lr, [
                                                                        ...(e[27] ||
                                                                            (e[27] = [
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
                                                              !d(l).hasMore &&
                                                              d(l).loaded &&
                                                              z.value &&
                                                              Object.keys(z.value).length > 0
                                                                  ? (n(),
                                                                    a(
                                                                        'div',
                                                                        or,
                                                                        ' No more articles '
                                                                    ))
                                                                  : u('', !0),
                                                          ],
                                                          64
                                                      ))
                                                    : (n(),
                                                      a('div', sr, [
                                                          d(l).loadError
                                                              ? (n(),
                                                                Re(
                                                                    Ee,
                                                                    {
                                                                        key: 0,
                                                                        reason: d(l).loadError,
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
                                                                          e[28] ||
                                                                              (e[28] = t(
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
                                                                          e[29] ||
                                                                              (e[29] = t(
                                                                                  'h3',
                                                                                  {
                                                                                      class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                  },
                                                                                  ' No saved articles ',
                                                                                  -1
                                                                              )),
                                                                          e[30] ||
                                                                              (e[30] = t(
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
                                                                : pe.value === 0
                                                                  ? (n(),
                                                                    a(
                                                                        f,
                                                                        { key: 2 },
                                                                        [
                                                                            e[31] ||
                                                                                (e[31] = t(
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
                                                                            e[32] ||
                                                                                (e[32] = t(
                                                                                    'h3',
                                                                                    {
                                                                                        class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                    },
                                                                                    ' No articles yet ',
                                                                                    -1
                                                                                )),
                                                                            e[33] ||
                                                                                (e[33] = t(
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
                                                                                                    Q
                                                                                                )()),
                                                                                    class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                                                },
                                                                                ' Add a Feed '
                                                                            ),
                                                                        ],
                                                                        64
                                                                    ))
                                                                  : $.value
                                                                    ? (n(),
                                                                      a(
                                                                          f,
                                                                          { key: 3 },
                                                                          [
                                                                              e[34] ||
                                                                                  (e[34] = t(
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
                                                                              e[35] ||
                                                                                  (e[35] = t(
                                                                                      'h3',
                                                                                      {
                                                                                          class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                      },
                                                                                      ' All caught up ',
                                                                                      -1
                                                                                  )),
                                                                              e[36] ||
                                                                                  (e[36] = t(
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
                                                                                                      l
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
                                                                              e[37] ||
                                                                                  (e[37] = t(
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
                                                                              e[38] ||
                                                                                  (e[38] = t(
                                                                                      'h3',
                                                                                      {
                                                                                          class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                      },
                                                                                      ' All caught up ',
                                                                                      -1
                                                                                  )),
                                                                              e[39] ||
                                                                                  (e[39] = t(
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
                                                                                                      l
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
                                            e[58] ||
                                                (e[58] = t(
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
                                                        { 'transition-none': I.value },
                                                    ]),
                                                    style: q({ height: M.value + 'px' }),
                                                },
                                                [
                                                    t('div', ir, [
                                                        (n(),
                                                        a(
                                                            'svg',
                                                            {
                                                                class: y([
                                                                    'h-5 w-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200',
                                                                    {
                                                                        'animate-spin':
                                                                            A.value,
                                                                    },
                                                                ]),
                                                                style: q(
                                                                    A.value
                                                                        ? {}
                                                                        : {
                                                                              transform: `rotate(${Math.min(M.value / le, 1) * 360}deg)`,
                                                                          }
                                                                ),
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '1.5',
                                                                stroke: 'currentColor',
                                                            },
                                                            [
                                                                ...(e[40] ||
                                                                    (e[40] = [
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
                                                        !A.value && M.value >= le
                                                            ? (n(),
                                                              a(
                                                                  'span',
                                                                  ur,
                                                                  'Release to refresh'
                                                              ))
                                                            : A.value
                                                              ? (n(),
                                                                a('span', dr, 'Refreshing...'))
                                                              : u('', !0),
                                                    ]),
                                                ],
                                                6
                                            ),
                                            t(
                                                'div',
                                                {
                                                    class: 'touch-pan-y',
                                                    onTouchstartPassive: Ue,
                                                    onTouchmovePassive: Oe,
                                                    onTouchend: Xe,
                                                },
                                                [
                                                    d(l).articles.length === 0 && !d(l).loading
                                                        ? (n(),
                                                          a('div', cr, [
                                                              d(l).loadError
                                                                  ? (n(),
                                                                    Re(
                                                                        Ee,
                                                                        {
                                                                            key: 0,
                                                                            reason: d(l)
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
                                                                              e[41] ||
                                                                                  (e[41] = t(
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
                                                                              e[42] ||
                                                                                  (e[42] = t(
                                                                                      'h3',
                                                                                      {
                                                                                          class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                      },
                                                                                      ' No saved articles ',
                                                                                      -1
                                                                                  )),
                                                                              e[43] ||
                                                                                  (e[43] = t(
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
                                                                    : pe.value === 0
                                                                      ? (n(),
                                                                        a(
                                                                            f,
                                                                            { key: 2 },
                                                                            [
                                                                                e[44] ||
                                                                                    (e[44] = t(
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
                                                                                e[45] ||
                                                                                    (e[45] = t(
                                                                                        'h3',
                                                                                        {
                                                                                            class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                        },
                                                                                        ' No articles yet ',
                                                                                        -1
                                                                                    )),
                                                                                e[46] ||
                                                                                    (e[46] = t(
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
                                                                                                        Q
                                                                                                    )()),
                                                                                        class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                                                    },
                                                                                    ' Add a Feed '
                                                                                ),
                                                                            ],
                                                                            64
                                                                        ))
                                                                      : $.value
                                                                        ? (n(),
                                                                          a(
                                                                              f,
                                                                              { key: 3 },
                                                                              [
                                                                                  e[47] ||
                                                                                      (e[47] =
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
                                                                                  e[48] ||
                                                                                      (e[48] =
                                                                                          t(
                                                                                              'h3',
                                                                                              {
                                                                                                  class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                              },
                                                                                              ' All caught up ',
                                                                                              -1
                                                                                          )),
                                                                                  e[49] ||
                                                                                      (e[49] =
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
                                                                                                          l
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
                                                                                  e[50] ||
                                                                                      (e[50] =
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
                                                                                  e[51] ||
                                                                                      (e[51] =
                                                                                          t(
                                                                                              'h3',
                                                                                              {
                                                                                                  class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                                                              },
                                                                                              ' All caught up ',
                                                                                              -1
                                                                                          )),
                                                                                  e[52] ||
                                                                                      (e[52] =
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
                                                                                                          l
                                                                                                      ).showAllArticles()),
                                                                                          class: 'mt-4 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                                                      },
                                                                                      ' Show all articles '
                                                                                  ),
                                                                              ],
                                                                              64
                                                                          )),
                                                          ]))
                                                        : d(l).articles.length > 0
                                                          ? (n(),
                                                            a('div', vr, [
                                                                (n(!0),
                                                                a(
                                                                    f,
                                                                    null,
                                                                    W(
                                                                        z.value,
                                                                        (s, c) => (
                                                                            n(),
                                                                            a(
                                                                                f,
                                                                                { key: c },
                                                                                [
                                                                                    t(
                                                                                        'div',
                                                                                        fr,
                                                                                        [
                                                                                            t(
                                                                                                'h2',
                                                                                                pr,
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
                                                                                                W(
                                                                                                    s,
                                                                                                    o => (
                                                                                                        n(),
                                                                                                        a(
                                                                                                            'div',
                                                                                                            {
                                                                                                                key: o.id,
                                                                                                                class: 'relative overflow-hidden border-b border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-200 dark:bg-neutral-800',
                                                                                                            },
                                                                                                            [
                                                                                                                re(
                                                                                                                    o.id
                                                                                                                ) &&
                                                                                                                Le(
                                                                                                                    o.id
                                                                                                                ) ===
                                                                                                                    'right'
                                                                                                                    ? (n(),
                                                                                                                      a(
                                                                                                                          'div',
                                                                                                                          kr,
                                                                                                                          [
                                                                                                                              e[53] ||
                                                                                                                                  (e[53] =
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
                                                                                                                                  xr,
                                                                                                                                  p(
                                                                                                                                      o.is_read_later
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
                                                                                                                re(
                                                                                                                    o.id
                                                                                                                ) &&
                                                                                                                Le(
                                                                                                                    o.id
                                                                                                                ) ===
                                                                                                                    'left'
                                                                                                                    ? (n(),
                                                                                                                      a(
                                                                                                                          'div',
                                                                                                                          hr,
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
                                                                                                                                                      d: 'M4.5 12.75l6 6 9-13.5',
                                                                                                                                                  }
                                                                                                                                              ),
                                                                                                                                          ],
                                                                                                                                          -1
                                                                                                                                      )),
                                                                                                                              t(
                                                                                                                                  'span',
                                                                                                                                  gr,
                                                                                                                                  p(
                                                                                                                                      o.is_read
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
                                                                                                                                !re(
                                                                                                                                    o.id
                                                                                                                                ) &&
                                                                                                                                U(
                                                                                                                                    o
                                                                                                                                ),
                                                                                                                        onTouchstart:
                                                                                                                            v =>
                                                                                                                                We(
                                                                                                                                    o.id,
                                                                                                                                    v
                                                                                                                                ),
                                                                                                                        onTouchmove:
                                                                                                                            v =>
                                                                                                                                Qe(
                                                                                                                                    o.id,
                                                                                                                                    v
                                                                                                                                ),
                                                                                                                        onTouchend:
                                                                                                                            v =>
                                                                                                                                Ze(
                                                                                                                                    o.id,
                                                                                                                                    o
                                                                                                                                ),
                                                                                                                        class: 'relative flex w-full gap-3 bg-white dark:bg-neutral-950 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50 active:bg-neutral-100 dark:active:bg-neutral-800/50',
                                                                                                                        style: q(
                                                                                                                            Ge(
                                                                                                                                o.id
                                                                                                                            )
                                                                                                                        ),
                                                                                                                    },
                                                                                                                    [
                                                                                                                        t(
                                                                                                                            'div',
                                                                                                                            br,
                                                                                                                            [
                                                                                                                                t(
                                                                                                                                    'h3',
                                                                                                                                    {
                                                                                                                                        class: y(
                                                                                                                                            [
                                                                                                                                                'text-sm leading-snug',
                                                                                                                                                o.is_read
                                                                                                                                                    ? 'text-neutral-600 dark:text-neutral-500 font-normal'
                                                                                                                                                    : 'text-neutral-900 dark:text-neutral-100 font-semibold',
                                                                                                                                            ]
                                                                                                                                        ),
                                                                                                                                    },
                                                                                                                                    p(
                                                                                                                                        o.title
                                                                                                                                    ),
                                                                                                                                    3
                                                                                                                                ),
                                                                                                                                t(
                                                                                                                                    'div',
                                                                                                                                    wr,
                                                                                                                                    [
                                                                                                                                        $.value
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
                                                                                                                                                      o.feed_favicon_url
                                                                                                                                                          ? (n(),
                                                                                                                                                            a(
                                                                                                                                                                'img',
                                                                                                                                                                {
                                                                                                                                                                    key: 0,
                                                                                                                                                                    src: o.feed_favicon_url,
                                                                                                                                                                    class: 'h-3.5 w-3.5 rounded-sm',
                                                                                                                                                                    alt: '',
                                                                                                                                                                },
                                                                                                                                                                null,
                                                                                                                                                                8,
                                                                                                                                                                yr
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
                                                                                                                                                                  _(
                                                                                                                                                                      v =>
                                                                                                                                                                          ye(
                                                                                                                                                                              o.feed_id
                                                                                                                                                                          ),
                                                                                                                                                                      [
                                                                                                                                                                          'stop',
                                                                                                                                                                      ]
                                                                                                                                                                  ),
                                                                                                                                                          },
                                                                                                                                                          p(
                                                                                                                                                              o.feed_title
                                                                                                                                                          ),
                                                                                                                                                          9,
                                                                                                                                                          _r
                                                                                                                                                      ),
                                                                                                                                                      e[55] ||
                                                                                                                                                          (e[55] =
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
                                                                                                                                            Cr,
                                                                                                                                            p(
                                                                                                                                                ke(
                                                                                                                                                    o.published_at
                                                                                                                                                )
                                                                                                                                            ),
                                                                                                                                            1
                                                                                                                                        ),
                                                                                                                                    ]
                                                                                                                                ),
                                                                                                                            ]
                                                                                                                        ),
                                                                                                                        o.image_url
                                                                                                                            ? (n(),
                                                                                                                              a(
                                                                                                                                  'img',
                                                                                                                                  {
                                                                                                                                      key: 0,
                                                                                                                                      src: o.image_url,
                                                                                                                                      class: 'h-16 w-16 shrink-0 rounded-lg object-cover',
                                                                                                                                      alt: o.title,
                                                                                                                                      loading:
                                                                                                                                          'lazy',
                                                                                                                                  },
                                                                                                                                  null,
                                                                                                                                  8,
                                                                                                                                  Mr
                                                                                                                              ))
                                                                                                                            : u(
                                                                                                                                  '',
                                                                                                                                  !0
                                                                                                                              ),
                                                                                                                        G.value ===
                                                                                                                        o.id
                                                                                                                            ? (n(),
                                                                                                                              a(
                                                                                                                                  'svg',
                                                                                                                                  Ar,
                                                                                                                                  [
                                                                                                                                      ...(e[56] ||
                                                                                                                                          (e[56] =
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
                                                                                                                    mr
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
                                                                        ref: H,
                                                                        class: 'h-px',
                                                                    },
                                                                    null,
                                                                    512
                                                                ),
                                                                d(l).loadingMore
                                                                    ? (n(),
                                                                      a('div', Sr, [
                                                                          ...(e[57] ||
                                                                              (e[57] = [
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
                                                                !d(l).hasMore &&
                                                                d(l).loaded &&
                                                                z.value &&
                                                                Object.keys(z.value).length > 0
                                                                    ? (n(),
                                                                      a(
                                                                          'div',
                                                                          Tr,
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
    Ir = ht(Lr, [['__scopeId', 'data-v-139440e4']])
export { Ir as default }
