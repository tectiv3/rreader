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
