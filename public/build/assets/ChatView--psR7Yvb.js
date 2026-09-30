import {
    s as z,
    o as B,
    f as s,
    g as t,
    u as a,
    t as d,
    j as i,
    k as v,
    F as g,
    r as D,
    b as o,
    p as H,
} from './app-B4LGLfGt.js'
import { u as V, a as A } from './useOnlineStatus-B4V4wxVM.js'
import { u as E } from './useToast-CELS0gRj.js'
import { _ as $ } from './_plugin-vue_export-helper-DlAUqK2U.js'
const I = { key: 0, class: 'flex items-center justify-center py-20' },
    N = { key: 1, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    S = { key: 2, class: 'flex flex-col items-center justify-center px-4 py-20 text-center' },
    T = { class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300' },
    F = { class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500' },
    O = { key: 3, class: 'mx-auto max-w-2xl px-4 py-6' },
    U = {
        key: 0,
        class: 'mb-4 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400',
    },
    Y = { key: 1, class: 'space-y-1' },
    P = { class: 'flex items-center gap-3' },
    R = ['onClick', 'title'],
    q = { class: 'text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate' },
    G = {
        class: 'mt-1 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-500',
    },
    J = { key: 0, class: 'truncate' },
    K = { key: 1 },
    Q = { class: 'truncate' },
    W = { class: 'shrink-0' },
    X = {
        key: 0,
        class: 'mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500',
    },
    Z = ['onClick'],
    tt = { key: 0, class: 'mt-3 rounded-lg border border-red-800/50 bg-red-950/50 p-3' },
    et = { class: 'flex gap-2' },
    rt = ['onClick'],
    st = { key: 2, class: 'flex flex-col items-center justify-center py-20 text-center' },
    ot = {
        __name: 'ChatView',
        setup(nt) {
            const h = z(),
                n = V(),
                { error: b } = E(),
                { isOnline: k } = A(),
                c = H(null)
            function w(l) {
                const e = new Date(),
                    r = new Date(l),
                    u = Math.floor((e - r) / 1e3)
                if (u < 60) return 'just now'
                const x = Math.floor(u / 60)
                if (x < 60) return `${x}m`
                const m = Math.floor(x / 60)
                if (m < 24) return `${m}h`
                const f = Math.floor(m / 24)
                return f < 7
                    ? `${f}d`
                    : r.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
            function _(l) {
                return l.last_message_at ? w(l.last_message_at) : 'new'
            }
            async function p() {
                await Promise.all([n.loadModels(!0), n.fetchConversationList()])
            }
            B(p)
            function y(l) {
                h.push({ name: 'chat.show', params: { conversationId: l.id } })
            }
            function C(l) {
                c.value = l.id
            }
            function M() {
                c.value = null
            }
            async function L(l) {
                try {
                    ;(await n.removeConversation(l.id), (c.value = null))
                } catch (e) {
                    b(e.response?.data?.message || 'Failed to delete conversation')
                }
            }
            function j() {
                h.push({ name: 'articles.index' })
            }
            return (l, e) => (
                o(),
                s(
                    g,
                    null,
                    [
                        t(
                            'header',
                            {
                                class: 'sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pt-safe',
                            },
                            [
                                t(
                                    'div',
                                    { class: 'flex h-11 items-center justify-between px-4' },
                                    [
                                        t(
                                            'div',
                                            { class: 'flex items-center gap-2 min-w-0' },
                                            [
                                                t(
                                                    'button',
                                                    {
                                                        onClick: j,
                                                        class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2',
                                                        'aria-label': 'Back to articles',
                                                    },
                                                    [
                                                        ...(e[0] ||
                                                            (e[0] = [
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
                                                                            d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                                                                        }),
                                                                    ],
                                                                    -1
                                                                ),
                                                            ])),
                                                    ]
                                                ),
                                                e[1] ||
                                                    (e[1] = t(
                                                        'h1',
                                                        {
                                                            class: 'text-base font-semibold text-neutral-800 dark:text-neutral-200 truncate',
                                                        },
                                                        ' Chat ',
                                                        -1
                                                    )),
                                            ]
                                        ),
                                    ]
                                ),
                            ]
                        ),
                        a(n).conversationsLoading && !a(n).conversationsLoaded
                            ? (o(),
                              s('div', I, [
                                  ...(e[2] ||
                                      (e[2] = [
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
                              ]))
                            : a(n).enabled === !1
                              ? (o(),
                                s('div', N, [
                                    ...(e[3] ||
                                        (e[3] = [
                                            t(
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
                                                        d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
                                                    }),
                                                ],
                                                -1
                                            ),
                                            t(
                                                'h3',
                                                {
                                                    class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                },
                                                ' Chat is unavailable ',
                                                -1
                                            ),
                                            t(
                                                'p',
                                                {
                                                    class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                },
                                                ' No AI provider is configured on this server. ',
                                                -1
                                            ),
                                        ])),
                                ]))
                              : a(n).conversationsError && !a(n).conversationsLoaded
                                ? (o(),
                                  s('div', S, [
                                      e[4] ||
                                          (e[4] = t(
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
                                          T,
                                          d(
                                              a(n).conversationsError === 'offline'
                                                  ? "You're offline"
                                                  : "Couldn't load conversations"
                                          ),
                                          1
                                      ),
                                      t(
                                          'p',
                                          F,
                                          d(
                                              a(n).conversationsError === 'offline'
                                                  ? 'Chat needs a connection.'
                                                  : 'The server returned an error.'
                                          ),
                                          1
                                      ),
                                      a(n).conversationsError === 'server' && a(k)
                                          ? (o(),
                                            s(
                                                'button',
                                                {
                                                    key: 0,
                                                    onClick: p,
                                                    class: 'mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors',
                                                },
                                                ' Try again '
                                            ))
                                          : i('', !0),
                                  ]))
                                : (o(),
                                  s('div', O, [
                                      a(k)
                                          ? i('', !0)
                                          : (o(),
                                            s('div', U, [
                                                ...(e[5] ||
                                                    (e[5] = [
                                                        t(
                                                            'svg',
                                                            {
                                                                class: 'h-4 w-4 shrink-0',
                                                                fill: 'none',
                                                                viewBox: '0 0 24 24',
                                                                'stroke-width': '1.5',
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
                                                        ),
                                                        v(
                                                            " You're offline — chat needs a connection. ",
                                                            -1
                                                        ),
                                                    ])),
                                            ])),
                                      a(n).conversations.length > 0
                                          ? (o(),
                                            s('div', Y, [
                                                (o(!0),
                                                s(
                                                    g,
                                                    null,
                                                    D(
                                                        a(n).conversations,
                                                        r => (
                                                            o(),
                                                            s(
                                                                'div',
                                                                {
                                                                    key: r.id,
                                                                    class: 'rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3',
                                                                },
                                                                [
                                                                    t('div', P, [
                                                                        t(
                                                                            'button',
                                                                            {
                                                                                onClick: u =>
                                                                                    y(r),
                                                                                class: 'flex-1 min-w-0 text-left transition-colors',
                                                                                title: r.article_title,
                                                                            },
                                                                            [
                                                                                t(
                                                                                    'p',
                                                                                    q,
                                                                                    d(
                                                                                        r.article_title ||
                                                                                            'Untitled article'
                                                                                    ),
                                                                                    1
                                                                                ),
                                                                                t('div', G, [
                                                                                    r.feed_title
                                                                                        ? (o(),
                                                                                          s(
                                                                                              'span',
                                                                                              J,
                                                                                              d(
                                                                                                  r.feed_title
                                                                                              ),
                                                                                              1
                                                                                          ))
                                                                                        : i(
                                                                                              '',
                                                                                              !0
                                                                                          ),
                                                                                    r.feed_title
                                                                                        ? (o(),
                                                                                          s(
                                                                                              'span',
                                                                                              K,
                                                                                              '·'
                                                                                          ))
                                                                                        : i(
                                                                                              '',
                                                                                              !0
                                                                                          ),
                                                                                    t(
                                                                                        'span',
                                                                                        Q,
                                                                                        d(
                                                                                            r.model
                                                                                        ),
                                                                                        1
                                                                                    ),
                                                                                    e[6] ||
                                                                                        (e[6] =
                                                                                            t(
                                                                                                'span',
                                                                                                null,
                                                                                                '·',
                                                                                                -1
                                                                                            )),
                                                                                    t(
                                                                                        'span',
                                                                                        W,
                                                                                        d(
                                                                                            _(
                                                                                                r
                                                                                            )
                                                                                        ),
                                                                                        1
                                                                                    ),
                                                                                ]),
                                                                                r.provider_available
                                                                                    ? i('', !0)
                                                                                    : (o(),
                                                                                      s(
                                                                                          'p',
                                                                                          X,
                                                                                          [
                                                                                              ...(e[7] ||
                                                                                                  (e[7] =
                                                                                                      [
                                                                                                          t(
                                                                                                              'svg',
                                                                                                              {
                                                                                                                  class: 'h-3.5 w-3.5 shrink-0',
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
                                                                                                                          d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                                                                                      }
                                                                                                                  ),
                                                                                                              ],
                                                                                                              -1
                                                                                                          ),
                                                                                                          v(
                                                                                                              ' Model unavailable — switch to a configured model in the chat. ',
                                                                                                              -1
                                                                                                          ),
                                                                                                      ])),
                                                                                          ]
                                                                                      )),
                                                                            ],
                                                                            8,
                                                                            R
                                                                        ),
                                                                        c.value !== r.id
                                                                            ? (o(),
                                                                              s(
                                                                                  'button',
                                                                                  {
                                                                                      key: 0,
                                                                                      onClick:
                                                                                          u =>
                                                                                              C(
                                                                                                  r
                                                                                              ),
                                                                                      class: 'rounded-lg p-1.5 text-neutral-500 hover:bg-red-900/50 hover:text-red-400 transition-colors shrink-0',
                                                                                      title: 'Delete conversation',
                                                                                      'aria-label':
                                                                                          'Delete conversation',
                                                                                  },
                                                                                  [
                                                                                      ...(e[8] ||
                                                                                          (e[8] =
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
                                                                                                                  d: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
                                                                                                              }
                                                                                                          ),
                                                                                                      ],
                                                                                                      -1
                                                                                                  ),
                                                                                              ])),
                                                                                  ],
                                                                                  8,
                                                                                  Z
                                                                              ))
                                                                            : i('', !0),
                                                                    ]),
                                                                    c.value === r.id
                                                                        ? (o(),
                                                                          s('div', tt, [
                                                                              e[9] ||
                                                                                  (e[9] = t(
                                                                                      'p',
                                                                                      {
                                                                                          class: 'text-sm text-red-300 mb-2',
                                                                                      },
                                                                                      ' Delete this conversation? Its history is removed for good. ',
                                                                                      -1
                                                                                  )),
                                                                              t('div', et, [
                                                                                  t(
                                                                                      'button',
                                                                                      {
                                                                                          onClick:
                                                                                              u =>
                                                                                                  L(
                                                                                                      r
                                                                                                  ),
                                                                                          class: 'rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors',
                                                                                      },
                                                                                      ' Delete ',
                                                                                      8,
                                                                                      rt
                                                                                  ),
                                                                                  t(
                                                                                      'button',
                                                                                      {
                                                                                          onClick:
                                                                                              M,
                                                                                          class: 'rounded-lg px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors',
                                                                                      },
                                                                                      ' Cancel '
                                                                                  ),
                                                                              ]),
                                                                          ]))
                                                                        : i('', !0),
                                                                ]
                                                            )
                                                        )
                                                    ),
                                                    128
                                                )),
                                            ]))
                                          : (o(),
                                            s('div', st, [
                                                ...(e[10] ||
                                                    (e[10] = [
                                                        t(
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
                                                                    d: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
                                                                }),
                                                            ],
                                                            -1
                                                        ),
                                                        t(
                                                            'h3',
                                                            {
                                                                class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                            },
                                                            ' No conversations yet ',
                                                            -1
                                                        ),
                                                        t(
                                                            'p',
                                                            {
                                                                class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                            },
                                                            ' Open an article and start a chat — it will show up here. ',
                                                            -1
                                                        ),
                                                    ])),
                                            ])),
                                  ])),
                    ],
                    64
                )
            )
        },
    },
    ct = $(ot, [['__scopeId', 'data-v-5c6e8191']])
export { ct as default }
