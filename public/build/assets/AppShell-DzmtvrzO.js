import { u as ce, a as ve, b as xe } from './useArticleStore-DIulHH08.js'
import { u as ee } from './useAddFeedModal-CO9o391U.js'
import { u as ke } from './useDarkMode-DRhgZMM1.js'
import {
    w as te,
    n as Z,
    o as fe,
    a as be,
    b as r,
    c as O,
    d as C,
    e as Q,
    f as l,
    g as e,
    T as P,
    t as c,
    h as i,
    i as G,
    j as s,
    k as E,
    l as pe,
    F as T,
    r as I,
    v as ge,
    m as me,
    p as b,
    q as J,
    u as z,
    s as re,
    x as le,
    y as he,
    z as ye,
    A as we,
    K as Ce,
    B as $e,
    C as Me,
    D,
    E as je,
} from './app-BO6VQ9fp.js'
import { _ as K, a as q, b as W } from './TextInput-B8pmyqSi.js'
import { u as Y } from './useSidebarStore-CsYhynkn.js'
import { u as ne } from './useToast-w_qnOgVX.js'
import { _ as ae } from './_plugin-vue_export-helper-DlAUqK2U.js'
const Se = {
        key: 0,
        class: 'fixed inset-0 z-50 flex items-start justify-center pt-[12vh] lg:items-center lg:pt-0',
    },
    ze = {
        key: 0,
        class: 'relative z-10 w-full max-h-[80vh] overflow-y-auto rounded-2xl bg-neutral-50 dark:bg-neutral-900 shadow-2xl max-w-md mx-4',
    },
    Fe = {
        class: 'sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-5 py-4 rounded-t-2xl',
    },
    Ae = { class: 'text-base font-semibold text-neutral-900 dark:text-neutral-100' },
    Be = { class: 'p-5' },
    Le = { class: 'mb-4 flex rounded-lg bg-neutral-200 dark:bg-neutral-800 p-0.5' },
    Ve = { key: 0 },
    _e = { key: 0 },
    Te = ['disabled'],
    Ue = { key: 0, class: 'mr-2 h-4 w-4 animate-spin', viewBox: '0 0 24 24', fill: 'none' },
    Re = { key: 1 },
    He = {
        class: 'flex items-start gap-3 mb-5 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3',
    },
    Ie = ['src'],
    Ne = {
        key: 1,
        class: 'mt-0.5 h-6 w-6 rounded bg-neutral-300 dark:bg-neutral-700 shrink-0',
    },
    Ee = { class: 'min-w-0 flex-1' },
    Oe = { class: 'text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate' },
    De = {
        key: 0,
        class: 'mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2',
    },
    qe = { class: 'mt-0.5 text-xs text-neutral-600 dark:text-neutral-500' },
    Qe = { class: 'mb-4' },
    Ke = { class: 'mb-4' },
    Pe = { key: 0 },
    Ye = ['value'],
    Ze = { key: 1 },
    Ge = ['disabled'],
    Je = { key: 0, class: 'mr-2 h-4 w-4 animate-spin', viewBox: '0 0 24 24', fill: 'none' },
    We = { key: 1 },
    Xe = ['disabled'],
    et = { key: 0, class: 'mr-2 h-4 w-4 animate-spin', viewBox: '0 0 24 24', fill: 'none' },
    tt = {
        __name: 'AddFeedModal',
        props: {
            show: { type: Boolean, default: !1 },
            initialTab: { type: String, default: 'feed' },
            initialUrl: { type: String, default: '' },
        },
        emits: ['close'],
        setup(a, { emit: B }) {
            const $ = a,
                F = B,
                { success: f } = ne(),
                d = b('feed'),
                p = b(''),
                M = b(''),
                L = b(!1),
                g = b(null),
                m = b([]),
                H = b(''),
                U = b(''),
                j = b(''),
                A = b(''),
                V = b(!1),
                y = b(!1),
                S = b({}),
                x = b(''),
                t = b(!1),
                n = b(''),
                o = b(null),
                _ = b(null)
            te(
                () => $.show,
                k => {
                    k
                        ? ((document.body.style.overflow = 'hidden'),
                          $.initialTab && (d.value = $.initialTab),
                          $.initialUrl && (x.value = $.initialUrl),
                          Z(() => {
                              d.value === 'article' ? _.value?.focus() : o.value?.focus()
                          }))
                        : ((document.body.style.overflow = ''), v())
                }
            )
            function w(k) {
                k.key === 'Escape' && $.show && (k.preventDefault(), N())
            }
            ;(fe(() => document.addEventListener('keydown', w)),
                be(() => {
                    ;(document.removeEventListener('keydown', w),
                        (document.body.style.overflow = ''))
                }))
            function v() {
                ;((d.value = 'feed'),
                    (p.value = ''),
                    (M.value = ''),
                    (L.value = !1),
                    (g.value = null),
                    (m.value = []),
                    (H.value = ''),
                    (U.value = ''),
                    (j.value = ''),
                    (A.value = ''),
                    (V.value = !1),
                    (y.value = !1),
                    (S.value = {}),
                    (x.value = ''),
                    (t.value = !1),
                    (n.value = ''))
            }
            function N() {
                F('close')
            }
            function R(k) {
                ;((d.value = k),
                    Z(() => {
                        k === 'article' ? _.value?.focus() : o.value?.focus()
                    }))
            }
            async function se() {
                if (p.value.trim()) {
                    ;((M.value = ''), (L.value = !0))
                    try {
                        const k = await J.post('/api/feeds/preview', { url: p.value })
                        ;((g.value = k.data.preview),
                            (m.value = k.data.categories),
                            (H.value = k.data.preview.feed_url),
                            (U.value = ''))
                    } catch (k) {
                        k.response?.status === 422 && k.response.data?.errors?.url
                            ? (M.value = k.response.data.errors.url[0])
                            : (M.value = 'Something went wrong. Please try again.')
                    } finally {
                        L.value = !1
                    }
                }
            }
            function oe() {
                ;((V.value = !V.value), V.value ? (j.value = '') : (A.value = ''))
            }
            async function ie() {
                ;((y.value = !0), (S.value = {}))
                try {
                    ;(await J.post('/api/feeds', {
                        feed_url: H.value,
                        title: U.value || g.value?.title || '',
                        category_id: j.value || '',
                        new_category: A.value || '',
                    }),
                        Y().fetchSidebar(),
                        N())
                } catch (k) {
                    k.response?.status === 422 &&
                        k.response.data?.errors &&
                        (S.value = Object.fromEntries(
                            Object.entries(k.response.data.errors).map(([u, h]) => [
                                u,
                                Array.isArray(h) ? h[0] : h,
                            ])
                        ))
                } finally {
                    y.value = !1
                }
            }
            function ue() {
                ;((g.value = null),
                    (S.value = {}),
                    Z(() => {
                        o.value?.focus()
                    }))
            }
            async function de() {
                if (x.value.trim()) {
                    ;((t.value = !0), (n.value = ''))
                    try {
                        const { data: k } = await J.post('/api/articles/save-url', {
                            url: x.value,
                        })
                        ;(k.duplicate
                            ? f('Article already saved -- marked as read later')
                            : f('Article saved'),
                            Y().fetchSidebar(),
                            (x.value = ''),
                            N())
                    } catch (k) {
                        n.value = k.response?.data?.message || 'Failed to save article'
                    } finally {
                        t.value = !1
                    }
                }
            }
            return (k, u) => (
                r(),
                O(me, { to: 'body' }, [
                    C(
                        P,
                        {
                            'enter-active-class': 'duration-200 ease-out',
                            'enter-from-class': 'opacity-0',
                            'enter-to-class': 'opacity-100',
                            'leave-active-class': 'duration-150 ease-in',
                            'leave-from-class': 'opacity-100',
                            'leave-to-class': 'opacity-0',
                        },
                        {
                            default: Q(() => [
                                a.show
                                    ? (r(),
                                      l('div', Se, [
                                          e('div', {
                                              class: 'absolute inset-0 bg-black/60',
                                              onClick: N,
                                          }),
                                          C(
                                              P,
                                              {
                                                  'enter-active-class':
                                                      'duration-200 ease-out',
                                                  'enter-from-class': 'opacity-0 scale-95',
                                                  'enter-to-class': 'opacity-100 scale-100',
                                                  'leave-active-class': 'duration-150 ease-in',
                                                  'leave-from-class': 'opacity-100 scale-100',
                                                  'leave-to-class': 'opacity-0 scale-95',
                                                  appear: '',
                                              },
                                              {
                                                  default: Q(() => [
                                                      a.show
                                                          ? (r(),
                                                            l('div', ze, [
                                                                e('div', Fe, [
                                                                    e(
                                                                        'h2',
                                                                        Ae,
                                                                        c(
                                                                            d.value === 'feed'
                                                                                ? 'Add Feed'
                                                                                : 'Save Article'
                                                                        ),
                                                                        1
                                                                    ),
                                                                    e(
                                                                        'button',
                                                                        {
                                                                            onClick: N,
                                                                            class: 'rounded-lg p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors',
                                                                            'aria-label':
                                                                                'Close',
                                                                        },
                                                                        [
                                                                            ...(u[8] ||
                                                                                (u[8] = [
                                                                                    e(
                                                                                        'svg',
                                                                                        {
                                                                                            class: 'h-5 w-5',
                                                                                            fill: 'none',
                                                                                            viewBox:
                                                                                                '0 0 24 24',
                                                                                            'stroke-width':
                                                                                                '1.5',
                                                                                            stroke: 'currentColor',
                                                                                        },
                                                                                        [
                                                                                            e(
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
                                                                        ]
                                                                    ),
                                                                ]),
                                                                e('div', Be, [
                                                                    e('div', Le, [
                                                                        e(
                                                                            'button',
                                                                            {
                                                                                onClick:
                                                                                    u[0] ||
                                                                                    (u[0] =
                                                                                        h =>
                                                                                            R(
                                                                                                'feed'
                                                                                            )),
                                                                                class: i([
                                                                                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                                                                    d.value ===
                                                                                    'feed'
                                                                                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                                                                                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                                                ]),
                                                                            },
                                                                            ' Add Feed ',
                                                                            2
                                                                        ),
                                                                        e(
                                                                            'button',
                                                                            {
                                                                                onClick:
                                                                                    u[1] ||
                                                                                    (u[1] =
                                                                                        h =>
                                                                                            R(
                                                                                                'article'
                                                                                            )),
                                                                                class: i([
                                                                                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                                                                    d.value ===
                                                                                    'article'
                                                                                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                                                                                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                                                ]),
                                                                            },
                                                                            ' Save Article ',
                                                                            2
                                                                        ),
                                                                    ]),
                                                                    d.value === 'feed'
                                                                        ? (r(),
                                                                          l('div', Ve, [
                                                                              g.value
                                                                                  ? (r(),
                                                                                    l(
                                                                                        'div',
                                                                                        Re,
                                                                                        [
                                                                                            e(
                                                                                                'button',
                                                                                                {
                                                                                                    onClick:
                                                                                                        ue,
                                                                                                    class: 'mb-4 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors',
                                                                                                },
                                                                                                [
                                                                                                    ...(u[11] ||
                                                                                                        (u[11] =
                                                                                                            [
                                                                                                                e(
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
                                                                                                                        e(
                                                                                                                            'path',
                                                                                                                            {
                                                                                                                                'stroke-linecap':
                                                                                                                                    'round',
                                                                                                                                'stroke-linejoin':
                                                                                                                                    'round',
                                                                                                                                d: 'M15.75 19.5L8.25 12l7.5-7.5',
                                                                                                                            }
                                                                                                                        ),
                                                                                                                    ],
                                                                                                                    -1
                                                                                                                ),
                                                                                                                E(
                                                                                                                    ' Search again ',
                                                                                                                    -1
                                                                                                                ),
                                                                                                            ])),
                                                                                                ]
                                                                                            ),
                                                                                            e(
                                                                                                'div',
                                                                                                He,
                                                                                                [
                                                                                                    g
                                                                                                        .value
                                                                                                        .favicon_url
                                                                                                        ? (r(),
                                                                                                          l(
                                                                                                              'img',
                                                                                                              {
                                                                                                                  key: 0,
                                                                                                                  src: g
                                                                                                                      .value
                                                                                                                      .favicon_url,
                                                                                                                  class: 'mt-0.5 h-6 w-6 rounded',
                                                                                                                  onError:
                                                                                                                      u[3] ||
                                                                                                                      (u[3] =
                                                                                                                          h =>
                                                                                                                              (h.target.style.display =
                                                                                                                                  'none')),
                                                                                                              },
                                                                                                              null,
                                                                                                              40,
                                                                                                              Ie
                                                                                                          ))
                                                                                                        : (r(),
                                                                                                          l(
                                                                                                              'div',
                                                                                                              Ne
                                                                                                          )),
                                                                                                    e(
                                                                                                        'div',
                                                                                                        Ee,
                                                                                                        [
                                                                                                            e(
                                                                                                                'h3',
                                                                                                                Oe,
                                                                                                                c(
                                                                                                                    g
                                                                                                                        .value
                                                                                                                        .title ||
                                                                                                                        'Untitled Feed'
                                                                                                                ),
                                                                                                                1
                                                                                                            ),
                                                                                                            g
                                                                                                                .value
                                                                                                                .description
                                                                                                                ? (r(),
                                                                                                                  l(
                                                                                                                      'p',
                                                                                                                      De,
                                                                                                                      c(
                                                                                                                          g
                                                                                                                              .value
                                                                                                                              .description
                                                                                                                      ),
                                                                                                                      1
                                                                                                                  ))
                                                                                                                : s(
                                                                                                                      '',
                                                                                                                      !0
                                                                                                                  ),
                                                                                                            e(
                                                                                                                'p',
                                                                                                                qe,
                                                                                                                c(
                                                                                                                    g
                                                                                                                        .value
                                                                                                                        .article_count
                                                                                                                ) +
                                                                                                                    ' articles found ',
                                                                                                                1
                                                                                                            ),
                                                                                                        ]
                                                                                                    ),
                                                                                                ]
                                                                                            ),
                                                                                            e(
                                                                                                'form',
                                                                                                {
                                                                                                    onSubmit:
                                                                                                        G(
                                                                                                            ie,
                                                                                                            [
                                                                                                                'prevent',
                                                                                                            ]
                                                                                                        ),
                                                                                                },
                                                                                                [
                                                                                                    e(
                                                                                                        'div',
                                                                                                        Qe,
                                                                                                        [
                                                                                                            C(
                                                                                                                W,
                                                                                                                {
                                                                                                                    for: 'add-feed-title',
                                                                                                                    value: 'Title (optional)',
                                                                                                                }
                                                                                                            ),
                                                                                                            C(
                                                                                                                K,
                                                                                                                {
                                                                                                                    id: 'add-feed-title',
                                                                                                                    type: 'text',
                                                                                                                    class: 'mt-1 block w-full text-base',
                                                                                                                    modelValue:
                                                                                                                        U.value,
                                                                                                                    'onUpdate:modelValue':
                                                                                                                        u[4] ||
                                                                                                                        (u[4] =
                                                                                                                            h =>
                                                                                                                                (U.value =
                                                                                                                                    h)),
                                                                                                                    placeholder:
                                                                                                                        g
                                                                                                                            .value
                                                                                                                            .title ||
                                                                                                                        'Feed title',
                                                                                                                },
                                                                                                                null,
                                                                                                                8,
                                                                                                                [
                                                                                                                    'modelValue',
                                                                                                                    'placeholder',
                                                                                                                ]
                                                                                                            ),
                                                                                                        ]
                                                                                                    ),
                                                                                                    e(
                                                                                                        'div',
                                                                                                        Ke,
                                                                                                        [
                                                                                                            C(
                                                                                                                W,
                                                                                                                {
                                                                                                                    for: 'add-feed-category',
                                                                                                                    value: 'Category (optional)',
                                                                                                                }
                                                                                                            ),
                                                                                                            V.value
                                                                                                                ? (r(),
                                                                                                                  l(
                                                                                                                      'div',
                                                                                                                      Ze,
                                                                                                                      [
                                                                                                                          C(
                                                                                                                              K,
                                                                                                                              {
                                                                                                                                  id: 'add-feed-new-category',
                                                                                                                                  type: 'text',
                                                                                                                                  class: 'mt-1 block w-full text-base',
                                                                                                                                  modelValue:
                                                                                                                                      A.value,
                                                                                                                                  'onUpdate:modelValue':
                                                                                                                                      u[6] ||
                                                                                                                                      (u[6] =
                                                                                                                                          h =>
                                                                                                                                              (A.value =
                                                                                                                                                  h)),
                                                                                                                                  placeholder:
                                                                                                                                      'New category name',
                                                                                                                              },
                                                                                                                              null,
                                                                                                                              8,
                                                                                                                              [
                                                                                                                                  'modelValue',
                                                                                                                              ]
                                                                                                                          ),
                                                                                                                      ]
                                                                                                                  ))
                                                                                                                : (r(),
                                                                                                                  l(
                                                                                                                      'div',
                                                                                                                      Pe,
                                                                                                                      [
                                                                                                                          pe(
                                                                                                                              e(
                                                                                                                                  'select',
                                                                                                                                  {
                                                                                                                                      id: 'add-feed-category',
                                                                                                                                      'onUpdate:modelValue':
                                                                                                                                          u[5] ||
                                                                                                                                          (u[5] =
                                                                                                                                              h =>
                                                                                                                                                  (j.value =
                                                                                                                                                      h)),
                                                                                                                                      class: 'mt-1 block w-full rounded-lg border-neutral-300 bg-white text-base text-neutral-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
                                                                                                                                  },
                                                                                                                                  [
                                                                                                                                      u[12] ||
                                                                                                                                          (u[12] =
                                                                                                                                              e(
                                                                                                                                                  'option',
                                                                                                                                                  {
                                                                                                                                                      value: '',
                                                                                                                                                  },
                                                                                                                                                  'No category',
                                                                                                                                                  -1
                                                                                                                                              )),
                                                                                                                                      (r(
                                                                                                                                          !0
                                                                                                                                      ),
                                                                                                                                      l(
                                                                                                                                          T,
                                                                                                                                          null,
                                                                                                                                          I(
                                                                                                                                              m.value,
                                                                                                                                              h => (
                                                                                                                                                  r(),
                                                                                                                                                  l(
                                                                                                                                                      'option',
                                                                                                                                                      {
                                                                                                                                                          key: h.id,
                                                                                                                                                          value: h.id,
                                                                                                                                                      },
                                                                                                                                                      c(
                                                                                                                                                          h.name
                                                                                                                                                      ),
                                                                                                                                                      9,
                                                                                                                                                      Ye
                                                                                                                                                  )
                                                                                                                                              )
                                                                                                                                          ),
                                                                                                                                          128
                                                                                                                                      )),
                                                                                                                                  ],
                                                                                                                                  512
                                                                                                                              ),
                                                                                                                              [
                                                                                                                                  [
                                                                                                                                      ge,
                                                                                                                                      j.value,
                                                                                                                                  ],
                                                                                                                              ]
                                                                                                                          ),
                                                                                                                      ]
                                                                                                                  )),
                                                                                                            e(
                                                                                                                'button',
                                                                                                                {
                                                                                                                    type: 'button',
                                                                                                                    onClick:
                                                                                                                        oe,
                                                                                                                    class: 'mt-2 text-sm text-blue-400 hover:text-blue-300',
                                                                                                                },
                                                                                                                c(
                                                                                                                    V.value
                                                                                                                        ? 'Choose existing category'
                                                                                                                        : '+ Create new category'
                                                                                                                ),
                                                                                                                1
                                                                                                            ),
                                                                                                            C(
                                                                                                                q,
                                                                                                                {
                                                                                                                    class: 'mt-2',
                                                                                                                    message:
                                                                                                                        S
                                                                                                                            .value
                                                                                                                            .category_id,
                                                                                                                },
                                                                                                                null,
                                                                                                                8,
                                                                                                                [
                                                                                                                    'message',
                                                                                                                ]
                                                                                                            ),
                                                                                                            C(
                                                                                                                q,
                                                                                                                {
                                                                                                                    class: 'mt-2',
                                                                                                                    message:
                                                                                                                        S
                                                                                                                            .value
                                                                                                                            .new_category,
                                                                                                                },
                                                                                                                null,
                                                                                                                8,
                                                                                                                [
                                                                                                                    'message',
                                                                                                                ]
                                                                                                            ),
                                                                                                        ]
                                                                                                    ),
                                                                                                    C(
                                                                                                        q,
                                                                                                        {
                                                                                                            class: 'mb-3',
                                                                                                            message:
                                                                                                                S
                                                                                                                    .value
                                                                                                                    .feed_url,
                                                                                                        },
                                                                                                        null,
                                                                                                        8,
                                                                                                        [
                                                                                                            'message',
                                                                                                        ]
                                                                                                    ),
                                                                                                    e(
                                                                                                        'button',
                                                                                                        {
                                                                                                            type: 'submit',
                                                                                                            class: i(
                                                                                                                [
                                                                                                                    'w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 active:bg-blue-700',
                                                                                                                    {
                                                                                                                        'opacity-25':
                                                                                                                            y.value,
                                                                                                                    },
                                                                                                                ]
                                                                                                            ),
                                                                                                            disabled:
                                                                                                                y.value,
                                                                                                        },
                                                                                                        [
                                                                                                            y.value
                                                                                                                ? (r(),
                                                                                                                  l(
                                                                                                                      'svg',
                                                                                                                      Je,
                                                                                                                      [
                                                                                                                          ...(u[13] ||
                                                                                                                              (u[13] =
                                                                                                                                  [
                                                                                                                                      e(
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
                                                                                                                                      e(
                                                                                                                                          'path',
                                                                                                                                          {
                                                                                                                                              class: 'opacity-75',
                                                                                                                                              fill: 'currentColor',
                                                                                                                                              d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z',
                                                                                                                                          },
                                                                                                                                          null,
                                                                                                                                          -1
                                                                                                                                      ),
                                                                                                                                  ])),
                                                                                                                      ]
                                                                                                                  ))
                                                                                                                : s(
                                                                                                                      '',
                                                                                                                      !0
                                                                                                                  ),
                                                                                                            E(
                                                                                                                ' ' +
                                                                                                                    c(
                                                                                                                        y.value
                                                                                                                            ? 'Subscribing...'
                                                                                                                            : 'Subscribe'
                                                                                                                    ),
                                                                                                                1
                                                                                                            ),
                                                                                                        ],
                                                                                                        10,
                                                                                                        Ge
                                                                                                    ),
                                                                                                ],
                                                                                                32
                                                                                            ),
                                                                                        ]
                                                                                    ))
                                                                                  : (r(),
                                                                                    l(
                                                                                        'div',
                                                                                        _e,
                                                                                        [
                                                                                            e(
                                                                                                'form',
                                                                                                {
                                                                                                    onSubmit:
                                                                                                        G(
                                                                                                            se,
                                                                                                            [
                                                                                                                'prevent',
                                                                                                            ]
                                                                                                        ),
                                                                                                },
                                                                                                [
                                                                                                    e(
                                                                                                        'div',
                                                                                                        null,
                                                                                                        [
                                                                                                            C(
                                                                                                                K,
                                                                                                                {
                                                                                                                    ref_key:
                                                                                                                        'urlInput',
                                                                                                                    ref: o,
                                                                                                                    id: 'add-feed-url',
                                                                                                                    type: 'url',
                                                                                                                    class: 'block w-full text-base',
                                                                                                                    modelValue:
                                                                                                                        p.value,
                                                                                                                    'onUpdate:modelValue':
                                                                                                                        u[2] ||
                                                                                                                        (u[2] =
                                                                                                                            h =>
                                                                                                                                (p.value =
                                                                                                                                    h)),
                                                                                                                    placeholder:
                                                                                                                        'https://example.com or feed URL',
                                                                                                                    required:
                                                                                                                        '',
                                                                                                                },
                                                                                                                null,
                                                                                                                8,
                                                                                                                [
                                                                                                                    'modelValue',
                                                                                                                ]
                                                                                                            ),
                                                                                                            u[9] ||
                                                                                                                (u[9] =
                                                                                                                    e(
                                                                                                                        'p',
                                                                                                                        {
                                                                                                                            class: 'mt-1.5 text-xs text-neutral-600 dark:text-neutral-500',
                                                                                                                        },
                                                                                                                        ' Enter a website URL or direct RSS/Atom feed URL ',
                                                                                                                        -1
                                                                                                                    )),
                                                                                                            C(
                                                                                                                q,
                                                                                                                {
                                                                                                                    class: 'mt-2',
                                                                                                                    message:
                                                                                                                        M.value,
                                                                                                                },
                                                                                                                null,
                                                                                                                8,
                                                                                                                [
                                                                                                                    'message',
                                                                                                                ]
                                                                                                            ),
                                                                                                        ]
                                                                                                    ),
                                                                                                    e(
                                                                                                        'button',
                                                                                                        {
                                                                                                            type: 'submit',
                                                                                                            class: i(
                                                                                                                [
                                                                                                                    'mt-4 w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 active:bg-blue-700',
                                                                                                                    {
                                                                                                                        'opacity-25':
                                                                                                                            L.value,
                                                                                                                    },
                                                                                                                ]
                                                                                                            ),
                                                                                                            disabled:
                                                                                                                L.value,
                                                                                                        },
                                                                                                        [
                                                                                                            L.value
                                                                                                                ? (r(),
                                                                                                                  l(
                                                                                                                      'svg',
                                                                                                                      Ue,
                                                                                                                      [
                                                                                                                          ...(u[10] ||
                                                                                                                              (u[10] =
                                                                                                                                  [
                                                                                                                                      e(
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
                                                                                                                                      e(
                                                                                                                                          'path',
                                                                                                                                          {
                                                                                                                                              class: 'opacity-75',
                                                                                                                                              fill: 'currentColor',
                                                                                                                                              d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z',
                                                                                                                                          },
                                                                                                                                          null,
                                                                                                                                          -1
                                                                                                                                      ),
                                                                                                                                  ])),
                                                                                                                      ]
                                                                                                                  ))
                                                                                                                : s(
                                                                                                                      '',
                                                                                                                      !0
                                                                                                                  ),
                                                                                                            E(
                                                                                                                ' ' +
                                                                                                                    c(
                                                                                                                        L.value
                                                                                                                            ? 'Searching...'
                                                                                                                            : 'Find Feed'
                                                                                                                    ),
                                                                                                                1
                                                                                                            ),
                                                                                                        ],
                                                                                                        10,
                                                                                                        Te
                                                                                                    ),
                                                                                                ],
                                                                                                32
                                                                                            ),
                                                                                        ]
                                                                                    )),
                                                                          ]))
                                                                        : d.value === 'article'
                                                                          ? (r(),
                                                                            l('div', We, [
                                                                                e(
                                                                                    'form',
                                                                                    {
                                                                                        onSubmit:
                                                                                            G(
                                                                                                de,
                                                                                                [
                                                                                                    'prevent',
                                                                                                ]
                                                                                            ),
                                                                                    },
                                                                                    [
                                                                                        e(
                                                                                            'div',
                                                                                            null,
                                                                                            [
                                                                                                C(
                                                                                                    K,
                                                                                                    {
                                                                                                        ref_key:
                                                                                                            'articleUrlInput',
                                                                                                        ref: _,
                                                                                                        id: 'save-article-url',
                                                                                                        type: 'text',
                                                                                                        inputmode:
                                                                                                            'url',
                                                                                                        class: 'block w-full text-base',
                                                                                                        modelValue:
                                                                                                            x.value,
                                                                                                        'onUpdate:modelValue':
                                                                                                            u[7] ||
                                                                                                            (u[7] =
                                                                                                                h =>
                                                                                                                    (x.value =
                                                                                                                        h)),
                                                                                                        placeholder:
                                                                                                            'https://example.com/article',
                                                                                                    },
                                                                                                    null,
                                                                                                    8,
                                                                                                    [
                                                                                                        'modelValue',
                                                                                                    ]
                                                                                                ),
                                                                                                u[14] ||
                                                                                                    (u[14] =
                                                                                                        e(
                                                                                                            'p',
                                                                                                            {
                                                                                                                class: 'mt-1.5 text-xs text-neutral-600 dark:text-neutral-500',
                                                                                                            },
                                                                                                            ' Save any web page as an article ',
                                                                                                            -1
                                                                                                        )),
                                                                                                C(
                                                                                                    q,
                                                                                                    {
                                                                                                        class: 'mt-2',
                                                                                                        message:
                                                                                                            n.value,
                                                                                                    },
                                                                                                    null,
                                                                                                    8,
                                                                                                    [
                                                                                                        'message',
                                                                                                    ]
                                                                                                ),
                                                                                            ]
                                                                                        ),
                                                                                        e(
                                                                                            'button',
                                                                                            {
                                                                                                type: 'submit',
                                                                                                class: i(
                                                                                                    [
                                                                                                        'mt-4 w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 active:bg-blue-700',
                                                                                                        {
                                                                                                            'opacity-25':
                                                                                                                t.value,
                                                                                                        },
                                                                                                    ]
                                                                                                ),
                                                                                                disabled:
                                                                                                    t.value,
                                                                                            },
                                                                                            [
                                                                                                t.value
                                                                                                    ? (r(),
                                                                                                      l(
                                                                                                          'svg',
                                                                                                          et,
                                                                                                          [
                                                                                                              ...(u[15] ||
                                                                                                                  (u[15] =
                                                                                                                      [
                                                                                                                          e(
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
                                                                                                                          e(
                                                                                                                              'path',
                                                                                                                              {
                                                                                                                                  class: 'opacity-75',
                                                                                                                                  fill: 'currentColor',
                                                                                                                                  d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z',
                                                                                                                              },
                                                                                                                              null,
                                                                                                                              -1
                                                                                                                          ),
                                                                                                                      ])),
                                                                                                          ]
                                                                                                      ))
                                                                                                    : s(
                                                                                                          '',
                                                                                                          !0
                                                                                                      ),
                                                                                                E(
                                                                                                    ' ' +
                                                                                                        c(
                                                                                                            t.value
                                                                                                                ? 'Saving...'
                                                                                                                : 'Save Article'
                                                                                                        ),
                                                                                                    1
                                                                                                ),
                                                                                            ],
                                                                                            10,
                                                                                            Xe
                                                                                        ),
                                                                                    ],
                                                                                    32
                                                                                ),
                                                                            ]))
                                                                          : s('', !0),
                                                                ]),
                                                            ]))
                                                          : s('', !0),
                                                  ]),
                                                  _: 1,
                                              }
                                          ),
                                      ]))
                                    : s('', !0),
                            ]),
                            _: 1,
                        }
                    ),
                ])
            )
        },
    },
    rt = {
        class: 'fixed bottom-20 lg:bottom-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4',
    },
    lt = {
        key: 0,
        class: 'h-4 w-4 shrink-0',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '2',
        stroke: 'currentColor',
    },
    nt = {
        key: 1,
        class: 'h-4 w-4 shrink-0',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '2',
        stroke: 'currentColor',
    },
    at = {
        key: 2,
        class: 'h-4 w-4 shrink-0',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '2',
        stroke: 'currentColor',
    },
    st = ['onClick'],
    ot = {
        __name: 'ToastContainer',
        setup(a) {
            const { toasts: B, dismiss: $ } = ne()
            return (F, f) => (
                r(),
                l('div', rt, [
                    (r(!0),
                    l(
                        T,
                        null,
                        I(
                            z(B),
                            d => (
                                r(),
                                l(
                                    'div',
                                    {
                                        key: d.id,
                                        class: i([
                                            'pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg transition-all duration-300',
                                            [
                                                d.type === 'success'
                                                    ? 'bg-green-600 text-white'
                                                    : d.type === 'error'
                                                      ? 'bg-red-600 text-white'
                                                      : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
                                                d.leaving
                                                    ? 'opacity-0 translate-y-2'
                                                    : 'opacity-100 translate-y-0',
                                            ],
                                        ]),
                                        role: 'status',
                                        'aria-live': 'polite',
                                    },
                                    [
                                        d.type === 'success'
                                            ? (r(),
                                              l('svg', lt, [
                                                  ...(f[0] ||
                                                      (f[0] = [
                                                          e(
                                                              'path',
                                                              {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M4.5 12.75l6 6 9-13.5',
                                                              },
                                                              null,
                                                              -1
                                                          ),
                                                      ])),
                                              ]))
                                            : d.type === 'error'
                                              ? (r(),
                                                l('svg', nt, [
                                                    ...(f[1] ||
                                                        (f[1] = [
                                                            e(
                                                                'path',
                                                                {
                                                                    'stroke-linecap': 'round',
                                                                    'stroke-linejoin': 'round',
                                                                    d: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
                                                                },
                                                                null,
                                                                -1
                                                            ),
                                                        ])),
                                                ]))
                                              : (r(),
                                                l('svg', at, [
                                                    ...(f[2] ||
                                                        (f[2] = [
                                                            e(
                                                                'path',
                                                                {
                                                                    'stroke-linecap': 'round',
                                                                    'stroke-linejoin': 'round',
                                                                    d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
                                                                },
                                                                null,
                                                                -1
                                                            ),
                                                        ])),
                                                ])),
                                        e('span', null, c(d.message), 1),
                                        e(
                                            'button',
                                            {
                                                onClick: p => z($)(d.id),
                                                class: 'ml-1 shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 transition-opacity',
                                                'aria-label': 'Dismiss',
                                            },
                                            [
                                                ...(f[3] ||
                                                    (f[3] = [
                                                        e(
                                                            'svg',
                                                            {
                                                                class: 'h-3.5 w-3.5',
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '2',
                                                                stroke: 'currentColor',
                                                            },
                                                            [
                                                                e('path', {
                                                                    'stroke-linecap': 'round',
                                                                    'stroke-linejoin': 'round',
                                                                    d: 'M6 18L18 6M6 6l12 12',
                                                                }),
                                                            ],
                                                            -1
                                                        ),
                                                    ])),
                                            ],
                                            8,
                                            st
                                        ),
                                    ],
                                    2
                                )
                            )
                        ),
                        128
                    )),
                ])
            )
        },
    },
    it = {
        key: 0,
        class: 'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-neutral-50 dark:bg-neutral-900 shadow-xl',
        role: 'dialog',
        'aria-label': 'Navigation sidebar',
    },
    ut = {
        class: 'flex min-h-14 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 pt-safe',
    },
    dt = { class: 'flex items-center gap-1' },
    ct = { class: 'flex-1 overflow-y-auto py-2', 'aria-label': 'Feed navigation' },
    vt = { class: 'px-3 pb-2' },
    xt = { key: 0, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    kt = { key: 0, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    ft = { class: 'px-3 pt-3' },
    bt = {
        key: 0,
        class: 'inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white',
    },
    pt = ['onClick', 'aria-expanded', 'title', 'aria-label'],
    gt = ['onClick'],
    mt = { class: 'flex-1 truncate' },
    ht = { key: 0, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    yt = { key: 0, class: 'ml-4' },
    wt = ['onClick'],
    Ct = ['src'],
    $t = { key: 1, class: 'h-4 w-4 shrink-0 rounded-sm bg-neutral-300 dark:bg-neutral-700' },
    Mt = { class: 'flex-1 truncate text-left' },
    jt = {
        key: 2,
        class: 'h-3.5 w-3.5 shrink-0 text-amber-500',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
        'aria-label': 'Feed disabled',
    },
    St = { key: 3, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    zt = { key: 0, class: 'mt-0.5' },
    Ft = ['onClick'],
    At = ['src'],
    Bt = { key: 1, class: 'h-4 w-4 shrink-0 rounded-sm bg-neutral-300 dark:bg-neutral-700' },
    Lt = { class: 'flex-1 truncate text-left' },
    Vt = {
        key: 2,
        class: 'h-3.5 w-3.5 shrink-0 text-amber-500',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
        'aria-label': 'Feed disabled',
    },
    _t = { key: 3, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    Tt = { class: 'border-t border-neutral-200 dark:border-neutral-800 p-3 space-y-2' },
    Ut = {
        key: 0,
        class: 'text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate',
    },
    Rt = { class: 'flex-1 overflow-y-auto py-2', 'aria-label': 'Feed navigation' },
    Ht = { class: 'px-2 pb-2' },
    It = ['title'],
    Nt = { key: 0, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    Et = ['title'],
    Ot = { key: 0, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    Dt = ['title'],
    qt = { key: 0, class: 'flex-1 text-left' },
    Qt = ['title'],
    Kt = { key: 0, class: 'flex-1 text-left' },
    Pt = { key: 0, class: 'px-3 pt-3' },
    Yt = {
        key: 0,
        class: 'inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white',
    },
    Zt = ['onClick', 'aria-expanded', 'title', 'aria-label'],
    Gt = ['onClick'],
    Jt = { class: 'flex-1 truncate' },
    Wt = { key: 0, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    Xt = { key: 0, class: 'ml-4' },
    er = ['onClick'],
    tr = ['src'],
    rr = { key: 1, class: 'h-4 w-4 shrink-0 rounded-sm bg-neutral-300 dark:bg-neutral-700' },
    lr = { class: 'flex-1 truncate text-left' },
    nr = {
        key: 2,
        class: 'h-3.5 w-3.5 shrink-0 text-amber-500',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
        'aria-label': 'Feed disabled',
    },
    ar = { key: 3, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    sr = { key: 0, class: 'mt-0.5' },
    or = ['onClick'],
    ir = ['src'],
    ur = { key: 1, class: 'h-4 w-4 shrink-0 rounded-sm bg-neutral-300 dark:bg-neutral-700' },
    dr = { class: 'flex-1 truncate text-left' },
    cr = {
        key: 2,
        class: 'h-3.5 w-3.5 shrink-0 text-amber-500',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
        'aria-label': 'Feed disabled',
    },
    vr = { key: 3, class: 'text-xs text-neutral-600 dark:text-neutral-500' },
    xr = { key: 1, class: 'px-2 pt-3' },
    kr = ['title'],
    fr = { key: 0 },
    br = ['title'],
    pr = { key: 0 },
    gr = {
        __name: 'SidebarDrawer',
        props: {
            open: Boolean,
            persistent: { type: Boolean, default: !1 },
            collapsed: { type: Boolean, default: !1 },
            sidebar: Object,
            activeFeedId: Number,
            activeCategoryId: Number,
            activeFilter: String,
        },
        emits: ['close', 'collapse-toggle', 'navigate'],
        setup(a, { emit: B }) {
            const { openAddFeedModal: $ } = ee(),
                F = re(),
                f = le(),
                d = a,
                p = B,
                M = b({})
            function L(x) {
                M.value[x] = !M.value[x]
            }
            function g(x) {
                return M.value[x] || !1
            }
            function m(x) {
                ;(d.persistent || p('close'), p('navigate', x))
            }
            function H() {
                return !d.activeFeedId && !d.activeCategoryId && !d.activeFilter
            }
            function U() {
                ;(p('close'), $())
            }
            function j() {
                ;(p('close'), F.push({ name: 'feeds.manage' }))
            }
            function A() {
                ;(p('close'), F.push({ name: 'settings' }))
            }
            function V() {
                ;(d.persistent || p('close'), F.push({ name: 'articles.highlights' }))
            }
            function y(x) {
                for (const n of d.sidebar?.categories || []) {
                    const o = n.feeds.find(_ => _.id === x)
                    if (o) return o.unread_count || 0
                }
                return (
                    (d.sidebar?.uncategorizedFeeds || []).find(n => n.id === x)
                        ?.unread_count || 0
                )
            }
            function S(x) {
                return x.unread_count || 0
            }
            return (x, t) =>
                a.persistent
                    ? (r(),
                      l(
                          'aside',
                          {
                              key: 1,
                              class: i([
                                  'flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 transition-all duration-200 shrink-0',
                                  a.collapsed ? 'w-16' : 'w-72',
                              ]),
                              'aria-label': 'Navigation sidebar',
                          },
                          [
                              e(
                                  'div',
                                  {
                                      class: i([
                                          'flex h-11 items-center border-b border-neutral-200 dark:border-neutral-800 px-3',
                                          a.collapsed ? 'justify-center' : 'justify-between',
                                      ]),
                                  },
                                  [
                                      a.collapsed
                                          ? s('', !0)
                                          : (r(), l('h2', Ut, ' RReader ')),
                                      a.collapsed
                                          ? s('', !0)
                                          : (r(),
                                            l(
                                                'button',
                                                {
                                                    key: 1,
                                                    onClick: t[10] || (t[10] = n => j()),
                                                    class: 'rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-blue-300 transition-colors cursor-pointer',
                                                },
                                                ' Edit '
                                            )),
                                  ],
                                  2
                              ),
                              e('nav', Rt, [
                                  e('div', Ht, [
                                      e(
                                          'button',
                                          {
                                              onClick:
                                                  t[11] ||
                                                  (t[11] = n => m({ filter: 'today' })),
                                              class: i([
                                                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                  a.activeFilter === 'today'
                                                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                              ]),
                                              title: a.collapsed ? 'Today' : void 0,
                                          },
                                          [
                                              t[37] ||
                                                  (t[37] = e(
                                                      'svg',
                                                      {
                                                          class: 'h-5 w-5 shrink-0 text-blue-500',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                          'stroke-width': '1.5',
                                                          stroke: 'currentColor',
                                                      },
                                                      [
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
                                                          }),
                                                      ],
                                                      -1
                                                  )),
                                              a.collapsed
                                                  ? s('', !0)
                                                  : (r(),
                                                    l(
                                                        T,
                                                        { key: 0 },
                                                        [
                                                            t[36] ||
                                                                (t[36] = e(
                                                                    'span',
                                                                    {
                                                                        class: 'flex-1 text-left',
                                                                    },
                                                                    'Today',
                                                                    -1
                                                                )),
                                                            a.sidebar.todayCount > 0
                                                                ? (r(),
                                                                  l(
                                                                      'span',
                                                                      Nt,
                                                                      c(a.sidebar.todayCount),
                                                                      1
                                                                  ))
                                                                : s('', !0),
                                                        ],
                                                        64
                                                    )),
                                          ],
                                          10,
                                          It
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick:
                                                  t[12] ||
                                                  (t[12] = n => m({ filter: 'read_later' })),
                                              class: i([
                                                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                  a.activeFilter === 'read_later'
                                                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                              ]),
                                              title: a.collapsed ? 'Read Later' : void 0,
                                          },
                                          [
                                              t[39] ||
                                                  (t[39] = e(
                                                      'svg',
                                                      {
                                                          class: 'h-5 w-5 shrink-0 text-amber-500',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                          'stroke-width': '1.5',
                                                          stroke: 'currentColor',
                                                      },
                                                      [
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
                                                          }),
                                                      ],
                                                      -1
                                                  )),
                                              a.collapsed
                                                  ? s('', !0)
                                                  : (r(),
                                                    l(
                                                        T,
                                                        { key: 0 },
                                                        [
                                                            t[38] ||
                                                                (t[38] = e(
                                                                    'span',
                                                                    {
                                                                        class: 'flex-1 text-left',
                                                                    },
                                                                    'Read Later',
                                                                    -1
                                                                )),
                                                            a.sidebar.readLaterCount > 0
                                                                ? (r(),
                                                                  l(
                                                                      'span',
                                                                      Ot,
                                                                      c(
                                                                          a.sidebar
                                                                              .readLaterCount
                                                                      ),
                                                                      1
                                                                  ))
                                                                : s('', !0),
                                                        ],
                                                        64
                                                    )),
                                          ],
                                          10,
                                          Et
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick:
                                                  t[13] ||
                                                  (t[13] = n =>
                                                      m({ filter: 'recently_read' })),
                                              class: i([
                                                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                  a.activeFilter === 'recently_read'
                                                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                              ]),
                                              title: a.collapsed ? 'Recently Read' : void 0,
                                          },
                                          [
                                              t[40] ||
                                                  (t[40] = e(
                                                      'svg',
                                                      {
                                                          class: 'h-5 w-5 shrink-0 text-green-500',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                          'stroke-width': '1.5',
                                                          stroke: 'currentColor',
                                                      },
                                                      [
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
                                                          }),
                                                      ],
                                                      -1
                                                  )),
                                              a.collapsed
                                                  ? s('', !0)
                                                  : (r(), l('span', qt, 'Recently Read')),
                                          ],
                                          10,
                                          Dt
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick: t[14] || (t[14] = n => V()),
                                              class: i([
                                                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                  z(f).name === 'articles.highlights'
                                                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                              ]),
                                              title: a.collapsed ? 'Quotes' : void 0,
                                          },
                                          [
                                              t[41] ||
                                                  (t[41] = e(
                                                      'svg',
                                                      {
                                                          class: 'h-5 w-5 shrink-0 text-purple-500',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                          'stroke-width': '1.5',
                                                          stroke: 'currentColor',
                                                      },
                                                      [
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
                                                          }),
                                                      ],
                                                      -1
                                                  )),
                                              a.collapsed
                                                  ? s('', !0)
                                                  : (r(), l('span', Kt, 'Quotes')),
                                          ],
                                          10,
                                          Qt
                                      ),
                                  ]),
                                  e(
                                      'div',
                                      {
                                          class: i([
                                              'border-t border-neutral-200 dark:border-neutral-800',
                                              a.collapsed ? 'mx-2' : 'mx-3',
                                          ]),
                                      },
                                      null,
                                      2
                                  ),
                                  a.collapsed
                                      ? s('', !0)
                                      : (r(),
                                        l('div', Pt, [
                                            t[47] ||
                                                (t[47] = e(
                                                    'div',
                                                    {
                                                        class: 'flex items-center justify-between px-3 pb-2',
                                                    },
                                                    [
                                                        e(
                                                            'h3',
                                                            {
                                                                class: 'text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500',
                                                            },
                                                            ' Feeds '
                                                        ),
                                                    ],
                                                    -1
                                                )),
                                            e(
                                                'button',
                                                {
                                                    onClick: t[15] || (t[15] = n => m({})),
                                                    class: i([
                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                        H()
                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                    ]),
                                                },
                                                [
                                                    t[42] ||
                                                        (t[42] = e(
                                                            'svg',
                                                            {
                                                                class: 'h-5 w-5 text-neutral-500 dark:text-neutral-400',
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '1.5',
                                                                stroke: 'currentColor',
                                                            },
                                                            [
                                                                e('path', {
                                                                    'stroke-linecap': 'round',
                                                                    'stroke-linejoin': 'round',
                                                                    d: 'M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
                                                                }),
                                                            ],
                                                            -1
                                                        )),
                                                    t[43] ||
                                                        (t[43] = e(
                                                            'span',
                                                            { class: 'flex-1 text-left' },
                                                            'All',
                                                            -1
                                                        )),
                                                    a.sidebar.totalUnread > 0
                                                        ? (r(),
                                                          l(
                                                              'span',
                                                              Yt,
                                                              c(a.sidebar.totalUnread),
                                                              1
                                                          ))
                                                        : s('', !0),
                                                ],
                                                2
                                            ),
                                            (r(!0),
                                            l(
                                                T,
                                                null,
                                                I(
                                                    a.sidebar.categories,
                                                    n => (
                                                        r(),
                                                        l(
                                                            'div',
                                                            { key: n.id, class: 'mt-0.5' },
                                                            [
                                                                e(
                                                                    'div',
                                                                    {
                                                                        class: i([
                                                                            'flex w-full items-center gap-0.5 rounded-lg text-sm transition-colors',
                                                                            a.activeCategoryId ===
                                                                            n.id
                                                                                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                        ]),
                                                                    },
                                                                    [
                                                                        e(
                                                                            'button',
                                                                            {
                                                                                onClick: o =>
                                                                                    L(n.id),
                                                                                class: 'shrink-0 rounded-lg p-2.5 text-neutral-600 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                'aria-expanded':
                                                                                    g(n.id),
                                                                                title: `Toggle ${n.name} feeds`,
                                                                                'aria-label': `Toggle ${n.name} feeds`,
                                                                            },
                                                                            [
                                                                                (r(),
                                                                                l(
                                                                                    'svg',
                                                                                    {
                                                                                        class: i(
                                                                                            [
                                                                                                'h-4 w-4 transition-transform duration-200',
                                                                                                {
                                                                                                    'rotate-90':
                                                                                                        g(
                                                                                                            n.id
                                                                                                        ),
                                                                                                },
                                                                                            ]
                                                                                        ),
                                                                                        fill: 'none',
                                                                                        viewBox:
                                                                                            '0 0 24 24',
                                                                                        'stroke-width':
                                                                                            '2',
                                                                                        stroke: 'currentColor',
                                                                                    },
                                                                                    [
                                                                                        ...(t[44] ||
                                                                                            (t[44] =
                                                                                                [
                                                                                                    e(
                                                                                                        'path',
                                                                                                        {
                                                                                                            'stroke-linecap':
                                                                                                                'round',
                                                                                                            'stroke-linejoin':
                                                                                                                'round',
                                                                                                            d: 'M8.25 4.5l7.5 7.5-7.5 7.5',
                                                                                                        },
                                                                                                        null,
                                                                                                        -1
                                                                                                    ),
                                                                                                ])),
                                                                                    ],
                                                                                    2
                                                                                )),
                                                                            ],
                                                                            8,
                                                                            Zt
                                                                        ),
                                                                        e(
                                                                            'button',
                                                                            {
                                                                                onClick: o =>
                                                                                    m({
                                                                                        category_id:
                                                                                            n.id,
                                                                                    }),
                                                                                class: 'flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-left cursor-pointer',
                                                                            },
                                                                            [
                                                                                e(
                                                                                    'span',
                                                                                    Jt,
                                                                                    c(n.name),
                                                                                    1
                                                                                ),
                                                                                S(n) > 0
                                                                                    ? (r(),
                                                                                      l(
                                                                                          'span',
                                                                                          Wt,
                                                                                          c(
                                                                                              S(
                                                                                                  n
                                                                                              )
                                                                                          ),
                                                                                          1
                                                                                      ))
                                                                                    : s(
                                                                                          '',
                                                                                          !0
                                                                                      ),
                                                                            ],
                                                                            8,
                                                                            Gt
                                                                        ),
                                                                    ],
                                                                    2
                                                                ),
                                                                g(n.id)
                                                                    ? (r(),
                                                                      l('div', Xt, [
                                                                          (r(!0),
                                                                          l(
                                                                              T,
                                                                              null,
                                                                              I(
                                                                                  n.feeds,
                                                                                  o => (
                                                                                      r(),
                                                                                      l(
                                                                                          'button',
                                                                                          {
                                                                                              key: o.id,
                                                                                              onClick:
                                                                                                  _ =>
                                                                                                      m(
                                                                                                          {
                                                                                                              feed_id:
                                                                                                                  o.id,
                                                                                                          }
                                                                                                      ),
                                                                                              class: i(
                                                                                                  [
                                                                                                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                                                                                                      a.activeFeedId ===
                                                                                                      o.id
                                                                                                          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                                                          : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-700 dark:hover:text-neutral-300',
                                                                                                  ]
                                                                                              ),
                                                                                          },
                                                                                          [
                                                                                              o.favicon_url
                                                                                                  ? (r(),
                                                                                                    l(
                                                                                                        'img',
                                                                                                        {
                                                                                                            key: 0,
                                                                                                            src: o.favicon_url,
                                                                                                            class: 'h-4 w-4 shrink-0 rounded-sm',
                                                                                                            alt: '',
                                                                                                        },
                                                                                                        null,
                                                                                                        8,
                                                                                                        tr
                                                                                                    ))
                                                                                                  : (r(),
                                                                                                    l(
                                                                                                        'div',
                                                                                                        rr
                                                                                                    )),
                                                                                              e(
                                                                                                  'span',
                                                                                                  lr,
                                                                                                  c(
                                                                                                      o.title
                                                                                                  ),
                                                                                                  1
                                                                                              ),
                                                                                              o.disabled_at
                                                                                                  ? (r(),
                                                                                                    l(
                                                                                                        'svg',
                                                                                                        nr,
                                                                                                        [
                                                                                                            ...(t[45] ||
                                                                                                                (t[45] =
                                                                                                                    [
                                                                                                                        e(
                                                                                                                            'path',
                                                                                                                            {
                                                                                                                                'stroke-linecap':
                                                                                                                                    'round',
                                                                                                                                'stroke-linejoin':
                                                                                                                                    'round',
                                                                                                                                d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                                                                                            },
                                                                                                                            null,
                                                                                                                            -1
                                                                                                                        ),
                                                                                                                    ])),
                                                                                                        ]
                                                                                                    ))
                                                                                                  : y(
                                                                                                          o.id
                                                                                                      ) >
                                                                                                      0
                                                                                                    ? (r(),
                                                                                                      l(
                                                                                                          'span',
                                                                                                          ar,
                                                                                                          c(
                                                                                                              y(
                                                                                                                  o.id
                                                                                                              )
                                                                                                          ),
                                                                                                          1
                                                                                                      ))
                                                                                                    : s(
                                                                                                          '',
                                                                                                          !0
                                                                                                      ),
                                                                                          ],
                                                                                          10,
                                                                                          er
                                                                                      )
                                                                                  )
                                                                              ),
                                                                              128
                                                                          )),
                                                                      ]))
                                                                    : s('', !0),
                                                            ]
                                                        )
                                                    )
                                                ),
                                                128
                                            )),
                                            a.sidebar.uncategorizedFeeds.length > 0
                                                ? (r(),
                                                  l('div', sr, [
                                                      (r(!0),
                                                      l(
                                                          T,
                                                          null,
                                                          I(
                                                              a.sidebar.uncategorizedFeeds,
                                                              n => (
                                                                  r(),
                                                                  l(
                                                                      'button',
                                                                      {
                                                                          key: n.id,
                                                                          onClick: o =>
                                                                              m({
                                                                                  feed_id:
                                                                                      n.id,
                                                                              }),
                                                                          class: i([
                                                                              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                              a.activeFeedId ===
                                                                              n.id
                                                                                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                          ]),
                                                                      },
                                                                      [
                                                                          n.favicon_url
                                                                              ? (r(),
                                                                                l(
                                                                                    'img',
                                                                                    {
                                                                                        key: 0,
                                                                                        src: n.favicon_url,
                                                                                        class: 'h-4 w-4 shrink-0 rounded-sm',
                                                                                        alt: '',
                                                                                    },
                                                                                    null,
                                                                                    8,
                                                                                    ir
                                                                                ))
                                                                              : (r(),
                                                                                l('div', ur)),
                                                                          e(
                                                                              'span',
                                                                              dr,
                                                                              c(n.title),
                                                                              1
                                                                          ),
                                                                          n.disabled_at
                                                                              ? (r(),
                                                                                l('svg', cr, [
                                                                                    ...(t[46] ||
                                                                                        (t[46] =
                                                                                            [
                                                                                                e(
                                                                                                    'path',
                                                                                                    {
                                                                                                        'stroke-linecap':
                                                                                                            'round',
                                                                                                        'stroke-linejoin':
                                                                                                            'round',
                                                                                                        d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                                                                    },
                                                                                                    null,
                                                                                                    -1
                                                                                                ),
                                                                                            ])),
                                                                                ]))
                                                                              : y(n.id) > 0
                                                                                ? (r(),
                                                                                  l(
                                                                                      'span',
                                                                                      vr,
                                                                                      c(
                                                                                          y(
                                                                                              n.id
                                                                                          )
                                                                                      ),
                                                                                      1
                                                                                  ))
                                                                                : s('', !0),
                                                                      ],
                                                                      10,
                                                                      or
                                                                  )
                                                              )
                                                          ),
                                                          128
                                                      )),
                                                  ]))
                                                : s('', !0),
                                        ])),
                                  a.collapsed
                                      ? (r(),
                                        l('div', xr, [
                                            e(
                                                'button',
                                                {
                                                    onClick: t[16] || (t[16] = n => m({})),
                                                    class: i([
                                                        'flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                        H()
                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                    ]),
                                                    title: 'All Feeds',
                                                },
                                                [
                                                    ...(t[48] ||
                                                        (t[48] = [
                                                            e(
                                                                'svg',
                                                                {
                                                                    class: 'h-5 w-5 text-neutral-500 dark:text-neutral-400',
                                                                    fill: 'none',
                                                                    viewBox: '0 0 24 24',
                                                                    'stroke-width': '1.5',
                                                                    stroke: 'currentColor',
                                                                },
                                                                [
                                                                    e('path', {
                                                                        'stroke-linecap':
                                                                            'round',
                                                                        'stroke-linejoin':
                                                                            'round',
                                                                        d: 'M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
                                                                    }),
                                                                ],
                                                                -1
                                                            ),
                                                        ])),
                                                ],
                                                2
                                            ),
                                        ]))
                                      : s('', !0),
                              ]),
                              e(
                                  'div',
                                  {
                                      class: i([
                                          'border-t border-neutral-200 dark:border-neutral-800 p-2',
                                          a.collapsed ? 'space-y-1' : 'space-y-2 p-3',
                                      ]),
                                  },
                                  [
                                      e(
                                          'button',
                                          {
                                              onClick: t[17] || (t[17] = n => U()),
                                              class: i([
                                                  'flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                  a.collapsed ? 'p-2.5' : 'px-4 py-2.5',
                                              ]),
                                              title: a.collapsed ? 'Add Feed' : void 0,
                                          },
                                          [
                                              t[49] ||
                                                  (t[49] = e(
                                                      'svg',
                                                      {
                                                          class: 'h-4 w-4 shrink-0',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                          'stroke-width': '1.5',
                                                          stroke: 'currentColor',
                                                      },
                                                      [
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M12 4.5v15m7.5-7.5h-15',
                                                          }),
                                                      ],
                                                      -1
                                                  )),
                                              a.collapsed
                                                  ? s('', !0)
                                                  : (r(), l('span', fr, 'Add Feed')),
                                          ],
                                          10,
                                          kr
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick: t[18] || (t[18] = n => A()),
                                              class: i([
                                                  'flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                  a.collapsed ? 'p-2.5' : 'px-4 py-2.5',
                                              ]),
                                              title: a.collapsed ? 'Settings' : void 0,
                                          },
                                          [
                                              t[50] ||
                                                  (t[50] = e(
                                                      'svg',
                                                      {
                                                          class: 'h-4 w-4 shrink-0',
                                                          fill: 'none',
                                                          viewBox: '0 0 24 24',
                                                          'stroke-width': '1.5',
                                                          stroke: 'currentColor',
                                                      },
                                                      [
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
                                                          }),
                                                          e('path', {
                                                              'stroke-linecap': 'round',
                                                              'stroke-linejoin': 'round',
                                                              d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                                                          }),
                                                      ],
                                                      -1
                                                  )),
                                              a.collapsed
                                                  ? s('', !0)
                                                  : (r(), l('span', pr, 'Settings')),
                                          ],
                                          10,
                                          br
                                      ),
                                  ],
                                  2
                              ),
                          ],
                          2
                      ))
                    : (r(),
                      l(
                          T,
                          { key: 0 },
                          [
                              C(
                                  P,
                                  { name: 'overlay' },
                                  {
                                      default: Q(() => [
                                          a.open
                                              ? (r(),
                                                l('div', {
                                                    key: 0,
                                                    class: 'fixed inset-0 z-40 bg-black/60',
                                                    onClick: t[0] || (t[0] = n => p('close')),
                                                }))
                                              : s('', !0),
                                      ]),
                                      _: 1,
                                  }
                              ),
                              C(
                                  P,
                                  { name: 'drawer' },
                                  {
                                      default: Q(() => [
                                          a.open
                                              ? (r(),
                                                l('div', it, [
                                                    e('div', ut, [
                                                        t[20] ||
                                                            (t[20] = e(
                                                                'h2',
                                                                {
                                                                    class: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
                                                                },
                                                                ' RReader ',
                                                                -1
                                                            )),
                                                        e('div', dt, [
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[1] ||
                                                                        (t[1] = n => j()),
                                                                    class: 'rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-blue-300 transition-colors cursor-pointer',
                                                                },
                                                                ' Edit '
                                                            ),
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[2] ||
                                                                        (t[2] = n =>
                                                                            p('close')),
                                                                    class: 'rounded-lg p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors',
                                                                    title: 'Close sidebar',
                                                                    'aria-label':
                                                                        'Close sidebar',
                                                                },
                                                                [
                                                                    ...(t[19] ||
                                                                        (t[19] = [
                                                                            e(
                                                                                'svg',
                                                                                {
                                                                                    class: 'h-5 w-5',
                                                                                    fill: 'none',
                                                                                    viewBox:
                                                                                        '0 0 24 24',
                                                                                    'stroke-width':
                                                                                        '1.5',
                                                                                    stroke: 'currentColor',
                                                                                },
                                                                                [
                                                                                    e('path', {
                                                                                        'stroke-linecap':
                                                                                            'round',
                                                                                        'stroke-linejoin':
                                                                                            'round',
                                                                                        d: 'M6 18L18 6M6 6l12 12',
                                                                                    }),
                                                                                ],
                                                                                -1
                                                                            ),
                                                                        ])),
                                                                ]
                                                            ),
                                                        ]),
                                                    ]),
                                                    e('nav', ct, [
                                                        e('div', vt, [
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[3] ||
                                                                        (t[3] = n =>
                                                                            m({
                                                                                filter: 'today',
                                                                            })),
                                                                    class: i([
                                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                        a.activeFilter ===
                                                                        'today'
                                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                    ]),
                                                                },
                                                                [
                                                                    t[21] ||
                                                                        (t[21] = e(
                                                                            'svg',
                                                                            {
                                                                                class: 'h-5 w-5 text-blue-500',
                                                                                fill: 'none',
                                                                                viewBox:
                                                                                    '0 0 24 24',
                                                                                'stroke-width':
                                                                                    '1.5',
                                                                                stroke: 'currentColor',
                                                                            },
                                                                            [
                                                                                e('path', {
                                                                                    'stroke-linecap':
                                                                                        'round',
                                                                                    'stroke-linejoin':
                                                                                        'round',
                                                                                    d: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
                                                                                }),
                                                                            ],
                                                                            -1
                                                                        )),
                                                                    t[22] ||
                                                                        (t[22] = e(
                                                                            'span',
                                                                            {
                                                                                class: 'flex-1 text-left',
                                                                            },
                                                                            'Today',
                                                                            -1
                                                                        )),
                                                                    a.sidebar.todayCount > 0
                                                                        ? (r(),
                                                                          l(
                                                                              'span',
                                                                              xt,
                                                                              c(
                                                                                  a.sidebar
                                                                                      .todayCount
                                                                              ),
                                                                              1
                                                                          ))
                                                                        : s('', !0),
                                                                ],
                                                                2
                                                            ),
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[4] ||
                                                                        (t[4] = n =>
                                                                            m({
                                                                                filter: 'read_later',
                                                                            })),
                                                                    class: i([
                                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                        a.activeFilter ===
                                                                        'read_later'
                                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                    ]),
                                                                },
                                                                [
                                                                    t[23] ||
                                                                        (t[23] = e(
                                                                            'svg',
                                                                            {
                                                                                class: 'h-5 w-5 text-amber-500',
                                                                                fill: 'none',
                                                                                viewBox:
                                                                                    '0 0 24 24',
                                                                                'stroke-width':
                                                                                    '1.5',
                                                                                stroke: 'currentColor',
                                                                            },
                                                                            [
                                                                                e('path', {
                                                                                    'stroke-linecap':
                                                                                        'round',
                                                                                    'stroke-linejoin':
                                                                                        'round',
                                                                                    d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
                                                                                }),
                                                                            ],
                                                                            -1
                                                                        )),
                                                                    t[24] ||
                                                                        (t[24] = e(
                                                                            'span',
                                                                            {
                                                                                class: 'flex-1 text-left',
                                                                            },
                                                                            'Read Later',
                                                                            -1
                                                                        )),
                                                                    a.sidebar.readLaterCount >
                                                                    0
                                                                        ? (r(),
                                                                          l(
                                                                              'span',
                                                                              kt,
                                                                              c(
                                                                                  a.sidebar
                                                                                      .readLaterCount
                                                                              ),
                                                                              1
                                                                          ))
                                                                        : s('', !0),
                                                                ],
                                                                2
                                                            ),
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[5] ||
                                                                        (t[5] = n =>
                                                                            m({
                                                                                filter: 'recently_read',
                                                                            })),
                                                                    class: i([
                                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                        a.activeFilter ===
                                                                        'recently_read'
                                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                    ]),
                                                                },
                                                                [
                                                                    ...(t[25] ||
                                                                        (t[25] = [
                                                                            e(
                                                                                'svg',
                                                                                {
                                                                                    class: 'h-5 w-5 text-green-500',
                                                                                    fill: 'none',
                                                                                    viewBox:
                                                                                        '0 0 24 24',
                                                                                    'stroke-width':
                                                                                        '1.5',
                                                                                    stroke: 'currentColor',
                                                                                },
                                                                                [
                                                                                    e('path', {
                                                                                        'stroke-linecap':
                                                                                            'round',
                                                                                        'stroke-linejoin':
                                                                                            'round',
                                                                                        d: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
                                                                                    }),
                                                                                ],
                                                                                -1
                                                                            ),
                                                                            e(
                                                                                'span',
                                                                                {
                                                                                    class: 'flex-1 text-left',
                                                                                },
                                                                                'Recently Read',
                                                                                -1
                                                                            ),
                                                                        ])),
                                                                ],
                                                                2
                                                            ),
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[6] ||
                                                                        (t[6] = n => V()),
                                                                    class: i([
                                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                        z(f).name ===
                                                                        'articles.highlights'
                                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                    ]),
                                                                },
                                                                [
                                                                    ...(t[26] ||
                                                                        (t[26] = [
                                                                            e(
                                                                                'svg',
                                                                                {
                                                                                    class: 'h-5 w-5 text-purple-500',
                                                                                    fill: 'none',
                                                                                    viewBox:
                                                                                        '0 0 24 24',
                                                                                    'stroke-width':
                                                                                        '1.5',
                                                                                    stroke: 'currentColor',
                                                                                },
                                                                                [
                                                                                    e('path', {
                                                                                        'stroke-linecap':
                                                                                            'round',
                                                                                        'stroke-linejoin':
                                                                                            'round',
                                                                                        d: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
                                                                                    }),
                                                                                ],
                                                                                -1
                                                                            ),
                                                                            e(
                                                                                'span',
                                                                                {
                                                                                    class: 'flex-1 text-left',
                                                                                },
                                                                                'Quotes',
                                                                                -1
                                                                            ),
                                                                        ])),
                                                                ],
                                                                2
                                                            ),
                                                        ]),
                                                        t[33] ||
                                                            (t[33] = e(
                                                                'div',
                                                                {
                                                                    class: 'mx-3 border-t border-neutral-200 dark:border-neutral-800',
                                                                },
                                                                null,
                                                                -1
                                                            )),
                                                        e('div', ft, [
                                                            t[32] ||
                                                                (t[32] = e(
                                                                    'div',
                                                                    {
                                                                        class: 'flex items-center justify-between px-3 pb-2',
                                                                    },
                                                                    [
                                                                        e(
                                                                            'h3',
                                                                            {
                                                                                class: 'text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-500',
                                                                            },
                                                                            ' Feeds '
                                                                        ),
                                                                    ],
                                                                    -1
                                                                )),
                                                            e(
                                                                'button',
                                                                {
                                                                    onClick:
                                                                        t[7] ||
                                                                        (t[7] = n => m({})),
                                                                    class: i([
                                                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                        H()
                                                                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                    ]),
                                                                },
                                                                [
                                                                    t[27] ||
                                                                        (t[27] = e(
                                                                            'svg',
                                                                            {
                                                                                class: 'h-5 w-5 text-neutral-500 dark:text-neutral-400',
                                                                                fill: 'none',
                                                                                viewBox:
                                                                                    '0 0 24 24',
                                                                                'stroke-width':
                                                                                    '1.5',
                                                                                stroke: 'currentColor',
                                                                            },
                                                                            [
                                                                                e('path', {
                                                                                    'stroke-linecap':
                                                                                        'round',
                                                                                    'stroke-linejoin':
                                                                                        'round',
                                                                                    d: 'M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
                                                                                }),
                                                                            ],
                                                                            -1
                                                                        )),
                                                                    t[28] ||
                                                                        (t[28] = e(
                                                                            'span',
                                                                            {
                                                                                class: 'flex-1 text-left',
                                                                            },
                                                                            'All',
                                                                            -1
                                                                        )),
                                                                    a.sidebar.totalUnread > 0
                                                                        ? (r(),
                                                                          l(
                                                                              'span',
                                                                              bt,
                                                                              c(
                                                                                  a.sidebar
                                                                                      .totalUnread
                                                                              ),
                                                                              1
                                                                          ))
                                                                        : s('', !0),
                                                                ],
                                                                2
                                                            ),
                                                            (r(!0),
                                                            l(
                                                                T,
                                                                null,
                                                                I(
                                                                    a.sidebar.categories,
                                                                    n => (
                                                                        r(),
                                                                        l(
                                                                            'div',
                                                                            {
                                                                                key: n.id,
                                                                                class: 'mt-0.5',
                                                                            },
                                                                            [
                                                                                e(
                                                                                    'div',
                                                                                    {
                                                                                        class: i(
                                                                                            [
                                                                                                'flex w-full items-center gap-0.5 rounded-lg text-sm transition-colors',
                                                                                                a.activeCategoryId ===
                                                                                                n.id
                                                                                                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                                                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                                            ]
                                                                                        ),
                                                                                    },
                                                                                    [
                                                                                        e(
                                                                                            'button',
                                                                                            {
                                                                                                onClick:
                                                                                                    o =>
                                                                                                        L(
                                                                                                            n.id
                                                                                                        ),
                                                                                                class: 'shrink-0 rounded-lg p-2.5 text-neutral-600 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer',
                                                                                                'aria-expanded':
                                                                                                    g(
                                                                                                        n.id
                                                                                                    ),
                                                                                                title: `Toggle ${n.name} feeds`,
                                                                                                'aria-label': `Toggle ${n.name} feeds`,
                                                                                            },
                                                                                            [
                                                                                                (r(),
                                                                                                l(
                                                                                                    'svg',
                                                                                                    {
                                                                                                        class: i(
                                                                                                            [
                                                                                                                'h-4 w-4 transition-transform duration-200',
                                                                                                                {
                                                                                                                    'rotate-90':
                                                                                                                        g(
                                                                                                                            n.id
                                                                                                                        ),
                                                                                                                },
                                                                                                            ]
                                                                                                        ),
                                                                                                        fill: 'none',
                                                                                                        viewBox:
                                                                                                            '0 0 24 24',
                                                                                                        'stroke-width':
                                                                                                            '2',
                                                                                                        stroke: 'currentColor',
                                                                                                    },
                                                                                                    [
                                                                                                        ...(t[29] ||
                                                                                                            (t[29] =
                                                                                                                [
                                                                                                                    e(
                                                                                                                        'path',
                                                                                                                        {
                                                                                                                            'stroke-linecap':
                                                                                                                                'round',
                                                                                                                            'stroke-linejoin':
                                                                                                                                'round',
                                                                                                                            d: 'M8.25 4.5l7.5 7.5-7.5 7.5',
                                                                                                                        },
                                                                                                                        null,
                                                                                                                        -1
                                                                                                                    ),
                                                                                                                ])),
                                                                                                    ],
                                                                                                    2
                                                                                                )),
                                                                                            ],
                                                                                            8,
                                                                                            pt
                                                                                        ),
                                                                                        e(
                                                                                            'button',
                                                                                            {
                                                                                                onClick:
                                                                                                    o =>
                                                                                                        m(
                                                                                                            {
                                                                                                                category_id:
                                                                                                                    n.id,
                                                                                                            }
                                                                                                        ),
                                                                                                class: 'flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-left cursor-pointer',
                                                                                            },
                                                                                            [
                                                                                                e(
                                                                                                    'span',
                                                                                                    mt,
                                                                                                    c(
                                                                                                        n.name
                                                                                                    ),
                                                                                                    1
                                                                                                ),
                                                                                                S(
                                                                                                    n
                                                                                                ) >
                                                                                                0
                                                                                                    ? (r(),
                                                                                                      l(
                                                                                                          'span',
                                                                                                          ht,
                                                                                                          c(
                                                                                                              S(
                                                                                                                  n
                                                                                                              )
                                                                                                          ),
                                                                                                          1
                                                                                                      ))
                                                                                                    : s(
                                                                                                          '',
                                                                                                          !0
                                                                                                      ),
                                                                                            ],
                                                                                            8,
                                                                                            gt
                                                                                        ),
                                                                                    ],
                                                                                    2
                                                                                ),
                                                                                g(n.id)
                                                                                    ? (r(),
                                                                                      l(
                                                                                          'div',
                                                                                          yt,
                                                                                          [
                                                                                              (r(
                                                                                                  !0
                                                                                              ),
                                                                                              l(
                                                                                                  T,
                                                                                                  null,
                                                                                                  I(
                                                                                                      n.feeds,
                                                                                                      o => (
                                                                                                          r(),
                                                                                                          l(
                                                                                                              'button',
                                                                                                              {
                                                                                                                  key: o.id,
                                                                                                                  onClick:
                                                                                                                      _ =>
                                                                                                                          m(
                                                                                                                              {
                                                                                                                                  feed_id:
                                                                                                                                      o.id,
                                                                                                                              }
                                                                                                                          ),
                                                                                                                  class: i(
                                                                                                                      [
                                                                                                                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                                                                                                                          a.activeFeedId ===
                                                                                                                          o.id
                                                                                                                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                                                                              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-700 dark:hover:text-neutral-300',
                                                                                                                      ]
                                                                                                                  ),
                                                                                                              },
                                                                                                              [
                                                                                                                  o.favicon_url
                                                                                                                      ? (r(),
                                                                                                                        l(
                                                                                                                            'img',
                                                                                                                            {
                                                                                                                                key: 0,
                                                                                                                                src: o.favicon_url,
                                                                                                                                class: 'h-4 w-4 shrink-0 rounded-sm',
                                                                                                                                alt: '',
                                                                                                                            },
                                                                                                                            null,
                                                                                                                            8,
                                                                                                                            Ct
                                                                                                                        ))
                                                                                                                      : (r(),
                                                                                                                        l(
                                                                                                                            'div',
                                                                                                                            $t
                                                                                                                        )),
                                                                                                                  e(
                                                                                                                      'span',
                                                                                                                      Mt,
                                                                                                                      c(
                                                                                                                          o.title
                                                                                                                      ),
                                                                                                                      1
                                                                                                                  ),
                                                                                                                  o.disabled_at &&
                                                                                                                  !o.is_special
                                                                                                                      ? (r(),
                                                                                                                        l(
                                                                                                                            'svg',
                                                                                                                            jt,
                                                                                                                            [
                                                                                                                                ...(t[30] ||
                                                                                                                                    (t[30] =
                                                                                                                                        [
                                                                                                                                            e(
                                                                                                                                                'path',
                                                                                                                                                {
                                                                                                                                                    'stroke-linecap':
                                                                                                                                                        'round',
                                                                                                                                                    'stroke-linejoin':
                                                                                                                                                        'round',
                                                                                                                                                    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                                                                                                                },
                                                                                                                                                null,
                                                                                                                                                -1
                                                                                                                                            ),
                                                                                                                                        ])),
                                                                                                                            ]
                                                                                                                        ))
                                                                                                                      : y(
                                                                                                                              o.id
                                                                                                                          ) >
                                                                                                                          0
                                                                                                                        ? (r(),
                                                                                                                          l(
                                                                                                                              'span',
                                                                                                                              St,
                                                                                                                              c(
                                                                                                                                  y(
                                                                                                                                      o.id
                                                                                                                                  )
                                                                                                                              ),
                                                                                                                              1
                                                                                                                          ))
                                                                                                                        : s(
                                                                                                                              '',
                                                                                                                              !0
                                                                                                                          ),
                                                                                                              ],
                                                                                                              10,
                                                                                                              wt
                                                                                                          )
                                                                                                      )
                                                                                                  ),
                                                                                                  128
                                                                                              )),
                                                                                          ]
                                                                                      ))
                                                                                    : s(
                                                                                          '',
                                                                                          !0
                                                                                      ),
                                                                            ]
                                                                        )
                                                                    )
                                                                ),
                                                                128
                                                            )),
                                                            a.sidebar.uncategorizedFeeds
                                                                .length > 0
                                                                ? (r(),
                                                                  l('div', zt, [
                                                                      (r(!0),
                                                                      l(
                                                                          T,
                                                                          null,
                                                                          I(
                                                                              a.sidebar
                                                                                  .uncategorizedFeeds,
                                                                              n => (
                                                                                  r(),
                                                                                  l(
                                                                                      'button',
                                                                                      {
                                                                                          key: n.id,
                                                                                          onClick:
                                                                                              o =>
                                                                                                  m(
                                                                                                      {
                                                                                                          feed_id:
                                                                                                              n.id,
                                                                                                      }
                                                                                                  ),
                                                                                          class: i(
                                                                                              [
                                                                                                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer',
                                                                                                  a.activeFeedId ===
                                                                                                  n.id
                                                                                                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                                                                                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50',
                                                                                              ]
                                                                                          ),
                                                                                      },
                                                                                      [
                                                                                          n.favicon_url
                                                                                              ? (r(),
                                                                                                l(
                                                                                                    'img',
                                                                                                    {
                                                                                                        key: 0,
                                                                                                        src: n.favicon_url,
                                                                                                        class: 'h-4 w-4 shrink-0 rounded-sm',
                                                                                                        alt: '',
                                                                                                    },
                                                                                                    null,
                                                                                                    8,
                                                                                                    At
                                                                                                ))
                                                                                              : (r(),
                                                                                                l(
                                                                                                    'div',
                                                                                                    Bt
                                                                                                )),
                                                                                          e(
                                                                                              'span',
                                                                                              Lt,
                                                                                              c(
                                                                                                  n.title
                                                                                              ),
                                                                                              1
                                                                                          ),
                                                                                          n.disabled_at
                                                                                              ? (r(),
                                                                                                l(
                                                                                                    'svg',
                                                                                                    Vt,
                                                                                                    [
                                                                                                        ...(t[31] ||
                                                                                                            (t[31] =
                                                                                                                [
                                                                                                                    e(
                                                                                                                        'path',
                                                                                                                        {
                                                                                                                            'stroke-linecap':
                                                                                                                                'round',
                                                                                                                            'stroke-linejoin':
                                                                                                                                'round',
                                                                                                                            d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                                                                                        },
                                                                                                                        null,
                                                                                                                        -1
                                                                                                                    ),
                                                                                                                ])),
                                                                                                    ]
                                                                                                ))
                                                                                              : y(
                                                                                                      n.id
                                                                                                  ) >
                                                                                                  0
                                                                                                ? (r(),
                                                                                                  l(
                                                                                                      'span',
                                                                                                      _t,
                                                                                                      c(
                                                                                                          y(
                                                                                                              n.id
                                                                                                          )
                                                                                                      ),
                                                                                                      1
                                                                                                  ))
                                                                                                : s(
                                                                                                      '',
                                                                                                      !0
                                                                                                  ),
                                                                                      ],
                                                                                      10,
                                                                                      Ft
                                                                                  )
                                                                              )
                                                                          ),
                                                                          128
                                                                      )),
                                                                  ]))
                                                                : s('', !0),
                                                        ]),
                                                    ]),
                                                    e('div', Tt, [
                                                        e(
                                                            'button',
                                                            {
                                                                onClick:
                                                                    t[8] || (t[8] = n => U()),
                                                                class: 'flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer',
                                                            },
                                                            [
                                                                ...(t[34] ||
                                                                    (t[34] = [
                                                                        e(
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
                                                                                e('path', {
                                                                                    'stroke-linecap':
                                                                                        'round',
                                                                                    'stroke-linejoin':
                                                                                        'round',
                                                                                    d: 'M12 4.5v15m7.5-7.5h-15',
                                                                                }),
                                                                            ],
                                                                            -1
                                                                        ),
                                                                        E(' Add Feed ', -1),
                                                                    ])),
                                                            ]
                                                        ),
                                                        e(
                                                            'button',
                                                            {
                                                                onClick:
                                                                    t[9] || (t[9] = n => A()),
                                                                class: 'flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer',
                                                            },
                                                            [
                                                                ...(t[35] ||
                                                                    (t[35] = [
                                                                        e(
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
                                                                                e('path', {
                                                                                    'stroke-linecap':
                                                                                        'round',
                                                                                    'stroke-linejoin':
                                                                                        'round',
                                                                                    d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
                                                                                }),
                                                                                e('path', {
                                                                                    'stroke-linecap':
                                                                                        'round',
                                                                                    'stroke-linejoin':
                                                                                        'round',
                                                                                    d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                                                                                }),
                                                                            ],
                                                                            -1
                                                                        ),
                                                                        E(' Settings ', -1),
                                                                    ])),
                                                            ]
                                                        ),
                                                    ]),
                                                ]))
                                              : s('', !0),
                                      ]),
                                      _: 1,
                                  }
                              ),
                          ],
                          64
                      ))
        },
    },
    X = ae(gr, [['__scopeId', 'data-v-a7a1ecea']]),
    mr = he('ui', () => {
        const a = b(!1)
        function B() {
            a.value = !a.value
        }
        function $() {
            a.value = !1
        }
        return { sidebarOpen: a, toggleSidebar: B, closeSidebar: $ }
    }),
    hr = {
        class: 'min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100',
    },
    yr = {
        key: 0,
        class: 'flex items-center justify-center gap-2 bg-amber-600 px-4 py-1.5 text-xs font-medium text-white',
    },
    wr = {
        key: 2,
        class: 'fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 pb-safe',
        'aria-label': 'Bottom navigation',
    },
    Cr = { class: 'flex h-14 items-center justify-around px-2' },
    $r = {
        __name: 'AppLayout',
        setup(a) {
            const { isOnline: B } = ce(),
                { flushQueue: $ } = ve()
            ke()
            const F = xe(),
                f = Y(),
                d = mr(),
                p = re(),
                M = le(),
                {
                    isAddFeedModalOpen: L,
                    initialTab: g,
                    initialUrl: m,
                    openAddFeedModal: H,
                    closeAddFeedModal: U,
                } = ee(),
                j = b(typeof window < 'u' && window.screen.width >= 1024),
                A = b(
                    typeof window < 'u'
                        ? localStorage.getItem('rreader-sidebar-collapsed') === 'true'
                        : !1
                )
            function V() {
                ;((A.value = !A.value),
                    localStorage.setItem('rreader-sidebar-collapsed', String(A.value)))
            }
            function y() {
                j.value ? V() : d.toggleSidebar()
            }
            ye('toggleSidebar', y)
            const S = D(() => ({
                    totalUnread: f.totalUnread,
                    readLaterCount: f.readLaterCount,
                    todayCount: f.todayCount,
                    categories: f.categories,
                    uncategorizedFeeds: f.uncategorizedFeeds,
                })),
                x = D(() => {
                    const w = M.query.feed_id
                    return w ? Number(w) : null
                }),
                t = D(() => {
                    const w = M.query.category_id
                    return w ? Number(w) : null
                }),
                n = D(() => M.query.filter || null),
                o = D(() => !B.value || F.showingCached)
            te(B, async w => {
                w &&
                    ((!F.showingCached && !F.loadError) ||
                        (await $(), F.forceRefresh(), f.fetchSidebar().catch(() => {})))
            })
            function _(w) {
                ;(d.closeSidebar(),
                    w.filter
                        ? p.push({ name: 'articles.index', query: { filter: w.filter } })
                        : w.feed_id
                          ? p.push({ name: 'articles.index', query: { feed_id: w.feed_id } })
                          : w.category_id
                            ? p.push({
                                  name: 'articles.index',
                                  query: { category_id: w.category_id },
                              })
                            : p.push({ name: 'articles.index' }))
            }
            return (w, v) => {
                const N = we('router-view')
                return (
                    r(),
                    l('div', hr, [
                        o.value
                            ? (r(),
                              l('div', yr, [
                                  v[6] ||
                                      (v[6] = e(
                                          'svg',
                                          {
                                              class: 'h-4 w-4 shrink-0',
                                              fill: 'none',
                                              viewBox: '0 0 24 24',
                                              'stroke-width': '1.5',
                                              stroke: 'currentColor',
                                          },
                                          [
                                              e('path', {
                                                  'stroke-linecap': 'round',
                                                  'stroke-linejoin': 'round',
                                                  d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                              }),
                                          ],
                                          -1
                                      )),
                                  E(
                                      ' ' +
                                          c(
                                              z(B)
                                                  ? "Can't reach the server — viewing cached content"
                                                  : "You're offline — viewing cached content"
                                          ),
                                      1
                                  ),
                              ]))
                            : s('', !0),
                        e(
                            'div',
                            { class: 'flex', style: Me(j.value ? 'height: 100vh' : void 0) },
                            [
                                j.value
                                    ? (r(),
                                      O(
                                          X,
                                          {
                                              key: 0,
                                              open: !0,
                                              persistent: !0,
                                              collapsed: A.value,
                                              sidebar: S.value,
                                              'active-feed-id': x.value,
                                              'active-category-id': t.value,
                                              'active-filter': n.value,
                                              onCollapseToggle: V,
                                              onNavigate: _,
                                          },
                                          null,
                                          8,
                                          [
                                              'collapsed',
                                              'sidebar',
                                              'active-feed-id',
                                              'active-category-id',
                                              'active-filter',
                                          ]
                                      ))
                                    : s('', !0),
                                e(
                                    'main',
                                    {
                                        class: i([
                                            'flex-1 overflow-y-auto',
                                            j.value ? '' : 'pb-16',
                                        ]),
                                    },
                                    [
                                        C(N, null, {
                                            default: Q(({ Component: R }) => [
                                                (r(),
                                                O(
                                                    Ce,
                                                    { include: 'ArticleListView' },
                                                    [(r(), O($e(R)))],
                                                    1024
                                                )),
                                            ]),
                                            _: 1,
                                        }),
                                    ],
                                    2
                                ),
                            ],
                            4
                        ),
                        C(ot),
                        C(
                            tt,
                            {
                                show: z(L),
                                'initial-tab': z(g),
                                'initial-url': z(m),
                                onClose: z(U),
                            },
                            null,
                            8,
                            ['show', 'initial-tab', 'initial-url', 'onClose']
                        ),
                        j.value
                            ? s('', !0)
                            : (r(),
                              O(
                                  X,
                                  {
                                      key: 1,
                                      open: z(d).sidebarOpen,
                                      sidebar: S.value,
                                      'active-feed-id': x.value,
                                      'active-category-id': t.value,
                                      'active-filter': n.value,
                                      onClose: v[0] || (v[0] = R => z(d).closeSidebar()),
                                      onNavigate: _,
                                  },
                                  null,
                                  8,
                                  [
                                      'open',
                                      'sidebar',
                                      'active-feed-id',
                                      'active-category-id',
                                      'active-filter',
                                  ]
                              )),
                        j.value
                            ? s('', !0)
                            : (r(),
                              l('nav', wr, [
                                  e('div', Cr, [
                                      e(
                                          'button',
                                          {
                                              onClick: v[1] || (v[1] = R => y()),
                                              class: 'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors',
                                              title: 'Open sidebar',
                                              'aria-label': 'Open sidebar',
                                          },
                                          [
                                              ...(v[7] ||
                                                  (v[7] = [
                                                      e(
                                                          'svg',
                                                          {
                                                              class: 'h-5 w-5',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              e('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      e(
                                                          'span',
                                                          { class: 'text-[10px]' },
                                                          'Menu',
                                                          -1
                                                      ),
                                                  ])),
                                          ]
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick:
                                                  v[2] ||
                                                  (v[2] = R => _({ filter: 'read_later' })),
                                              class: i([
                                                  'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                                                  n.value === 'read_later'
                                                      ? 'text-amber-500'
                                                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
                                              ]),
                                              title: 'Read Later',
                                              'aria-label': 'Read Later',
                                          },
                                          [
                                              ...(v[8] ||
                                                  (v[8] = [
                                                      e(
                                                          'svg',
                                                          {
                                                              class: 'h-5 w-5',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              e('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      e(
                                                          'span',
                                                          { class: 'text-[10px]' },
                                                          'Read Later',
                                                          -1
                                                      ),
                                                  ])),
                                          ],
                                          2
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick:
                                                  v[3] ||
                                                  (v[3] = R =>
                                                      z(p).push({
                                                          name: 'articles.highlights',
                                                      })),
                                              class: i([
                                                  'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                                                  z(M).name === 'articles.highlights'
                                                      ? 'text-blue-500'
                                                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
                                              ]),
                                              title: 'Highlights',
                                              'aria-label': 'Highlights',
                                          },
                                          [
                                              ...(v[9] ||
                                                  (v[9] = [
                                                      e(
                                                          'svg',
                                                          {
                                                              class: 'h-5 w-5',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              e('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      e(
                                                          'span',
                                                          { class: 'text-[10px]' },
                                                          'Quotes',
                                                          -1
                                                      ),
                                                  ])),
                                          ],
                                          2
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick: v[4] || (v[4] = R => _({})),
                                              class: i([
                                                  'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                                                  !n.value &&
                                                  !x.value &&
                                                  !t.value &&
                                                  z(M).name === 'articles.index'
                                                      ? 'text-blue-500'
                                                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
                                              ]),
                                              title: 'All feeds',
                                              'aria-label': 'All feeds',
                                          },
                                          [
                                              ...(v[10] ||
                                                  (v[10] = [
                                                      e(
                                                          'svg',
                                                          {
                                                              class: 'h-5 w-5',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              e('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      e(
                                                          'span',
                                                          { class: 'text-[10px]' },
                                                          'Feeds',
                                                          -1
                                                      ),
                                                  ])),
                                          ],
                                          2
                                      ),
                                      e(
                                          'button',
                                          {
                                              onClick: v[5] || (v[5] = R => z(H)()),
                                              class: 'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200',
                                              title: 'Add feed',
                                              'aria-label': 'Add feed',
                                          },
                                          [
                                              ...(v[11] ||
                                                  (v[11] = [
                                                      e(
                                                          'svg',
                                                          {
                                                              class: 'h-5 w-5',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              e('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
                                                              }),
                                                              e('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      e(
                                                          'span',
                                                          { class: 'text-[10px]' },
                                                          'Add',
                                                          -1
                                                      ),
                                                  ])),
                                          ]
                                      ),
                                  ]),
                              ])),
                    ])
                )
            }
        },
    },
    Mr = ae($r, [['__scopeId', 'data-v-2432ecb8']]),
    _r = {
        __name: 'AppShell',
        props: {
            initialSidebar: { type: Object, default: () => ({}) },
            user: { type: Object, required: !0 },
        },
        setup(a) {
            je().appContext.config.globalProperties.$router || window.location.reload()
            const $ = a,
                F = Y()
            return (F.loaded || F.initialize($.initialSidebar), (f, d) => (r(), O(Mr)))
        },
    }
export { _r as default }
