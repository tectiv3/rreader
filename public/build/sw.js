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
class n {
    constructor(e, t, n = 'GET') {
        ;((this.handler = s(t)), (this.match = e), (this.method = n))
    }
    setCatchHandler(e) {
        this.catchHandler = s(e)
    }
}
class i extends n {
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
        const n = s.origin === location.origin,
            { params: i, route: r } = this.findMatchingRoute({
                event: t,
                request: e,
                sameOrigin: n,
                url: s,
            })
        let a = r && r.handler
        const o = e.method
        if ((!a && this.i.has(o) && (a = this.i.get(o)), !a)) return
        let c
        try {
            c = a.handle({ url: s, request: e, event: t, params: i })
        } catch (e) {
            c = Promise.reject(e)
        }
        const l = r && r.catchHandler
        return (
            c instanceof Promise &&
                (this.o || l) &&
                (c = c.catch(async n => {
                    if (l)
                        try {
                            return await l.handle({ url: s, request: e, event: t, params: i })
                        } catch (e) {
                            e instanceof Error && (n = e)
                        }
                    if (this.o) return this.o.handle({ url: s, request: e, event: t })
                    throw n
                })),
            c
        )
    }
    findMatchingRoute({ url: e, sameOrigin: t, request: s, event: n }) {
        const i = this.t.get(s.method) || []
        for (const r of i) {
            let i
            const a = r.match({ url: e, sameOrigin: t, request: s, event: n })
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
        a = new n(({ url: e }) => e.href === t.href, s, r)
    } else if (e instanceof RegExp) a = new i(e, s, r)
    else if ('function' == typeof e) a = new n(e, s, r)
    else {
        if (!(e instanceof n))
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
                      for (var n in s) ({}).hasOwnProperty.call(s, n) && (e[n] = s[n])
                  }
                  return e
              }),
        p.apply(null, arguments)
    )
}
let g, m
const y = new WeakMap(),
    v = new WeakMap(),
    b = new WeakMap(),
    R = new WeakMap(),
    j = new WeakMap()
let C = {
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
function D(e) {
    return e !== IDBDatabase.prototype.transaction ||
        'objectStoreNames' in IDBTransaction.prototype
        ? (
              m ||
              (m = [
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
              const n = e.call(U(this), t, ...s)
              return (b.set(n, t.sort ? t.sort() : [t]), x(n))
          }
}
function q(e) {
    return 'function' == typeof e
        ? D(e)
        : (e instanceof IDBTransaction &&
              (function (e) {
                  if (v.has(e)) return
                  const t = new Promise((t, s) => {
                      const n = () => {
                              ;(e.removeEventListener('complete', i),
                                  e.removeEventListener('error', r),
                                  e.removeEventListener('abort', r))
                          },
                          i = () => {
                              ;(t(), n())
                          },
                          r = () => {
                              ;(s(e.error || new DOMException('AbortError', 'AbortError')),
                                  n())
                          }
                      ;(e.addEventListener('complete', i),
                          e.addEventListener('error', r),
                          e.addEventListener('abort', r))
                  })
                  v.set(e, t)
              })(e),
          (t = e),
          (g || (g = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])).some(
              e => t instanceof e
          )
              ? new Proxy(e, C)
              : e)
    var t
}
function x(e) {
    if (e instanceof IDBRequest)
        return (function (e) {
            const t = new Promise((t, s) => {
                const n = () => {
                        ;(e.removeEventListener('success', i),
                            e.removeEventListener('error', r))
                    },
                    i = () => {
                        ;(t(x(e.result)), n())
                    },
                    r = () => {
                        ;(s(e.error), n())
                    }
                ;(e.addEventListener('success', i), e.addEventListener('error', r))
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
    I = ['put', 'add', 'delete', 'clear'],
    L = new Map()
function B(e, t) {
    if (!(e instanceof IDBDatabase) || t in e || 'string' != typeof t) return
    if (L.get(t)) return L.get(t)
    const s = t.replace(/FromIndex$/, ''),
        n = t !== s,
        i = I.includes(s)
    if (!(s in (n ? IDBIndex : IDBObjectStore).prototype) || (!i && !E.includes(s))) return
    const r = async function (e, ...t) {
        const r = this.transaction(e, i ? 'readwrite' : 'readonly')
        let a = r.store
        return (
            n && (a = a.index(t.shift())),
            (await Promise.all([a[s](...t), i && r.done]))[0]
        )
    }
    return (L.set(t, r), r)
}
C = (e =>
    p({}, e, {
        get: (t, s, n) => B(t, s) || e.get(t, s, n),
        has: (t, s) => !!B(t, s) || e.has(t, s),
    }))(C)
try {
    self['workbox:expiration:7.3.0'] && _()
} catch (e) {}
const N = 'cache-entries',
    T = e => {
        const t = new URL(e, location.href)
        return ((t.hash = ''), t.href)
    }
class k {
    constructor(e) {
        ;((this.l = null), (this.u = e))
    }
    h(e) {
        const t = e.createObjectStore(N, { keyPath: 'id' })
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
        const s = { url: (e = T(e)), timestamp: t, cacheName: this.u, id: this.m(e) },
            n = (await this.getDb()).transaction(N, 'readwrite', { durability: 'relaxed' })
        ;(await n.store.put(s), await n.done)
    }
    async getTimestamp(e) {
        const t = await this.getDb(),
            s = await t.get(N, this.m(e))
        return null == s ? void 0 : s.timestamp
    }
    async expireEntries(e, t) {
        const s = await this.getDb()
        let n = await s.transaction(N).store.index('timestamp').openCursor(null, 'prev')
        const i = []
        let r = 0
        for (; n; ) {
            const s = n.value
            ;(s.cacheName === this.u &&
                ((e && s.timestamp < e) || (t && r >= t) ? i.push(n.value) : r++),
                (n = await n.continue()))
        }
        const a = []
        for (const e of i) (await s.delete(N, e.id), a.push(e.url))
        return a
    }
    m(e) {
        return this.u + '|' + T(e)
    }
    async getDb() {
        return (
            this.l ||
                (this.l = await (function (
                    e,
                    t,
                    { blocked: s, upgrade: n, blocking: i, terminated: r } = {}
                ) {
                    const a = indexedDB.open(e, t),
                        o = x(a)
                    return (
                        n &&
                            a.addEventListener('upgradeneeded', e => {
                                n(x(a.result), e.oldVersion, e.newVersion, x(a.transaction), e)
                            }),
                        s &&
                            a.addEventListener('blocked', e =>
                                s(e.oldVersion, e.newVersion, e)
                            ),
                        o
                            .then(e => {
                                ;(r && e.addEventListener('close', () => r()),
                                    i &&
                                        e.addEventListener('versionchange', e =>
                                            i(e.oldVersion, e.newVersion, e)
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
class S {
    constructor(e, t = {}) {
        ;((this.v = !1),
            (this.R = !1),
            (this.j = t.maxEntries),
            (this.C = t.maxAgeSeconds),
            (this.D = t.matchOptions),
            (this.u = e),
            (this.q = new k(e)))
    }
    async expireEntries() {
        if (this.v) return void (this.R = !0)
        this.v = !0
        const e = this.C ? Date.now() - 1e3 * this.C : 0,
            t = await this.q.expireEntries(e, this.j),
            s = await self.caches.open(this.u)
        for (const e of t) await s.delete(e, this.D)
        ;((this.v = !1), this.R && ((this.R = !1), d(this.expireEntries())))
    }
    async updateTimestamp(e) {
        await this.q.setTimestamp(e, Date.now())
    }
    async isURLExpired(e) {
        if (this.C) {
            const t = await this.q.getTimestamp(e),
                s = Date.now() - 1e3 * this.C
            return void 0 === t || t < s
        }
        return !1
    }
    async delete() {
        ;((this.R = !1), await this.q.expireEntries(1 / 0))
    }
}
class O {
    constructor(e = {}) {
        ;((this.cachedResponseWillBeUsed = async ({
            event: e,
            request: t,
            cacheName: s,
            cachedResponse: n,
        }) => {
            if (!n) return null
            const i = this.U(n),
                r = this.I(s)
            d(r.expireEntries())
            const a = r.updateTimestamp(t.url)
            if (e)
                try {
                    e.waitUntil(a)
                } catch (e) {}
            return i ? n : null
        }),
            (this.cacheDidUpdate = async ({ cacheName: e, request: t }) => {
                const s = this.I(e)
                ;(await s.updateTimestamp(t.url), await s.expireEntries())
            }),
            (this.L = e),
            (this.C = e.maxAgeSeconds),
            (this._ = new Map()),
            e.purgeOnQuotaError &&
                (function (e) {
                    w.add(e)
                })(() => this.deleteCacheAndMetadata()))
    }
    I(e) {
        if (e === f()) throw new t('expire-custom-caches-only')
        let s = this._.get(e)
        return (s || ((s = new S(e, this.L)), this._.set(e, s)), s)
    }
    U(e) {
        if (!this.C) return !0
        const t = this.B(e)
        if (null === t) return !0
        return t >= Date.now() - 1e3 * this.C
    }
    B(e) {
        if (!e.headers.has('date')) return null
        const t = e.headers.get('date'),
            s = new Date(t).getTime()
        return isNaN(s) ? null : s
    }
    async deleteCacheAndMetadata() {
        for (const [e, t] of this._) (await self.caches.delete(e), await t.delete())
        this._ = new Map()
    }
}
try {
    self['workbox:cacheable-response:7.3.0'] && _()
} catch (e) {}
class P {
    constructor(e = {}) {
        ;((this.N = e.statuses), (this.T = e.headers))
    }
    isResponseCacheable(e) {
        let t = !0
        return (
            this.N && (t = this.N.includes(e.status)),
            this.T && t && (t = Object.keys(this.T).some(t => e.headers.get(t) === this.T[t])),
            t
        )
    }
}
class M {
    constructor(e) {
        ;((this.cacheWillUpdate = async ({ response: e }) =>
            this.k.isResponseCacheable(e) ? e : null),
            (this.k = new P(e)))
    }
}
function A(e, t) {
    const s = new URL(e)
    for (const e of t) s.searchParams.delete(e)
    return s.href
}
class V {
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
class F {
    constructor(e, t) {
        ;((this.S = {}),
            Object.assign(this, t),
            (this.event = t.event),
            (this.O = e),
            (this.P = new V()),
            (this.M = []),
            (this.A = [...e.plugins]),
            (this.V = new Map()))
        for (const e of this.A) this.V.set(e, {})
        this.event.waitUntil(this.P.promise)
    }
    async fetch(e) {
        const { event: s } = this
        let n = W(e)
        if ('navigate' === n.mode && s instanceof FetchEvent && s.preloadResponse) {
            const e = await s.preloadResponse
            if (e) return e
        }
        const i = this.hasCallback('fetchDidFail') ? n.clone() : null
        try {
            for (const e of this.iterateCallbacks('requestWillFetch'))
                n = await e({ request: n.clone(), event: s })
        } catch (e) {
            if (e instanceof Error)
                throw new t('plugin-error-request-will-fetch', {
                    thrownErrorMessage: e.message,
                })
        }
        const r = n.clone()
        try {
            let e
            e = await fetch(n, 'navigate' === n.mode ? void 0 : this.O.fetchOptions)
            for (const t of this.iterateCallbacks('fetchDidSucceed'))
                e = await t({ event: s, request: r, response: e })
            return e
        } catch (e) {
            throw (
                i &&
                    (await this.runCallbacks('fetchDidFail', {
                        error: e,
                        event: s,
                        originalRequest: i.clone(),
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
        const { cacheName: n, matchOptions: i } = this.O,
            r = await this.getCacheKey(t, 'read'),
            a = Object.assign(Object.assign({}, i), { cacheName: n })
        s = await caches.match(r, a)
        for (const e of this.iterateCallbacks('cachedResponseWillBeUsed'))
            s =
                (await e({
                    cacheName: n,
                    matchOptions: i,
                    cachedResponse: s,
                    request: r,
                    event: this.event,
                })) || void 0
        return s
    }
    async cachePut(e, s) {
        const n = W(e)
        var i
        await ((i = 0), new Promise(e => setTimeout(e, i)))
        const r = await this.getCacheKey(n, 'write')
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
        const { cacheName: c, matchOptions: l } = this.O,
            u = await self.caches.open(c),
            h = this.hasCallback('cacheDidUpdate'),
            f = h
                ? await (async function (e, t, s, n) {
                      const i = A(t.url, s)
                      if (t.url === i) return e.match(t, n)
                      const r = Object.assign(Object.assign({}, n), { ignoreSearch: !0 }),
                          a = await e.keys(t, r)
                      for (const t of a) if (i === A(t.url, s)) return e.match(t, n)
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
        if (!this.S[s]) {
            let n = e
            for (const e of this.iterateCallbacks('cacheKeyWillBeUsed'))
                n = W(await e({ mode: t, request: n, event: this.event, params: this.params }))
            this.S[s] = n
        }
        return this.S[s]
    }
    hasCallback(e) {
        for (const t of this.O.plugins) if (e in t) return !0
        return !1
    }
    async runCallbacks(e, t) {
        for (const s of this.iterateCallbacks(e)) await s(t)
    }
    *iterateCallbacks(e) {
        for (const t of this.O.plugins)
            if ('function' == typeof t[e]) {
                const s = this.V.get(t),
                    n = n => {
                        const i = Object.assign(Object.assign({}, n), { state: s })
                        return t[e](i)
                    }
                yield n
            }
    }
    waitUntil(e) {
        return (this.M.push(e), e)
    }
    async doneWaiting() {
        for (; this.M.length; ) {
            const e = this.M.splice(0),
                t = (await Promise.allSettled(e)).find(e => 'rejected' === e.status)
            if (t) throw t.reason
        }
    }
    destroy() {
        this.P.resolve(null)
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
class K {
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
            n = 'params' in e ? e.params : void 0,
            i = new F(this, { event: t, request: s, params: n }),
            r = this.F(i, s, t)
        return [r, this.K(r, i, s, t)]
    }
    async F(e, s, n) {
        let i
        await e.runCallbacks('handlerWillStart', { event: n, request: s })
        try {
            if (((i = await this.G(s, e)), !i || 'error' === i.type))
                throw new t('no-response', { url: s.url })
        } catch (t) {
            if (t instanceof Error)
                for (const r of e.iterateCallbacks('handlerDidError'))
                    if (((i = await r({ error: t, event: n, request: s })), i)) break
            if (!i) throw t
        }
        for (const t of e.iterateCallbacks('handlerWillRespond'))
            i = await t({ event: n, request: s, response: i })
        return i
    }
    async K(e, t, s, n) {
        let i, r
        try {
            i = await e
        } catch (r) {}
        try {
            ;(await t.runCallbacks('handlerDidRespond', { event: n, request: s, response: i }),
                await t.doneWaiting())
        } catch (e) {
            e instanceof Error && (r = e)
        }
        if (
            (await t.runCallbacks('handlerDidComplete', {
                event: n,
                request: s,
                response: i,
                error: r,
            }),
            t.destroy(),
            r)
        )
            throw r
    }
}
class G extends K {
    async G(e, s) {
        let n,
            i = await s.cacheMatch(e)
        if (!i)
            try {
                i = await s.fetchAndCachePut(e)
            } catch (e) {
                e instanceof Error && (n = e)
            }
        if (!i) throw new t('no-response', { url: e.url, error: n })
        return i
    }
}
const H = {
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
function X(e) {
    if (!e) throw new t('add-to-cache-list-unexpected-type', { entry: e })
    if ('string' == typeof e) {
        const t = new URL(e, location.href)
        return { cacheKey: t.href, url: t.href }
    }
    const { revision: s, url: n } = e
    if (!n) throw new t('add-to-cache-list-unexpected-type', { entry: e })
    if (!s) {
        const e = new URL(n, location.href)
        return { cacheKey: e.href, url: e.href }
    }
    const i = new URL(n, location.href),
        r = new URL(n, location.href)
    return (i.searchParams.set('__WB_REVISION__', s), { cacheKey: i.href, url: r.href })
}
class J {
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
class z {
    constructor({ precacheController: e }) {
        ;((this.cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
            const s = (null == t ? void 0 : t.cacheKey) || this.H.getCacheKeyForURL(e.url)
            return s ? new Request(s, { headers: e.headers }) : e
        }),
            (this.H = e))
    }
}
let Z, Q
async function Y(e, s) {
    let n = null
    if (e.url) {
        n = new URL(e.url).origin
    }
    if (n !== self.location.origin) throw new t('cross-origin-copy-response', { origin: n })
    const i = e.clone(),
        r = { headers: new Headers(i.headers), status: i.status, statusText: i.statusText },
        a = s ? s(r) : r,
        o = (function () {
            if (void 0 === Z) {
                const e = new Response('')
                if ('body' in e)
                    try {
                        ;(new Response(e.body), (Z = !0))
                    } catch (e) {
                        Z = !1
                    }
                Z = !1
            }
            return Z
        })()
            ? i.body
            : await i.blob()
    return new Response(o, a)
}
class ee extends K {
    constructor(e = {}) {
        ;((e.cacheName = h(e.cacheName)),
            super(e),
            (this.$ = !1 !== e.fallbackToNetwork),
            this.plugins.push(ee.copyRedirectedCacheableResponsesPlugin))
    }
    async G(e, t) {
        const s = await t.cacheMatch(e)
        return (
            s ||
            (t.event && 'install' === t.event.type ? await this.X(e, t) : await this.J(e, t))
        )
    }
    async J(e, s) {
        let n
        const i = s.params || {}
        if (!this.$)
            throw new t('missing-precache-entry', { cacheName: this.cacheName, url: e.url })
        {
            const t = i.integrity,
                r = e.integrity,
                a = !r || r === t
            ;((n = await s.fetch(
                new Request(e, { integrity: 'no-cors' !== e.mode ? r || t : void 0 })
            )),
                t && a && 'no-cors' !== e.mode && (this.Z(), await s.cachePut(e, n.clone())))
        }
        return n
    }
    async X(e, s) {
        this.Z()
        const n = await s.fetch(e)
        if (!(await s.cachePut(e, n.clone())))
            throw new t('bad-precaching-response', { url: e.url, status: n.status })
        return n
    }
    Z() {
        let e = null,
            t = 0
        for (const [s, n] of this.plugins.entries())
            n !== ee.copyRedirectedCacheableResponsesPlugin &&
                (n === ee.defaultPrecacheCacheabilityPlugin && (e = s),
                n.cacheWillUpdate && t++)
        0 === t
            ? this.plugins.push(ee.defaultPrecacheCacheabilityPlugin)
            : t > 1 && null !== e && this.plugins.splice(e, 1)
    }
}
;((ee.defaultPrecacheCacheabilityPlugin = {
    cacheWillUpdate: async ({ response: e }) => (!e || e.status >= 400 ? null : e),
}),
    (ee.copyRedirectedCacheableResponsesPlugin = {
        cacheWillUpdate: async ({ response: e }) => (e.redirected ? await Y(e) : e),
    }))
class te {
    constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: s = !0 } = {}) {
        ;((this.Y = new Map()),
            (this.ee = new Map()),
            (this.te = new Map()),
            (this.O = new ee({
                cacheName: h(e),
                plugins: [...t, new z({ precacheController: this })],
                fallbackToNetwork: s,
            })),
            (this.install = this.install.bind(this)),
            (this.activate = this.activate.bind(this)))
    }
    get strategy() {
        return this.O
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
        for (const n of e) {
            'string' == typeof n ? s.push(n) : n && void 0 === n.revision && s.push(n.url)
            const { cacheKey: e, url: i } = X(n),
                r = 'string' != typeof n && n.revision ? 'reload' : 'default'
            if (this.Y.has(i) && this.Y.get(i) !== e)
                throw new t('add-to-cache-list-conflicting-entries', {
                    firstEntry: this.Y.get(i),
                    secondEntry: e,
                })
            if ('string' != typeof n && n.integrity) {
                if (this.te.has(e) && this.te.get(e) !== n.integrity)
                    throw new t('add-to-cache-list-conflicting-integrities', { url: i })
                this.te.set(e, n.integrity)
            }
            if ((this.Y.set(i, e), this.ee.set(i, r), s.length > 0)) {
                const e = `Workbox is precaching URLs without revision info: ${s.join(', ')}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`
                console.warn(e)
            }
        }
    }
    install(e) {
        return $(e, async () => {
            const t = new J()
            this.strategy.plugins.push(t)
            for (const [t, s] of this.Y) {
                const n = this.te.get(s),
                    i = this.ee.get(t),
                    r = new Request(t, { integrity: n, cache: i, credentials: 'same-origin' })
                await Promise.all(
                    this.strategy.handleAll({ params: { cacheKey: s }, request: r, event: e })
                )
            }
            const { updatedURLs: s, notUpdatedURLs: n } = t
            return { updatedURLs: s, notUpdatedURLs: n }
        })
    }
    activate(e) {
        return $(e, async () => {
            const e = await self.caches.open(this.strategy.cacheName),
                t = await e.keys(),
                s = new Set(this.Y.values()),
                n = []
            for (const i of t) s.has(i.url) || (await e.delete(i), n.push(i.url))
            return { deletedURLs: n }
        })
    }
    getURLsToCacheKeys() {
        return this.Y
    }
    getCachedURLs() {
        return [...this.Y.keys()]
    }
    getCacheKeyForURL(e) {
        const t = new URL(e, location.href)
        return this.Y.get(t.href)
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
const se = () => (Q || (Q = new te()), Q)
class ne extends n {
    constructor(e, t) {
        super(({ request: s }) => {
            const n = e.getURLsToCacheKeys()
            for (const i of (function* (
                e,
                {
                    ignoreURLParametersMatching: t = [/^utm_/, /^fbclid$/],
                    directoryIndex: s = 'index.html',
                    cleanURLs: n = !0,
                    urlManipulation: i,
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
                if (n) {
                    const e = new URL(a.href)
                    ;((e.pathname += '.html'), yield e.href)
                }
                if (i) {
                    const e = i({ url: r })
                    for (const t of e) yield t.href
                }
            })(s.url, t)) {
                const t = n.get(i)
                if (t) {
                    return { cacheKey: t, integrity: e.getIntegrityForCacheKey(t) }
                }
            }
        }, e.strategy)
    }
}
var ie
;(importScripts('/sw-reading-state.js', '/sw-share-target.js', '/sw-navigation.js'),
    self.skipWaiting(),
    self.addEventListener('activate', () => self.clients.claim()),
    (ie = {}),
    (function (e) {
        se().precache(e)
    })([
        { url: '/build/assets/useToast-CgxITCA8.js', revision: null },
        { url: '/build/assets/useSidebarStore-ChK8O9o0.js', revision: null },
        { url: '/build/assets/useOnlineStatus-Bn9_XpL5.js', revision: null },
        { url: '/build/assets/useDarkMode-BLLMHZrl.js', revision: null },
        { url: '/build/assets/useArticleStore-oUIez41C.js', revision: null },
        { url: '/build/assets/useAddFeedModal-kDpp3crX.js', revision: null },
        { url: '/build/assets/purify.es-J9PU_gBl.js', revision: null },
        { url: '/build/assets/app-DlJZqWT7.js', revision: null },
        { url: '/build/assets/app-CfGLTB_S.css', revision: null },
        { url: '/build/assets/_plugin-vue_export-helper-DlAUqK2U.js', revision: null },
        { url: '/build/assets/Welcome-CnKX8A7G.js', revision: null },
        { url: '/build/assets/VerifyEmail-KmzX1scU.js', revision: null },
        { url: '/build/assets/UpdateProfileInformationForm-D4RauV9K.js', revision: null },
        { url: '/build/assets/UpdatePasswordForm-B1Y9I4eQ.js', revision: null },
        { url: '/build/assets/TextInput-CqmL5rlx.js', revision: null },
        { url: '/build/assets/SettingsView-qbhgbL-k.js', revision: null },
        { url: '/build/assets/SettingsView-B4uaY3NX.css', revision: null },
        { url: '/build/assets/SearchView-CrCCjwGh.css', revision: null },
        { url: '/build/assets/SearchView-CIEGzgJ1.js', revision: null },
        { url: '/build/assets/ResetPassword-prGxlc8S.js', revision: null },
        { url: '/build/assets/Register-VGjURmsK.js', revision: null },
        { url: '/build/assets/PrimaryButton-C56MpfXE.js', revision: null },
        { url: '/build/assets/OpmlImportView-CipUPWGJ.css', revision: null },
        { url: '/build/assets/OpmlImportView-8kerfq_D.js', revision: null },
        { url: '/build/assets/Login-B6MC37W7.js', revision: null },
        { url: '/build/assets/HighlightsView-DkLhVRlv.js', revision: null },
        { url: '/build/assets/HighlightsView-CLICb-f0.css', revision: null },
        { url: '/build/assets/GuestLayout-CzOR98Gt.js', revision: null },
        { url: '/build/assets/ForgotPassword-C0vpoTbb.js', revision: null },
        { url: '/build/assets/FeedManageView-DbFGujvW.css', revision: null },
        { url: '/build/assets/FeedManageView-CCBglEES.js', revision: null },
        { url: '/build/assets/FeedEditView-D8vugbTo.js', revision: null },
        { url: '/build/assets/FeedCreateView-gWCLk5d-.css', revision: null },
        { url: '/build/assets/FeedCreateView-35FCxwXC.js', revision: null },
        { url: '/build/assets/Edit-DzuXk3Gd.js', revision: null },
        { url: '/build/assets/DeleteUserForm-ClVtvcJ-.js', revision: null },
        { url: '/build/assets/ConfirmPassword-6HpIMUw8.js', revision: null },
        { url: '/build/assets/ChatView-ufax9ZqE.js', revision: null },
        { url: '/build/assets/ChatView-CSY4dkmo.css', revision: null },
        { url: '/build/assets/ChatPanel-xRJtcpQZ.css', revision: null },
        { url: '/build/assets/ChatPanel-DpINk8Hc.js', revision: null },
        { url: '/build/assets/ChatConversationView-BW5hVnNk.js', revision: null },
        { url: '/build/assets/ArticleListView-ho1Nesc8.css', revision: null },
        { url: '/build/assets/ArticleListView-D0wjK_Rl.js', revision: null },
        { url: '/build/assets/ArticleDetailView-BUnF9e_-.js', revision: null },
        { url: '/build/assets/ArticleDetailView-B5NIqI-l.css', revision: null },
        { url: '/build/assets/AppShell-Dc1Uu88s.css', revision: null },
        { url: '/build/assets/AppShell-B2fDwWaZ.js', revision: null },
        { url: 'manifest.webmanifest', revision: 'f8a1f2577700595006912f577c4a169f' },
    ]),
    (function (e) {
        const t = se()
        c(new ne(t, e))
    })(ie),
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
        new G({
            cacheName: 'google-fonts-cache',
            plugins: [
                new O({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
                new M({ statuses: [0, 200] }),
            ],
        }),
        'GET'
    ),
    c(
        ({ url: e }) =>
            /\/api\//.test(e.pathname) &&
            !/^\/api\/articles(\/\d+)?$/.test(e.pathname) &&
            !/^\/api\/chat(\/|$)/.test(e.pathname),
        new (class extends K {
            constructor(e = {}) {
                ;(super(e),
                    this.plugins.some(e => 'cacheWillUpdate' in e) || this.plugins.unshift(H),
                    (this.ne = e.networkTimeoutSeconds || 0))
            }
            async G(e, s) {
                const n = [],
                    i = []
                let r
                if (this.ne) {
                    const { id: t, promise: a } = this.ie({ request: e, logs: n, handler: s })
                    ;((r = t), i.push(a))
                }
                const a = this.re({ timeoutId: r, request: e, logs: n, handler: s })
                i.push(a)
                const o = await s.waitUntil(
                    (async () => (await s.waitUntil(Promise.race(i))) || (await a))()
                )
                if (!o) throw new t('no-response', { url: e.url })
                return o
            }
            ie({ request: e, logs: t, handler: s }) {
                let n
                return {
                    promise: new Promise(t => {
                        n = setTimeout(async () => {
                            t(await s.cacheMatch(e))
                        }, 1e3 * this.ne)
                    }),
                    id: n,
                }
            }
            async re({ timeoutId: e, request: t, logs: s, handler: n }) {
                let i, r
                try {
                    r = await n.fetchAndCachePut(t)
                } catch (e) {
                    e instanceof Error && (i = e)
                }
                return (e && clearTimeout(e), (!i && r) || (r = await n.cacheMatch(t)), r)
            }
        })({
            cacheName: 'api-cache',
            networkTimeoutSeconds: 5,
            plugins: [
                new O({ maxEntries: 50, maxAgeSeconds: 86400 }),
                new M({ statuses: [0, 200] }),
            ],
        }),
        'GET'
    ),
    c(
        /\.(?:jpg|jpeg|gif|png|webp|avif|svg)$/i,
        new G({
            cacheName: 'article-images-cache',
            plugins: [
                new O({ maxEntries: 200, maxAgeSeconds: 2592e3 }),
                new M({ statuses: [200] }),
            ],
        }),
        'GET'
    ),
    c(
        /^https?:\/\/.*\.(?:jpg|jpeg|gif|png|webp|avif|svg)(?:\?.*)?$/i,
        new G({
            cacheName: 'external-images-cache',
            plugins: [
                new O({ maxEntries: 300, maxAgeSeconds: 1209600 }),
                new M({ statuses: [200] }),
            ],
        }),
        'GET'
    ),
    c(
        /favicon/i,
        new G({
            cacheName: 'favicon-cache',
            plugins: [
                new O({ maxEntries: 100, maxAgeSeconds: 2592e3 }),
                new M({ statuses: [200] }),
            ],
        }),
        'GET'
    ))
