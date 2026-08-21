# RReader SPA Architecture Overview

## Tech Stack

- **Backend**: Laravel 12, PHP 8.2+ (running 8.3.6)
- **Frontend**: Vue 3 (Composition API), Pinia 3, Vue Router 4
- **Inertia.js**: v2 (used only for the auth shell and page-bootstrapping, NOT for SPA navigation)
- **Build**: Vite 7 + laravel-vite-plugin + vite-plugin-pwa (Workbox)
- **CSS**: Tailwind CSS v4 + @tailwindcss/typography + @tailwindcss/forms
- **HTTP client**: Axios (frontend), Laravel HTTP facade (backend feed fetching)
- **Feed parsing**: laminas/laminas-feed (via FeedParserService)
- **API auth**: Sanctum (session-based, same-origin stateful SPA, not token-based)
- **DB**: SQLite

---

## The Core Architectural Concept

This app uses a **hybrid Inertia + SPA** pattern:

1. **Auth pages** (login, register, forgot password, etc.) are standard Inertia pages served from `resources/js/Pages/Auth/`. They use `GuestLayout.vue`.
2. **The main app** is a single Inertia page called `AppShell` (`resources/js/Pages/AppShell.vue`) that hosts a full Vue Router SPA. Once `AppShell` loads, all navigation is client-side via Vue Router — no full page reloads, no Inertia navigations.
3. **Vue Router is conditionally installed** — only when the component being rendered is `AppShell` (see `app.js`).
4. **No Ziggy** — all URLs are hardcoded strings. No `route()` helper on the frontend.

This means:
- Inertia handles authentication state and the initial page bootstrap.
- The SPA takes over once authenticated.
- The URL bar is managed by Vue Router (HTML5 history mode), backed by a Laravel catch-all route.

---

## Directory Structure

```
rreader/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                    # JSON API controllers (all SPA traffic)
│   │   │   │   ├── ArticleApiController.php
│   │   │   │   ├── CategoryApiController.php
│   │   │   │   ├── FeedApiController.php
│   │   │   │   ├── HighlightApiController.php
│   │   │   │   ├── OpmlApiController.php
│   │   │   │   ├── SettingsApiController.php
│   │   │   │   └── SidebarApiController.php
│   │   │   ├── Auth/                   # Breeze auth controllers (Inertia)
│   │   │   ├── OpmlController.php      # Used for OPML export (file download)
│   │   │   └── ProfileController.php   # Inertia profile page
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php
│   ├── Jobs/
│   │   ├── FetchFeed.php               # Queued job for fetching feeds
│   │   └── ResolveFavicon.php          # Queued job for favicon resolution
│   ├── Models/
│   │   ├── Article.php
│   │   ├── Category.php
│   │   ├── Feed.php
│   │   ├── Highlight.php              # User text highlights/annotations
│   │   ├── User.php
│   │   └── UserArticle.php             # Pivot model for read state
│   └── Services/
│       ├── BookmarkParserService.php    # Bookmark/URL saving
│       ├── ContentExtractorService.php  # Article content extraction
│       ├── FaviconService.php           # Favicon discovery and caching
│       ├── FeedParserService.php        # Feed discovery and parsing
│       └── OpmlService.php              # OPML import/export
├── resources/
│   ├── js/
│   │   ├── app.js                      # Entry point: SW registration + Inertia bootstrap
│   │   ├── router.js                   # Vue Router (SPA routes)
│   │   ├── Pages/                      # Inertia pages (resolved by Inertia)
│   │   │   ├── AppShell.vue            # THE SPA CONTAINER
│   │   │   ├── Welcome.vue             # Public landing page
│   │   │   ├── Auth/                   # Login, Register, etc.
│   │   │   └── Profile/               # Profile edit (Inertia)
│   │   ├── Views/                      # Vue Router views (SPA pages)
│   │   │   ├── AppLayout.vue           # Main layout wrapping all SPA views
│   │   │   ├── ArticleListView.vue     # /articles (keep-alive cached)
│   │   │   ├── ArticleDetailView.vue   # /articles/:id (mobile full page)
│   │   │   ├── HighlightsView.vue      # /articles/highlights
│   │   │   ├── SearchView.vue          # /articles/search
│   │   │   ├── FeedManageView.vue      # /feeds/manage
│   │   │   ├── FeedCreateView.vue      # /feeds/create
│   │   │   ├── FeedEditView.vue        # /feeds/:id/edit
│   │   │   ├── SettingsView.vue        # /settings
│   │   │   └── OpmlImportView.vue      # /opml/import
│   │   ├── Components/                 # Shared UI components
│   │   │   ├── AddFeedModal.vue
│   │   │   ├── ArticleListErrorState.vue  # Offline/error state for article list
│   │   │   ├── ArticleListSkeleton.vue
│   │   │   ├── SidebarDrawer.vue
│   │   │   ├── ToastContainer.vue
│   │   │   └── (Breeze defaults: Modal, Dropdown, TextInput, etc.)
│   │   ├── Stores/                     # Pinia stores
│   │   │   ├── useArticleStore.js      # Article list, content cache, read state, offline
│   │   │   ├── useSidebarStore.js      # Sidebar data (categories, feeds, counts)
│   │   │   └── useUIStore.js           # UI state (sidebar open/closed)
│   │   ├── Composables/
│   │   │   ├── useAddFeedModal.js      # Module-level singleton for modal state
│   │   │   ├── useArticleCache.js      # IndexedDB article + list cache (two stores)
│   │   │   ├── useDarkMode.js          # Theme management
│   │   │   ├── useOfflineQueue.js      # localStorage queue with merge-on-update
│   │   │   ├── useOnlineStatus.js      # navigator.onLine watcher
│   │   │   ├── useReadingState.js      # Bookmark persistence (localStorage + SW)
│   │   │   └── useToast.js             # Toast notification system
│   │   └── Layouts/
│   │       ├── AuthenticatedLayout.vue # Used by Profile page
│   │       └── GuestLayout.vue         # Used by auth pages
│   └── views/
│       └── app.blade.php               # Single Blade template
├── routes/
│   ├── web.php                         # Web routes including SPA catch-all
│   ├── api.php                         # JSON API routes (auth:sanctum)
│   └── auth.php                        # Breeze auth routes
├── bootstrap/
│   └── app.php                         # Middleware config (statefulApi enabled)
├── public/
│   ├── sw-navigation.js                # SW addon: network-first nav with shell fallback
│   ├── sw-reading-state.js             # SW addon: reading state persistence
│   └── sw-share-target.js              # SW addon: share target handler
└── vite.config.js                      # Vite + PWA (Workbox) configuration
```

---

## Route Structure

### `routes/web.php`

| Route | Handler | Notes |
|---|---|---|
| `GET /sw.js` | Closure | Serves SW from build dir with correct headers |
| `GET /manifest.webmanifest` | Closure | Dynamic manifest generation |
| `GET /` | Inertia `Welcome` | Public landing page |
| `GET /dashboard` | Redirect to `/articles` | Auth + verified |
| auth.php routes | Breeze auth | **Loaded BEFORE catch-all** |
| `GET /profile` | `ProfileController@edit` | Inertia page |
| `PATCH /profile` | `ProfileController@update` | |
| `DELETE /profile` | `ProfileController@destroy` | |
| `GET /opml/export` | `OpmlController@export` | Direct file download |
| `GET /{any}` | Inertia `AppShell` | **SPA catch-all** — must be LAST; excludes `api/` paths |

The catch-all passes `initialSidebar` and `user` as Inertia props for server-side hydration.

**IMPORTANT**: `require auth.php` must come BEFORE the catch-all, otherwise the catch-all
intercepts `/login`, `/register`, etc. and creates redirect loops.

### `routes/api.php`

All routes under `auth:sanctum` middleware (session-based via `$middleware->statefulApi()`):

**Articles**: GET /api/articles, GET /api/articles/search, GET /api/articles/{article}, PATCH /api/articles/{article}, POST /api/articles/mark-all-read, POST /api/articles/save-url
**Sidebar**: GET /api/sidebar
**Feeds**: GET /api/feeds/manage, POST /api/feeds/preview, POST /api/feeds, PUT /api/feeds/{feed}, DELETE /api/feeds/{feed}, POST /api/feeds/{feed}/reenable, POST /api/feeds/{feed}/refresh
**Categories**: POST /api/categories, PUT /api/categories/{id}, DELETE /api/categories/{id}, POST /api/categories/reorder
**Settings**: GET /api/settings, PATCH /api/settings, PATCH /api/settings/account, PATCH /api/settings/password
**OPML**: POST /api/opml/preview, POST /api/opml/import
**Highlights**: GET /api/highlights, POST /api/highlights, PUT /api/highlights/{highlight}, DELETE /api/highlights/{highlight}

### `resources/js/router.js` (Vue Router)

| Path | Name | Component |
|---|---|---|
| `/articles` | `articles.index` | `ArticleListView` |
| `/articles/search` | `articles.search` | `SearchView` |
| `/articles/highlights` | `articles.highlights` | `HighlightsView` |
| `/articles/:id` | `articles.show` | `ArticleDetailView` |
| `/feeds/manage` | `feeds.manage` | `FeedManageView` |
| `/feeds/create` | `feeds.create` | `FeedCreateView` |
| `/feeds/:id/edit` | `feeds.edit` | `FeedEditView` |
| `/settings` | `settings` | `SettingsView` |
| `/opml/import` | `opml.import` | `OpmlImportView` |
| `/highlights` | — | Redirect to `/articles/highlights` |
| `/:pathMatch(.*)` | — | Redirect to `/articles` |

All routes use lazy imports. The catch-all redirects unknown paths to `/articles`.

---

## Frontend Boot Sequence (`app.js`)

1. Registers SW (`/sw.js` — served by Laravel, not from `/build/`), stores Promise in `window.__swReady`
2. Sets up reload-on-controllerchange (skips first install to avoid bouncing first-time visitors)
3. Runs `idbCleanup()` for expired IndexedDB entries
4. Queries reading state from SW via MessageChannel (800ms timeout), falls back to localStorage — if saved URL differs from current, redirects before mounting (avoids flash)
5. Validates bookmark URL is a local path (not `//evil.example.com`)
6. Mounts Inertia via `createInertiaApp`, resolves pages from `./Pages/**/*.vue`
7. **Conditionally mounts Vue Router**: only when `props.initialPage.component === 'AppShell'`
8. Mounts Pinia (always)

---

## AppShell + AppLayout

### `Pages/AppShell.vue`
- Receives `initialSidebar` and `user` props from Laravel
- Calls `sidebarStore.initialize(props.initialSidebar)` for zero-API-call hydration
- Renders `<AppLayout />`

### `Views/AppLayout.vue`
- Offline banner, `<router-view>` wrapped in `<keep-alive include="ArticleListView">`
- `<ToastContainer>`, `<AddFeedModal>`, `<SidebarDrawer>`, bottom nav bar
- Bottom nav hides on scroll-down, shows on scroll-up
- `provide('toggleSidebar', toggleSidebar)` for child views

---

## Pinia Stores

### `useArticleStore` — Article list, content cache, offline, mutations
- **State**: `articles`, `contentCache` (Map), `activeView`, `loading`, `loaded`, `filterTitle`, `hasMore`, `loadingMore`, `nextCursor`, `showingCached`, `loadError`
- **Getters**: `unreadCount`, `readLaterCount`, `unreadByFeed`, `getContent`, `adjacentIds`
- **Actions**: `fetchArticles(view)`, `showAllArticles`, `loadMore`, `fetchContent(id)`, `prefetchAdjacent(id)`, `warmCache`, `cacheReadLater`, `cancelWarmCache`, `markRead(id)`, `markUnread(id)`, `toggleReadLater(id)`, `saveReadingProgress(id, progress)`, `markAllRead`, `dismissArticle`, `forceRefresh`
- All writes are **optimistic** with rollback on failure
- Uses `useOfflineQueue` for offline write persistence

### `useSidebarStore` — Categories, feeds, counts
- `initialize(data)` — hydrates from Inertia prop
- `fetchSidebar()` — refreshes from `/api/sidebar`

### `useUIStore` — Sidebar open/closed state

---

## Offline / PWA Architecture

### Service Worker (Workbox + custom addons)
- **`sw.js`** — Workbox-generated, precaches build assets, imports addons
- **`sw-navigation.js`** — Network-first navigation handler with 5s timeout, shell cache (`navigation-cache`), fallback chain: exact URL → `/articles` → any cached SPA page → offline error page. Clears shell cache on activate (deploy = new asset hashes). Repopulates `/articles` on activate.
- **`sw-reading-state.js`** — Persists reading bookmark in a dedicated SW cache so it survives app restarts and is available before the app boots
- **`sw-share-target.js`** — Web Share Target handler for `/_share-target`

### IndexedDB (`rreader` db, v2)
- **`articles` store** — keyed by article id, holds `{ id, content, cachedAt, isRead, isReadLater, readAt }`. Cleanup evicts read articles older than 30 days but preserves read-later and the bookmarked article.
- **`lists` store** — keyed by view string, holds `{ key, articles, filterTitle, cachedAt }`. Snapshots of article list per view for offline list rendering. Cleaned after 30 days.

### Offline Queue (`useOfflineQueue`)
- localStorage-backed, survives app restarts
- Merge-on-update: repeated PATCHes to the same URL merge instead of appending
- Entry validation (rejects non-local URLs, non-write methods)
- Quota handling: on QuotaExceededError, drops oldest half and retries
- Transient error awareness: retries on 5xx, 408, 419 (expired CSRF), 429

### Reading State (`useReadingState`)
- Dual-write: localStorage + SW cache
- Read on boot: SW first (works offline), localStorage fallback
- Protected from IDB eviction via `readingStateArticleId()`

### Warm Cache
- `warmCache()` — pre-fetches up to 50 unread articles into IDB (first 5 also in-memory for instant taps)
- `cacheReadLater()` — independently ensures all read-later articles are in IDB for offline access

---

## Key Patterns

1. **Optimistic mutations**: Article state changes update Pinia immediately, fire API, rollback on failure
2. **LRU content cache**: Map-based, max 20 entries, reinsert on access
3. **In-flight dedup**: Concurrent `fetchContent` calls for same ID share one Promise
4. **Keep-alive**: Only `ArticleListView` is kept alive (by name match)
5. **Module-level singletons**: `useToast`, `useOnlineStatus`, `useAddFeedModal`, `useDarkMode` store state at module level
6. **Responsive article reading**: Desktop = inline expansion (no route change), Mobile = `ArticleDetailView` navigation
7. **Session-based feed preview**: `POST /api/feeds/preview` stores in PHP session, `POST /api/feeds` reads from session
8. **Dual-use sidebar data**: `SidebarApiController::buildSidebarData($user)` is static, used by both API and catch-all route
9. **Sanctum stateful API**: `$middleware->statefulApi()` in bootstrap/app.php enables session auth for API routes
10. **Cursor-based pagination**: Article list uses cursor pagination with `loadMore`

---

## Data Models

```
User → hasMany Category, Feed; belongsToMany Article (via user_articles)
Category → belongsTo User; hasMany Feed (category_id nullable, sort_order for reordering)
Feed → belongsTo User, Category; hasMany Article
Article → belongsTo Feed; belongsToMany User (pivot: is_read, is_read_later, read_at, reading_progress)
Highlight → belongsTo User, Article (user text highlights/annotations)
```

Articles are shared across users. Per-user state lives in `user_articles` pivot.
Feed has health tracking: `consecutive_failures`, `disabled_at`, exponential back-off.