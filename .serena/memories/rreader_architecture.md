# RReader SPA Architecture Overview (spa-overhaul branch)

## Tech Stack

- **Backend**: Laravel 11, PHP
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
spa-overhaul/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/                    # JSON API controllers (all SPA traffic)
│   │   │   │   ├── ArticleApiController.php
│   │   │   │   ├── CategoryApiController.php
│   │   │   │   ├── FeedApiController.php
│   │   │   │   ├── OpmlApiController.php
│   │   │   │   ├── SettingsApiController.php
│   │   │   │   └── SidebarApiController.php
│   │   │   ├── Auth/                   # Breeze auth controllers (Inertia)
│   │   │   ├── OpmlController.php      # Used for OPML export (file download)
│   │   │   └── ProfileController.php   # Inertia profile page
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php
│   ├── Jobs/
│   │   └── FetchFeed.php               # Queued job for fetching feeds
│   ├── Models/
│   │   ├── Article.php
│   │   ├── Category.php
│   │   ├── Feed.php
│   │   ├── User.php
│   │   └── UserArticle.php             # Pivot model for read state
│   └── Services/
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
│   │   │   ├── FeedManageView.vue      # /feeds/manage
│   │   │   ├── FeedCreateView.vue      # /feeds/create
│   │   │   ├── FeedEditView.vue        # /feeds/:id/edit
│   │   │   ├── SettingsView.vue        # /settings
│   │   │   ├── SearchView.vue          # /articles/search
│   │   │   └── OpmlImportView.vue      # /opml/import
│   │   ├── Components/                 # Shared UI components
│   │   │   ├── AddFeedModal.vue
│   │   │   ├── SidebarDrawer.vue
│   │   │   ├── ToastContainer.vue
│   │   │   └── ArticleListSkeleton.vue
│   │   ├── Stores/                     # Pinia stores
│   │   │   ├── useArticleStore.js      # Article list, content cache, read state
│   │   │   ├── useSidebarStore.js      # Sidebar data (categories, feeds, counts)
│   │   │   └── useUIStore.js           # UI state (sidebar open/closed)
│   │   ├── Composables/
│   │   │   ├── useAddFeedModal.js      # Module-level singleton for modal state
│   │   │   ├── useDarkMode.js          # Theme management
│   │   │   ├── useOfflineQueue.js      # localStorage queue for offline actions
│   │   │   ├── useOnlineStatus.js      # navigator.onLine watcher
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
│   └── sw-reading-state.js             # SW addon for reading state persistence
└── vite.config.js                      # Vite + PWA (Workbox) configuration
```

---

## Route Structure

### `routes/web.php`

| Route | Handler | Notes |
|---|---|---|
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

**Articles**: GET /api/articles, GET /api/articles/search, GET /api/articles/{id}, PATCH /api/articles/{id}, POST /api/articles/mark-all-read
**Sidebar**: GET /api/sidebar
**Feeds**: POST /api/feeds/preview, POST /api/feeds, PUT /api/feeds/{id}, DELETE /api/feeds/{id}, POST /api/feeds/{id}/reenable
**Categories**: POST /api/categories, PUT /api/categories/{id}, DELETE /api/categories/{id}, POST /api/categories/reorder
**Settings**: GET /api/settings, PATCH /api/settings, PATCH /api/settings/account, PATCH /api/settings/password
**OPML**: POST /api/opml/preview, POST /api/opml/import

### `resources/js/router.js` (Vue Router)

| Path | Name | Component |
|---|---|---|
| `/articles` | `articles.index` | `ArticleListView` |
| `/articles/search` | `articles.search` | `SearchView` |
| `/articles/:id` | `articles.show` | `ArticleDetailView` |
| `/feeds/manage` | `feeds.manage` | `FeedManageView` |
| `/feeds/create` | `feeds.create` | `FeedCreateView` |
| `/feeds/:id/edit` | `feeds.edit` | `FeedEditView` |
| `/settings` | `settings` | `SettingsView` |
| `/opml/import` | `opml.import` | `OpmlImportView` |
| `/:pathMatch(.*)` | — | Redirect to `/articles` |

All routes use lazy imports. The catch-all redirects unknown paths to `/articles`.

---

## Frontend Boot Sequence (`app.js`)

1. Registers SW (`/build/sw.js`), stores Promise in `window.__swReady`
2. Queries reading state from SW via MessageChannel — if saved URL differs, redirects before mounting (avoids flash)
3. Mounts Inertia via `createInertiaApp`, resolves pages from `./Pages/**/*.vue`
4. **Conditionally mounts Vue Router**: only when `props.initialPage.component === 'AppShell'`
5. Mounts Pinia (always)

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

### `useArticleStore` — Article list, content cache, mutations
- `articles` — flat array of article metadata (no content)
- `contentCache` — `Map<id, content>`, LRU max 20 entries
- `inFlightRequests` — dedup concurrent fetch calls
- Actions: `fetchArticles(view)`, `fetchContent(id)`, `prefetchAdjacent(id)`, `markRead(id)`, `markUnread(id)`, `toggleReadLater(id)`, `markAllRead(feedId?)`
- All writes are **optimistic** with rollback on failure

### `useSidebarStore` — Categories, feeds, counts
- `initialize(data)` — hydrates from Inertia prop
- `fetchSidebar()` — refreshes from `/api/sidebar`

### `useUIStore` — Sidebar open/closed state

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

---

## Data Models

```
User → hasMany Category, Feed; belongsToMany Article (via user_articles)
Category → belongsTo User; hasMany Feed (category_id nullable, sort_order for reordering)
Feed → belongsTo User, Category; hasMany Article
Article → belongsTo Feed; belongsToMany User (pivot: is_read, is_read_later, read_at)
```

Articles are shared across users. Per-user state lives in `user_articles` pivot.
Feed has health tracking: `consecutive_failures`, `disabled_at`, exponential back-off.
