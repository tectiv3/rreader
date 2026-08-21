import {
    s as D,
    o as N,
    q as m,
    f as d,
    g as e,
    F as j,
    r as $,
    l as b,
    v as H,
    h as f,
    t as n,
    i as C,
    Q as p,
    j as h,
    k as A,
    a4 as x,
    p as _,
    b as u,
} from './app-CHkijDF0.js'
import { u as I } from './useDarkMode-CBtMes8M.js'
import { u as G } from './useToast-C3IzSksO.js'
import { _ as R } from './_plugin-vue_export-helper-DlAUqK2U.js'
const q = { key: 0, class: 'flex items-center justify-center py-20' },
    Q = { key: 1, class: 'mx-auto max-w-lg px-4 py-6 space-y-5' },
    Z = { class: 'rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5' },
    J = { class: 'space-y-4' },
    K = { class: 'grid grid-cols-3 gap-2' },
    W = ['onClick'],
    X = { class: 'rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5 mb-5' },
    Y = { class: 'space-y-4' },
    ee = { class: 'flex items-center justify-between' },
    te = ['aria-checked'],
    re = { class: 'flex items-center justify-between' },
    ae = ['aria-checked'],
    se = ['disabled'],
    le = { class: 'rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5' },
    ne = { key: 0, class: 'mt-1 text-sm text-red-600 dark:text-red-400' },
    oe = { key: 0, class: 'mt-1 text-sm text-red-600 dark:text-red-400' },
    de = ['disabled'],
    ue = { class: 'rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5' },
    ie = { key: 0, class: 'mt-1 text-sm text-red-600 dark:text-red-400' },
    ce = { key: 0, class: 'mt-1 text-sm text-red-600 dark:text-red-400' },
    be = ['disabled'],
    me = {
        __name: 'SettingsView',
        setup(fe) {
            const V = D(),
                { setTheme: M } = I(),
                { success: y, error: k } = G(),
                F = `v1.1.1 (${new Date('2026-08-21T18:11:36.617Z').toLocaleDateString()})`,
                S = _(!0),
                r = x({
                    theme: 'dark',
                    article_view: 'full',
                    font_size: 'medium',
                    refresh_interval: 30,
                    mark_read_on_scroll: !0,
                    hide_read_articles: !1,
                }),
                g = _(!1),
                o = x({ name: '', email: '' }),
                v = _(!1),
                i = x({}),
                l = x({ current_password: '', password: '', password_confirmation: '' }),
                w = _(!1),
                c = x({})
            N(async () => {
                try {
                    const s = await m.get('/api/settings'),
                        { settings: t, user: a } = s.data
                    ;((r.theme = t.theme || 'dark'),
                        (r.article_view = t.article_view || 'full'),
                        (r.font_size = t.font_size || 'medium'),
                        (r.refresh_interval = t.refresh_interval || 30),
                        (r.mark_read_on_scroll = t.mark_read_on_scroll || !0),
                        (r.hide_read_articles = t.hide_read_articles || !1),
                        (o.name = a.name || ''),
                        (o.email = a.email || ''))
                } catch {
                    k('Failed to load settings')
                } finally {
                    S.value = !1
                }
            })
            async function L() {
                g.value = !0
                try {
                    ;(await m.patch('/api/settings', {
                        theme: r.theme,
                        article_view: r.article_view,
                        font_size: r.font_size,
                        refresh_interval: r.refresh_interval,
                        mark_read_on_scroll: r.mark_read_on_scroll,
                        hide_read_articles: r.hide_read_articles,
                    }),
                        M(r.theme),
                        y('Preferences saved'))
                } catch {
                    k('Failed to save preferences')
                } finally {
                    g.value = !1
                }
            }
            function U(s) {
                ;((r.theme = s), M(s))
            }
            async function z() {
                ;((v.value = !0), Object.keys(i).forEach(s => delete i[s]))
                try {
                    ;(await m.patch('/api/settings/account', { name: o.name, email: o.email }),
                        y('Account updated'))
                } catch (s) {
                    s.response?.status === 422
                        ? Object.assign(i, s.response.data.errors || {})
                        : k('Failed to update account')
                } finally {
                    v.value = !1
                }
            }
            async function P() {
                ;((w.value = !0), Object.keys(c).forEach(s => delete c[s]))
                try {
                    ;(await m.patch('/api/settings/password', {
                        current_password: l.current_password,
                        password: l.password,
                        password_confirmation: l.password_confirmation,
                    }),
                        (l.current_password = ''),
                        (l.password = ''),
                        (l.password_confirmation = ''),
                        y('Password updated'))
                } catch (s) {
                    ;(s.response?.status === 422
                        ? Object.assign(c, s.response.data.errors || {})
                        : k('Failed to update password'),
                        (l.password = ''),
                        (l.password_confirmation = ''))
                } finally {
                    w.value = !1
                }
            }
            function B() {
                V.push({ name: 'opml.import' })
            }
            function E() {
                window.location.href = '/opml/export'
            }
            async function O() {
                try {
                    ;(await m.post('/logout'), (window.location.href = '/'))
                } catch {
                    window.location.href = '/'
                }
            }
            function T() {
                V.back()
            }
            return (s, t) => (
                u(),
                d(
                    j,
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
                                    { class: 'flex h-11 items-center justify-between px-4' },
                                    [
                                        e(
                                            'div',
                                            { class: 'flex items-center gap-2 min-w-0' },
                                            [
                                                e(
                                                    'button',
                                                    {
                                                        onClick: T,
                                                        class: 'rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors -ml-2',
                                                        'aria-label': 'Go back',
                                                    },
                                                    [
                                                        ...(t[8] ||
                                                            (t[8] = [
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
                                                t[9] ||
                                                    (t[9] = e(
                                                        'h1',
                                                        {
                                                            class: 'text-base font-semibold text-neutral-800 dark:text-neutral-200 truncate',
                                                        },
                                                        ' Settings ',
                                                        -1
                                                    )),
                                            ]
                                        ),
                                    ]
                                ),
                            ]
                        ),
                        S.value
                            ? (u(),
                              d('div', q, [
                                  ...(t[10] ||
                                      (t[10] = [
                                          e(
                                              'svg',
                                              {
                                                  class: 'h-8 w-8 animate-spin text-neutral-400',
                                                  fill: 'none',
                                                  viewBox: '0 0 24 24',
                                              },
                                              [
                                                  e('circle', {
                                                      class: 'opacity-25',
                                                      cx: '12',
                                                      cy: '12',
                                                      r: '10',
                                                      stroke: 'currentColor',
                                                      'stroke-width': '4',
                                                  }),
                                                  e('path', {
                                                      class: 'opacity-75',
                                                      fill: 'currentColor',
                                                      d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                  }),
                                              ],
                                              -1
                                          ),
                                      ])),
                              ]))
                            : (u(),
                              d('div', Q, [
                                  e(
                                      'form',
                                      { onSubmit: C(L, ['prevent']) },
                                      [
                                          e('div', Z, [
                                              t[12] ||
                                                  (t[12] = e(
                                                      'h2',
                                                      {
                                                          class: 'text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4',
                                                      },
                                                      ' Appearance ',
                                                      -1
                                                  )),
                                              e('div', J, [
                                                  e('div', null, [
                                                      t[11] ||
                                                          (t[11] = e(
                                                              'label',
                                                              {
                                                                  class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-2',
                                                              },
                                                              'Theme',
                                                              -1
                                                          )),
                                                      e('div', K, [
                                                          (u(),
                                                          d(
                                                              j,
                                                              null,
                                                              $(
                                                                  [
                                                                      {
                                                                          value: 'dark',
                                                                          label: 'Dark',
                                                                      },
                                                                      {
                                                                          value: 'light',
                                                                          label: 'Light',
                                                                      },
                                                                      {
                                                                          value: 'system',
                                                                          label: 'System',
                                                                      },
                                                                  ],
                                                                  a =>
                                                                      e(
                                                                          'button',
                                                                          {
                                                                              key: a.value,
                                                                              type: 'button',
                                                                              onClick: pe =>
                                                                                  U(a.value),
                                                                              class: f([
                                                                                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                                                                  r.theme ===
                                                                                  a.value
                                                                                      ? 'bg-blue-600 text-white'
                                                                                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700',
                                                                              ]),
                                                                          },
                                                                          n(a.label),
                                                                          11,
                                                                          W
                                                                      )
                                                              ),
                                                              64
                                                          )),
                                                      ]),
                                                  ]),
                                              ]),
                                          ]),
                                          e('div', X, [
                                              t[17] ||
                                                  (t[17] = e(
                                                      'h2',
                                                      {
                                                          class: 'text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4',
                                                      },
                                                      ' Feeds ',
                                                      -1
                                                  )),
                                              e('div', Y, [
                                                  e('div', null, [
                                                      t[14] ||
                                                          (t[14] = e(
                                                              'label',
                                                              {
                                                                  for: 'refresh_interval',
                                                                  class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-2',
                                                              },
                                                              'Refresh interval (minutes)',
                                                              -1
                                                          )),
                                                      b(
                                                          e(
                                                              'select',
                                                              {
                                                                  id: 'refresh_interval',
                                                                  'onUpdate:modelValue':
                                                                      t[0] ||
                                                                      (t[0] = a =>
                                                                          (r.refresh_interval =
                                                                              a)),
                                                                  class: 'w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
                                                              },
                                                              [
                                                                  ...(t[13] ||
                                                                      (t[13] = [
                                                                          e(
                                                                              'option',
                                                                              { value: 5 },
                                                                              '5 minutes',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 15 },
                                                                              '15 minutes',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 30 },
                                                                              '30 minutes',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 60 },
                                                                              '1 hour',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 120 },
                                                                              '2 hours',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 360 },
                                                                              '6 hours',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 720 },
                                                                              '12 hours',
                                                                              -1
                                                                          ),
                                                                          e(
                                                                              'option',
                                                                              { value: 1440 },
                                                                              '24 hours',
                                                                              -1
                                                                          ),
                                                                      ])),
                                                              ],
                                                              512
                                                          ),
                                                          [
                                                              [
                                                                  H,
                                                                  r.refresh_interval,
                                                                  void 0,
                                                                  { number: !0 },
                                                              ],
                                                          ]
                                                      ),
                                                  ]),
                                                  e('div', ee, [
                                                      t[15] ||
                                                          (t[15] = e(
                                                              'label',
                                                              {
                                                                  for: 'mark_read_on_scroll',
                                                                  class: 'text-sm text-neutral-700 dark:text-neutral-300',
                                                              },
                                                              'Mark as read on scroll',
                                                              -1
                                                          )),
                                                      e(
                                                          'button',
                                                          {
                                                              id: 'mark_read_on_scroll',
                                                              type: 'button',
                                                              onClick:
                                                                  t[1] ||
                                                                  (t[1] = a =>
                                                                      (r.mark_read_on_scroll =
                                                                          !r.mark_read_on_scroll)),
                                                              class: f([
                                                                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                                                  r.mark_read_on_scroll
                                                                      ? 'bg-blue-600'
                                                                      : 'bg-neutral-300 dark:bg-neutral-700',
                                                              ]),
                                                              role: 'switch',
                                                              'aria-checked':
                                                                  r.mark_read_on_scroll,
                                                          },
                                                          [
                                                              e(
                                                                  'span',
                                                                  {
                                                                      class: f([
                                                                          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                                                                          r.mark_read_on_scroll
                                                                              ? 'translate-x-6'
                                                                              : 'translate-x-1',
                                                                      ]),
                                                                  },
                                                                  null,
                                                                  2
                                                              ),
                                                          ],
                                                          10,
                                                          te
                                                      ),
                                                  ]),
                                                  e('div', re, [
                                                      t[16] ||
                                                          (t[16] = e(
                                                              'label',
                                                              {
                                                                  for: 'hide_read_articles',
                                                                  class: 'text-sm text-neutral-700 dark:text-neutral-300',
                                                              },
                                                              'Hide read articles',
                                                              -1
                                                          )),
                                                      e(
                                                          'button',
                                                          {
                                                              id: 'hide_read_articles',
                                                              type: 'button',
                                                              onClick:
                                                                  t[2] ||
                                                                  (t[2] = a =>
                                                                      (r.hide_read_articles =
                                                                          !r.hide_read_articles)),
                                                              class: f([
                                                                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                                                  r.hide_read_articles
                                                                      ? 'bg-blue-600'
                                                                      : 'bg-neutral-300 dark:bg-neutral-700',
                                                              ]),
                                                              role: 'switch',
                                                              'aria-checked':
                                                                  r.hide_read_articles,
                                                          },
                                                          [
                                                              e(
                                                                  'span',
                                                                  {
                                                                      class: f([
                                                                          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                                                                          r.hide_read_articles
                                                                              ? 'translate-x-6'
                                                                              : 'translate-x-1',
                                                                      ]),
                                                                  },
                                                                  null,
                                                                  2
                                                              ),
                                                          ],
                                                          10,
                                                          ae
                                                      ),
                                                  ]),
                                              ]),
                                          ]),
                                          e(
                                              'button',
                                              {
                                                  type: 'submit',
                                                  class: 'w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-25',
                                                  disabled: g.value,
                                              },
                                              n(g.value ? 'Saving...' : 'Save Preferences'),
                                              9,
                                              se
                                          ),
                                      ],
                                      32
                                  ),
                                  e('div', le, [
                                      t[20] ||
                                          (t[20] = e(
                                              'h2',
                                              {
                                                  class: 'text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4',
                                              },
                                              ' Account ',
                                              -1
                                          )),
                                      e(
                                          'form',
                                          { onSubmit: C(z, ['prevent']), class: 'space-y-4' },
                                          [
                                              e('div', null, [
                                                  t[18] ||
                                                      (t[18] = e(
                                                          'label',
                                                          {
                                                              for: 'name',
                                                              class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-1',
                                                          },
                                                          'Name',
                                                          -1
                                                      )),
                                                  b(
                                                      e(
                                                          'input',
                                                          {
                                                              id: 'name',
                                                              'onUpdate:modelValue':
                                                                  t[3] ||
                                                                  (t[3] = a => (o.name = a)),
                                                              type: 'text',
                                                              class: 'w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
                                                          },
                                                          null,
                                                          512
                                                      ),
                                                      [[p, o.name]]
                                                  ),
                                                  i.name
                                                      ? (u(), d('p', ne, n(i.name[0]), 1))
                                                      : h('', !0),
                                              ]),
                                              e('div', null, [
                                                  t[19] ||
                                                      (t[19] = e(
                                                          'label',
                                                          {
                                                              for: 'email',
                                                              class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-1',
                                                          },
                                                          'Email',
                                                          -1
                                                      )),
                                                  b(
                                                      e(
                                                          'input',
                                                          {
                                                              id: 'email',
                                                              'onUpdate:modelValue':
                                                                  t[4] ||
                                                                  (t[4] = a => (o.email = a)),
                                                              type: 'email',
                                                              class: 'w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
                                                          },
                                                          null,
                                                          512
                                                      ),
                                                      [[p, o.email]]
                                                  ),
                                                  i.email
                                                      ? (u(), d('p', oe, n(i.email[0]), 1))
                                                      : h('', !0),
                                              ]),
                                              e(
                                                  'button',
                                                  {
                                                      type: 'submit',
                                                      class: 'w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-25',
                                                      disabled: v.value,
                                                  },
                                                  n(
                                                      v.value
                                                          ? 'Updating...'
                                                          : 'Update Account'
                                                  ),
                                                  9,
                                                  de
                                              ),
                                          ],
                                          32
                                      ),
                                  ]),
                                  e('div', ue, [
                                      t[24] ||
                                          (t[24] = e(
                                              'h2',
                                              {
                                                  class: 'text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4',
                                              },
                                              ' Change Password ',
                                              -1
                                          )),
                                      e(
                                          'form',
                                          { onSubmit: C(P, ['prevent']), class: 'space-y-4' },
                                          [
                                              e('div', null, [
                                                  t[21] ||
                                                      (t[21] = e(
                                                          'label',
                                                          {
                                                              for: 'current_password',
                                                              class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-1',
                                                          },
                                                          'Current password',
                                                          -1
                                                      )),
                                                  b(
                                                      e(
                                                          'input',
                                                          {
                                                              id: 'current_password',
                                                              'onUpdate:modelValue':
                                                                  t[5] ||
                                                                  (t[5] = a =>
                                                                      (l.current_password =
                                                                          a)),
                                                              type: 'password',
                                                              class: 'w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
                                                          },
                                                          null,
                                                          512
                                                      ),
                                                      [[p, l.current_password]]
                                                  ),
                                                  c.current_password
                                                      ? (u(),
                                                        d(
                                                            'p',
                                                            ie,
                                                            n(c.current_password[0]),
                                                            1
                                                        ))
                                                      : h('', !0),
                                              ]),
                                              e('div', null, [
                                                  t[22] ||
                                                      (t[22] = e(
                                                          'label',
                                                          {
                                                              for: 'password',
                                                              class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-1',
                                                          },
                                                          'New password',
                                                          -1
                                                      )),
                                                  b(
                                                      e(
                                                          'input',
                                                          {
                                                              id: 'password',
                                                              'onUpdate:modelValue':
                                                                  t[6] ||
                                                                  (t[6] = a =>
                                                                      (l.password = a)),
                                                              type: 'password',
                                                              class: 'w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
                                                          },
                                                          null,
                                                          512
                                                      ),
                                                      [[p, l.password]]
                                                  ),
                                                  c.password
                                                      ? (u(), d('p', ce, n(c.password[0]), 1))
                                                      : h('', !0),
                                              ]),
                                              e('div', null, [
                                                  t[23] ||
                                                      (t[23] = e(
                                                          'label',
                                                          {
                                                              for: 'password_confirmation',
                                                              class: 'block text-sm text-neutral-700 dark:text-neutral-300 mb-1',
                                                          },
                                                          'Confirm new password',
                                                          -1
                                                      )),
                                                  b(
                                                      e(
                                                          'input',
                                                          {
                                                              id: 'password_confirmation',
                                                              'onUpdate:modelValue':
                                                                  t[7] ||
                                                                  (t[7] = a =>
                                                                      (l.password_confirmation =
                                                                          a)),
                                                              type: 'password',
                                                              class: 'w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-base text-neutral-800 dark:text-neutral-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
                                                          },
                                                          null,
                                                          512
                                                      ),
                                                      [[p, l.password_confirmation]]
                                                  ),
                                              ]),
                                              e(
                                                  'button',
                                                  {
                                                      type: 'submit',
                                                      class: 'w-full rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-25',
                                                      disabled: w.value,
                                                  },
                                                  n(
                                                      w.value
                                                          ? 'Updating...'
                                                          : 'Update Password'
                                                  ),
                                                  9,
                                                  be
                                              ),
                                          ],
                                          32
                                      ),
                                  ]),
                                  e(
                                      'div',
                                      {
                                          class: 'rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5',
                                      },
                                      [
                                          t[27] ||
                                              (t[27] = e(
                                                  'h2',
                                                  {
                                                      class: 'text-base font-medium text-neutral-800 dark:text-neutral-200 mb-4',
                                                  },
                                                  'Data',
                                                  -1
                                              )),
                                          e('div', { class: 'space-y-3' }, [
                                              e(
                                                  'button',
                                                  {
                                                      onClick: B,
                                                      class: 'flex w-full items-center gap-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700',
                                                  },
                                                  [
                                                      ...(t[25] ||
                                                          (t[25] = [
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
                                                                          d: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                              A(' Import OPML ', -1),
                                                          ])),
                                                  ]
                                              ),
                                              e(
                                                  'button',
                                                  {
                                                      onClick: E,
                                                      class: 'flex w-full items-center gap-3 rounded-lg bg-neutral-200 dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-800 dark:text-neutral-200 transition hover:bg-neutral-300 dark:hover:bg-neutral-700',
                                                  },
                                                  [
                                                      ...(t[26] ||
                                                          (t[26] = [
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
                                                                          d: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                              A(' Export OPML ', -1),
                                                          ])),
                                                  ]
                                              ),
                                          ]),
                                      ]
                                  ),
                                  e(
                                      'div',
                                      {
                                          class: 'rounded-xl bg-neutral-50 dark:bg-neutral-900 p-5',
                                      },
                                      [
                                          t[30] ||
                                              (t[30] = e(
                                                  'h2',
                                                  {
                                                      class: 'text-base font-medium text-neutral-800 dark:text-neutral-200 mb-3',
                                                  },
                                                  'About',
                                                  -1
                                              )),
                                          e(
                                              'div',
                                              {
                                                  class: 'space-y-2 text-sm text-neutral-500 dark:text-neutral-400',
                                              },
                                              [
                                                  e('div', { class: 'flex justify-between' }, [
                                                      t[28] ||
                                                          (t[28] = e(
                                                              'span',
                                                              null,
                                                              'Version',
                                                              -1
                                                          )),
                                                      e(
                                                          'span',
                                                          {
                                                              class: 'text-neutral-700 dark:text-neutral-300',
                                                          },
                                                          n(F)
                                                      ),
                                                  ]),
                                                  t[29] ||
                                                      (t[29] = e(
                                                          'div',
                                                          { class: 'flex justify-between' },
                                                          [
                                                              e('span', null, 'Source code'),
                                                              e(
                                                                  'a',
                                                                  {
                                                                      href: 'https://github.com/tectiv3/rreader',
                                                                      target: '_blank',
                                                                      rel: 'noopener noreferrer',
                                                                      class: 'text-blue-400 hover:text-blue-300',
                                                                  },
                                                                  ' GitHub '
                                                              ),
                                                          ],
                                                          -1
                                                      )),
                                              ]
                                          ),
                                      ]
                                  ),
                                  e(
                                      'button',
                                      {
                                          onClick: O,
                                          class: 'w-full rounded-lg bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-800 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/70',
                                      },
                                      ' Log Out '
                                  ),
                              ])),
                    ],
                    64
                )
            )
        },
    },
    we = R(me, [['__scopeId', 'data-v-1d385e3d']])
export { we as default }
