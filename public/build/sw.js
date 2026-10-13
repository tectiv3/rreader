try {
    self['workbox:core:7.3.0'] && _()
} catch (e) {}
const e = (e, ...t) => {
    let s = e
    return (t.length > 0 && (s += ` :: ${JSON.stringify(t)}`), s)
}
class t extends Error {
    constructor(t, s) {
        ;(super(e(t, s)), (this.name = t), (this.details = s))
    }
}
try {
    self['workbox:routing:7.3.0'] && _()
} catch (e) {}
const s = e => (e && 'object' == typeof e ? e : { handle: e })
class i {
    constructor(e, t, i = 'GET') {
        ;((this.handler = s(t)), (this.match = e), (this.method = i))
    }
    setCatchHandler(e) {
        this.catchHandler = s(e)
    }
}
class n extends i {
    constructor(e, t, s) {
        super(
            ({ url: t }) => {
                const s = e.exec(t.href)
                if (s && (t.origin === location.origin || 0 === s.index)) return s.slice(1)
            },
            t,
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
        self.addEventListener('fetch', e => {
            const { request: t } = e,
                s = this.handleRequest({ request: t, event: e })
            s && e.respondWith(s)
        })
    }
    addCacheListener() {
        self.addEventListener('message', e => {
            if (e.data && 'CACHE_URLS' === e.data.type) {
                const { payload: t } = e.data,
                    s = Promise.all(
                        t.urlsToCache.map(t => {
                            'string' == typeof t && (t = [t])
                            const s = new Request(...t)
                            return this.handleRequest({ request: s, event: e })
                        })
                    )
                ;(e.waitUntil(s),
                    e.ports && e.ports[0] && s.then(() => e.ports[0].postMessage(!0)))
            }
        })
    }
    handleRequest({ request: e, event: t }) {
        const s = new URL(e.url, location.href)
        if (!s.protocol.startsWith('http')) return
        const i = s.origin === location.origin,
            { params: n, route: r } = this.findMatchingRoute({
                event: t,
                request: e,
                sameOrigin: i,
                url: s,
            })
        let a = r && r.handler
        const o = e.method
        if ((!a && this.i.has(o) && (a = this.i.get(o)), !a)) return
        let c
        try {
            c = a.handle({ url: s, request: e, event: t, params: n })
        } catch (e) {
            c = Promise.reject(e)
        }
        const l = r && r.catchHandler
        return (
            c instanceof Promise &&
                (this.o || l) &&
                (c = c.catch(async i => {
                    if (l)
                        try {
                            return await l.handle({ url: s, request: e, event: t, params: n })
                        } catch (e) {
                            e instanceof Error && (i = e)
                        }
                    if (this.o) return this.o.handle({ url: s, request: e, event: t })
                    throw i
                })),
            c
        )
    }
    findMatchingRoute({ url: e, sameOrigin: t, request: s, event: i }) {
        const n = this.t.get(s.method) || []
        for (const r of n) {
            let n
            const a = r.match({ url: e, sameOrigin: t, request: s, event: i })
            if (a)
                return (
                    (n = a),
                    ((Array.isArray(n) && 0 === n.length) ||
                        (a.constructor === Object && 0 === Object.keys(a).length) ||
                        'boolean' == typeof a) &&
                        (n = void 0),
                    { route: r, params: n }
                )
        }
        return {}
    }
    setDefaultHandler(e, t = 'GET') {
        this.i.set(t, s(e))
    }
    setCatchHandler(e) {
        this.o = s(e)
    }
    registerRoute(e) {
        ;(this.t.has(e.method) || this.t.set(e.method, []), this.t.get(e.method).push(e))
    }
    unregisterRoute(e) {
        if (!this.t.has(e.method))
            throw new t('unregister-route-but-not-found-with-method', { method: e.method })
        const s = this.t.get(e.method).indexOf(e)
        if (!(s > -1)) throw new t('unregister-route-route-not-registered')
        this.t.get(e.method).splice(s, 1)
    }
}
let a
const o = () => (a || ((a = new r()), a.addFetchListener(), a.addCacheListener()), a)
function c(e, s, r) {
    let a
    if ('string' == typeof e) {
        const t = new URL(e, location.href)
        a = new i(({ url: e }) => e.href === t.href, s, r)
    } else if (e instanceof RegExp) a = new n(e, s, r)
    else if ('function' == typeof e) a = new i(e, s, r)
    else {
        if (!(e instanceof i))
            throw new t('unsupported-route-type', {
                moduleName: 'workbox-routing',
                funcName: 'registerRoute',
                paramName: 'capture',
            })
        a = e
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
    u = e => [l.prefix, e, l.suffix].filter(e => e && e.length > 0).join('-'),
    h = e => e || u(l.precache),
    f = e => e || u(l.runtime)
function d(e) {
    e.then(() => {})
}
const w = new Set()
function p() {
    return (
        (p = Object.assign
            ? Object.assign.bind()
            : function (e) {
                  for (var t = 1; t < arguments.length; t++) {
                      var s = arguments[t]
                      for (var i in s) ({}).hasOwnProperty.call(s, i) && (e[i] = s[i])
                  }
                  return e
              }),
        p.apply(null, arguments)
    )
}
let m, g
const y = new WeakMap(),
    v = new WeakMap(),
    b = new WeakMap(),
    R = new WeakMap(),
    j = new WeakMap()
let D = {
    get(e, t, s) {
        if (e instanceof IDBTransaction) {
            if ('done' === t) return v.get(e)
            if ('objectStoreNames' === t) return e.objectStoreNames || b.get(e)
            if ('store' === t)
                return s.objectStoreNames[1] ? void 0 : s.objectStore(s.objectStoreNames[0])
        }
        return x(e[t])
    },
    set: (e, t, s) => ((e[t] = s), !0),
    has: (e, t) => (e instanceof IDBTransaction && ('done' === t || 'store' === t)) || t in e,
}
function C(e) {
    return e !== IDBDatabase.prototype.transaction ||
        'objectStoreNames' in IDBTransaction.prototype
        ? (
              g ||
              (g = [
                  IDBCursor.prototype.advance,
                  IDBCursor.prototype.continue,
                  IDBCursor.prototype.continuePrimaryKey,
              ])
          ).includes(e)
            ? function (...t) {
                  return (e.apply(U(this), t), x(y.get(this)))
              }
            : function (...t) {
                  return x(e.apply(U(this), t))
              }
        : function (t, ...s) {
              const i = e.call(U(this), t, ...s)
              return (b.set(i, t.sort ? t.sort() : [t]), x(i))
          }
}
function q(e) {
    return 'function' == typeof e
        ? C(e)
        : (e instanceof IDBTransaction &&
              (function (e) {
                  if (v.has(e)) return
                  const t = new Promise((t, s) => {
                      const i = () => {
                              ;(e.removeEventListener('complete', n),
                                  e.removeEventListener('error', r),
                                  e.removeEventListener('abort', r))
                          },
                          n = () => {
                              ;(t(), i())
                          },
                          r = () => {
                              ;(s(e.error || new DOMException('AbortError', 'AbortError')),
                                  i())
                          }
                      ;(e.addEventListener('complete', n),
                          e.addEventListener('error', r),
                          e.addEventListener('abort', r))
                  })
                  v.set(e, t)
              })(e),
          (t = e),
          (m || (m = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])).some(
              e => t instanceof e
          )
              ? new Proxy(e, D)
              : e)
    var t
}
function x(e) {
    if (e instanceof IDBRequest)
        return (function (e) {
            const t = new Promise((t, s) => {
                const i = () => {
                        ;(e.removeEventListener('success', n),
                            e.removeEventListener('error', r))
                    },
                    n = () => {
                        ;(t(x(e.result)), i())
                    },
                    r = () => {
                        ;(s(e.error), i())
                    }
                ;(e.addEventListener('success', n), e.addEventListener('error', r))
            })
            return (
                t
                    .then(t => {
                        t instanceof IDBCursor && y.set(t, e)
                    })
                    .catch(() => {}),
                j.set(t, e),
                t
            )
        })(e)
    if (R.has(e)) return R.get(e)
    const t = q(e)
    return (t !== e && (R.set(e, t), j.set(t, e)), t)
}
const U = e => j.get(e)
const E = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
    B = ['put', 'add', 'delete', 'clear'],
    I = new Map()
function L(e, t) {
    if (!(e instanceof IDBDatabase) || t in e || 'string' != typeof t) return
    if (I.get(t)) return I.get(t)
    const s = t.replace(/FromIndex$/, ''),
        i = t !== s,
        n = B.includes(s)
    if (!(s in (i ? IDBIndex : IDBObjectStore).prototype) || (!n && !E.includes(s))) return
    const r = async function (e, ...t) {
        const r = this.transaction(e, n ? 'readwrite' : 'readonly')
        let a = r.store
        return (
            i && (a = a.index(t.shift())),
            (await Promise.all([a[s](...t), n && r.done]))[0]
        )
    }
    return (I.set(t, r), r)
}
D = (e =>
    p({}, e, {
        get: (t, s, i) => L(t, s) || e.get(t, s, i),
        has: (t, s) => !!L(t, s) || e.has(t, s),
    }))(D)
try {
    self['workbox:expiration:7.3.0'] && _()
} catch (e) {}
const S = 'cache-entries',
    N = e => {
        const t = new URL(e, location.href)
        return ((t.hash = ''), t.href)
    }
class O {
    constructor(e) {
        ;((this.l = null), (this.u = e))
    }
    h(e) {
        const t = e.createObjectStore(S, { keyPath: 'id' })
        ;(t.createIndex('cacheName', 'cacheName', { unique: !1 }),
            t.createIndex('timestamp', 'timestamp', { unique: !1 }))
    }
    p(e) {
        ;(this.h(e),
            this.u &&
                (function (e, { blocked: t } = {}) {
                    const s = indexedDB.deleteDatabase(e)
                    ;(t && s.addEventListener('blocked', e => t(e.oldVersion, e)),
                        x(s).then(() => {}))
                })(this.u))
    }
    async setTimestamp(e, t) {
        const s = { url: (e = N(e)), timestamp: t, cacheName: this.u, id: this.m(e) },
            i = (await this.getDb()).transaction(S, 'readwrite', { durability: 'relaxed' })
        ;(await i.store.put(s), await i.done)
    }
    async getTimestamp(e) {
        const t = await this.getDb(),
            s = await t.get(S, this.m(e))
        return null == s ? void 0 : s.timestamp
    }
    async expireEntries(e, t) {
        const s = await this.getDb()
        let i = await s.transaction(S).store.index('timestamp').openCursor(null, 'prev')
        const n = []
        let r = 0
        for (; i; ) {
            const s = i.value
            ;(s.cacheName === this.u &&
                ((e && s.timestamp < e) || (t && r >= t) ? n.push(i.value) : r++),
                (i = await i.continue()))
        }
        const a = []
        for (const e of n) (await s.delete(S, e.id), a.push(e.url))
        return a
    }
    m(e) {
        return this.u + '|' + N(e)
    }
    async getDb() {
        return (
            this.l ||
                (this.l = await (function (
                    e,
                    t,
                    { blocked: s, upgrade: i, blocking: n, terminated: r } = {}
                ) {
                    const a = indexedDB.open(e, t),
                        o = x(a)
                    return (
                        i &&
                            a.addEventListener('upgradeneeded', e => {
                                i(x(a.result), e.oldVersion, e.newVersion, x(a.transaction), e)
                            }),
                        s &&
                            a.addEventListener('blocked', e =>
                                s(e.oldVersion, e.newVersion, e)
                            ),
                        o
                            .then(e => {
                                ;(r && e.addEventListener('close', () => r()),
                                    n &&
                                        e.addEventListener('versionchange', e =>
                                            n(e.oldVersion, e.newVersion, e)
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
class P {
    constructor(e, t = {}) {
        ;((this.v = !1),
            (this.R = !1),
            (this.j = t.maxEntries),
            (this.D = t.maxAgeSeconds),
            (this.C = t.matchOptions),
            (this.u = e),
            (this.q = new O(e)))
    }
    async expireEntries() {
        if (this.v) return void (this.R = !0)
        this.v = !0
        const e = this.D ? Date.now() - 1e3 * this.D : 0,
            t = await this.q.expireEntries(e, this.j),
            s = await self.caches.open(this.u)
        for (const e of t) await s.delete(e, this.C)
        ;((this.v = !1), this.R && ((this.R = !1), d(this.expireEntries())))
    }
    async updateTimestamp(e) {
        await this.q.setTimestamp(e, Date.now())
    }
    async isURLExpired(e) {
        if (this.D) {
            const t = await this.q.getTimestamp(e),
                s = Date.now() - 1e3 * this.D
            return void 0 === t || t < s
        }
        return !1
    }
    async delete() {
        ;((this.R = !1), await this.q.expireEntries(1 / 0))
    }
}
class T {
    constructor(e = {}) {
        ;((this.cachedResponseWillBeUsed = async ({
            event: e,
            request: t,
            cacheName: s,
            cachedResponse: i,
        }) => {
            if (!i) return null
            const n = this.U(i),
                r = this.B(s)
            d(r.expireEntries())
            const a = r.updateTimestamp(t.url)
            if (e)
                try {
                    e.waitUntil(a)
                } catch (e) {}
            return n ? i : null
        }),
            (this.cacheDidUpdate = async ({ cacheName: e, request: t }) => {
                const s = this.B(e)
                ;(await s.updateTimestamp(t.url), await s.expireEntries())
            }),
            (this.I = e),
            (this.D = e.maxAgeSeconds),
            (this.L = new Map()),
            e.purgeOnQuotaError &&
                (function (e) {
                    w.add(e)
                })(() => this.deleteCacheAndMetadata()))
    }
    B(e) {
        if (e === f()) throw new t('expire-custom-caches-only')
        let s = this.L.get(e)
        return (s || ((s = new P(e, this.I)), this.L.set(e, s)), s)
    }
    U(e) {
        if (!this.D) return !0
        const t = this.S(e)
        if (null === t) return !0
        return t >= Date.now() - 1e3 * this.D
    }
    S(e) {
        if (!e.headers.has('date')) return null
        const t = e.headers.get('date'),
            s = new Date(t).getTime()
        return isNaN(s) ? null : s
    }
    async deleteCacheAndMetadata() {
        for (const [e, t] of this.L) (await self.caches.delete(e), await t.delete())
        this.L = new Map()
    }
}
try {
    self['workbox:cacheable-response:7.3.0'] && _()
} catch (e) {}
class k {
    constructor(e = {}) {
        ;((this._ = e.statuses), (this.N = e.headers))
    }
    isResponseCacheable(e) {
        let t = !0
        return (
            this._ && (t = this._.includes(e.status)),
            this.N && t && (t = Object.keys(this.N).some(t => e.headers.get(t) === this.N[t])),
            t
        )
    }
}
class A {
    constructor(e) {
        ;((this.cacheWillUpdate = async ({ response: e }) =>
            this.O.isResponseCacheable(e) ? e : null),
            (this.O = new k(e)))
    }
}
function F(e, t) {
    const s = new URL(e)
    for (const e of t) s.searchParams.delete(e)
    return s.href
}
class M {
    constructor() {
        this.promise = new Promise((e, t) => {
            ;((this.resolve = e), (this.reject = t))
        })
    }
}
try {
    self['workbox:strategies:7.3.0'] && _()
} catch (e) {}
function W(e) {
    return 'string' == typeof e ? new Request(e) : e
}
class K {
    constructor(e, t) {
        ;((this.P = {}),
            Object.assign(this, t),
            (this.event = t.event),
            (this.T = e),
            (this.k = new M()),
            (this.A = []),
            (this.F = [...e.plugins]),
            (this.M = new Map()))
        for (const e of this.F) this.M.set(e, {})
        this.event.waitUntil(this.k.promise)
    }
    async fetch(e) {
        const { event: s } = this
        let i = W(e)
        if ('navigate' === i.mode && s instanceof FetchEvent && s.preloadResponse) {
            const e = await s.preloadResponse
            if (e) return e
        }
        const n = this.hasCallback('fetchDidFail') ? i.clone() : null
        try {
            for (const e of this.iterateCallbacks('requestWillFetch'))
                i = await e({ request: i.clone(), event: s })
        } catch (e) {
            if (e instanceof Error)
                throw new t('plugin-error-request-will-fetch', {
                    thrownErrorMessage: e.message,
                })
        }
        const r = i.clone()
        try {
            let e
            e = await fetch(i, 'navigate' === i.mode ? void 0 : this.T.fetchOptions)
            for (const t of this.iterateCallbacks('fetchDidSucceed'))
                e = await t({ event: s, request: r, response: e })
            return e
        } catch (e) {
            throw (
                n &&
                    (await this.runCallbacks('fetchDidFail', {
                        error: e,
                        event: s,
                        originalRequest: n.clone(),
                        request: r.clone(),
                    })),
                e
            )
        }
    }
    async fetchAndCachePut(e) {
        const t = await this.fetch(e),
            s = t.clone()
        return (this.waitUntil(this.cachePut(e, s)), t)
    }
    async cacheMatch(e) {
        const t = W(e)
        let s
        const { cacheName: i, matchOptions: n } = this.T,
            r = await this.getCacheKey(t, 'read'),
            a = Object.assign(Object.assign({}, n), { cacheName: i })
        s = await caches.match(r, a)
        for (const e of this.iterateCallbacks('cachedResponseWillBeUsed'))
            s =
                (await e({
                    cacheName: i,
                    matchOptions: n,
                    cachedResponse: s,
                    request: r,
                    event: this.event,
                })) || void 0
        return s
    }
    async cachePut(e, s) {
        const i = W(e)
        var n
        await ((n = 0), new Promise(e => setTimeout(e, n)))
        const r = await this.getCacheKey(i, 'write')
        if (!s)
            throw new t('cache-put-with-no-response', {
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
        const { cacheName: c, matchOptions: l } = this.T,
            u = await self.caches.open(c),
            h = this.hasCallback('cacheDidUpdate'),
            f = h
                ? await (async function (e, t, s, i) {
                      const n = F(t.url, s)
                      if (t.url === n) return e.match(t, i)
                      const r = Object.assign(Object.assign({}, i), { ignoreSearch: !0 }),
                          a = await e.keys(t, r)
                      for (const t of a) if (n === F(t.url, s)) return e.match(t, i)
                  })(u, r.clone(), ['__WB_REVISION__'], l)
                : null
        try {
            await u.put(r, h ? o.clone() : o)
        } catch (e) {
            if (e instanceof Error)
                throw (
                    'QuotaExceededError' === e.name &&
                        (await (async function () {
                            for (const e of w) await e()
                        })()),
                    e
                )
        }
        for (const e of this.iterateCallbacks('cacheDidUpdate'))
            await e({
                cacheName: c,
                oldResponse: f,
                newResponse: o.clone(),
                request: r,
                event: this.event,
            })
        return !0
    }
    async getCacheKey(e, t) {
        const s = `${e.url} | ${t}`
        if (!this.P[s]) {
            let i = e
            for (const e of this.iterateCallbacks('cacheKeyWillBeUsed'))
                i = W(await e({ mode: t, request: i, event: this.event, params: this.params }))
            this.P[s] = i
        }
        return this.P[s]
    }
    hasCallback(e) {
        for (const t of this.T.plugins) if (e in t) return !0
        return !1
    }
    async runCallbacks(e, t) {
        for (const s of this.iterateCallbacks(e)) await s(t)
    }
    *iterateCallbacks(e) {
        for (const t of this.T.plugins)
            if ('function' == typeof t[e]) {
                const s = this.M.get(t),
                    i = i => {
                        const n = Object.assign(Object.assign({}, i), { state: s })
                        return t[e](n)
                    }
                yield i
            }
    }
    waitUntil(e) {
        return (this.A.push(e), e)
    }
    async doneWaiting() {
        for (; this.A.length; ) {
            const e = this.A.splice(0),
                t = (await Promise.allSettled(e)).find(e => 'rejected' === e.status)
            if (t) throw t.reason
        }
    }
    destroy() {
        this.k.resolve(null)
    }
    async W(e) {
        let t = e,
            s = !1
        for (const e of this.iterateCallbacks('cacheWillUpdate'))
            if (
                ((t =
                    (await e({ request: this.request, response: t, event: this.event })) ||
                    void 0),
                (s = !0),
                !t)
            )
                break
        return (s || (t && 200 !== t.status && (t = void 0)), t)
    }
}
class V {
    constructor(e = {}) {
        ;((this.cacheName = f(e.cacheName)),
            (this.plugins = e.plugins || []),
            (this.fetchOptions = e.fetchOptions),
            (this.matchOptions = e.matchOptions))
    }
    handle(e) {
        const [t] = this.handleAll(e)
        return t
    }
    handleAll(e) {
        e instanceof FetchEvent && (e = { event: e, request: e.request })
        const t = e.event,
            s = 'string' == typeof e.request ? new Request(e.request) : e.request,
            i = 'params' in e ? e.params : void 0,
            n = new K(this, { event: t, request: s, params: i }),
            r = this.K(n, s, t)
        return [r, this.V(r, n, s, t)]
    }
    async K(e, s, i) {
        let n
        await e.runCallbacks('handlerWillStart', { event: i, request: s })
        try {
            if (((n = await this.H(s, e)), !n || 'error' === n.type))
                throw new t('no-response', { url: s.url })
        } catch (t) {
            if (t instanceof Error)
                for (const r of e.iterateCallbacks('handlerDidError'))
                    if (((n = await r({ error: t, event: i, request: s })), n)) break
            if (!n) throw t
        }
        for (const t of e.iterateCallbacks('handlerWillRespond'))
            n = await t({ event: i, request: s, response: n })
        return n
    }
    async V(e, t, s, i) {
        let n, r
        try {
            n = await e
        } catch (r) {}
        try {
            ;(await t.runCallbacks('handlerDidRespond', { event: i, request: s, response: n }),
                await t.doneWaiting())
        } catch (e) {
            e instanceof Error && (r = e)
        }
        if (
            (await t.runCallbacks('handlerDidComplete', {
                event: i,
                request: s,
                response: n,
                error: r,
            }),
            t.destroy(),
            r)
        )
            throw r
    }
}
class H extends V {
    async H(e, s) {
        let i,
            n = await s.cacheMatch(e)
        if (!n)
            try {
                n = await s.fetchAndCachePut(e)
            } catch (e) {
                e instanceof Error && (i = e)
            }
        if (!n) throw new t('no-response', { url: e.url, error: i })
        return n
    }
}
const G = {
    cacheWillUpdate: async ({ response: e }) =>
        200 === e.status || 0 === e.status ? e : null,
}
function $(e, t) {
    const s = t()
    return (e.waitUntil(s), s)
}
try {
    self['workbox:precaching:7.3.0'] && _()
} catch (e) {}
function J(e) {
    if (!e) throw new t('add-to-cache-list-unexpected-type', { entry: e })
    if ('string' == typeof e) {
        const t = new URL(e, location.href)
        return { cacheKey: t.href, url: t.href }
    }
    const { revision: s, url: i } = e
    if (!i) throw new t('add-to-cache-list-unexpected-type', { entry: e })
    if (!s) {
        const e = new URL(i, location.href)
        return { cacheKey: e.href, url: e.href }
    }
    const n = new URL(i, location.href),
        r = new URL(i, location.href)
    return (n.searchParams.set('__WB_REVISION__', s), { cacheKey: n.href, url: r.href })
}
class z {
    constructor() {
        ;((this.updatedURLs = []),
            (this.notUpdatedURLs = []),
            (this.handlerWillStart = async ({ request: e, state: t }) => {
                t && (t.originalRequest = e)
            }),
            (this.cachedResponseWillBeUsed = async ({
                event: e,
                state: t,
                cachedResponse: s,
            }) => {
                if (
                    'install' === e.type &&
                    t &&
                    t.originalRequest &&
                    t.originalRequest instanceof Request
                ) {
                    const e = t.originalRequest.url
                    s ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e)
                }
                return s
            }))
    }
}
class X {
    constructor({ precacheController: e }) {
        ;((this.cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
            const s = (null == t ? void 0 : t.cacheKey) || this.G.getCacheKeyForURL(e.url)
            return s ? new Request(s, { headers: e.headers }) : e
        }),
            (this.G = e))
    }
}
let Q, Y
async function Z(e, s) {
    let i = null
    if (e.url) {
        i = new URL(e.url).origin
    }
    if (i !== self.location.origin) throw new t('cross-origin-copy-response', { origin: i })
    const n = e.clone(),
        r = { headers: new Headers(n.headers), status: n.status, statusText: n.statusText },
        a = s ? s(r) : r,
        o = (function () {
            if (void 0 === Q) {
                const e = new Response('')
                if ('body' in e)
                    try {
                        ;(new Response(e.body), (Q = !0))
                    } catch (e) {
                        Q = !1
                    }
                Q = !1
            }
            return Q
        })()
            ? n.body
            : await n.blob()
    return new Response(o, a)
}
class ee extends V {
    constructor(e = {}) {
        ;((e.cacheName = h(e.cacheName)),
            super(e),
            (this.$ = !1 !== e.fallbackToNetwork),
            this.plugins.push(ee.copyRedirectedCacheableResponsesPlugin))
    }
    async H(e, t) {
        const s = await t.cacheMatch(e)
        return (
            s ||
            (t.event && 'install' === t.event.type ? await this.J(e, t) : await this.X(e, t))
        )
    }
    async X(e, s) {
        let i
        const n = s.params || {}
        if (!this.$)
            throw new t('missing-precache-entry', { cacheName: this.cacheName, url: e.url })
        {
            const t = n.integrity,
                r = e.integrity,
                a = !r || r === t
            ;((i = await s.fetch(
                new Request(e, { integrity: 'no-cors' !== e.mode ? r || t : void 0 })
            )),
                t && a && 'no-cors' !== e.mode && (this.Y(), await s.cachePut(e, i.clone())))
        }
        return i
    }
    async J(e, s) {
        this.Y()
        const i = await s.fetch(e)
        if (!(await s.cachePut(e, i.clone())))
            throw new t('bad-precaching-response', { url: e.url, status: i.status })
        return i
    }
    Y() {
        let e = null,
            t = 0
        for (const [s, i] of this.plugins.entries())
            i !== ee.copyRedirectedCacheableResponsesPlugin &&
                (i === ee.defaultPrecacheCacheabilityPlugin && (e = s),
                i.cacheWillUpdate && t++)
        0 === t
            ? this.plugins.push(ee.defaultPrecacheCacheabilityPlugin)
            : t > 1 && null !== e && this.plugins.splice(e, 1)
    }
}
;((ee.defaultPrecacheCacheabilityPlugin = {
    cacheWillUpdate: async ({ response: e }) => (!e || e.status >= 400 ? null : e),
}),
    (ee.copyRedirectedCacheableResponsesPlugin = {
        cacheWillUpdate: async ({ response: e }) => (e.redirected ? await Z(e) : e),
    }))
class te {
    constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: s = !0 } = {}) {
        ;((this.Z = new Map()),
            (this.ee = new Map()),
            (this.te = new Map()),
            (this.T = new ee({
                cacheName: h(e),
                plugins: [...t, new X({ precacheController: this })],
                fallbackToNetwork: s,
            })),
            (this.install = this.install.bind(this)),
            (this.activate = this.activate.bind(this)))
    }
    get strategy() {
        return this.T
    }
    precache(e) {
        ;(this.addToCacheList(e),
            this.se ||
                (self.addEventListener('install', this.install),
                self.addEventListener('activate', this.activate),
                (this.se = !0)))
    }
    addToCacheList(e) {
        const s = []
        for (const i of e) {
            'string' == typeof i ? s.push(i) : i && void 0 === i.revision && s.push(i.url)
            const { cacheKey: e, url: n } = J(i),
                r = 'string' != typeof i && i.revision ? 'reload' : 'default'
            if (this.Z.has(n) && this.Z.get(n) !== e)
                throw new t('add-to-cache-list-conflicting-entries', {
                    firstEntry: this.Z.get(n),
                    secondEntry: e,
                })
            if ('string' != typeof i && i.integrity) {
                if (this.te.has(e) && this.te.get(e) !== i.integrity)
                    throw new t('add-to-cache-list-conflicting-integrities', { url: n })
                this.te.set(e, i.integrity)
            }
            if ((this.Z.set(n, e), this.ee.set(n, r), s.length > 0)) {
                const e = `Workbox is precaching URLs without revision info: ${s.join(', ')}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`
                console.warn(e)
            }
        }
    }
    install(e) {
        return $(e, async () => {
            const t = new z()
            this.strategy.plugins.push(t)
            for (const [t, s] of this.Z) {
                const i = this.te.get(s),
                    n = this.ee.get(t),
                    r = new Request(t, { integrity: i, cache: n, credentials: 'same-origin' })
                await Promise.all(
                    this.strategy.handleAll({ params: { cacheKey: s }, request: r, event: e })
                )
            }
            const { updatedURLs: s, notUpdatedURLs: i } = t
            return { updatedURLs: s, notUpdatedURLs: i }
        })
    }
    activate(e) {
        return $(e, async () => {
            const e = await self.caches.open(this.strategy.cacheName),
                t = await e.keys(),
                s = new Set(this.Z.values()),
                i = []
            for (const n of t) s.has(n.url) || (await e.delete(n), i.push(n.url))
            return { deletedURLs: i }
        })
    }
    getURLsToCacheKeys() {
        return this.Z
    }
    getCachedURLs() {
        return [...this.Z.keys()]
    }
    getCacheKeyForURL(e) {
        const t = new URL(e, location.href)
        return this.Z.get(t.href)
    }
    getIntegrityForCacheKey(e) {
        return this.te.get(e)
    }
    async matchPrecache(e) {
        const t = e instanceof Request ? e.url : e,
            s = this.getCacheKeyForURL(t)
        if (s) {
            return (await self.caches.open(this.strategy.cacheName)).match(s)
        }
    }
    createHandlerBoundToURL(e) {
        const s = this.getCacheKeyForURL(e)
        if (!s) throw new t('non-precached-url', { url: e })
        return t => (
            (t.request = new Request(e)),
            (t.params = Object.assign({ cacheKey: s }, t.params)),
            this.strategy.handle(t)
        )
    }
}
const se = () => (Y || (Y = new te()), Y)
class ie extends i {
    constructor(e, t) {
        super(({ request: s }) => {
            const i = e.getURLsToCacheKeys()
            for (const n of (function* (
                e,
                {
                    ignoreURLParametersMatching: t = [/^utm_/, /^fbclid$/],
                    directoryIndex: s = 'index.html',
                    cleanURLs: i = !0,
                    urlManipulation: n,
                } = {}
            ) {
                const r = new URL(e, location.href)
                ;((r.hash = ''), yield r.href)
                const a = (function (e, t = []) {
                    for (const s of [...e.searchParams.keys()])
                        t.some(e => e.test(s)) && e.searchParams.delete(s)
                    return e
                })(r, t)
                if ((yield a.href, s && a.pathname.endsWith('/'))) {
                    const e = new URL(a.href)
                    ;((e.pathname += s), yield e.href)
                }
                if (i) {
                    const e = new URL(a.href)
                    ;((e.pathname += '.html'), yield e.href)
                }
                if (n) {
                    const e = n({ url: r })
                    for (const t of e) yield t.href
                }
            })(s.url, t)) {
                const t = i.get(n)
                if (t) {
                    return { cacheKey: t, integrity: e.getIntegrityForCacheKey(t) }
                }
            }
        }, e.strategy)
    }
}
var ne
;(importScripts('/sw-reading-state.js', '/sw-share-target.js', '/sw-navigation.js'),
    self.skipWaiting(),
    self.addEventListener('activate', () => self.clients.claim()),
    (ne = {}),
    (function (e) {
        se().precache(e)
    })([
        { url: '/build/assets/useToast-C0RakikF.js', revision: null },
        { url: '/build/assets/useSidebarStore-BJSSbRO8.js', revision: null },
        { url: '/build/assets/useOnlineStatus-DEFR8icl.js', revision: null },
        { url: '/build/assets/useDarkMode-D-laMA_T.js', revision: null },
        { url: '/build/assets/useArticleStore-Dq6bA7A0.js', revision: null },
        { url: '/build/assets/useAddFeedModal-CpyZo5rr.js', revision: null },
        { url: '/build/assets/purify.es-J9PU_gBl.js', revision: null },
        { url: '/build/assets/app-Du0X5HFG.js', revision: null },
        { url: '/build/assets/app-DX6iuNWO.css', revision: null },
        { url: '/build/assets/_plugin-vue_export-helper-DlAUqK2U.js', revision: null },
        { url: '/build/assets/Welcome-De08LL41.js', revision: null },
        { url: '/build/assets/VerifyEmail-C3h1iQKM.js', revision: null },
        { url: '/build/assets/UpdateProfileInformationForm-DDSCy2Px.js', revision: null },
        { url: '/build/assets/UpdatePasswordForm-CPk5RCbl.js', revision: null },
        { url: '/build/assets/TextInput-C_KHBgj1.js', revision: null },
        { url: '/build/assets/SettingsView-CLKboXRJ.js', revision: null },
        { url: '/build/assets/SettingsView-B4uaY3NX.css', revision: null },
        { url: '/build/assets/SearchView-CrCCjwGh.css', revision: null },
        { url: '/build/assets/SearchView-CZiEBBp8.js', revision: null },
        { url: '/build/assets/ResetPassword-BFVsH9pn.js', revision: null },
        { url: '/build/assets/Register-CtpbWFCl.js', revision: null },
        { url: '/build/assets/PrimaryButton-MpmbsF-o.js', revision: null },
        { url: '/build/assets/OpmlImportView-mi0x4HRv.js', revision: null },
        { url: '/build/assets/OpmlImportView-CipUPWGJ.css', revision: null },
        { url: '/build/assets/Login-BTShIp6S.js', revision: null },
        { url: '/build/assets/HighlightsView-D2DBzKKs.js', revision: null },
        { url: '/build/assets/HighlightsView-CLICb-f0.css', revision: null },
        { url: '/build/assets/GuestLayout-CaFIjja3.js', revision: null },
        { url: '/build/assets/ForgotPassword-Bduh_hd9.js', revision: null },
        { url: '/build/assets/FeedManageView-DbFGujvW.css', revision: null },
        { url: '/build/assets/FeedManageView-B0GNnkfo.js', revision: null },
        { url: '/build/assets/FeedEditView-DFvO8kS3.js', revision: null },
        { url: '/build/assets/FeedCreateView-gWCLk5d-.css', revision: null },
        { url: '/build/assets/FeedCreateView-CuzQ1dz7.js', revision: null },
        { url: '/build/assets/Edit-5Nn7SJpr.js', revision: null },
        { url: '/build/assets/DeleteUserForm-XUmwYWQf.js', revision: null },
        { url: '/build/assets/ConfirmPassword-DpKTm-tH.js', revision: null },
        { url: '/build/assets/ChatView-CSY4dkmo.css', revision: null },
        { url: '/build/assets/ChatView-BNhm8lIc.js', revision: null },
        { url: '/build/assets/ChatPanel-Ctmjga12.js', revision: null },
        { url: '/build/assets/ChatPanel-B-Oe3-9K.css', revision: null },
        { url: '/build/assets/ChatConversationView-BrPuSwCx.js', revision: null },
        { url: '/build/assets/ArticleListView-BvjG4rzi.css', revision: null },
        { url: '/build/assets/ArticleListView-BKOgv-6U.js', revision: null },
        { url: '/build/assets/ArticleDetailView-tzGHAeJH.js', revision: null },
        { url: '/build/assets/ArticleDetailView-B5NIqI-l.css', revision: null },
        { url: '/build/assets/AppShell-Dc1Uu88s.css', revision: null },
        { url: '/build/assets/AppShell-DMK3tNHi.js', revision: null },
        { url: 'manifest.webmanifest', revision: 'f8a1f2577700595006912f577c4a169f' },
    ]),
    (function (e) {
        const t = se()
        c(new ie(t, e))
    })(ne),
    self.addEventListener('activate', e => {
        const t = h()
        e.waitUntil(
            (async (e, t = '-precache-') => {
                const s = (await self.caches.keys()).filter(
                    s => s.includes(t) && s.includes(self.registration.scope) && s !== e
                )
                return (await Promise.all(s.map(e => self.caches.delete(e))), s)
            })(t).then(e => {})
        )
    }),
    c(
        /^https?:\/\/fonts\.(bunny\.net|googleapis\.com)\/.*/i,
        new H({
            cacheName: 'google-fonts-cache',
            plugins: [
                new T({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
                new A({ statuses: [0, 200] }),
            ],
        }),
        'GET'
    ),
    c(
        ({ url: e }) =>
            /\/api\//.test(e.pathname) &&
            !/^\/api\/articles(\/\d+)?$/.test(e.pathname) &&
            !/^\/api\/chat(\/|$)/.test(e.pathname),
        new (class extends V {
            constructor(e = {}) {
                ;(super(e),
                    this.plugins.some(e => 'cacheWillUpdate' in e) || this.plugins.unshift(G),
                    (this.ie = e.networkTimeoutSeconds || 0))
            }
            async H(e, s) {
                const i = [],
                    n = []
                let r
                if (this.ie) {
                    const { id: t, promise: a } = this.ne({ request: e, logs: i, handler: s })
                    ;((r = t), n.push(a))
                }
                const a = this.re({ timeoutId: r, request: e, logs: i, handler: s })
                n.push(a)
                const o = await s.waitUntil(
                    (async () => (await s.waitUntil(Promise.race(n))) || (await a))()
                )
                if (!o) throw new t('no-response', { url: e.url })
                return o
            }
            ne({ request: e, logs: t, handler: s }) {
                let i
                return {
                    promise: new Promise(t => {
                        i = setTimeout(async () => {
                            t(await s.cacheMatch(e))
                        }, 1e3 * this.ie)
                    }),
                    id: i,
                }
            }
            async re({ timeoutId: e, request: t, logs: s, handler: i }) {
                let n, r
                try {
                    r = await i.fetchAndCachePut(t)
                } catch (e) {
                    e instanceof Error && (n = e)
                }
                return (e && clearTimeout(e), (!n && r) || (r = await i.cacheMatch(t)), r)
            }
        })({
            cacheName: 'api-cache',
            networkTimeoutSeconds: 5,
            plugins: [
                new T({ maxEntries: 50, maxAgeSeconds: 86400 }),
                new A({ statuses: [0, 200] }),
            ],
        }),
        'GET'
    ),
    c(
        /\.(?:jpg|jpeg|gif|png|webp|avif|svg)$/i,
        new H({
            cacheName: 'article-images-cache',
            plugins: [
                new T({ maxEntries: 200, maxAgeSeconds: 2592e3 }),
                new A({ statuses: [200] }),
            ],
        }),
        'GET'
    ),
    c(
        /^https?:\/\/.*\.(?:jpg|jpeg|gif|png|webp|avif|svg)(?:\?.*)?$/i,
        new H({
            cacheName: 'external-images-cache',
            plugins: [
                new T({ maxEntries: 300, maxAgeSeconds: 1209600 }),
                new A({ statuses: [200] }),
            ],
        }),
        'GET'
    ),
    c(
        /favicon/i,
        new H({
            cacheName: 'favicon-cache',
            plugins: [
                new T({ maxEntries: 100, maxAgeSeconds: 2592e3 }),
                new A({ statuses: [200] }),
            ],
        }),
        'GET'
    ))
