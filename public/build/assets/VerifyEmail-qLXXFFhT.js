import {
    G as m,
    b as n,
    c,
    e as i,
    d as o,
    u as t,
    H as p,
    g as a,
    f as g,
    j as y,
    i as v,
    h as b,
    k as r,
    J as k,
    D as x,
} from './app-BnURHHqH.js'
import { _ } from './GuestLayout-Dt4E637u.js'
import { P as h } from './PrimaryButton-BHr42pIQ.js'
import './_plugin-vue_export-helper-DlAUqK2U.js'
const w = { key: 0, class: 'mb-4 text-sm font-medium text-green-400' },
    V = { class: 'mt-4 flex items-center justify-between' },
    S = {
        __name: 'VerifyEmail',
        props: { status: { type: String } },
        setup(l) {
            const u = l,
                s = m({}),
                d = () => {
                    s.post('/email/verification-notification')
                },
                f = x(() => u.status === 'verification-link-sent')
            return (B, e) => (
                n(),
                c(_, null, {
                    default: i(() => [
                        o(t(p), { title: 'Email Verification' }),
                        e[2] ||
                            (e[2] = a(
                                'div',
                                { class: 'mb-4 text-sm text-neutral-400' },
                                " Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another. ",
                                -1
                            )),
                        f.value
                            ? (n(),
                              g(
                                  'div',
                                  w,
                                  ' A new verification link has been sent to the email address you provided during registration. '
                              ))
                            : y('', !0),
                        a(
                            'form',
                            { onSubmit: v(d, ['prevent']) },
                            [
                                a('div', V, [
                                    o(
                                        h,
                                        {
                                            class: b({ 'opacity-25': t(s).processing }),
                                            disabled: t(s).processing,
                                        },
                                        {
                                            default: i(() => [
                                                ...(e[0] ||
                                                    (e[0] = [
                                                        r(' Resend Verification Email ', -1),
                                                    ])),
                                            ]),
                                            _: 1,
                                        },
                                        8,
                                        ['class', 'disabled']
                                    ),
                                    o(
                                        t(k),
                                        {
                                            href: '/logout',
                                            method: 'post',
                                            as: 'button',
                                            class: 'rounded-md text-sm text-neutral-400 underline hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900',
                                        },
                                        {
                                            default: i(() => [
                                                ...(e[1] || (e[1] = [r('Log Out', -1)])),
                                            ]),
                                            _: 1,
                                        }
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
export { S as default }
