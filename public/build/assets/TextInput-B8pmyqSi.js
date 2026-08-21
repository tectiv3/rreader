import {
    l as n,
    M as d,
    b as t,
    f as s,
    g as i,
    t as r,
    L as p,
    P as m,
    o as _,
    Q as f,
    p as v,
} from './app-BO6VQ9fp.js'
const b = { class: 'text-sm text-red-400' },
    S = {
        __name: 'InputError',
        props: { message: { type: String } },
        setup(e) {
            return (a, o) =>
                n((t(), s('div', null, [i('p', b, r(e.message), 1)], 512)), [[d, e.message]])
        },
    },
    x = { class: 'block text-sm font-medium text-neutral-300' },
    g = { key: 0 },
    h = { key: 1 },
    M = {
        __name: 'InputLabel',
        props: { value: { type: String } },
        setup(e) {
            return (a, o) => (
                t(),
                s('label', x, [
                    e.value
                        ? (t(), s('span', g, r(e.value), 1))
                        : (t(), s('span', h, [p(a.$slots, 'default')])),
                ])
            )
        },
    },
    V = {
        __name: 'TextInput',
        props: { modelValue: { type: String, required: !0 }, modelModifiers: {} },
        emits: ['update:modelValue'],
        setup(e, { expose: a }) {
            const o = m(e, 'modelValue'),
                u = v(null)
            return (
                _(() => {
                    u.value.hasAttribute('autofocus') && u.value.focus()
                }),
                a({ focus: () => u.value.focus() }),
                (y, l) =>
                    n(
                        (t(),
                        s(
                            'input',
                            {
                                class: 'rounded-md border-neutral-700 bg-neutral-800 text-neutral-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-neutral-400',
                                'onUpdate:modelValue': l[0] || (l[0] = c => (o.value = c)),
                                ref_key: 'input',
                                ref: u,
                            },
                            null,
                            512
                        )),
                        [[f, o.value]]
                    )
            )
        },
    }
export { V as _, S as a, M as b }
