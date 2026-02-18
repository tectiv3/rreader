# SPA Architecture Overhaul — Design

## Problem

The app uses Inertia.js for page navigation, which owns the page lifecycle. This causes:

- **Lost state on navigation**: article read states, scroll position, and list data are discarded on every Inertia page transition
- **Prev/next mismatch**: backend guesses adjacent articles by replicating frontend filters — but filter logic diverges, so swipe order doesn't match the list
- **Skeleton flash**: every navigation shows an article-list skeleton, even article-to-article transitions
- **No single source of truth**: read/unread state is scattered across Inertia props, a composable, optimistic patches, and backend queries

## Decision

**Approach A: Pinia + Vue Router inside an Inertia shell.**

- Keep Inertia for auth pages (login, register, password reset) — session-based auth stays untouched
- One Inertia "AppShell" page boots Vue Router + Pinia for all app functionality
- Pinia is the single source of truth for articles, sidebar structure, and UI state
- Backend becomes a JSON API; frontend drives all state mutations optimistically

## Architecture

```
Browser hits /articles (or any app route)
    → Laravel catch-all route → Inertia renders AppShell
        → AppShell mounts Vue Router + Pinia
            → Vue Router resolves path → renders view
                → View reads/writes Pinia stores
                    → Stores make API calls to Laravel
```

## Pinia Stores

### useArticleStore

```
State:
  articles: ArticleMeta[]            // ordered array, backend sort preserved
  contentCache: Map<id, ArticleBody> // LRU, max 20 full bodies
  inFlightRequests: Map<id, Promise> // dedup concurrent fetches
  activeView: { type, feedId?, categoryId? }
  loading: boolean

Getters:
  unreadCount          // articles.filter(a => !a.is_read).length
  readLaterCount       // articles.filter(a => a.is_read_later).length
  unreadByFeed         // grouped count per feed_id, drives sidebar badges
  getContent(id)       // content cache lookup
  adjacentIds(id)      // { prev, next } from array index position

Actions:
  fetchArticles(view)       // GET /api/articles — replaces articles array
  fetchContent(id)          // check cache → check in-flight → fetch → cache → evict if >20
  prefetchAdjacent(id)      // fire-and-forget fetchContent for neighbors
  markRead(id)              // set is_read=true → PATCH backend (fire-and-forget)
  markUnread(id)            // set is_read=false → PATCH backend
  toggleReadLater(id)       // flip is_read_later → PATCH backend
  markAllRead(feedId?)      // batch update → PATCH backend
```

### useSidebarStore

```
State:
  categories: Array<{ id, name, sort_order, feeds: Array<{ id, title, favicon_url }> }>
  uncategorizedFeeds: Array<{ id, title, favicon_url }>

Getters:
  (unread counts come from articleStore.unreadByFeed — not duplicated here)

Actions:
  fetchSidebar()     // GET /api/sidebar — structural data only, no counts
```

### useUIStore

```
State:
  sidebarOpen: boolean
  darkMode: 'dark' | 'light' | 'system'
  toasts: Array
```

## Article Content Cache (Leaky Bucket)

Two tiers:

| Tier | Contents | Storage | Size |
|------|----------|---------|------|
| Metadata | id, title, summary, feed, timestamps, read state | Pinia `articles` array | All articles for current view (max ~1000) |
| Full content | HTML body, author, URL | Pinia `contentCache` Map | LRU, max 20 entries |

`fetchContent(id)` is the single entry point:
1. In contentCache? Return it (instant)
2. In inFlightRequests? Return same promise (no duplicate)
3. Otherwise: fetch from API → cache → evict LRU if >20 → return

`prefetchAdjacent(id)` calls `fetchContent(n-1)` and `fetchContent(n+1)` fire-and-forget. No-op if cached or in-flight.

Eviction: never evict the currently viewed article or its immediate neighbors.

## Vue Router

```
/articles                    → ArticleListView
/articles/:id                → ArticleDetailView
/feeds/manage                → FeedManageView
/feeds/:id/edit              → FeedEditView
/settings                    → SettingsView
/articles/search             → SearchView
```

### Key UX behaviors

**ArticleListView:**
- Wrapped in `<keep-alive>` — never re-renders on back navigation
- On mount: if `activeView` doesn't match route params, `fetchArticles()`
- Reads directly from `articleStore.articles`
- Swipe-to-action calls store actions (markRead, toggleReadLater)

**ArticleDetailView:**
- On mount: `fetchContent(id)` + `prefetchAdjacent(id)` + `markRead(id)`
- Metadata renders instantly from store (title, feed, date)
- Content fills in when fetch resolves
- Swipe/arrow keys: `router.replace(/articles/:nextId)` using `adjacentIds(id)`
- Back: `router.back()` → ArticleListView is alive with scroll position intact

## Backend API

All routes behind `auth` middleware.

```
GET    /api/articles?feed_id=&category_id=&filter=   → full metadata list
GET    /api/articles/:id                              → article content (body, author, url)
PATCH  /api/articles/:id                              → update { is_read, is_read_later }
POST   /api/articles/mark-all-read                    → batch mark read
GET    /api/sidebar                                   → categories + feeds structure (no counts)
GET    /api/articles/search?q=                        → search results
```

`GET /api/articles` returns all articles for the view (no pagination). The 1000-article-per-user cap makes this safe (~200-300KB).

`PATCH /api/articles/:id` returns 204. Frontend doesn't need the response.

### Article retention rules

- Max 1000 articles per user across all feeds (purge oldest on feed refresh)
- New feed subscription: import only 10 most recent entries
- Articles older than 1 year: auto-mark as read

## New Feature: Recently Read

A sidebar filter (like Today, Read Later) that shows articles sorted by `read_at` descending. Backend filters by `is_read = true` and orders by `read_at`.

## Migration Phases

### Phase 1: Foundation
- Install Pinia + Vue Router
- Create AppShell.vue Inertia page
- Add catch-all Laravel route
- Set up three Pinia stores (empty)
- Wire up Vue Router with placeholder views

### Phase 2: API endpoints
- Add `/api/*` routes alongside existing Inertia routes (both coexist)
- `GET /api/articles`, `GET /api/articles/:id`, `PATCH /api/articles/:id`, `GET /api/sidebar`
- Article retention logic (1000 cap, 10 on subscribe, 1-year auto-read)

### Phase 3: Article store + list view
- Implement useArticleStore with full metadata fetch, content cache, optimistic mutations
- Build ArticleListView replacing Index.vue
- Wire sidebar counts to computed getters
- Swipe-to-action on list items

### Phase 4: Article detail view
- Build ArticleDetailView replacing Show.vue
- Content fetching with LRU cache + prefetch
- Swipe/keyboard navigation from store array order
- `<keep-alive>` on list view

### Phase 5: Remaining views + cleanup
- Migrate feed management, settings, search to Vue Router views
- Add "Recently Read" sidebar filter
- Remove old Inertia pages and dead composables
- Clean up backend (remove Inertia rendering from ArticleController)

Each phase produces a working app.
