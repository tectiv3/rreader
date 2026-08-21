import {
    s as S,
    o as $,
    f as n,
    g as e,
    l as C,
    Q as L,
    F as x,
    r as b,
    t as u,
    q as m,
    p as v,
    D as j,
    b as o,
    j as q,
    N as B,
    i as N,
} from './app-BO6VQ9fp.js'
import { u as z } from './useToast-w_qnOgVX.js'
import { _ as E } from './_plugin-vue_export-helper-DlAUqK2U.js'
const I = {
        class: 'sticky top-11 z-20 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-4 py-3 backdrop-blur',
    },
    A = { class: 'relative' },
    Q = { key: 0, class: 'space-y-4 px-4 py-6' },
    K = { key: 1, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    Z = { key: 2, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    G = { class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500' },
    R = { key: 3, class: 'px-4 py-4 space-y-6' },
    J = ['onClick'],
    O = ['src'],
    P = {
        class: 'text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1',
    },
    W = { key: 0, class: 'text-xs text-neutral-500 dark:text-neutral-500 mb-3' },
    X = { class: 'space-y-2' },
    Y = ['onKeydown'],
    ee = { class: 'mt-2 flex justify-end gap-2' },
    te = ['onClick'],
    re = {
        class: 'border-l-2 border-blue-500 pl-3 text-sm text-neutral-700 dark:text-neutral-300 italic',
    },
    le = { class: 'mt-2 flex items-center justify-between' },
    ae = { class: 'text-xs text-neutral-500 dark:text-neutral-500' },
    ne = { class: 'flex items-center gap-1' },
    oe = ['onClick'],
    se = ['onClick'],
    ie = { class: 'py-4 text-center text-sm text-neutral-500 dark:text-neutral-600' },
    ue = {
        __name: 'HighlightsView',
        setup(de) {
            const g = S(),
                { success: w, error: k } = z(),
                i = v([]),
                f = v(!0),
                d = v('')
            async function M() {
                f.value = !0
                try {
                    const l = await m.get('/api/highlights')
                    i.value = l.data || []
                } catch {
                    k('Failed to load highlights')
                } finally {
                    f.value = !1
                }
            }
            const p = v(null),
                c = v('')
            function F(l) {
                ;((p.value = l.id), (c.value = l.text))
            }
            function y() {
                ;((p.value = null), (c.value = ''))
            }
            async function _(l) {
                const t = c.value.trim()
                if (!t) return
                const r = i.value.find(s => s.id === l)?.text,
                    a = i.value.find(s => s.id === l)
                ;(a && (a.text = t), (p.value = null), (c.value = ''))
                try {
                    ;(await m.put(`/api/highlights/${l}`, { text: t }), w('Quote updated'))
                } catch {
                    ;(a && (a.text = r), k('Failed to update quote'))
                }
            }
            async function H(l) {
                const t = [...i.value]
                i.value = i.value.filter(r => r.id !== l)
                try {
                    ;(await m.delete(`/api/highlights/${l}`), w('Quote deleted'))
                } catch {
                    ;((i.value = t), k('Failed to delete quote'))
                }
            }
            const h = j(() => {
                    if (!d.value.trim()) return i.value
                    const l = d.value.toLowerCase()
                    return i.value.filter(
                        t =>
                            t.text.toLowerCase().includes(l) ||
                            t.article?.title?.toLowerCase().includes(l)
                    )
                }),
                T = j(() => {
                    const l = [],
                        t = new Map()
                    for (const r of h.value) {
                        const a = r.article_id
                        if (!t.has(a)) {
                            const s = {
                                articleId: a,
                                articleTitle: r.article?.title || 'Unknown Article',
                                articleUrl: r.article?.url,
                                feedTitle: r.article?.feed?.title,
                                feedFaviconUrl: r.article?.feed?.favicon_url,
                                highlights: [],
                            }
                            ;(t.set(a, s), l.push(s))
                        }
                        t.get(a).highlights.push(r)
                    }
                    return l
                })
            function U(l) {
                return new Date(l).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
            }
            function V() {
                g.push({ name: 'articles.index' })
            }
            function D(l) {
                g.push({ name: 'articles.show', params: { id: l } })
            }
            return (
                $(() => {
                    M()
                }),
                (l, t) => (
                    o(),
                    n(
                        x,
                        null,
                        [
                            e(
                                'header',
                                {
                                    class: 'sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pt-safe',
                                },
                                [
                                    e(
                                        'div',
                                        {
                                            class: 'flex h-11 items-center justify-between px-4',
                                        },
                                        [
                                            e(
                                                'div',
                                                { class: 'flex items-center gap-2 min-w-0' },
                                                [
                                                    e(
                                                        'button',
                                                        {
                                                            onClick: V,
                                                            class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2',
                                                            'aria-label': 'Go back',
                                                        },
                                                        [
                                                            ...(t[2] ||
                                                                (t[2] = [
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
                                                                                d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                                                                            }),
                                                                        ],
                                                                        -1
                                                                    ),
                                                                ])),
                                                        ]
                                                    ),
                                                    t[3] ||
                                                        (t[3] = e(
                                                            'h1',
                                                            {
                                                                class: 'text-base font-semibold text-neutral-800 dark:text-neutral-200 truncate',
                                                            },
                                                            ' Highlights ',
                                                            -1
                                                        )),
                                                ]
                                            ),
                                        ]
                                    ),
                                ]
                            ),
                            e('div', I, [
                                e('div', A, [
                                    t[4] ||
                                        (t[4] = e(
                                            'svg',
                                            {
                                                class: 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500',
                                                fill: 'none',
                                                viewBox: '0 0 24 24',
                                                'stroke-width': '1.5',
                                                stroke: 'currentColor',
                                            },
                                            [
                                                e('path', {
                                                    'stroke-linecap': 'round',
                                                    'stroke-linejoin': 'round',
                                                    d: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
                                                }),
                                            ],
                                            -1
                                        )),
                                    C(
                                        e(
                                            'input',
                                            {
                                                'onUpdate:modelValue':
                                                    t[0] || (t[0] = r => (d.value = r)),
                                                type: 'search',
                                                placeholder: 'Search quotes...',
                                                class: 'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2.5 pl-10 pr-4 text-base text-neutral-800 dark:text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-0',
                                                autocomplete: 'off',
                                            },
                                            null,
                                            512
                                        ),
                                        [[L, d.value]]
                                    ),
                                ]),
                            ]),
                            f.value
                                ? (o(),
                                  n('div', Q, [
                                      (o(),
                                      n(
                                          x,
                                          null,
                                          b(4, r =>
                                              e('div', { key: r, class: 'animate-pulse' }, [
                                                  ...(t[5] ||
                                                      (t[5] = [
                                                          e(
                                                              'div',
                                                              {
                                                                  class: 'mb-2 h-4 w-48 rounded bg-neutral-200 dark:bg-neutral-800',
                                                              },
                                                              null,
                                                              -1
                                                          ),
                                                          e(
                                                              'div',
                                                              {
                                                                  class: 'rounded-lg border border-neutral-200 dark:border-neutral-800 p-4',
                                                              },
                                                              [
                                                                  e('div', {
                                                                      class: 'mb-2 h-3 w-full rounded bg-neutral-200 dark:bg-neutral-800',
                                                                  }),
                                                                  e('div', {
                                                                      class: 'h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800',
                                                                  }),
                                                              ],
                                                              -1
                                                          ),
                                                      ])),
                                              ])
                                          ),
                                          64
                                      )),
                                  ]))
                                : i.value.length === 0
                                  ? (o(),
                                    n('div', K, [
                                        ...(t[6] ||
                                            (t[6] = [
                                                e(
                                                    'svg',
                                                    {
                                                        class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                        fill: 'none',
                                                        viewBox: '0 0 24 24',
                                                        'stroke-width': '1',
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
                                                    'h3',
                                                    {
                                                        class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                    },
                                                    ' No saved quotes yet ',
                                                    -1
                                                ),
                                                e(
                                                    'p',
                                                    {
                                                        class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                    },
                                                    ' Select text in any article and tap "Save quote" to save it here. ',
                                                    -1
                                                ),
                                            ])),
                                    ]))
                                  : h.value.length === 0 && d.value.trim()
                                    ? (o(),
                                      n('div', Z, [
                                          t[7] ||
                                              (t[7] = e(
                                                  'svg',
                                                  {
                                                      class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                      fill: 'none',
                                                      viewBox: '0 0 24 24',
                                                      'stroke-width': '1',
                                                      stroke: 'currentColor',
                                                  },
                                                  [
                                                      e('path', {
                                                          'stroke-linecap': 'round',
                                                          'stroke-linejoin': 'round',
                                                          d: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
                                                      }),
                                                  ],
                                                  -1
                                              )),
                                          t[8] ||
                                              (t[8] = e(
                                                  'h3',
                                                  {
                                                      class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                  },
                                                  ' No results found ',
                                                  -1
                                              )),
                                          e(
                                              'p',
                                              G,
                                              ' No quotes match "' + u(d.value) + '". ',
                                              1
                                          ),
                                      ]))
                                    : (o(),
                                      n('div', R, [
                                          (o(!0),
                                          n(
                                              x,
                                              null,
                                              b(
                                                  T.value,
                                                  r => (
                                                      o(),
                                                      n('section', { key: r.articleId }, [
                                                          e(
                                                              'button',
                                                              {
                                                                  onClick: a => D(r.articleId),
                                                                  class: 'flex items-center gap-2 text-left group mb-2',
                                                              },
                                                              [
                                                                  r.feedFaviconUrl
                                                                      ? (o(),
                                                                        n(
                                                                            'img',
                                                                            {
                                                                                key: 0,
                                                                                src: r.feedFaviconUrl,
                                                                                class: 'h-4 w-4 rounded-sm shrink-0',
                                                                                alt: '',
                                                                            },
                                                                            null,
                                                                            8,
                                                                            O
                                                                        ))
                                                                      : q('', !0),
                                                                  e(
                                                                      'h2',
                                                                      P,
                                                                      u(r.articleTitle),
                                                                      1
                                                                  ),
                                                              ],
                                                              8,
                                                              J
                                                          ),
                                                          r.feedTitle
                                                              ? (o(),
                                                                n('p', W, u(r.feedTitle), 1))
                                                              : q('', !0),
                                                          e('div', X, [
                                                              (o(!0),
                                                              n(
                                                                  x,
                                                                  null,
                                                                  b(
                                                                      r.highlights,
                                                                      a => (
                                                                          o(),
                                                                          n(
                                                                              'div',
                                                                              {
                                                                                  key: a.id,
                                                                                  class: 'rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3',
                                                                              },
                                                                              [
                                                                                  p.value ===
                                                                                  a.id
                                                                                      ? (o(),
                                                                                        n(
                                                                                            x,
                                                                                            {
                                                                                                key: 0,
                                                                                            },
                                                                                            [
                                                                                                C(
                                                                                                    e(
                                                                                                        'textarea',
                                                                                                        {
                                                                                                            'onUpdate:modelValue':
                                                                                                                t[1] ||
                                                                                                                (t[1] =
                                                                                                                    s =>
                                                                                                                        (c.value =
                                                                                                                            s)),
                                                                                                            class: 'w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y',
                                                                                                            rows: '3',
                                                                                                            onKeydown:
                                                                                                                [
                                                                                                                    B(
                                                                                                                        N(
                                                                                                                            s =>
                                                                                                                                _(
                                                                                                                                    a.id
                                                                                                                                ),
                                                                                                                            [
                                                                                                                                'meta',
                                                                                                                                'prevent',
                                                                                                                            ]
                                                                                                                        ),
                                                                                                                        [
                                                                                                                            'enter',
                                                                                                                        ]
                                                                                                                    ),
                                                                                                                    B(
                                                                                                                        y,
                                                                                                                        [
                                                                                                                            'escape',
                                                                                                                        ]
                                                                                                                    ),
                                                                                                                ],
                                                                                                        },
                                                                                                        null,
                                                                                                        40,
                                                                                                        Y
                                                                                                    ),
                                                                                                    [
                                                                                                        [
                                                                                                            L,
                                                                                                            c.value,
                                                                                                        ],
                                                                                                    ]
                                                                                                ),
                                                                                                e(
                                                                                                    'div',
                                                                                                    ee,
                                                                                                    [
                                                                                                        e(
                                                                                                            'button',
                                                                                                            {
                                                                                                                onClick:
                                                                                                                    y,
                                                                                                                class: 'rounded-md px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors',
                                                                                                            },
                                                                                                            ' Cancel '
                                                                                                        ),
                                                                                                        e(
                                                                                                            'button',
                                                                                                            {
                                                                                                                onClick:
                                                                                                                    s =>
                                                                                                                        _(
                                                                                                                            a.id
                                                                                                                        ),
                                                                                                                class: 'rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors',
                                                                                                            },
                                                                                                            ' Save ',
                                                                                                            8,
                                                                                                            te
                                                                                                        ),
                                                                                                    ]
                                                                                                ),
                                                                                            ],
                                                                                            64
                                                                                        ))
                                                                                      : (o(),
                                                                                        n(
                                                                                            x,
                                                                                            {
                                                                                                key: 1,
                                                                                            },
                                                                                            [
                                                                                                e(
                                                                                                    'blockquote',
                                                                                                    re,
                                                                                                    u(
                                                                                                        a.text
                                                                                                    ),
                                                                                                    1
                                                                                                ),
                                                                                                e(
                                                                                                    'div',
                                                                                                    le,
                                                                                                    [
                                                                                                        e(
                                                                                                            'span',
                                                                                                            ae,
                                                                                                            u(
                                                                                                                U(
                                                                                                                    a.created_at
                                                                                                                )
                                                                                                            ),
                                                                                                            1
                                                                                                        ),
                                                                                                        e(
                                                                                                            'div',
                                                                                                            ne,
                                                                                                            [
                                                                                                                e(
                                                                                                                    'button',
                                                                                                                    {
                                                                                                                        onClick:
                                                                                                                            s =>
                                                                                                                                F(
                                                                                                                                    a
                                                                                                                                ),
                                                                                                                        class: 'rounded p-1 text-neutral-400 hover:text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors',
                                                                                                                        'aria-label':
                                                                                                                            'Edit quote',
                                                                                                                    },
                                                                                                                    [
                                                                                                                        ...(t[9] ||
                                                                                                                            (t[9] =
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
                                                                                                                                                    d: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125',
                                                                                                                                                }
                                                                                                                                            ),
                                                                                                                                        ],
                                                                                                                                        -1
                                                                                                                                    ),
                                                                                                                                ])),
                                                                                                                    ],
                                                                                                                    8,
                                                                                                                    oe
                                                                                                                ),
                                                                                                                e(
                                                                                                                    'button',
                                                                                                                    {
                                                                                                                        onClick:
                                                                                                                            s =>
                                                                                                                                H(
                                                                                                                                    a.id
                                                                                                                                ),
                                                                                                                        class: 'rounded p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors',
                                                                                                                        'aria-label':
                                                                                                                            'Delete quote',
                                                                                                                    },
                                                                                                                    [
                                                                                                                        ...(t[10] ||
                                                                                                                            (t[10] =
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
                                                                                                                                                    d: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
                                                                                                                                                }
                                                                                                                                            ),
                                                                                                                                        ],
                                                                                                                                        -1
                                                                                                                                    ),
                                                                                                                                ])),
                                                                                                                    ],
                                                                                                                    8,
                                                                                                                    se
                                                                                                                ),
                                                                                                            ]
                                                                                                        ),
                                                                                                    ]
                                                                                                ),
                                                                                            ],
                                                                                            64
                                                                                        )),
                                                                              ]
                                                                          )
                                                                      )
                                                                  ),
                                                                  128
                                                              )),
                                                          ]),
                                                      ])
                                                  )
                                              ),
                                              128
                                          )),
                                          e(
                                              'div',
                                              ie,
                                              u(h.value.length) +
                                                  ' quote' +
                                                  u(h.value.length !== 1 ? 's' : ''),
                                              1
                                          ),
                                      ])),
                        ],
                        64
                    )
                )
            )
        },
    },
    pe = E(ue, [['__scopeId', 'data-v-8ce85f2a']])
export { pe as default }
