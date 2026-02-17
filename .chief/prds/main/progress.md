## Codebase Patterns
- Tailwind v4 with `@tailwindcss/vite` plugin (no tailwind.config.js, use CSS-based config in `resources/css/app.css`)
- Dark mode via `class` strategy: `@variant dark (&:where(.dark, .dark *));` in CSS
- Dark mode composable at `resources/js/Composables/useDarkMode.js` — uses localStorage
- `AppLayout.vue` is the main app layout (mobile-first, dark mode); `AuthenticatedLayout.vue` is Breeze's updated layout
- PWA via `vite-plugin-pwa` configured in `vite.config.js`
- App name is "RReader" (set in `.env` and PWA manifest)
- `@vitejs/plugin-vue` v6 required for Vite 7 compatibility
- Breeze Vue scaffolding provides auth pages under `resources/js/Pages/Auth/`
- Use `slate-950` for backgrounds, `slate-900` for cards/surfaces, `slate-800` for borders, `blue-500` for primary accent
- Use `text-base` on form inputs for mobile (prevents iOS auto-zoom on focus)
- Use `focus:ring-offset-slate-900` on dark backgrounds for proper focus ring visibility
- Breeze components default to light theme — always replace gray/indigo with slate/blue palette
- Database is SQLite with foreign keys enabled
- Use `text()` for URL columns in migrations (URLs can exceed 255 chars)
- `foreignId()->constrained()` already creates an index — don't add redundant `$table->index()` on FK columns
- Use composite indexes for boolean filters (e.g. `['user_id', 'is_read']` not just `'is_read'`)
- `laminas/laminas-feed` for RSS/Atom parsing — `FeedReader::importString($xml)` to parse feed content
- Services go in `app/Services/` — inject via controller method parameters (Laravel auto-resolves)
- Feed-related routes: `feeds.create` (GET), `feeds.preview` (POST), `feeds.store` (POST)
- Use `Http::timeout(15)->withUserAgent('RReader/1.0')` for external HTTP requests
- Queued jobs go in `app/Jobs/` — use `$tries`, `$backoff` array for retry with exponential backoff
- Artisan commands go in `app/Console/Commands/` — schedule in `routes/console.php` using `Schedule::command()`
- Manual refresh endpoint at `POST /feeds/refresh` accepts optional `feed_ids` array, defaults to all user feeds
- Article filtering: `ArticleController::index()` accepts `feed_id`, `category_id`, `filter` query params
- Sidebar data served from `ArticleController::getSidebarData()` — categories, feeds, unread counts per feed
- Use local `ref()` copies for paginated Inertia data to avoid mutating readonly props during infinite scroll
- Use `window.open(url, '_blank', 'noopener,noreferrer')` with URL protocol validation for external links
- Category expand/collapse: separate toggle button (with `aria-expanded`) from category navigation button for accessibility
- `chunkById()` for bulk operations like markAllAsRead to avoid memory issues at scale
- Use `provide/inject` to communicate between page components and layout components (slots don't support events)
- Bottom nav in `AppLayout.vue` (mobile only, `lg:hidden`); main content needs `pb-16 lg:pb-0` to avoid overlap
- `usePage().props` gives access to Inertia shared props from any component (useful for active-state in nav)
- Feed/category management page at `/feeds/manage` — `FeedController@manage` renders categories + uncategorized feeds
- `CategoryController` handles CRUD + reorder; ownership verified via `user_id` check + `abort(404)`
- OPML import uses session storage for parsed data (don't trust client-submitted parsed OPML)
- `OpmlService` handles parse/import/export; `OpmlController` at `/opml/*` routes
- Use `simplexml_load_string()` for OPML parsing (lighter than laminas-feed for non-RSS XML)
- Always `libxml_clear_errors()` and restore `libxml_use_internal_errors()` state after XML parsing
- Sanitize URLs from OPML attributes — reject non-http(s) schemes to prevent XSS via `javascript:` URIs
- Use `watch(() => props.preview, ..., { immediate: true })` to re-init selection state when Inertia props change
- User preferences stored as JSON column on users table — `$casts => 'array'`, direct assignment (not in `$fillable`)
- `useDarkMode` composable supports 3 modes: `dark`, `light`, `system` — stored in localStorage as `rreader-theme`
- Settings routes: `settings.index` (GET), `settings.update` (PATCH), `settings.updateAccount` (PATCH), `settings.updatePassword` (PATCH)
- Reuse existing Breeze auth routes (e.g. `route('logout')`) instead of duplicating auth logic

---

## 2026-02-17 - US-001
- What was implemented: Project scaffolding with Laravel 11 + Inertia.js + Vue 3, Tailwind CSS v4 with dark mode (class strategy), PWA manifest and service worker via vite-plugin-pwa, base AppLayout component with mobile-first responsive design and dark mode toggle
- Files changed:
  - `composer.json` / `package.json` — project dependencies
  - `vite.config.js` — Vite config with Laravel, Vue, Tailwind v4, and PWA plugins
  - `resources/css/app.css` — Tailwind v4 CSS config with dark mode variant
  - `resources/js/app.js` — Inertia app setup with service worker registration
  - `resources/views/app.blade.php` — Blade template with PWA meta tags, dark class on html
  - `resources/js/Layouts/AppLayout.vue` — New mobile-first dark mode layout
  - `resources/js/Layouts/AuthenticatedLayout.vue` — Updated Breeze layout for dark mode
  - `resources/js/Layouts/GuestLayout.vue` — Updated Breeze guest layout for dark mode
  - `resources/js/Composables/useDarkMode.js` — Dark mode composable with localStorage persistence
  - `resources/js/Pages/Dashboard.vue` — Updated to use AppLayout
  - `public/icons/` — PWA icons (192x192, 512x512)
  - `.env` / `.env.example` — APP_NAME set to RReader
- **Learnings for future iterations:**
  - Breeze scaffolds Tailwind v3 config even when `@tailwindcss/vite` v4 is in package.json — must delete `tailwind.config.js` and `postcss.config.js` and use CSS-based config
  - `@vitejs/plugin-vue@5` is incompatible with Vite 7, need v6
  - `imagefilledroundedrectangle()` doesn't exist in all PHP GD versions — use `imagefilledrectangle()` instead
  - The `postcss` and `autoprefixer` packages in package.json are not needed with Tailwind v4 vite plugin but were left to avoid breaking anything
---

## 2026-02-17 - US-002
- What was implemented: Dark-themed, mobile-first authentication pages (Login, Register, Forgot Password, Verify Email, Confirm Password). Updated all Breeze UI components (TextInput, PrimaryButton, InputLabel, InputError, Checkbox) for dark theme with proper slate/blue color scheme. Replaced default Laravel Welcome page with minimal RReader landing page. All auth flows work with proper dark styling, large touch targets, and full-width buttons.
- Files changed:
  - `resources/js/Components/TextInput.vue` — Dark bg/border/text colors (slate-800/700/100), blue focus ring
  - `resources/js/Components/PrimaryButton.vue` — Blue-600 bg, py-3 for larger touch target, justify-center
  - `resources/js/Components/InputLabel.vue` — text-slate-300 for dark readability
  - `resources/js/Components/InputError.vue` — text-red-400 for dark contrast
  - `resources/js/Components/Checkbox.vue` — Dark bg/border, blue-500 check color
  - `resources/js/Pages/Auth/Login.vue` — Full-width button, dark link colors, "Create an account" link, text-base inputs
  - `resources/js/Pages/Auth/Register.vue` — Full-width button, dark link colors, centered "Already registered?" link
  - `resources/js/Pages/Auth/ForgotPassword.vue` — Dark text colors (slate-400, green-400)
  - `resources/js/Pages/Auth/ConfirmPassword.vue` — Dark text colors
  - `resources/js/Pages/Auth/VerifyEmail.vue` — Dark text/link colors, blue focus rings
  - `resources/js/Pages/Welcome.vue` — Replaced Laravel default with minimal RReader landing (logo, login/register buttons)
  - `routes/web.php` — Removed unused Application import and version props
- **Learnings for future iterations:**
  - Breeze components use light-theme colors by default (gray-300, gray-600, gray-700, indigo-500) — must replace all with dark palette (slate-700, slate-400, slate-300, blue-500)
  - Use `text-base` on inputs for mobile to prevent iOS auto-zoom on focus (16px minimum)
  - Use `focus:ring-offset-slate-900` on dark backgrounds so focus rings look correct
  - GuestLayout was already dark-themed from US-001, so auth pages just needed component and page-level color fixes
---

## 2026-02-17 - US-003
- What was implemented: Core database schema and Eloquent models for categories, feeds, articles, and user_articles pivot table. All migrations with proper foreign keys, cascading deletes, and optimized indexes. Models with full relationship definitions (User hasMany Categories/Feeds, Feed belongsTo Category, Feed hasMany Articles, User belongsToMany Articles via pivot).
- Files changed:
  - `database/migrations/2026_02_17_000001_create_categories_table.php` — categories table (id, user_id FK, name, sort_order)
  - `database/migrations/2026_02_17_000002_create_feeds_table.php` — feeds table (id, user_id FK, category_id nullable FK, title, feed_url, site_url, description, favicon_url, last_fetched_at)
  - `database/migrations/2026_02_17_000003_create_articles_table.php` — articles table (id, feed_id FK, guid unique per feed, title, author, content, summary, url, image_url, published_at)
  - `database/migrations/2026_02_17_000004_create_user_articles_table.php` — user_articles pivot (user_id, article_id, is_read, is_read_later, read_at)
  - `app/Models/Category.php` — Category model with user/feeds relationships
  - `app/Models/Feed.php` — Feed model with user/category/articles relationships
  - `app/Models/Article.php` — Article model with feed/users relationships
  - `app/Models/UserArticle.php` — UserArticle pivot model with user/article relationships
  - `app/Models/User.php` — Added categories(), feeds(), articles() relationships
- **Learnings for future iterations:**
  - `foreignId()->constrained()` automatically creates an index on the FK column — no need for additional `$table->index()`
  - Use `text()` instead of `string()` for URL columns — real-world URLs often exceed 255 characters
  - Boolean column indexes alone have near-zero selectivity — use composite indexes like `['user_id', 'is_read']`
  - SQLite handles `cascadeOnDelete()` and `nullOnDelete()` correctly with foreign keys enabled
---

## 2026-02-17 - US-004
- What was implemented: Feed subscription feature — users can add RSS/Atom feeds by URL with auto-discovery, preview feed details before subscribing, optionally assign categories (existing or new), and initial articles are fetched and stored on subscription.
- Files changed:
  - `app/Services/FeedParserService.php` — New service for RSS/Atom feed parsing using laminas/laminas-feed, with auto-discovery from HTML pages, URL normalization, and article extraction
  - `app/Http/Controllers/FeedController.php` — New controller with create (form), preview (discover + validate), and store (subscribe + fetch articles) actions
  - `resources/js/Pages/Feeds/Create.vue` — New Add Feed page with URL input, loading states, feed preview card, category selection (existing or new), dark-themed mobile-first design
  - `routes/web.php` — Added authenticated routes: GET /feeds/create, POST /feeds/preview, POST /feeds
  - `composer.json` — Added laminas/laminas-feed dependency for RSS/Atom parsing
- **Learnings for future iterations:**
  - `laminas/laminas-feed` is the go-to PHP library for RSS/Atom parsing — use `FeedReader::importString()` for parsing XML content
  - Feed auto-discovery works by looking for `<link>` tags with `type="application/rss+xml"` or `application/atom+xml` in HTML pages
  - Author data from laminas-feed returns an ArrayObject — use `$entry->getAuthor()?->offsetGet('name')` to get the name string
  - Always normalize URLs by prepending `https://` if no scheme is present
  - Use `Http::timeout(15)->withUserAgent('RReader/1.0')` for external feed fetching to be a good citizen
  - Inertia's `useForm().post()` with `preserveScroll: true` keeps the page position during preview requests
---

## 2026-02-17 - US-005
- What was implemented: Background feed fetching system — queued `FetchFeed` job with retry logic (3 retries, exponential backoff at 60s/300s/900s), `FetchAllFeeds` artisan command dispatching jobs for all feeds, scheduled every 30 minutes via `routes/console.php`, manual refresh endpoint (`POST /feeds/refresh`) supporting all feeds or specific feed IDs, and a refresh button on the Dashboard page.
- Files changed:
  - `app/Jobs/FetchFeed.php` — New queued job: fetches feed via FeedParserService, inserts new articles (skips by guid), updates feed metadata (title, favicon) if changed, updates last_fetched_at
  - `app/Console/Commands/FetchAllFeeds.php` — New artisan command `feeds:fetch-all` dispatching FetchFeed for every feed
  - `routes/console.php` — Registered `feeds:fetch-all` to run every 30 minutes
  - `app/Http/Controllers/FeedController.php` — Added `refresh()` method and `FetchFeed` import
  - `routes/web.php` — Added `POST /feeds/refresh` route
  - `resources/js/Pages/Dashboard.vue` — Added refresh button with loading state
- **Learnings for future iterations:**
  - Laravel 11 uses `routes/console.php` with `Schedule` facade for scheduling (no more `app/Console/Kernel.php`)
  - Use `$backoff` as an array property on jobs for custom exponential backoff intervals (e.g. `[60, 300, 900]`)
  - `FeedParserService::discoverAndParse()` is reusable for both initial subscription and background fetching
  - Check existing guids via `pluck('guid')->toArray()` before inserting to avoid duplicates efficiently
  - The manual refresh endpoint dispatches jobs (async) rather than fetching synchronously for better UX
---

## 2026-02-17 - US-006
- What was implemented: Article list view with date-grouped articles ("Today", "Yesterday", date labels), mobile card layout and desktop compact single-line layout, unread count badge in header, mark-all-as-read action, mark-as-read on article tap, infinite scroll pagination via IntersectionObserver, empty state with "Add a Feed" CTA, refresh feeds button. Dashboard now redirects to articles page.
- Files changed:
  - `app/Http/Controllers/ArticleController.php` — New controller with index (paginated articles with feed eager loading + left join for read state), markAsRead (batch), markAllAsRead actions
  - `resources/js/Pages/Articles/Index.vue` — Article list page with mobile card view (thumbnail, title, feed name, time ago) and desktop compact view (single-line rows), date section grouping, infinite scroll sentinel, empty state
  - `routes/web.php` — Added ArticleController import, article routes (GET /articles, POST /articles/mark-read, POST /articles/mark-all-read), dashboard redirect to articles.index
- **Learnings for future iterations:**
  - Use `leftJoin` on user_articles to get is_read/is_read_later in a single query rather than N+1 pivot queries
  - `whereDoesntHave` is clean for counting unread articles (articles where no user_articles row with is_read=true exists)
  - `syncWithoutDetaching` is ideal for upsert-style pivot operations (creates row if not exists, updates if exists)
  - IntersectionObserver with `rootMargin: '200px'` provides smooth infinite scroll by triggering before the sentinel is visible
  - Use `ref` callback pattern (`:ref="onSentinel"`) for dynamic IntersectionObserver target binding in Vue
  - Inertia `preserveState: true` with manual data merge is needed for infinite scroll (otherwise page reload resets to page 1)
  - Desktop compact view uses `lg:hidden` / `hidden lg:block` to switch between mobile card and desktop single-line layouts
---

## 2026-02-17 - US-007
- What was implemented: Sidebar navigation drawer with slide-out animation from left side. Includes "Today" and "Read Later" smart filters, "All Feeds" with total unread badge, categories with expand/collapse chevron and unread counts, individual feeds with favicon and per-feed unread counts. Tapping a category or feed filters the article list. ArticleController updated with feed_id/category_id/filter query params. markAllAsRead respects active filters. Empty category handling (shows empty, not all feeds).
- Files changed:
  - `app/Http/Controllers/ArticleController.php` — Added getSidebarData() method, filtering by feed_id/category_id/filter query params, markAllAsRead respects filters and uses chunkById
  - `resources/js/Components/SidebarDrawer.vue` — New sidebar drawer component with slide animation, smart filters (Today, Read Later), category expand/collapse with aria-expanded, feed listing with favicons and unread counts, Inertia Link for Add Feed
  - `resources/js/Pages/Articles/Index.vue` — Integrated sidebar, hamburger menu button, local ref for article data (no prop mutation), filter context passed to markAllAsRead, safe window.open with URL validation, IntersectionObserver cleanup on unmount
- **Learnings for future iterations:**
  - Never mutate Inertia props directly — use local `ref()` copies for data that gets modified (e.g. infinite scroll appending)
  - Separate toggle and navigation into distinct buttons for accessibility — a `<span @click.stop>` inside a `<button>` is not keyboard-accessible
  - Use `chunkById()` for bulk operations to avoid loading all IDs into memory
  - `todayCount` in sidebar should count unread articles only (consistent with other badges)
  - Always validate URL protocol before `window.open()` — RSS feeds can contain `javascript:` URIs
  - Use Inertia `<Link>` instead of `<a :href>` for internal navigation to avoid full page reloads
  - Clean up IntersectionObserver in `onUnmounted()` and when sentinel element is removed from DOM
---

## 2026-02-17 - US-008
- What was implemented: Individual article view with full-screen reading experience. Article content rendered with clean typography using Tailwind Typography plugin (`prose prose-invert`). Header shows feed name with back button. Actions: Save/Remove from Read Later (bookmark toggle), Mark as Unread, Open in Browser (with URL validation), Share (native Web Share API with clipboard fallback). Article list now navigates to article view (via Inertia routing) instead of opening external browser. Article is automatically marked as read on view.
- Files changed:
  - `resources/js/Pages/Articles/Show.vue` — New article view page with rendered HTML content, article metadata, action buttons (read later, mark unread, open in browser, share), back navigation, responsive layout
  - `app/Http/Controllers/ArticleController.php` — Added `show()` (renders article, marks as read), `toggleReadLater()` (toggles bookmark), `markAsUnread()` (returns article to unread state)
  - `routes/web.php` — Added GET `/articles/{article}`, POST `/articles/{article}/toggle-read-later`, POST `/articles/{article}/mark-unread`
  - `resources/js/Pages/Articles/Index.vue` — Updated `openArticle()` to navigate to article show page via `router.visit()` instead of opening external URL
  - `resources/css/app.css` — Added `@tailwindcss/typography` plugin for prose classes
  - `package.json` / `package-lock.json` — Added `@tailwindcss/typography` dependency
- **Learnings for future iterations:**
  - Use `@tailwindcss/typography` plugin with `@plugin` directive in CSS for Tailwind v4 (not JS config)
  - `prose-invert` is essential for dark mode article content — pair with `prose-headings:text-slate-200`, `prose-a:text-blue-400` etc.
  - `syncWithoutDetaching` works for both creating and updating pivot records — ideal for toggle operations
  - `navigator.share()` is available on mobile browsers; fall back to `navigator.clipboard.writeText()` on desktop
  - Article show route uses Laravel route model binding (`Article $article`) — ensure user owns the feed via `$user->feeds()->pluck('feeds.id')->contains($article->feed_id)`
  - `window.history.back()` preserves scroll position in the article list automatically (browser behavior)
---

## 2026-02-17 - US-009
- What was implemented: Read Later section — already had backend filtering (`filter=read_later`), sidebar link with badge, empty state, and article view toggle from previous stories. Added: swipe-to-remove gesture on mobile article cards in Read Later view (left swipe reveals red "Remove" background, optimistic UI removal), and a bottom navigation bar (mobile only, hidden on desktop via `lg:hidden`) with Menu (sidebar toggle), Read Later (bookmark), Feeds (all feeds), and Add Feed shortcuts. Bottom nav uses `provide/inject` pattern to communicate sidebar toggle from Index.vue to AppLayout.
- Files changed:
  - `resources/js/Layouts/AppLayout.vue` — Added mobile bottom navigation bar with 4 items (Menu, Read Later, Feeds, Add), active state highlighting, safe-area padding, hidden on desktop. Uses `inject('toggleSidebar')` for sidebar button. Main content `pb-16 lg:pb-0` to avoid overlap.
  - `resources/js/Pages/Articles/Index.vue` — Added swipe-to-remove for Read Later view: touch event handlers (`onTouchStart/Move/End`), swipe state tracking, red reveal background with "Remove" label, optimistic removal via `allArticles.value.filter()` + async `toggleReadLater` POST. Added `provide('toggleSidebar')` for bottom nav. Mobile card wrapped in `overflow-hidden` container for swipe clipping.
  - `.chief/prds/main/prd.json` — Marked US-009 as passes: true
- **Learnings for future iterations:**
  - Most Read Later functionality was already built incrementally by US-006/007/008 — the controller filter, sidebar link, empty state, and article view toggle were all in place
  - Use `provide/inject` to communicate between page components and layout components (slots don't support events easily)
  - Swipe gesture: track `startX` on touchstart, compute deltaX on touchmove, threshold check on touchend. Cap swipe distance with `Math.max(deltaX, -200)` to prevent over-swiping
  - Optimistic UI removal: filter local `ref()` array immediately, then POST to server. No need to wait for response in swipe-to-remove scenarios
  - Bottom nav `pb-safe` class handles iPhone home indicator safe area; main content needs `pb-16` to avoid being hidden behind the fixed bottom bar
  - `usePage().props` gives access to Inertia shared props from any component — useful for active state in bottom nav
---

## 2026-02-17 - US-010
- What was implemented: Feed & Category Management — full CRUD for categories (create, rename, delete with feed migration, reorder via up/down controls) and feeds (rename/override title, move between categories, unsubscribe with confirmation dialog). Dedicated management page at `/feeds/manage` accessible via "Edit" button in sidebar drawer header. Dark-themed, mobile-first design consistent with existing app patterns.
- Files changed:
  - `app/Http/Controllers/CategoryController.php` — New controller with store (create), update (rename), destroy (delete with optional feed migration), reorder (sort_order update) actions
  - `app/Http/Controllers/FeedController.php` — Added manage() (renders management page with categories + uncategorized feeds), update() (rename title + move category), destroy() (unsubscribe/delete feed)
  - `resources/js/Pages/Feeds/Manage.vue` — New management page with category sections (reorder up/down, rename inline, delete with move-feeds dialog), feed cards (rename inline, move via category dropdown, unsubscribe with confirmation), create new category form, empty state
  - `resources/js/Components/SidebarDrawer.vue` — Added "Edit" button in drawer header linking to feeds.manage route
  - `routes/web.php` — Added CategoryController import, routes: GET /feeds/manage, PUT /feeds/{feed}, DELETE /feeds/{feed}, POST /categories, PUT /categories/{category}, DELETE /categories/{category}, POST /categories/reorder
  - `.chief/prds/main/prd.json` — Marked US-010 as passes: true
- **Learnings for future iterations:**
  - Use dedicated management pages for complex CRUD rather than overloading sidebar with edit mode — keeps sidebar simple and management UI spacious
  - `router.delete()` in Inertia needs `data` option for request body (e.g., `{ data: { move_to_category_id: ... } }`)
  - Category reorder via up/down buttons is simpler and more accessible than drag-and-drop — use array swap + POST new order
  - Verify category/feed ownership with `user_id` check before allowing mutations — abort(404) for unauthorized access
  - Use `preserveScroll: true` on all CRUD operations so user doesn't lose position on the page
  - Inline editing (rename) with Escape key to cancel provides fast, non-disruptive UX
---

## 2026-02-17 - US-011
- What was implemented: OPML Import & Export — file upload with .opml/.xml support, XML parsing with `simplexml_load_string()`, preview of feeds with duplicate detection, selectable feeds with select-all toggle, session-based data storage for secure import, category mapping from OPML folder outlines, nested category flattening, export as OPML 2.0 with XMLWriter. Dark-themed mobile-first UI consistent with existing pages.
- Files changed:
  - `app/Services/OpmlService.php` — New service: parse OPML XML (categories + uncategorized feeds, nested flattening), import feeds with duplicate skip + category find-or-create, export user subscriptions as OPML 2.0 XML. URL scheme validation, libxml error cleanup, title/name truncation.
  - `app/Http/Controllers/OpmlController.php` — New controller: index (render import page), preview (upload + parse + session store + duplicate marking), import (read from session + import + dispatch FetchFeed for new feeds), export (download OPML file).
  - `resources/js/Pages/Opml/Import.vue` — New page: file upload with drag-style label, preview with categories/uncategorized sections, per-feed checkboxes with duplicate marking (strikethrough + "subscribed" label), select-all toggle, import button with count, export download button. Uses `watch` for reactive selection state.
  - `routes/web.php` — Added OpmlController import, routes: GET /opml/import, POST /opml/preview, POST /opml/import, GET /opml/export
- **Learnings for future iterations:**
  - Store parsed OPML in session rather than sending back to client and trusting re-submitted data — prevents fabricated import requests
  - `simplexml_load_string()` is sufficient for OPML parsing (no need for laminas-feed which is for RSS/Atom)
  - Always wrap `libxml_use_internal_errors(true)` in try/finally with `libxml_clear_errors()` and state restore
  - Sanitize all URLs from OPML attributes — reject non-http(s) schemes to prevent XSS via `javascript:` or `data:` URIs
  - Use `watch(() => props.preview, ..., { immediate: true })` instead of one-time `if` block for selection init — handles re-uploads
  - Use `uploadForm.processing` from Inertia's `useForm` instead of manual `isUploading` ref — single source of truth
  - `mimetypes:text/xml,application/xml,text/plain,text/x-opml` validation is more reliable than file extension check alone
  - Scope `FetchFeed` dispatch to `whereIn('feed_url', $selectedUrls)` to avoid re-dispatching for previously failed feeds
---

## 2026-02-17 - US-012
- What was implemented: Settings screen with all sections — Appearance (Dark/Light/System theme toggle), Reading (article view mode, font size), Feeds (refresh interval, mark-as-read-on-scroll toggle), Account (name/email update), Password change, Data (Import/Export OPML links), About (version, source code link), and Logout button. Settings persisted per-user via JSON `settings` column on users table. Updated `useDarkMode` composable to support 3-mode theme (dark/light/system) with system media query listener and proper cleanup. Settings accessible from both bottom nav and sidebar drawer.
- Files changed:
  - `database/migrations/2026_02_17_140359_add_settings_to_users_table.php` — Add nullable JSON `settings` column to users table
  - `app/Models/User.php` — Added `settings` to `$casts` as array
  - `app/Http/Controllers/SettingsController.php` — New controller with index (render settings page with defaults merged), update (validate & persist preferences), updateAccount (name/email), updatePassword (current password verification)
  - `resources/js/Pages/Settings/Index.vue` — New settings page with Appearance, Reading, Feeds, Account, Password, Data, About, and Logout sections. Dark-themed, mobile-first design consistent with app patterns
  - `resources/js/Composables/useDarkMode.js` — Upgraded from boolean dark/light to 3-mode theme (dark/light/system) with sync localStorage read at module load, media query listener with cleanup, old key migration
  - `resources/js/Layouts/AppLayout.vue` — Added Settings icon to bottom navigation bar with active state detection
  - `resources/js/Components/SidebarDrawer.vue` — Added Settings link in drawer footer alongside Add Feed button
  - `routes/web.php` — Added settings routes: GET /settings, PATCH /settings, PATCH /settings/account, PATCH /settings/password
  - `.chief/prds/main/prd.json` — Marked US-012 as passes: true
- **Learnings for future iterations:**
  - Store user preferences as a JSON column on users table — simpler than a separate settings table, `$casts => 'array'` handles serialization automatically
  - Don't add JSON settings column to `$fillable` — use direct assignment (`$user->settings = ...`) to prevent mass-assignment overwrites
  - `useDarkMode` composable uses module-level singleton ref — any component calling it shares the same reactive state
  - Read localStorage synchronously at module load (outside `onMounted`) to prevent theme flash on page load
  - Always clean up `matchMedia` event listeners in `onUnmounted()` to prevent listener accumulation in Inertia SPA
  - Use `watch(() => props.status, ...)` with `immediate: true` for flash messages that arrive via Inertia redirect — setup-time refs miss async prop updates
  - Reuse existing Breeze logout route (`route('logout')`) instead of duplicating auth logic in new controllers
  - Wrap toggle-button preference groups in `<form @submit.prevent>` for keyboard accessibility
---

## 2026-02-17 - US-013
- What was implemented: Search Articles feature — full-text search across article titles and content with debounced input (300ms), loading indicator, search scoped to all feeds by default (supports feed_id/category_id params for scoping), search results in same card format as article list (mobile cards + desktop compact rows), infinite scroll pagination on results, clear button, empty state for no results, initial state with helpful prompt. Search accessible from bottom navigation bar (magnifying glass icon) with active state highlighting. JSON API response support for potential future use.
- Files changed:
  - `app/Http/Controllers/ArticleController.php` — Added `search()` method with LIKE-based full-text search across title and content, feed/category scoping, pagination, and JSON response support
  - `resources/js/Pages/Articles/Search.vue` — New search page with debounced input, loading spinner, clear button, mobile card layout and desktop compact layout (matching article list), infinite scroll, empty state, initial search prompt
  - `resources/js/Layouts/AppLayout.vue` — Added Search icon to bottom navigation bar between Add and Settings, with active state detection
  - `routes/web.php` — Added `GET /articles/search` route (before `{article}` to avoid route conflict)
  - `.chief/prds/main/prd.json` — Marked US-013 as passes: true
- **Learnings for future iterations:**
  - Place specific routes like `/articles/search` before parameterized routes like `/articles/{article}` to avoid Laravel treating "search" as an article ID
  - SQLite `LIKE` is case-insensitive by default for ASCII characters — sufficient for basic full-text search without needing a separate search index
  - Use `wantsJson()` to support both Inertia page renders and JSON API responses from the same controller method
  - Debounce search input with 300ms delay to avoid excessive requests while still feeling responsive
  - Use `type="search"` on the input element for native browser clear button and mobile keyboard optimization
---

## 2026-02-17 - US-014
- What was implemented: Bottom Navigation Bar refinement — reduced to 5 items matching Feedly's layout (hamburger/Menu, bookmark/Read Later, grid/Feeds, RSS+/Add Feed, magnifying glass/Search), removed Settings from bottom nav (already accessible via sidebar drawer). Added scroll-direction hide/show behavior (nav hides on scroll down, reappears on scroll up) with smooth CSS transform transition. Updated icons: Feeds uses grid icon, Add Feed uses RSS+ combined icon. Fixed Menu button fallback when `toggleSidebar` inject is not provided (navigates to articles index instead of silently failing). Replaced redundant inline `:style` with Tailwind `bottom-0` class.
- Files changed:
  - `resources/js/Layouts/AppLayout.vue` — Reduced bottom nav from 6 to 5 items, added scroll-direction show/hide with passive scroll listener and proper cleanup, updated Feeds icon to grid, Add Feed icon to RSS+, fixed Menu button fallback for pages without sidebar, added `bottom-0` class replacing inline style
  - `.chief/prds/main/prd.json` — Marked US-014 as passes: true
- **Learnings for future iterations:**
  - Use `translate-y-full` / `translate-y-0` with `transition-transform duration-300` for smooth bottom nav show/hide — GPU-accelerated and avoids layout thrashing
  - Scroll-direction detection: track `lastScrollY`, use a threshold (10px) dead zone to prevent jitter from sub-pixel scroll events
  - Always use `{ passive: true }` on scroll event listeners for performance (tells browser handler won't call `preventDefault()`)
  - When using `inject('toggleSidebar', null)` with optional chaining `?.()`, the Menu button silently does nothing on pages that don't provide the injection — add a fallback navigation action
  - Prefer Tailwind utility classes (`bottom-0`) over inline `:style` bindings for static positioning values
---
