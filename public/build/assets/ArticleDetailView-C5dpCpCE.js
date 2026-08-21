import {
    s as Ve,
    x as Ne,
    o as de,
    a as G,
    W as Q,
    X as ve,
    w as Oe,
    n as Z,
    f as s,
    l as fe,
    M as me,
    g as o,
    h as K,
    j as m,
    t as y,
    u as J,
    F as Xe,
    k as ee,
    i as Ye,
    p,
    S as pe,
    U as te,
    q as qe,
    D as A,
    b as i,
} from './app-BnURHHqH.js'
import { b as Pe, u as Ue } from './useArticleStore-CCZ6SYej.js'
import { u as Fe } from './useToast-B2RcqhN9.js'
import { p as We } from './purify.es-J9PU_gBl.js'
import { _ as Ge } from './_plugin-vue_export-helper-DlAUqK2U.js'
import './useSidebarStore-BCMn638G.js'
const Qe = {
        class: 'sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pt-safe',
    },
    Ze = { class: 'flex h-11 items-center justify-between px-4' },
    Ke = { class: 'flex items-center gap-1 shrink-0' },
    Je = ['aria-label'],
    et = ['fill'],
    tt = ['disabled', 'aria-label', 'title'],
    nt = { key: 0, class: 'flex items-center justify-center py-20' },
    rt = { key: 1, class: 'mx-auto max-w-3xl px-4 py-20 text-center' },
    ot = {
        key: 0,
        class: 'mt-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200',
    },
    at = { class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-400' },
    lt = { class: 'mt-6 flex items-center justify-center gap-3' },
    st = { key: 2, class: 'overflow-x-hidden' },
    it = { class: 'mb-6' },
    ut = { class: 'text-2xl font-bold leading-tight text-neutral-900 dark:text-neutral-100' },
    ct = ['href'],
    dt = {
        class: 'mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400',
    },
    vt = ['src'],
    ft = { key: 1 },
    mt = ['src', 'alt'],
    pt = { key: 1, class: 'flex items-center gap-2 py-8 text-neutral-400' },
    ht = ['innerHTML'],
    gt = { key: 3, class: 'py-12 text-center' },
    xt = { class: 'text-neutral-500 dark:text-neutral-400' },
    kt = {
        class: 'mt-8 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-4',
    },
    yt = { key: 1 },
    wt = { key: 3 },
    bt = 150,
    Tt = 15,
    he = 100,
    _t = 0.5,
    St = 0.45,
    Ct = {
        __name: 'ArticleDetailView',
        setup(Mt) {
            const x = Pe(),
                L = Ve(),
                C = Ne(),
                { success: I, error: ge } = Fe(),
                { isOnline: ne } = Ue(),
                n = p(null),
                z = p(!0),
                k = p(!1),
                T = p(null),
                E = p(!1),
                xe = A(() => {
                    const e = (n.value?.content || n.value?.summary || '').replace(
                        /(href|src)=(["'])http:\/\//gi,
                        '$1=$2https://'
                    )
                    return We.sanitize(e, { USE_PROFILES: { html: !0 } })
                }),
                h = p(!1),
                c = p(null)
            function V() {
                const t = window.screen.width < 1024
                h.value !== t && (h.value = t)
            }
            ;(de(() => {
                ;(V(),
                    window.addEventListener('resize', V),
                    window.addEventListener('scroll', q, { passive: !0 }))
            }),
                G(() => {
                    ;(window.removeEventListener('resize', V),
                        window.removeEventListener('scroll', q),
                        clearTimeout(Y))
                }),
                G(() => Q()))
            const N = p(!1),
                O = p(!1),
                j = p(null)
            let M = 0
            async function X(t) {
                const e = ++M,
                    r = Number(t)
                ;((O.value = !1),
                    h.value && c.value ? (c.value.scrollTop = 0) : window.scrollTo(0, 0))
                let a = 0
                const l = pe()
                l?.scrollTop && l.url === `/articles/${r}` && (a = l.scrollTop)
                const f = `/articles/${r}`,
                    v = x.articles.find(d => d.id === r)
                ;(ve(f, 0, v?.title ?? (l?.url === f ? l.title : null)),
                    v
                        ? ((n.value = { ...v }),
                          (k.value = v.is_read_later || !1),
                          te(v.title),
                          (z.value = !1),
                          (N.value = !0))
                        : ((n.value = null), (z.value = !0)),
                    x.cancelWarmCache())
                try {
                    const d = await x.fetchContent(r)
                    if (e !== M) return
                    ;((n.value = d),
                        (k.value = d.is_read_later || !1),
                        te(d.title),
                        x.markRead(r),
                        x.prefetchAdjacent(r))
                    const g = d.reading_progress
                    a
                        ? (await Z(),
                          setTimeout(() => {
                              e === M &&
                                  (h.value && c.value
                                      ? (c.value.scrollTop = a)
                                      : window.scrollTo(0, a))
                          }, 100))
                        : d.is_read_later &&
                          g &&
                          g > 0 &&
                          (await Z(),
                          setTimeout(() => {
                              if (e === M)
                                  if (h.value && c.value) {
                                      const S = c.value.scrollHeight - c.value.clientHeight
                                      c.value.scrollTop = Math.round((g / 100) * S)
                                  } else {
                                      const S =
                                          document.documentElement.scrollHeight -
                                          window.innerHeight
                                      window.scrollTo(0, Math.round((g / 100) * S))
                                  }
                          }, 100))
                } catch (d) {
                    if (e !== M) return
                    ;[403, 404, 410].includes(d.response?.status)
                        ? (Q(), L.replace({ name: 'articles.index' }))
                        : ((j.value = pe()?.title ?? null),
                          (O.value = !0),
                          te(j.value || 'Unavailable'))
                } finally {
                    e === M && ((z.value = !1), (N.value = !1))
                }
            }
            let Y = null
            function re() {
                let t, e, r
                h.value && c.value
                    ? ((t = c.value.scrollTop),
                      (e = c.value.scrollHeight),
                      (r = c.value.clientHeight))
                    : ((t = window.scrollY),
                      (e = document.documentElement.scrollHeight),
                      (r = window.innerHeight))
                const a = e - r
                return a <= 0 ? 0 : Math.min(100, Math.round((t / a) * 100))
            }
            function q() {
                n.value &&
                    (clearTimeout(Y),
                    (Y = setTimeout(() => {
                        const t = h.value && c.value ? c.value.scrollTop : window.scrollY
                        ;(ve(`/articles/${n.value.id}`, t, n.value.title ?? null),
                            k.value && x.saveReadingProgress(n.value.id, re()))
                    }, 500)))
            }
            ;(X(C.params.id),
                Oe(
                    () => C.params.id,
                    async t => {
                        t &&
                            C.name === 'articles.show' &&
                            ((E.value = !1), await X(t), await Z(), le())
                    }
                ))
            const w = A(() =>
                n.value ? x.adjacentIds(n.value.id) : { prev: null, next: null }
            )
            function H(t) {
                if (E.value) return
                const e = t === 'next' ? w.value.next : w.value.prev
                e &&
                    ((E.value = !0),
                    sessionStorage.setItem('article-swipe-direction', t),
                    L.replace({ name: 'articles.show', params: { id: e } }))
            }
            const ke = A(() =>
                    n.value?.image_url
                        ? !(n.value.content || n.value.summary || '').includes(
                              n.value.image_url
                          )
                        : !1
                ),
                ye = A(() =>
                    n.value
                        ? new Date(n.value.published_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                          })
                        : ''
                ),
                we = A(() =>
                    n.value
                        ? new Date(n.value.published_at).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : ''
                )
            function B() {
                Q()
                const t = C.fullPath
                ;(L.back(),
                    setTimeout(() => {
                        C.fullPath === t && L.push({ name: 'articles.index' })
                    }, 100))
            }
            function be() {
                n.value &&
                    (x.toggleReadLater(n.value.id, re()),
                    (k.value = !k.value),
                    I(k.value ? 'Article saved' : 'Removed from Read Later'))
            }
            function Te() {
                n.value && (x.markUnread(n.value.id), I('Marked as unread'))
            }
            function oe() {
                if (n.value?.url)
                    try {
                        const t = new URL(n.value.url)
                        ;(t.protocol === 'http:' || t.protocol === 'https:') &&
                            window.open(t.href, '_blank', 'noopener,noreferrer')
                    } catch {}
            }
            function _e() {
                n.value &&
                    (navigator.share
                        ? navigator
                              .share({ title: n.value.title, url: n.value.url })
                              .catch(() => {})
                        : n.value.url &&
                          navigator.clipboard
                              .writeText(n.value.url)
                              .then(() => {
                                  I('Link copied to clipboard')
                              })
                              .catch(() => {}))
            }
            function ae(t) {
                t.target.tagName === 'INPUT' ||
                    t.target.tagName === 'TEXTAREA' ||
                    t.target.isContentEditable ||
                    (t.key === 'ArrowRight' || t.key === 'j'
                        ? H('next')
                        : t.key === 'ArrowLeft' || t.key === 'k'
                          ? H('prev')
                          : t.key === 'Escape' && B())
            }
            function le() {
                const t = sessionStorage.getItem('article-swipe-direction')
                if (t && T.value) {
                    sessionStorage.removeItem('article-swipe-direction')
                    const e = T.value,
                        r = t === 'next' ? '40%' : '-40%'
                    ;((e.style.transition = 'none'),
                        (e.style.transform = `translateX(${r})`),
                        e.offsetHeight,
                        (e.style.transition = 'transform 160ms ease-out'),
                        (e.style.transform = 'translateX(0)'),
                        e.addEventListener(
                            'transitionend',
                            () => {
                                ;((e.style.transition = ''), (e.style.transform = ''))
                            },
                            { once: !0 }
                        ))
                }
            }
            ;(de(() => {
                ;(document.addEventListener('keydown', ae),
                    document.addEventListener('selectionchange', ce),
                    le())
            }),
                G(() => {
                    ;(clearTimeout(W),
                        document.removeEventListener('keydown', ae),
                        document.removeEventListener('selectionchange', ce),
                        (u = 'idle'),
                        ue())
                }))
            const R = p(null),
                D = p(null)
            let P = 0,
                $ = 0,
                U = 0,
                u = 'idle',
                se = !1,
                _ = 0
            function Se() {
                return window.visualViewport ? window.visualViewport.scale > 1.05 : !1
            }
            function Ce(t) {
                if (u === 'animating' || !h.value || E.value || Se()) return
                ;((P = t.touches[0].clientX),
                    ($ = t.touches[0].clientY),
                    (U = Date.now()),
                    (_ = 0))
                const e = c.value
                ;((se = e ? e.scrollTop <= 0 : !1), (u = 'tracking'))
            }
            function Me(t) {
                if (u === 'idle' || u === 'animating' || !h.value) return
                const e = t.touches[0].clientX - P,
                    r = t.touches[0].clientY - $,
                    a = Math.abs(e),
                    l = Math.abs(r)
                if (u === 'tracking') {
                    if (Math.sqrt(a * a + l * l) < Tt) return
                    if (l > a && r > 0 && se) ((u = 'dismissing'), t.preventDefault())
                    else if (a > l * 1.2) ((u = 'horizontal'), t.preventDefault())
                    else {
                        u = 'idle'
                        return
                    }
                }
                if (u === 'dismissing') {
                    t.preventDefault()
                    const f = Math.max(0, t.touches[0].clientY - $)
                    De(f)
                }
                u === 'horizontal' && (t.preventDefault(), Ee(e))
            }
            function Le(t) {
                const e = u,
                    r = t.changedTouches[0].clientX - P,
                    a = t.changedTouches[0].clientY - $
                if (e === 'horizontal') {
                    const l = Date.now() - U,
                        f = Math.abs(r) / Math.max(l, 1)
                    if ((Math.abs(_) > he || f > _t) && !E.value) {
                        const d = _ < 0 ? 'next' : 'prev'
                        if (d === 'next' ? w.value.next : w.value.prev) {
                            He(d)
                            return
                        }
                    }
                    Re()
                    return
                }
                if (e === 'dismissing') {
                    const l = Date.now() - U,
                        f = a / Math.max(l, 1),
                        v = window.innerHeight * 0.3,
                        d = Math.max(0, a) * 0.6
                    d > bt || d > v || f > 1.5 ? Ae() : Ie()
                    return
                }
                u = 'idle'
            }
            function Ee(t) {
                const e = T.value,
                    r = D.value
                if (!e) return
                const l = (t < 0 ? 'next' : 'prev') === 'next' ? w.value.next : w.value.prev
                if (
                    ((_ = t * (l ? St : 0.15)),
                    (e.style.transition = 'none'),
                    (e.style.transform = `translateX(${_}px)`),
                    (e.style.willChange = 'transform'),
                    r)
                ) {
                    const v = Math.min(Math.abs(_) / he, 1),
                        d = t < 0
                    ;((r.style.transition = 'none'),
                        (r.style.opacity = String(l ? v * 0.9 : v * 0.3)),
                        (r.className =
                            'swipe-indicator ' +
                            (d ? 'swipe-indicator-right' : 'swipe-indicator-left')))
                    const g = r.querySelector('.swipe-chevron')
                    if (g) {
                        const Be = 0.6 + 0.4 * v,
                            $e = d ? ' scaleX(-1)' : ''
                        ;((g.style.transform = `scale(${Be})${$e}`),
                            (g.style.opacity = String(l ? 1 : 0.4)))
                    }
                    const S = r.querySelector('.swipe-label')
                    S &&
                        ((S.style.opacity = String(v > 0.6 ? (v - 0.6) / 0.4 : 0)),
                        (S.textContent = l ? (d ? 'Next' : 'Previous') : ''))
                }
            }
            function He(t) {
                u = 'animating'
                const e = T.value,
                    r = D.value
                if (!e) return
                const a = t === 'next' ? -window.innerWidth : window.innerWidth
                ;((e.style.transition = 'transform 200ms ease-in'),
                    (e.style.transform = `translateX(${a}px)`),
                    r &&
                        ((r.style.transition = 'opacity 200ms ease-in'),
                        (r.style.opacity = '0')))
                let l = !1
                const f = () => {
                        l || ((l = !0), clearTimeout(v), ie(), H(t))
                    },
                    v = setTimeout(f, 300)
                e.addEventListener('transitionend', f, { once: !0 })
            }
            function Re() {
                u = 'animating'
                const t = T.value,
                    e = D.value
                if (!t) {
                    u = 'idle'
                    return
                }
                ;((t.style.transition = 'transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1.0)'),
                    (t.style.transform = 'translateX(0)'),
                    e &&
                        ((e.style.transition = 'opacity 250ms ease-out'),
                        (e.style.opacity = '0')))
                let r = !1
                const a = () => {
                        r || ((r = !0), clearTimeout(l), ie())
                    },
                    l = setTimeout(a, 350)
                t.addEventListener('transitionend', a, { once: !0 })
            }
            function ie() {
                ;((u = 'idle'), (_ = 0))
                const t = T.value,
                    e = D.value
                ;(t &&
                    ((t.style.transition = ''),
                    (t.style.transform = ''),
                    (t.style.willChange = '')),
                    e && ((e.style.transition = ''), (e.style.opacity = '0')))
            }
            function De(t) {
                const e = c.value,
                    r = R.value
                if (!e) return
                const a = t * 0.6,
                    l = window.innerHeight * 0.5,
                    f = Math.min(a / l, 1),
                    v = 1 - 0.08 * f
                ;((e.style.transition = 'none'),
                    (e.style.transform = `translateY(${a}px) scale(${v})`),
                    (e.style.transformOrigin = 'top center'),
                    (e.style.borderRadius = `${12 * f}px`),
                    r && ((r.style.transition = 'none'), (r.style.opacity = String(0.5 * f))))
            }
            function Ae() {
                u = 'animating'
                const t = c.value,
                    e = R.value
                if (!t) return
                ;((t.style.transition =
                    'transform 250ms ease-in, border-radius 250ms ease-in'),
                    (t.style.transform = 'translateY(100vh) scale(0.9)'),
                    (t.style.borderRadius = '12px'),
                    e &&
                        ((e.style.transition = 'opacity 250ms ease-in'),
                        (e.style.opacity = '0')))
                let r = !1
                const a = () => {
                        r || ((r = !0), clearTimeout(l), (u = 'idle'), B())
                    },
                    l = setTimeout(a, 400)
                t.addEventListener('transitionend', a, { once: !0 })
            }
            function Ie() {
                u = 'animating'
                const t = c.value,
                    e = R.value
                if (!t) return
                ;((t.style.transition =
                    'transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1.0), border-radius 300ms ease-out'),
                    (t.style.transform = 'translateY(0) scale(1)'),
                    (t.style.borderRadius = '0px'),
                    e &&
                        ((e.style.transition = 'opacity 300ms ease-out'),
                        (e.style.opacity = '0')))
                let r = !1
                const a = () => {
                        r || ((r = !0), clearTimeout(l), (u = 'idle'), ue())
                    },
                    l = setTimeout(a, 450)
                t.addEventListener('transitionend', a, { once: !0 })
            }
            function ue() {
                const t = c.value,
                    e = R.value
                ;(t &&
                    ((t.style.transition = ''),
                    (t.style.transform = ''),
                    (t.style.transformOrigin = ''),
                    (t.style.borderRadius = '')),
                    e && ((e.style.transition = ''), (e.style.opacity = '0')))
            }
            const b = p(!1)
            let F = '',
                W = null
            function ce() {
                ;(clearTimeout(W),
                    (W = setTimeout(() => {
                        const t = window.getSelection()
                        if (!t || t.isCollapsed || !t.toString().trim()) {
                            b.value = !1
                            return
                        }
                        const e = document.querySelector('.article-content')
                        if (!e) {
                            b.value = !1
                            return
                        }
                        const r = t.getRangeAt(0),
                            a = e.contains(r.commonAncestorContainer)
                        ;((b.value = a), a && (F = t.toString().trim()))
                    }, 100)))
            }
            async function ze() {
                const t = F
                if (!t || !n.value) return
                const e = n.value.id
                ;((F = ''), window.getSelection()?.removeAllRanges(), (b.value = !1))
                try {
                    ;(await qe.post('/api/highlights', { article_id: e, text: t }),
                        I('Quote saved'))
                } catch {
                    ge('Failed to save quote')
                }
            }
            function je(t) {
                L.push({ name: 'articles.index', query: { feed_id: t } })
            }
            return (t, e) => (
                i(),
                s('div', null, [
                    fe(
                        o(
                            'div',
                            {
                                ref_key: 'scrimEl',
                                ref: R,
                                class: 'fixed inset-0 z-40 bg-black pointer-events-none',
                                style: { opacity: '0' },
                            },
                            null,
                            512
                        ),
                        [[me, h.value]]
                    ),
                    fe(
                        o(
                            'div',
                            {
                                ref_key: 'swipeIndicatorEl',
                                ref: D,
                                class: 'swipe-indicator',
                                style: { opacity: '0' },
                            },
                            [
                                ...(e[6] ||
                                    (e[6] = [
                                        o(
                                            'div',
                                            { class: 'swipe-chevron' },
                                            [
                                                o(
                                                    'svg',
                                                    {
                                                        class: 'h-5 w-5',
                                                        fill: 'none',
                                                        viewBox: '0 0 24 24',
                                                        'stroke-width': '2',
                                                        stroke: 'currentColor',
                                                    },
                                                    [
                                                        o('path', {
                                                            'stroke-linecap': 'round',
                                                            'stroke-linejoin': 'round',
                                                            d: 'M15.75 19.5L8.25 12l7.5-7.5',
                                                        }),
                                                    ]
                                                ),
                                            ],
                                            -1
                                        ),
                                        o('span', { class: 'swipe-label' }, null, -1),
                                    ])),
                            ],
                            512
                        ),
                        [[me, h.value]]
                    ),
                    o(
                        'div',
                        {
                            ref_key: 'scrollContainer',
                            ref: c,
                            class: K(
                                h.value
                                    ? 'fixed inset-0 z-50 overflow-y-auto overscroll-none bg-white dark:bg-neutral-950'
                                    : ''
                            ),
                            onScrollPassive: q,
                            onTouchstartPassive: Ce,
                            onTouchmove: Me,
                            onTouchend: Le,
                        },
                        [
                            o('header', Qe, [
                                o('div', Ze, [
                                    o('div', { class: 'flex items-center gap-2 min-w-0' }, [
                                        o(
                                            'button',
                                            {
                                                onClick: B,
                                                class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2',
                                                'aria-label': 'Go back',
                                            },
                                            [
                                                ...(e[7] ||
                                                    (e[7] = [
                                                        o(
                                                            'svg',
                                                            {
                                                                class: 'h-5 w-5',
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '1.5',
                                                                stroke: 'currentColor',
                                                            },
                                                            [
                                                                o('path', {
                                                                    'stroke-linecap': 'round',
                                                                    'stroke-linejoin': 'round',
                                                                    d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                                                                }),
                                                            ],
                                                            -1
                                                        ),
                                                    ])),
                                            ]
                                        ),
                                    ]),
                                    o('div', Ke, [
                                        n.value
                                            ? (i(),
                                              s(
                                                  'button',
                                                  {
                                                      key: 0,
                                                      onClick: be,
                                                      class: K([
                                                          'rounded-lg p-2 transition-colors cursor-pointer',
                                                          k.value
                                                              ? 'text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                      ]),
                                                      'aria-label': k.value
                                                          ? 'Remove from Read Later'
                                                          : 'Save to Read Later',
                                                  },
                                                  [
                                                      (i(),
                                                      s(
                                                          'svg',
                                                          {
                                                              class: 'h-5 w-5',
                                                              fill: k.value
                                                                  ? 'currentColor'
                                                                  : 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              ...(e[8] ||
                                                                  (e[8] = [
                                                                      o(
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
                                                          et
                                                      )),
                                                  ],
                                                  10,
                                                  Je
                                              ))
                                            : m('', !0),
                                        n.value
                                            ? (i(),
                                              s(
                                                  'button',
                                                  {
                                                      key: 1,
                                                      onClick: ze,
                                                      disabled: !b.value,
                                                      class: K([
                                                          'rounded-lg p-2 transition-colors cursor-pointer',
                                                          b.value
                                                              ? 'text-amber-500 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                              : 'text-neutral-300 dark:text-neutral-600 cursor-default',
                                                      ]),
                                                      'aria-label': b.value
                                                          ? 'Save selected text as quote'
                                                          : 'Select text to save quote',
                                                      title: b.value
                                                          ? 'Save quote'
                                                          : 'Select text first',
                                                  },
                                                  [
                                                      ...(e[9] ||
                                                          (e[9] = [
                                                              o(
                                                                  'svg',
                                                                  {
                                                                      class: 'h-5 w-5',
                                                                      fill: 'none',
                                                                      viewBox: '0 0 24 24',
                                                                      'stroke-width': '1.5',
                                                                      stroke: 'currentColor',
                                                                  },
                                                                  [
                                                                      o('path', {
                                                                          'stroke-linecap':
                                                                              'round',
                                                                          'stroke-linejoin':
                                                                              'round',
                                                                          d: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                          ])),
                                                  ],
                                                  10,
                                                  tt
                                              ))
                                            : m('', !0),
                                        n.value
                                            ? (i(),
                                              s(
                                                  'button',
                                                  {
                                                      key: 2,
                                                      onClick: e[0] || (e[0] = r => Te()),
                                                      class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                      'aria-label': 'Mark as unread',
                                                  },
                                                  [
                                                      ...(e[10] ||
                                                          (e[10] = [
                                                              o(
                                                                  'svg',
                                                                  {
                                                                      class: 'h-5 w-5',
                                                                      fill: 'none',
                                                                      viewBox: '0 0 24 24',
                                                                      'stroke-width': '1.5',
                                                                      stroke: 'currentColor',
                                                                  },
                                                                  [
                                                                      o('path', {
                                                                          'stroke-linecap':
                                                                              'round',
                                                                          'stroke-linejoin':
                                                                              'round',
                                                                          d: 'M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                          ])),
                                                  ]
                                              ))
                                            : m('', !0),
                                        n.value?.url
                                            ? (i(),
                                              s(
                                                  'button',
                                                  {
                                                      key: 3,
                                                      onClick: e[1] || (e[1] = r => oe()),
                                                      class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                      'aria-label': 'Open in browser',
                                                  },
                                                  [
                                                      ...(e[11] ||
                                                          (e[11] = [
                                                              o(
                                                                  'svg',
                                                                  {
                                                                      class: 'h-5 w-5',
                                                                      fill: 'none',
                                                                      viewBox: '0 0 24 24',
                                                                      'stroke-width': '1.5',
                                                                      stroke: 'currentColor',
                                                                  },
                                                                  [
                                                                      o('path', {
                                                                          'stroke-linecap':
                                                                              'round',
                                                                          'stroke-linejoin':
                                                                              'round',
                                                                          d: 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                          ])),
                                                  ]
                                              ))
                                            : m('', !0),
                                        n.value
                                            ? (i(),
                                              s(
                                                  'button',
                                                  {
                                                      key: 4,
                                                      onClick: _e,
                                                      class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                      'aria-label': 'Share article',
                                                  },
                                                  [
                                                      ...(e[12] ||
                                                          (e[12] = [
                                                              o(
                                                                  'svg',
                                                                  {
                                                                      class: 'h-5 w-5',
                                                                      fill: 'none',
                                                                      viewBox: '0 0 24 24',
                                                                      'stroke-width': '1.5',
                                                                      stroke: 'currentColor',
                                                                  },
                                                                  [
                                                                      o('path', {
                                                                          'stroke-linecap':
                                                                              'round',
                                                                          'stroke-linejoin':
                                                                              'round',
                                                                          d: 'M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                          ])),
                                                  ]
                                              ))
                                            : m('', !0),
                                    ]),
                                ]),
                            ]),
                            z.value
                                ? (i(),
                                  s('div', nt, [
                                      ...(e[13] ||
                                          (e[13] = [
                                              o(
                                                  'svg',
                                                  {
                                                      class: 'h-8 w-8 animate-spin text-neutral-400',
                                                      fill: 'none',
                                                      viewBox: '0 0 24 24',
                                                  },
                                                  [
                                                      o('circle', {
                                                          class: 'opacity-25',
                                                          cx: '12',
                                                          cy: '12',
                                                          r: '10',
                                                          stroke: 'currentColor',
                                                          'stroke-width': '4',
                                                      }),
                                                      o('path', {
                                                          class: 'opacity-75',
                                                          fill: 'currentColor',
                                                          d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                      }),
                                                  ],
                                                  -1
                                              ),
                                          ])),
                                  ]))
                                : O.value
                                  ? (i(),
                                    s('div', rt, [
                                        e[14] ||
                                            (e[14] = o(
                                                'svg',
                                                {
                                                    class: 'mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                    fill: 'none',
                                                    viewBox: '0 0 24 24',
                                                    'stroke-width': '1',
                                                    stroke: 'currentColor',
                                                },
                                                [
                                                    o('path', {
                                                        'stroke-linecap': 'round',
                                                        'stroke-linejoin': 'round',
                                                        d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                    }),
                                                ],
                                                -1
                                            )),
                                        j.value
                                            ? (i(), s('h1', ot, y(j.value), 1))
                                            : m('', !0),
                                        o(
                                            'p',
                                            at,
                                            y(
                                                J(ne)
                                                    ? "Couldn't load this article. It may just be a hiccup — try again."
                                                    : "This article isn't downloaded, so it can't be opened offline."
                                            ),
                                            1
                                        ),
                                        e[15] ||
                                            (e[15] = o(
                                                'p',
                                                {
                                                    class: 'mt-1 text-xs text-neutral-500 dark:text-neutral-500',
                                                },
                                                " Your place is saved — it'll reopen here next time. ",
                                                -1
                                            )),
                                        o('div', lt, [
                                            o(
                                                'button',
                                                {
                                                    type: 'button',
                                                    onClick:
                                                        e[2] ||
                                                        (e[2] = r => X(J(C).params.id)),
                                                    class: 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                },
                                                ' Try again '
                                            ),
                                            o(
                                                'button',
                                                {
                                                    type: 'button',
                                                    onClick: B,
                                                    class: 'rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer',
                                                },
                                                ' Back to list '
                                            ),
                                        ]),
                                    ]))
                                  : n.value
                                    ? (i(),
                                      s('div', st, [
                                          o(
                                              'article',
                                              {
                                                  ref_key: 'articleEl',
                                                  ref: T,
                                                  class: 'mx-auto max-w-3xl px-4 py-6',
                                              },
                                              [
                                                  o('header', it, [
                                                      o('h1', ut, [
                                                          n.value.url
                                                              ? (i(),
                                                                s(
                                                                    'a',
                                                                    {
                                                                        key: 0,
                                                                        href: n.value.url,
                                                                        target: '_blank',
                                                                        rel: 'noopener noreferrer',
                                                                        class: 'hover:text-blue-500 dark:hover:text-blue-400 transition-colors',
                                                                    },
                                                                    y(n.value.title),
                                                                    9,
                                                                    ct
                                                                ))
                                                              : (i(),
                                                                s(
                                                                    Xe,
                                                                    { key: 1 },
                                                                    [ee(y(n.value.title), 1)],
                                                                    64
                                                                )),
                                                      ]),
                                                      o('div', dt, [
                                                          n.value.feed_id
                                                              ? (i(),
                                                                s(
                                                                    'a',
                                                                    {
                                                                        key: 0,
                                                                        href: '#',
                                                                        class: 'flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 transition-colors',
                                                                        onClick:
                                                                            e[3] ||
                                                                            (e[3] = Ye(
                                                                                r =>
                                                                                    je(
                                                                                        n.value
                                                                                            .feed_id
                                                                                    ),
                                                                                ['prevent']
                                                                            )),
                                                                    },
                                                                    [
                                                                        n.value
                                                                            .feed_favicon_url
                                                                            ? (i(),
                                                                              s(
                                                                                  'img',
                                                                                  {
                                                                                      key: 0,
                                                                                      src: n
                                                                                          .value
                                                                                          .feed_favicon_url,
                                                                                      class: 'h-4 w-4 rounded-sm',
                                                                                      alt: '',
                                                                                  },
                                                                                  null,
                                                                                  8,
                                                                                  vt
                                                                              ))
                                                                            : m('', !0),
                                                                        o(
                                                                            'span',
                                                                            null,
                                                                            y(
                                                                                n.value
                                                                                    .feed_title
                                                                            ),
                                                                            1
                                                                        ),
                                                                    ]
                                                                ))
                                                              : m('', !0),
                                                          n.value.author
                                                              ? (i(),
                                                                s(
                                                                    'span',
                                                                    ft,
                                                                    '· ' + y(n.value.author),
                                                                    1
                                                                ))
                                                              : m('', !0),
                                                          o(
                                                              'span',
                                                              null,
                                                              '· ' +
                                                                  y(ye.value) +
                                                                  ' at ' +
                                                                  y(we.value),
                                                              1
                                                          ),
                                                      ]),
                                                  ]),
                                                  ke.value
                                                      ? (i(),
                                                        s(
                                                            'img',
                                                            {
                                                                key: 0,
                                                                src: n.value.image_url,
                                                                alt: n.value.title,
                                                                class: 'mb-6 w-full max-h-80 object-cover rounded-lg',
                                                                loading: 'lazy',
                                                            },
                                                            null,
                                                            8,
                                                            mt
                                                        ))
                                                      : m('', !0),
                                                  N.value && !n.value.content
                                                      ? (i(),
                                                        s('div', pt, [
                                                            ...(e[16] ||
                                                                (e[16] = [
                                                                    o(
                                                                        'svg',
                                                                        {
                                                                            class: 'h-4 w-4 animate-spin',
                                                                            fill: 'none',
                                                                            viewBox:
                                                                                '0 0 24 24',
                                                                        },
                                                                        [
                                                                            o('circle', {
                                                                                class: 'opacity-25',
                                                                                cx: '12',
                                                                                cy: '12',
                                                                                r: '10',
                                                                                stroke: 'currentColor',
                                                                                'stroke-width':
                                                                                    '4',
                                                                            }),
                                                                            o('path', {
                                                                                class: 'opacity-75',
                                                                                fill: 'currentColor',
                                                                                d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                                            }),
                                                                        ],
                                                                        -1
                                                                    ),
                                                                    o(
                                                                        'span',
                                                                        { class: 'text-sm' },
                                                                        'Loading full article...',
                                                                        -1
                                                                    ),
                                                                ])),
                                                        ]))
                                                      : (i(),
                                                        s(
                                                            'div',
                                                            {
                                                                key: 2,
                                                                class: 'article-content prose max-w-none dark:prose-invert prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 prose-code:text-blue-300 prose-pre:bg-neutral-50 dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-img:rounded-lg prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-500 dark:prose-blockquote:text-neutral-400',
                                                                innerHTML: xe.value,
                                                            },
                                                            null,
                                                            8,
                                                            ht
                                                        )),
                                                  !n.value.content && !n.value.summary
                                                      ? (i(),
                                                        s('div', gt, [
                                                            o(
                                                                'p',
                                                                xt,
                                                                y(
                                                                    n.value._offline
                                                                        ? "This article wasn't downloaded for offline reading."
                                                                        : 'No article content available.'
                                                                ),
                                                                1
                                                            ),
                                                            n.value.url && J(ne)
                                                                ? (i(),
                                                                  s(
                                                                      'button',
                                                                      {
                                                                          key: 0,
                                                                          onClick: oe,
                                                                          class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                                      },
                                                                      ' Read on original site '
                                                                  ))
                                                                : m('', !0),
                                                        ]))
                                                      : m('', !0),
                                                  o('div', kt, [
                                                      w.value.prev
                                                          ? (i(),
                                                            s(
                                                                'button',
                                                                {
                                                                    key: 0,
                                                                    onClick:
                                                                        e[4] ||
                                                                        (e[4] = r =>
                                                                            H('prev')),
                                                                    class: 'flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                                },
                                                                [
                                                                    ...(e[17] ||
                                                                        (e[17] = [
                                                                            o(
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
                                                                                    o('path', {
                                                                                        'stroke-linecap':
                                                                                            'round',
                                                                                        'stroke-linejoin':
                                                                                            'round',
                                                                                        d: 'M15.75 19.5L8.25 12l7.5-7.5',
                                                                                    }),
                                                                                ],
                                                                                -1
                                                                            ),
                                                                            ee(
                                                                                ' Previous ',
                                                                                -1
                                                                            ),
                                                                        ])),
                                                                ]
                                                            ))
                                                          : (i(), s('div', yt)),
                                                      w.value.next
                                                          ? (i(),
                                                            s(
                                                                'button',
                                                                {
                                                                    key: 2,
                                                                    onClick:
                                                                        e[5] ||
                                                                        (e[5] = r =>
                                                                            H('next')),
                                                                    class: 'flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer',
                                                                },
                                                                [
                                                                    ...(e[18] ||
                                                                        (e[18] = [
                                                                            ee(' Next ', -1),
                                                                            o(
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
                                                                                    o('path', {
                                                                                        'stroke-linecap':
                                                                                            'round',
                                                                                        'stroke-linejoin':
                                                                                            'round',
                                                                                        d: 'M8.25 4.5l7.5 7.5-7.5 7.5',
                                                                                    }),
                                                                                ],
                                                                                -1
                                                                            ),
                                                                        ])),
                                                                ]
                                                            ))
                                                          : (i(), s('div', wt)),
                                                  ]),
                                              ],
                                              512
                                          ),
                                      ]))
                                    : m('', !0),
                        ],
                        34
                    ),
                ])
            )
        },
    },
    It = Ge(Ct, [['__scopeId', 'data-v-0dcad889']])
export { It as default }
