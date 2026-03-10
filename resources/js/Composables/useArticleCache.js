const DB_NAME = 'rreader'
const DB_VERSION = 1
const STORE_NAME = 'articles'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

let dbPromise = null

function openDB() {
    if (dbPromise) return dbPromise

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = event => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                })
                store.createIndex('cachedAt', 'cachedAt')
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => {
            dbPromise = null
            reject(request.error)
        }
    })

    return dbPromise
}

function reqToPromise(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function tx(mode) {
    const db = await openDB()
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
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
    try {
        const store = await tx('readwrite')
        const cutoff = Date.now() - THIRTY_DAYS

        // Use cursor to avoid loading all article content into memory
        await new Promise((resolve, reject) => {
            const req = store.index('cachedAt').openCursor(IDBKeyRange.upperBound(cutoff))
            req.onsuccess = () => {
                const cursor = req.result
                if (!cursor) return resolve()
                if (cursor.value.isRead) cursor.delete()
                cursor.continue()
            }
            req.onerror = () => reject(req.error)
        })
    } catch {
        // Silent failure
    }
}
