try {
    self['workbox:core:7.3.0'] && _()
} catch (t) {}
const t = (t, ...e) => {
    let s = t
    return (e.length > 0 && (s += ` :: ${JSON.stringify(e)}`), s)
}
class e extends Error {
    constructor(e, s) {
        ;(super(t(e, s)), (this.name = e), (this.details = s))
    }
}
try {
    self['workbox:routing:7.3.0'] && _()
} catch (t) {}
const s = t => (t && 'object' == typeof t ? t : { handle: t })
class n {
    constructor(t, e, n = 'GET') {
        ;((this.handler = s(e)), (this.match = t), (this.method = n))
    }
    setCatchHandler(t) {
        this.catchHandler = s(t)
    }
}
class i extends n {
    constructor(t, e, s) {
        super(
            ({ url: e }) => {
                const s = t.exec(e.href)
                if (s && (e.origin === location.origin || 0 === s.index)) return s.slice(1)
            },
            e,
            s
        )
    }
}
class r {
    constructor() {
        ;((this.t = new Map()), (this.i = new Map()))
    }
    get routes() {
        return this.t
    }
    addFetchListener() {
        self.addEventListener('fetch', t => {
            const { request: e } = t,
                s = this.handleRequest({ request: e, event: t })
            s && t.respondWith(s)
        })
    }
    addCacheListener() {
        self.addEventListener('message', t => {
            if (t.data && 'CACHE_URLS' === t.data.type) {
                const { payload: e } = t.data,
                    s = Promise.all(
                        e.urlsToCache.map(e => {
                            'string' == typeof e && (e = [e])
                            const s = new Request(...e)
                            return this.handleRequest({ request: s, event: t })
                        })
                    )
                ;(t.waitUntil(s),
                    t.ports && t.ports[0] && s.then(() => t.ports[0].postMessage(!0)))
            }
        })
    }
    handleRequest({ request: t, event: e }) {
        const s = new URL(t.url, location.href)
        if (!s.protocol.startsWith('http')) return
        const n = s.origin === location.origin,
            { params: i, route: r } = this.findMatchingRoute({
                event: e,
                request: t,
                sameOrigin: n,
                url: s,
            })
        let a = r && r.handler
        const o = t.method
        if ((!a && this.i.has(o) && (a = this.i.get(o)), !a)) return
        let c
        try {
            c = a.handle({ url: s, request: t, event: e, params: i })
        } catch (t) {
            c = Promise.reject(t)
        }
        const l = r && r.catchHandler
        return (
            c instanceof Promise &&
                (this.o || l) &&
                (c = c.catch(async n => {
                    if (l)
                        try {
                            return await l.handle({ url: s, request: t, event: e, params: i })
                        } catch (t) {
                            t instanceof Error && (n = t)
                        }
                    if (this.o) return this.o.handle({ url: s, request: t, event: e })
                    throw n
                })),
            c
        )
    }
    findMatchingRoute({ url: t, sameOrigin: e, request: s, event: n }) {
        const i = this.t.get(s.method) || []
        for (const r of i) {
            let i
            const a = r.match({ url: t, sameOrigin: e, request: s, event: n })
            if (a)
                return (
                    (i = a),
                    ((Array.isArray(i) && 0 === i.length) ||
                        (a.constructor === Object && 0 === Object.keys(a).length) ||
                        'boolean' == typeof a) &&
                        (i = void 0),
                    { route: r, params: i }
                )
        }
        return {}
    }
    setDefaultHandler(t, e = 'GET') {
        this.i.set(e, s(t))
    }
    setCatchHandler(t) {
        this.o = s(t)
    }
    registerRoute(t) {
        ;(this.t.has(t.method) || this.t.set(t.method, []), this.t.get(t.method).push(t))
    }
    unregisterRoute(t) {
        if (!this.t.has(t.method))
            throw new e('unregister-route-but-not-found-with-method', { method: t.method })
        const s = this.t.get(t.method).indexOf(t)
        if (!(s > -1)) throw new e('unregister-route-route-not-registered')
        this.t.get(t.method).splice(s, 1)
    }
}
let a
const o = () => (a || ((a = new r()), a.addFetchListener(), a.addCacheListener()), a)
function c(t, s, r) {
    let a
    if ('string' == typeof t) {
        const e = new URL(t, location.href)
        a = new n(({ url: t }) => t.href === e.href, s, r)
    } else if (t instanceof RegExp) a = new i(t, s, r)
    else if ('function' == typeof t) a = new n(t, s, r)
    else {
        if (!(t instanceof n))
            throw new e('unsupported-route-type', {
                moduleName: 'workbox-routing',
                funcName: 'registerRoute',
                paramName: 'capture',
            })
        a = t
    }
    return (o().registerRoute(a), a)
}
const l = {
        googleAnalytics: 'googleAnalytics',
        precache: 'precache-v2',
        prefix: 'workbox',
        runtime: 'runtime',
        suffix: 'undefined' != typeof registration ? registration.scope : '',
    },
    u = t => [l.prefix, t, l.suffix].filter(t => t && t.length > 0).join('-'),
    h = t => t || u(l.precache),
    f = t => t || u(l.runtime)
function d(t) {
    t.then(() => {})
}
const w = new Set()
function p() {
    return (
        (p = Object.assign
            ? Object.assign.bind()
            : function (t) {
                  for (var e = 1; e < arguments.length; e++) {
                      var s = arguments[e]
                      for (var n in s) ({}).hasOwnProperty.call(s, n) && (t[n] = s[n])
                  }
                  return t
              }),
        p.apply(null, arguments)
    )
}
let g, y
const m = new WeakMap(),
    v = new WeakMap(),
    b = new WeakMap(),
    R = new WeakMap(),
    j = new WeakMap()
let D = {
    get(t, e, s) {
        if (t instanceof IDBTransaction) {
            if ('done' === e) return v.get(t)
            if ('objectStoreNames' === e) return t.objectStoreNames || b.get(t)
            if ('store' === e)
                return s.objectStoreNames[1] ? void 0 : s.objectStore(s.objectStoreNames[0])
        }
        return U(t[e])
    },
    set: (t, e, s) => ((t[e] = s), !0),
    has: (t, e) => (t instanceof IDBTransaction && ('done' === e || 'store' === e)) || e in t,
}
function C(t) {
    return t !== IDBDatabase.prototype.transaction ||
        'objectStoreNames' in IDBTransaction.prototype
        ? (
              y ||
              (y = [
                  IDBCursor.prototype.advance,
                  IDBCursor.prototype.continue,
                  IDBCursor.prototype.continuePrimaryKey,
              ])
          ).includes(t)
            ? function (...e) {
                  return (t.apply(x(this), e), U(m.get(this)))
              }
            : function (...e) {
                  return U(t.apply(x(this), e))
              }
        : function (e, ...s) {
              const n = t.call(x(this), e, ...s)
              return (b.set(n, e.sort ? e.sort() : [e]), U(n))
          }
}
function q(t) {
    return 'function' == typeof t
        ? C(t)
        : (t instanceof IDBTransaction &&
              (function (t) {
                  if (v.has(t)) return
                  const e = new Promise((e, s) => {
                      const n = () => {
                              ;(t.removeEventListener('complete', i),
                                  t.removeEventListener('error', r),
                                  t.removeEventListener('abort', r))
                          },
                          i = () => {
                              ;(e(), n())
                          },
                          r = () => {
                              ;(s(t.error || new DOMException('AbortError', 'AbortError')),
                                  n())
                          }
                      ;(t.addEventListener('complete', i),
                          t.addEventListener('error', r),
                          t.addEventListener('abort', r))
                  })
                  v.set(t, e)
              })(t),
          (e = t),
          (g || (g = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])).some(
              t => e instanceof t
          )
              ? new Proxy(t, D)
              : t)
    var e
}
function U(t) {
    if (t instanceof IDBRequest)
        return (function (t) {
            const e = new Promise((e, s) => {
                const n = () => {
                        ;(t.removeEventListener('success', i),
                            t.removeEventListener('error', r))
                    },
                    i = () => {
                        ;(e(U(t.result)), n())
                    },
                    r = () => {
                        ;(s(t.error), n())
                    }
                ;(t.addEventListener('success', i), t.addEventListener('error', r))
            })
            return (
                e
                    .then(e => {
                        e instanceof IDBCursor && m.set(e, t)
                    })
                    .catch(() => {}),
                j.set(e, t),
                e
            )
        })(t)
    if (R.has(t)) return R.get(t)
    const e = q(t)
    return (e !== t && (R.set(t, e), j.set(e, t)), e)
}
const x = t => j.get(t)
const E = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
    I = ['put', 'add', 'delete', 'clear'],
    B = new Map()
function L(t, e) {
    if (!(t instanceof IDBDatabase) || e in t || 'string' != typeof e) return
    if (B.get(e)) return B.get(e)
    const s = e.replace(/FromIndex$/, ''),
        n = e !== s,
        i = I.includes(s)
    if (!(s in (n ? IDBIndex : IDBObjectStore).prototype) || (!i && !E.includes(s))) return
    const r = async function (t, ...e) {
        const r = this.transaction(t, i ? 'readwrite' : 'readonly')
        let a = r.store
        return (
            n && (a = a.index(e.shift())),
            (await Promise.all([a[s](...e), i && r.done]))[0]
        )
    }
    return (B.set(e, r), r)
}
D = (t =>
    p({}, t, {
        get: (e, s, n) => L(e, s) || t.get(e, s, n),
        has: (e, s) => !!L(e, s) || t.has(e, s),
    }))(D)
try {
    self['workbox:expiration:7.3.0'] && _()
} catch (t) {}
const S = 'cache-entries',
    T = t => {
        const e = new URL(t, location.href)
        return ((e.hash = ''), e.href)
    }
class N {
    constructor(t) {
        ;((this.l = null), (this.u = t))
    }
    h(t) {
        const e = t.createObjectStore(S, { keyPath: 'id' })
        ;(e.createIndex('cacheName', 'cacheName', { unique: !1 }),
            e.createIndex('timestamp', 'timestamp', { unique: !1 }))
    }
    p(t) {
        ;(this.h(t),
            this.u &&
                (function (t, { blocked: e } = {}) {
                    const s = indexedDB.deleteDatabase(t)
                    ;(e && s.addEventListener('blocked', t => e(t.oldVersion, t)),
                        U(s).then(() => {}))
                })(this.u))
    }
    async setTimestamp(t, e) {
        const s = { url: (t = T(t)), timestamp: e, cacheName: this.u, id: this.m(t) },
            n = (await this.getDb()).transaction(S, 'readwrite', { durability: 'relaxed' })
        ;(await n.store.put(s), await n.done)
    }
    async getTimestamp(t) {
        const e = await this.getDb(),
            s = await e.get(S, this.m(t))
        return null == s ? void 0 : s.timestamp
    }
    async expireEntries(t, e) {
        const s = await this.getDb()
        let n = await s.transaction(S).store.index('timestamp').openCursor(null, 'prev')
        const i = []
        let r = 0
        for (; n; ) {
            const s = n.value
            ;(s.cacheName === this.u &&
                ((t && s.timestamp < t) || (e && r >= e) ? i.push(n.value) : r++),
                (n = await n.continue()))
        }
        const a = []
        for (const t of i) (await s.delete(S, t.id), a.push(t.url))
        return a
    }
    m(t) {
        return this.u + '|' + T(t)
    }
    async getDb() {
        return (
            this.l ||
                (this.l = await (function (
                    t,
                    e,
                    { blocked: s, upgrade: n, blocking: i, terminated: r } = {}
                ) {
                    const a = indexedDB.open(t, e),
                        o = U(a)
                    return (
                        n &&
                            a.addEventListener('upgradeneeded', t => {
                                n(U(a.result), t.oldVersion, t.newVersion, U(a.transaction), t)
                            }),
                        s &&
                            a.addEventListener('blocked', t =>
                                s(t.oldVersion, t.newVersion, t)
                            ),
                        o
                            .then(t => {
                                ;(r && t.addEventListener('close', () => r()),
                                    i &&
                                        t.addEventListener('versionchange', t =>
                                            i(t.oldVersion, t.newVersion, t)
                                        ))
                            })
                            .catch(() => {}),
                        o
                    )
                })('workbox-expiration', 1, { upgrade: this.p.bind(this) })),
            this.l
        )
    }
}
class O {
    constructor(t, e = {}) {
        ;((this.v = !1),
            (this.R = !1),
            (this.j = e.maxEntries),
            (this.D = e.maxAgeSeconds),
            (this.C = e.matchOptions),
            (this.u = t),
            (this.q = new N(t)))
    }
    async expireEntries() {
        if (this.v) return void (this.R = !0)
        this.v = !0
        const t = this.D ? Date.now() - 1e3 * this.D : 0,
            e = await this.q.expireEntries(t, this.j),
            s = await self.caches.open(this.u)
        for (const t of e) await s.delete(t, this.C)
        ;((this.v = !1), this.R && ((this.R = !1), d(this.expireEntries())))
    }
    async updateTimestamp(t) {
        await this.q.setTimestamp(t, Date.now())
    }
    async isURLExpired(t) {
        if (this.D) {
            const e = await this.q.getTimestamp(t),
                s = Date.now() - 1e3 * this.D
            return void 0 === e || e < s
        }
        return !1
    }
    async delete() {
        ;((this.R = !1), await this.q.expireEntries(1 / 0))
    }
}
class P {
    constructor(t = {}) {
        ;((this.cachedResponseWillBeUsed = async ({
            event: t,
            request: e,
            cacheName: s,
            cachedResponse: n,
        }) => {
            if (!n) return null
            const i = this.U(n),
                r = this.I(s)
            d(r.expireEntries())
            const a = r.updateTimestamp(e.url)
            if (t)
                try {
                    t.waitUntil(a)
                } catch (t) {}
            return i ? n : null
        }),
            (this.cacheDidUpdate = async ({ cacheName: t, request: e }) => {
                const s = this.I(t)
                ;(await s.updateTimestamp(e.url), await s.expireEntries())
            }),
            (this.B = t),
            (this.D = t.maxAgeSeconds),
            (this.L = new Map()),
            t.purgeOnQuotaError &&
                (function (t) {
                    w.add(t)
                })(() => this.deleteCacheAndMetadata()))
    }
    I(t) {
        if (t === f()) throw new e('expire-custom-caches-only')
        let s = this.L.get(t)
        return (s || ((s = new O(t, this.B)), this.L.set(t, s)), s)
    }
    U(t) {
        if (!this.D) return !0
        const e = this._(t)
        if (null === e) return !0
        return e >= Date.now() - 1e3 * this.D
    }
    _(t) {
        if (!t.headers.has('date')) return null
        const e = t.headers.get('date'),
            s = new Date(e).getTime()
        return isNaN(s) ? null : s
    }
    async deleteCacheAndMetadata() {
        for (const [t, e] of this.L) (await self.caches.delete(t), await e.delete())
        this.L = new Map()
    }
}
try {
    self['workbox:cacheable-response:7.3.0'] && _()
} catch (t) {}
class A {
    constructor(t = {}) {
        ;((this.S = t.statuses), (this.T = t.headers))
    }
    isResponseCacheable(t) {
        let e = !0
        return (
            this.S && (e = this.S.includes(t.status)),
            this.T && e && (e = Object.keys(this.T).some(e => t.headers.get(e) === this.T[e])),
            e
        )
    }
}
class M {
    constructor(t) {
        ;((this.cacheWillUpdate = async ({ response: t }) =>
            this.N.isResponseCacheable(t) ? t : null),
            (this.N = new A(t)))
    }
}
function k(t, e) {
    const s = new URL(t)
    for (const t of e) s.searchParams.delete(t)
    return s.href
}
class F {
    constructor() {
        this.promise = new Promise((t, e) => {
            ;((this.resolve = t), (this.reject = e))
        })
    }
}
try {
    self['workbox:strategies:7.3.0'] && _()
} catch (t) {}
function W(t) {
    return 'string' == typeof t ? new Request(t) : t
}
class V {
    constructor(t, e) {
        ;((this.O = {}),
            Object.assign(this, e),
            (this.event = e.event),
            (this.P = t),
            (this.A = new F()),
            (this.M = []),
            (this.k = [...t.plugins]),
            (this.F = new Map()))
        for (const t of this.k) this.F.set(t, {})
        this.event.waitUntil(this.A.promise)
    }
    async fetch(t) {
        const { event: s } = this
        let n = W(t)
        if ('navigate' === n.mode && s instanceof FetchEvent && s.preloadResponse) {
            const t = await s.preloadResponse
            if (t) return t
        }
        const i = this.hasCallback('fetchDidFail') ? n.clone() : null
        try {
            for (const t of this.iterateCallbacks('requestWillFetch'))
                n = await t({ request: n.clone(), event: s })
        } catch (t) {
            if (t instanceof Error)
                throw new e('plugin-error-request-will-fetch', {
                    thrownErrorMessage: t.message,
                })
        }
        const r = n.clone()
        try {
            let t
            t = await fetch(n, 'navigate' === n.mode ? void 0 : this.P.fetchOptions)
            for (const e of this.iterateCallbacks('fetchDidSucceed'))
                t = await e({ event: s, request: r, response: t })
            return t
        } catch (t) {
            throw (
                i &&
                    (await this.runCallbacks('fetchDidFail', {
                        error: t,
                        event: s,
                        originalRequest: i.clone(),
                        request: r.clone(),
                    })),
                t
            )
        }
    }
    async fetchAndCachePut(t) {
        const e = await this.fetch(t),
            s = e.clone()
        return (this.waitUntil(this.cachePut(t, s)), e)
    }
    async cacheMatch(t) {
        const e = W(t)
        let s
        const { cacheName: n, matchOptions: i } = this.P,
            r = await this.getCacheKey(e, 'read'),
            a = Object.assign(Object.assign({}, i), { cacheName: n })
        s = await caches.match(r, a)
        for (const t of this.iterateCallbacks('cachedResponseWillBeUsed'))
            s =
                (await t({
                    cacheName: n,
                    matchOptions: i,
                    cachedResponse: s,
                    request: r,
                    event: this.event,
                })) || void 0
        return s
    }
    async cachePut(t, s) {
        const n = W(t)
        var i
        await ((i = 0), new Promise(t => setTimeout(t, i)))
        const r = await this.getCacheKey(n, 'write')
        if (!s)
            throw new e('cache-put-with-no-response', {
                url:
                    ((a = r.url),
                    new URL(String(a), location.href).href.replace(
                        new RegExp(`^${location.origin}`),
                        ''
                    )),
            })
        var a
        const o = await this.W(s)
        if (!o) return !1
        const { cacheName: c, matchOptions: l } = this.P,
            u = await self.caches.open(c),
            h = this.hasCallback('cacheDidUpdate'),
            f = h
                ? await (async function (t, e, s, n) {
                      const i = k(e.url, s)
                      if (e.url === i) return t.match(e, n)
                      const r = Object.assign(Object.assign({}, n), { ignoreSearch: !0 }),
                          a = await t.keys(e, r)
                      for (const e of a) if (i === k(e.url, s)) return t.match(e, n)
                  })(u, r.clone(), ['__WB_REVISION__'], l)
                : null
        try {
            await u.put(r, h ? o.clone() : o)
        } catch (t) {
            if (t instanceof Error)
                throw (
                    'QuotaExceededError' === t.name &&
                        (await (async function () {
                            for (const t of w) await t()
                        })()),
                    t
                )
        }
        for (const t of this.iterateCallbacks('cacheDidUpdate'))
            await t({
                cacheName: c,
                oldResponse: f,
                newResponse: o.clone(),
                request: r,
                event: this.event,
            })
        return !0
    }
    async getCacheKey(t, e) {
        const s = `${t.url} | ${e}`
        if (!this.O[s]) {
            let n = t
            for (const t of this.iterateCallbacks('cacheKeyWillBeUsed'))
                n = W(await t({ mode: e, request: n, event: this.event, params: this.params }))
            this.O[s] = n
        }
        return this.O[s]
    }
    hasCallback(t) {
        for (const e of this.P.plugins) if (t in e) return !0
        return !1
    }
    async runCallbacks(t, e) {
        for (const s of this.iterateCallbacks(t)) await s(e)
    }
    *iterateCallbacks(t) {
        for (const e of this.P.plugins)
            if ('function' == typeof e[t]) {
                const s = this.F.get(e),
                    n = n => {
                        const i = Object.assign(Object.assign({}, n), { state: s })
                        return e[t](i)
                    }
                yield n
            }
    }
    waitUntil(t) {
        return (this.M.push(t), t)
    }
    async doneWaiting() {
        for (; this.M.length; ) {
            const t = this.M.splice(0),
                e = (await Promise.allSettled(t)).find(t => 'rejected' === t.status)
            if (e) throw e.reason
        }
    }
    destroy() {
        this.A.resolve(null)
    }
    async W(t) {
        let e = t,
            s = !1
        for (const t of this.iterateCallbacks('cacheWillUpdate'))
            if (
                ((e =
                    (await t({ request: this.request, response: e, event: this.event })) ||
                    void 0),
                (s = !0),
                !e)
            )
                break
        return (s || (e && 200 !== e.status && (e = void 0)), e)
    }
}
class G {
    constructor(t = {}) {
        ;((this.cacheName = f(t.cacheName)),
            (this.plugins = t.plugins || []),
            (this.fetchOptions = t.fetchOptions),
            (this.matchOptions = t.matchOptions))
    }
    handle(t) {
        const [e] = this.handleAll(t)
        return e
    }
    handleAll(t) {
        t instanceof FetchEvent && (t = { event: t, request: t.request })
        const e = t.event,
            s = 'string' == typeof t.request ? new Request(t.request) : t.request,
            n = 'params' in t ? t.params : void 0,
            i = new V(this, { event: e, request: s, params: n }),
            r = this.V(i, s, e)
        return [r, this.G(r, i, s, e)]
    }
    async V(t, s, n) {
        let i
        await t.runCallbacks('handlerWillStart', { event: n, request: s })
        try {
            if (((i = await this.H(s, t)), !i || 'error' === i.type))
                throw new e('no-response', { url: s.url })
        } catch (e) {
            if (e instanceof Error)
                for (const r of t.iterateCallbacks('handlerDidError'))
                    if (((i = await r({ error: e, event: n, request: s })), i)) break
            if (!i) throw e
        }
        for (const e of t.iterateCallbacks('handlerWillRespond'))
            i = await e({ event: n, request: s, response: i })
        return i
    }
    async G(t, e, s, n) {
        let i, r
        try {
            i = await t
        } catch (r) {}
        try {
            ;(await e.runCallbacks('handlerDidRespond', { event: n, request: s, response: i }),
                await e.doneWaiting())
        } catch (t) {
            t instanceof Error && (r = t)
        }
        if (
            (await e.runCallbacks('handlerDidComplete', {
                event: n,
                request: s,
                response: i,
                error: r,
            }),
            e.destroy(),
            r)
        )
            throw r
    }
}
class H extends G {
    async H(t, s) {
        let n,
            i = await s.cacheMatch(t)
        if (!i)
            try {
                i = await s.fetchAndCachePut(t)
            } catch (t) {
                t instanceof Error && (n = t)
            }
        if (!i) throw new e('no-response', { url: t.url, error: n })
        return i
    }
}
const K = {
    cacheWillUpdate: async ({ response: t }) =>
        200 === t.status || 0 === t.status ? t : null,
}
function $(t, e) {
    const s = e()
    return (t.waitUntil(s), s)
}
try {
    self['workbox:precaching:7.3.0'] && _()
} catch (t) {}
function X(t) {
    if (!t) throw new e('add-to-cache-list-unexpected-type', { entry: t })
    if ('string' == typeof t) {
        const e = new URL(t, location.href)
        return { cacheKey: e.href, url: e.href }
    }
    const { revision: s, url: n } = t
    if (!n) throw new e('add-to-cache-list-unexpected-type', { entry: t })
    if (!s) {
        const t = new URL(n, location.href)
        return { cacheKey: t.href, url: t.href }
    }
    const i = new URL(n, location.href),
        r = new URL(n, location.href)
    return (i.searchParams.set('__WB_REVISION__', s), { cacheKey: i.href, url: r.href })
}
class z {
    constructor() {
        ;((this.updatedURLs = []),
            (this.notUpdatedURLs = []),
            (this.handlerWillStart = async ({ request: t, state: e }) => {
                e && (e.originalRequest = t)
            }),
            (this.cachedResponseWillBeUsed = async ({
                event: t,
                state: e,
                cachedResponse: s,
            }) => {
                if (
                    'install' === t.type &&
                    e &&
                    e.originalRequest &&
                    e.originalRequest instanceof Request
                ) {
                    const t = e.originalRequest.url
                    s ? this.notUpdatedURLs.push(t) : this.updatedURLs.push(t)
                }
                return s
            }))
    }
}
class J {
    constructor({ precacheController: t }) {
        ;((this.cacheKeyWillBeUsed = async ({ request: t, params: e }) => {
            const s = (null == e ? void 0 : e.cacheKey) || this.K.getCacheKeyForURL(t.url)
            return s ? new Request(s, { headers: t.headers }) : t
        }),
            (this.K = t))
    }
}
let Q, Y
async function Z(t, s) {
    let n = null
    if (t.url) {
        n = new URL(t.url).origin
    }
    if (n !== self.location.origin) throw new e('cross-origin-copy-response', { origin: n })
    const i = t.clone(),
        r = { headers: new Headers(i.headers), status: i.status, statusText: i.statusText },
        a = s ? s(r) : r,
        o = (function () {
            if (void 0 === Q) {
                const t = new Response('')
                if ('body' in t)
                    try {
                        ;(new Response(t.body), (Q = !0))
                    } catch (t) {
                        Q = !1
                    }
                Q = !1
            }
            return Q
        })()
            ? i.body
            : await i.blob()
    return new Response(o, a)
}
class tt extends G {
    constructor(t = {}) {
        ;((t.cacheName = h(t.cacheName)),
            super(t),
            (this.$ = !1 !== t.fallbackToNetwork),
            this.plugins.push(tt.copyRedirectedCacheableResponsesPlugin))
    }
    async H(t, e) {
        const s = await e.cacheMatch(t)
        return (
            s ||
            (e.event && 'install' === e.event.type ? await this.X(t, e) : await this.J(t, e))
        )
    }
    async J(t, s) {
        let n
        const i = s.params || {}
        if (!this.$)
            throw new e('missing-precache-entry', { cacheName: this.cacheName, url: t.url })
        {
            const e = i.integrity,
                r = t.integrity,
                a = !r || r === e
            ;((n = await s.fetch(
                new Request(t, { integrity: 'no-cors' !== t.mode ? r || e : void 0 })
            )),
                e && a && 'no-cors' !== t.mode && (this.Y(), await s.cachePut(t, n.clone())))
        }
        return n
    }
    async X(t, s) {
        this.Y()
        const n = await s.fetch(t)
        if (!(await s.cachePut(t, n.clone())))
            throw new e('bad-precaching-response', { url: t.url, status: n.status })
        return n
    }
    Y() {
        let t = null,
            e = 0
        for (const [s, n] of this.plugins.entries())
            n !== tt.copyRedirectedCacheableResponsesPlugin &&
                (n === tt.defaultPrecacheCacheabilityPlugin && (t = s),
                n.cacheWillUpdate && e++)
        0 === e
            ? this.plugins.push(tt.defaultPrecacheCacheabilityPlugin)
            : e > 1 && null !== t && this.plugins.splice(t, 1)
    }
}
;((tt.defaultPrecacheCacheabilityPlugin = {
    cacheWillUpdate: async ({ response: t }) => (!t || t.status >= 400 ? null : t),
}),
    (tt.copyRedirectedCacheableResponsesPlugin = {
        cacheWillUpdate: async ({ response: t }) => (t.redirected ? await Z(t) : t),
    }))
class et {
    constructor({ cacheName: t, plugins: e = [], fallbackToNetwork: s = !0 } = {}) {
        ;((this.Z = new Map()),
            (this.tt = new Map()),
            (this.et = new Map()),
            (this.P = new tt({
                cacheName: h(t),
                plugins: [...e, new J({ precacheController: this })],
                fallbackToNetwork: s,
            })),
            (this.install = this.install.bind(this)),
            (this.activate = this.activate.bind(this)))
    }
    get strategy() {
        return this.P
    }
    precache(t) {
        ;(this.addToCacheList(t),
            this.st ||
                (self.addEventListener('install', this.install),
                self.addEventListener('activate', this.activate),
                (this.st = !0)))
    }
    addToCacheList(t) {
        const s = []
        for (const n of t) {
            'string' == typeof n ? s.push(n) : n && void 0 === n.revision && s.push(n.url)
            const { cacheKey: t, url: i } = X(n),
                r = 'string' != typeof n && n.revision ? 'reload' : 'default'
            if (this.Z.has(i) && this.Z.get(i) !== t)
                throw new e('add-to-cache-list-conflicting-entries', {
                    firstEntry: this.Z.get(i),
                    secondEntry: t,
                })
            if ('string' != typeof n && n.integrity) {
                if (this.et.has(t) && this.et.get(t) !== n.integrity)
                    throw new e('add-to-cache-list-conflicting-integrities', { url: i })
                this.et.set(t, n.integrity)
            }
            if ((this.Z.set(i, t), this.tt.set(i, r), s.length > 0)) {
                const t = `Workbox is precaching URLs without revision info: ${s.join(', ')}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`
                console.warn(t)
            }
        }
    }
    install(t) {
        return $(t, async () => {
            const e = new z()
            this.strategy.plugins.push(e)
            for (const [e, s] of this.Z) {
                const n = this.et.get(s),
                    i = this.tt.get(e),
                    r = new Request(e, { integrity: n, cache: i, credentials: 'same-origin' })
                await Promise.all(
                    this.strategy.handleAll({ params: { cacheKey: s }, request: r, event: t })
                )
            }
            const { updatedURLs: s, notUpdatedURLs: n } = e
            return { updatedURLs: s, notUpdatedURLs: n }
        })
    }
    activate(t) {
        return $(t, async () => {
            const t = await self.caches.open(this.strategy.cacheName),
                e = await t.keys(),
                s = new Set(this.Z.values()),
                n = []
            for (const i of e) s.has(i.url) || (await t.delete(i), n.push(i.url))
            return { deletedURLs: n }
        })
    }
    getURLsToCacheKeys() {
        return this.Z
    }
    getCachedURLs() {
        return [...this.Z.keys()]
    }
    getCacheKeyForURL(t) {
        const e = new URL(t, location.href)
        return this.Z.get(e.href)
    }
    getIntegrityForCacheKey(t) {
        return this.et.get(t)
    }
    async matchPrecache(t) {
        const e = t instanceof Request ? t.url : t,
            s = this.getCacheKeyForURL(e)
        if (s) {
            return (await self.caches.open(this.strategy.cacheName)).match(s)
        }
    }
    createHandlerBoundToURL(t) {
        const s = this.getCacheKeyForURL(t)
        if (!s) throw new e('non-precached-url', { url: t })
        return e => (
            (e.request = new Request(t)),
            (e.params = Object.assign({ cacheKey: s }, e.params)),
            this.strategy.handle(e)
        )
    }
}
const st = () => (Y || (Y = new et()), Y)
class nt extends n {
    constructor(t, e) {
        super(({ request: s }) => {
            const n = t.getURLsToCacheKeys()
            for (const i of (function* (
                t,
                {
                    ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/],
                    directoryIndex: s = 'index.html',
                    cleanURLs: n = !0,
                    urlManipulation: i,
                } = {}
            ) {
                const r = new URL(t, location.href)
                ;((r.hash = ''), yield r.href)
                const a = (function (t, e = []) {
                    for (const s of [...t.searchParams.keys()])
                        e.some(t => t.test(s)) && t.searchParams.delete(s)
                    return t
                })(r, e)
                if ((yield a.href, s && a.pathname.endsWith('/'))) {
                    const t = new URL(a.href)
                    ;((t.pathname += s), yield t.href)
                }
                if (n) {
                    const t = new URL(a.href)
                    ;((t.pathname += '.html'), yield t.href)
                }
                if (i) {
                    const t = i({ url: r })
                    for (const e of t) yield e.href
                }
            })(s.url, e)) {
                const e = n.get(i)
                if (e) {
                    return { cacheKey: e, integrity: t.getIntegrityForCacheKey(e) }
                }
            }
        }, t.strategy)
    }
}
var it
;(importScripts('/sw-reading-state.js', '/sw-share-target.js', '/sw-navigation.js'),
    self.skipWaiting(),
    self.addEventListener('activate', () => self.clients.claim()),
    (it = {}),
    (function (t) {
        st().precache(t)
    })([
        { url: '/build/assets/useToast-B2RcqhN9.js', revision: null },
        { url: '/build/assets/useSidebarStore-BCMn638G.js', revision: null },
        { url: '/build/assets/useDarkMode-CRp9DEOA.js', revision: null },
        { url: '/build/assets/useArticleStore-CCZ6SYej.js', revision: null },
        { url: '/build/assets/useAddFeedModal-O49CpxzI.js', revision: null },
        { url: '/build/assets/purify.es-J9PU_gBl.js', revision: null },
        { url: '/build/assets/app-CPRrY4Og.css', revision: null },
        { url: '/build/assets/app-BnURHHqH.js', revision: null },
        { url: '/build/assets/_plugin-vue_export-helper-DlAUqK2U.js', revision: null },
        { url: '/build/assets/Welcome-C1TdhSX6.js', revision: null },
        { url: '/build/assets/VerifyEmail-qLXXFFhT.js', revision: null },
        { url: '/build/assets/UpdateProfileInformationForm-Bt3m3T1D.js', revision: null },
        { url: '/build/assets/UpdatePasswordForm-wjdlC9ed.js', revision: null },
        { url: '/build/assets/TextInput-BgW1HVTh.js', revision: null },
        { url: '/build/assets/SettingsView-s_XSqrHX.js', revision: null },
        { url: '/build/assets/SettingsView-B4uaY3NX.css', revision: null },
        { url: '/build/assets/SearchView-CrCCjwGh.css', revision: null },
        { url: '/build/assets/SearchView-BR-3AQ9o.js', revision: null },
        { url: '/build/assets/ResetPassword-BOIjfcmr.js', revision: null },
        { url: '/build/assets/Register-CJalsnfn.js', revision: null },
        { url: '/build/assets/PrimaryButton-BHr42pIQ.js', revision: null },
        { url: '/build/assets/OpmlImportView-sZz8cGnn.js', revision: null },
        { url: '/build/assets/OpmlImportView-CipUPWGJ.css', revision: null },
        { url: '/build/assets/Login-UwUSogls.js', revision: null },
        { url: '/build/assets/HighlightsView-CLICb-f0.css', revision: null },
        { url: '/build/assets/HighlightsView-BwMIzbpj.js', revision: null },
        { url: '/build/assets/GuestLayout-Dt4E637u.js', revision: null },
        { url: '/build/assets/ForgotPassword-CF8G8CwD.js', revision: null },
        { url: '/build/assets/FeedManageView-DbFGujvW.css', revision: null },
        { url: '/build/assets/FeedManageView-CrlWoM5P.js', revision: null },
        { url: '/build/assets/FeedEditView-DDvzGlvr.js', revision: null },
        { url: '/build/assets/FeedCreateView-gWCLk5d-.css', revision: null },
        { url: '/build/assets/FeedCreateView-BZbgKwe4.js', revision: null },
        { url: '/build/assets/Edit-BjGhaU5H.js', revision: null },
        { url: '/build/assets/DeleteUserForm-CFB6IL7x.js', revision: null },
        { url: '/build/assets/ConfirmPassword-CGgTO3g_.js', revision: null },
        { url: '/build/assets/ArticleListView-cfYBsrC-.js', revision: null },
        { url: '/build/assets/ArticleListView-CQnLtuEa.css', revision: null },
        { url: '/build/assets/ArticleDetailView-DVAIGIXv.css', revision: null },
        { url: '/build/assets/ArticleDetailView-C5dpCpCE.js', revision: null },
        { url: '/build/assets/AppShell-DviSCAiy.js', revision: null },
        { url: '/build/assets/AppShell-Dr8pOMpS.css', revision: null },
        { url: 'manifest.webmanifest', revision: 'f8a1f2577700595006912f577c4a169f' },
    ]),
    (function (t) {
        const e = st()
        c(new nt(e, t))
    })(it),
    self.addEventListener('activate', t => {
        const e = h()
        t.waitUntil(
            (async (t, e = '-precache-') => {
                const s = (await self.caches.keys()).filter(
                    s => s.includes(e) && s.includes(self.registration.scope) && s !== t
                )
                return (await Promise.all(s.map(t => self.caches.delete(t))), s)
            })(e).then(t => {})
        )
    }),
    c(
        /^https?:\/\/fonts\.(bunny\.net|googleapis\.com)\/.*/i,
        new H({
            cacheName: 'google-fonts-cache',
            plugins: [
                new P({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
                new M({ statuses: [0, 200] }),
            ],
        }),
        'GET'
    ),
    c(
        ({ url: t }) =>
            /\/api\//.test(t.pathname) && !/^\/api\/articles(\/\d+)?$/.test(t.pathname),
        new (class extends G {
            constructor(t = {}) {
                ;(super(t),
                    this.plugins.some(t => 'cacheWillUpdate' in t) || this.plugins.unshift(K),
                    (this.nt = t.networkTimeoutSeconds || 0))
            }
            async H(t, s) {
                const n = [],
                    i = []
                let r
                if (this.nt) {
                    const { id: e, promise: a } = this.it({ request: t, logs: n, handler: s })
                    ;((r = e), i.push(a))
                }
                const a = this.rt({ timeoutId: r, request: t, logs: n, handler: s })
                i.push(a)
                const o = await s.waitUntil(
                    (async () => (await s.waitUntil(Promise.race(i))) || (await a))()
                )
                if (!o) throw new e('no-response', { url: t.url })
                return o
            }
            it({ request: t, logs: e, handler: s }) {
                let n
                return {
                    promise: new Promise(e => {
                        n = setTimeout(async () => {
                            e(await s.cacheMatch(t))
                        }, 1e3 * this.nt)
                    }),
                    id: n,
                }
            }
            async rt({ timeoutId: t, request: e, logs: s, handler: n }) {
                let i, r
                try {
                    r = await n.fetchAndCachePut(e)
                } catch (t) {
                    t instanceof Error && (i = t)
                }
                return (t && clearTimeout(t), (!i && r) || (r = await n.cacheMatch(e)), r)
            }
        })({
            cacheName: 'api-cache',
            networkTimeoutSeconds: 5,
            plugins: [
                new P({ maxEntries: 50, maxAgeSeconds: 86400 }),
                new M({ statuses: [0, 200] }),
            ],
        }),
        'GET'
    ),
    c(
        /\.(?:jpg|jpeg|gif|png|webp|avif|svg)$/i,
        new H({
            cacheName: 'article-images-cache',
            plugins: [
                new P({ maxEntries: 200, maxAgeSeconds: 2592e3 }),
                new M({ statuses: [200] }),
            ],
        }),
        'GET'
    ),
    c(
        /^https?:\/\/.*\.(?:jpg|jpeg|gif|png|webp|avif|svg)(?:\?.*)?$/i,
        new H({
            cacheName: 'external-images-cache',
            plugins: [
                new P({ maxEntries: 300, maxAgeSeconds: 1209600 }),
                new M({ statuses: [200] }),
            ],
        }),
        'GET'
    ),
    c(
        /favicon/i,
        new H({
            cacheName: 'favicon-cache',
            plugins: [
                new P({ maxEntries: 100, maxAgeSeconds: 2592e3 }),
                new M({ statuses: [200] }),
            ],
        }),
        'GET'
    ))
