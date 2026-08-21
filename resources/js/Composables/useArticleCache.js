import { readingStateArticleId } from '@/Composables/useReadingState.js'

const DB_NAME = 'rreader'
const DB_VERSION = 2
const STORE_NAME = 'articles'
const LIST_STORE_NAME = 'lists'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

let dbPromise = null

function openDB() {
    if (dbPromise) return dbPromise

    const promise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = event => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                })
                store.createIndex('cachedAt', 'cachedAt')
            }
            // v2: snapshots of the article list per view, so the list still renders
            // offline even when the API response isn't in the service worker cache.
            if (!db.objectStoreNames.contains(LIST_STORE_NAME)) {
                db.createObjectStore(LIST_STORE_NAME, { keyPath: 'key' })
            }
        }

        request.onsuccess = () => {
            const db = request.result
            // The memo lives for the life of the page, so a connection closed out
            // from under us (storage pressure, an upgrade elsewhere) would leave
            // every later transaction throwing InvalidStateError into a silent
            // catch — offline mode off, with nothing to show for it. Drop the memo
            // instead so the next call reopens.
            db.onclose = () => {
                if (dbPromise === promise) dbPromise = null
            }
            db.onversionchange = () => {
                db.close()
                if (dbPromise === promise) dbPromise = null
            }
            resolve(db)
        }
        request.onerror = () => {
            dbPromise = null
            reject(request.error)
        }
        // Another tab still holds the previous version open. Reject rather than hang
        // forever — every caller treats a rejection as a cache miss.
        request.onblocked = () => {
            dbPromise = null
            reject(new Error('IndexedDB upgrade blocked by another tab'))
        }
    })

    dbPromise = promise
    return promise
}

function reqToPromise(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function tx(mode, storeName = STORE_NAME) {
    const db = await openDB()
    return db.transaction(storeName, mode).objectStore(storeName)
}

export async function idbGet(id) {
    try {
        const store = await tx('readonly')
        const record = await reqToPromise(store.get(id))
        return record?.content ?? null
    } catch {
        return null
    }
}

export async function idbPut(id, content) {
    try {
        const store = await tx('readwrite')
        const existing = await reqToPromise(store.get(id))

        const record = {
            id,
            content,
            cachedAt: Date.now(),
            isRead: existing?.isRead ?? false,
            isReadLater: content?.is_read_later ?? existing?.isReadLater ?? false,
            readAt: existing?.readAt ?? null,
        }

        await reqToPromise(store.put(record))
    } catch {
        // Silent failure — cache is best-effort
    }
}

export async function idbMarkRead(id) {
    try {
        const store = await tx('readwrite')
        const record = await reqToPromise(store.get(id))
        if (!record) return

        record.isRead = true
        record.readAt = Date.now()
        await reqToPromise(store.put(record))
    } catch {
        // Silent failure
    }
}

export async function idbUpdateMeta(id, fields) {
    try {
        const store = await tx('readwrite')
        const record = await reqToPromise(store.get(id))
        if (!record?.content) return

        Object.assign(record.content, fields)
        if ('is_read_later' in fields) record.isReadLater = !!fields.is_read_later
        await reqToPromise(store.put(record))
    } catch {
        // Silent failure
    }
}

export async function idbList() {
    try {
        const store = await tx('readonly')
        const keys = await reqToPromise(store.getAllKeys())
        return keys
    } catch {
        return []
    }
}

export async function idbCleanup() {
    await cleanupArticles()
    await cleanupLists()
}

async function cleanupArticles() {
    try {
        const store = await tx('readwrite')
        const cutoff = Date.now() - THIRTY_DAYS
        // The article the app reopens to is what "resume reading" depends on, and
        // opening an article marks it read — which is exactly what this sweep
        // deletes. Without this it would eventually evict the one article the
        // reader is most likely to want back.
        const bookmarked = readingStateArticleId()

        // Use cursor to avoid loading all article content into memory
        await new Promise((resolve, reject) => {
            const req = store.index('cachedAt').openCursor(IDBKeyRange.upperBound(cutoff))
            req.onsuccess = () => {
                const cursor = req.result
                if (!cursor) return resolve()
                if (
                    cursor.value.isRead &&
                    !cursor.value.isReadLater &&
                    cursor.value.id !== bookmarked
                )
                    cursor.delete()
                cursor.continue()
            }
            req.onerror = () => reject(req.error)
        })
    } catch {
        // Silent failure
    }
}

// Snapshots for views the reader hasn't opened in a month (a feed they no longer
// visit, a one-off category) are dead weight. Small store, so a plain scan is fine.
async function cleanupLists() {
    try {
        const store = await tx('readwrite', LIST_STORE_NAME)
        const cutoff = Date.now() - THIRTY_DAYS

        await new Promise((resolve, reject) => {
            const req = store.openCursor()
            req.onsuccess = () => {
                const cursor = req.result
                if (!cursor) return resolve()
                if ((cursor.value.cachedAt ?? 0) < cutoff) cursor.delete()
                cursor.continue()
            }
            req.onerror = () => reject(req.error)
        })
    } catch {
        // Silent failure
    }
}

export async function idbPutList(key, { articles, filterTitle }) {
    try {
        const store = await tx('readwrite', LIST_STORE_NAME)
        await reqToPromise(store.put({ key, articles, filterTitle, cachedAt: Date.now() }))
    } catch {
        // Silent failure — cache is best-effort
    }
}

export async function idbGetList(key) {
    try {
        const store = await tx('readonly', LIST_STORE_NAME)
        const record = await reqToPromise(store.get(key))
        if (!record) return null
        return {
            articles: record.articles ?? [],
            filterTitle: record.filterTitle ?? '',
        }
    } catch {
        return null
    }
}
