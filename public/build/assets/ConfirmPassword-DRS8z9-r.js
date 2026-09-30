import {
    G as m,
    b as n,
    c as d,
    e as t,
    d as e,
    u as o,
    H as u,
    g as r,
    i as p,
    h as f,
    k as c,
} from './app-CcPhvO6o.js'
import { _ } from './GuestLayout-BfE_YuQ5.js'
import { b as w, _ as b, a as x } from './TextInput-f3mX8BYY.js'
import { P as g } from './PrimaryButton-DXgkgFDl.js'
import './_plugin-vue_export-helper-DlAUqK2U.js'
const P = { class: 'mt-4 flex justify-end' },
    h = {
        __name: 'ConfirmPassword',
        setup(V) {
            const s = m({ password: '' }),
                i = () => {
                    s.post('/confirm-password', { onFinish: () => s.reset() })
                }
            return (v, a) => (
                n(),
                d(_, null, {
                    default: t(() => [
                        e(o(u), { title: 'Confirm Password' }),
                        a[2] ||
                            (a[2] = r(
                                'div',
                                { class: 'mb-4 text-sm text-neutral-400' },
                                ' This is a secure area of the application. Please confirm your password before continuing. ',
                                -1
                            )),
                        r(
                            'form',
                            { onSubmit: p(i, ['prevent']) },
                            [
                                r('div', null, [
                                    e(w, { for: 'password', value: 'Password' }),
                                    e(
                                        b,
                                        {
                                            id: 'password',
                                            type: 'password',
                                            class: 'mt-1 block w-full',
                                            modelValue: o(s).password,
                                            'onUpdate:modelValue':
                                                a[0] || (a[0] = l => (o(s).password = l)),
                                            required: '',
                                            autocomplete: 'current-password',
                                            autofocus: '',
                                        },
                                        null,
                                        8,
                                        ['modelValue']
                                    ),
                                    e(
                                        x,
                                        { class: 'mt-2', message: o(s).errors.password },
                                        null,
                                        8,
                                        ['message']
                                    ),
                                ]),
                                r('div', P, [
                                    e(
                                        g,
                                        {
                                            class: f([
                                                'ms-4',
                                                { 'opacity-25': o(s).processing },
                                            ]),
                                            disabled: o(s).processing,
                                        },
                                        {
                                            default: t(() => [
                                                ...(a[1] || (a[1] = [c(' Confirm ', -1)])),
                                            ]),
                                            _: 1,
                                        },
                                        8,
                                        ['class', 'disabled']
                                    ),
                                ]),
                            ],
                            32
                        ),
                    ]),
                    _: 1,
                })
            )
        },
    }
export { h as default }
