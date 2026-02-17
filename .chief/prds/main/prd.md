# RReader - Self-Hosted RSS Reader PWA

## Overview
A self-hosted Feedly-style RSS reader built as a Progressive Web App with Laravel (backend) and Vue/Inertia (frontend). The app should feel native on mobile devices with dark mode support, aggressive caching, and instant launch times. Users can subscribe to RSS/Atom feeds, organize them by category, read articles, and save them for later.

## Tech Stack
- **Backend:** Laravel (latest), PHP 8.2+
- **Frontend:** Vue 3 + Inertia.js
- **Styling:** Tailwind CSS
- **PWA:** Vite PWA plugin with service worker
- **Feed Parsing:** `simplepie/simplepie` or `laminas/laminas-feed`
- **Database:** SQLite (default) / MySQL / PostgreSQL
- **Queue:** Laravel queues for background feed fetching

## User Stories

### US-001: Project Scaffolding & PWA Foundation
**Priority:** 1
**Description:** As a developer, I want the Laravel + Inertia + Vue project scaffolded with PWA support so that the app can be installed on mobile devices and launches instantly.

**Acceptance Criteria:**
- [ ] Fresh Laravel project with Inertia.js and Vue 3 configured
- [ ] Tailwind CSS installed and configured with dark mode (`class` strategy)
- [ ] PWA manifest configured (app name "RReader", theme color, icons)
- [ ] Service worker registered via vite-plugin-pwa with precaching of app shell
- [ ] App is installable on iOS Safari and Android Chrome
- [ ] Base layout component with mobile-first responsive design
- [ ] Dark mode is the default theme; light mode available via toggle
- [ ] App shell loads instantly on repeat visits (cached by service worker)

### US-002: Authentication (Login & Register)
**Priority:** 2
**Description:** As a user, I want to register and log in so that my feeds and reading progress are private and persistent.

**Acceptance Criteria:**
- [ ] Registration screen with name, email, password, password confirmation
- [ ] Login screen with email and password
- [ ] "Remember me" checkbox on login
- [ ] Authenticated routes protected by middleware
- [ ] Redirect to feed list after successful login
- [ ] Mobile-native feel: full-screen forms, large touch targets, dark themed
- [ ] Logout functionality accessible from settings
- [ ] Laravel Breeze or Fortify for auth scaffolding (adapted to Inertia/Vue)

### US-003: Database Schema & Feed Models
**Priority:** 3
**Description:** As a developer, I want the core database schema and Eloquent models in place so that feeds, articles, categories, and user relationships are properly structured.

**Acceptance Criteria:**
- [ ] `categories` table: id, user_id, name, sort_order, timestamps
- [ ] `feeds` table: id, user_id, category_id (nullable), title, feed_url, site_url, description, favicon_url, last_fetched_at, timestamps
- [ ] `articles` table: id, feed_id, guid (unique per feed), title, author, content, summary, url, image_url, published_at, timestamps
- [ ] `user_articles` pivot table: user_id, article_id, is_read (boolean, default false), is_read_later (boolean, default false), read_at, timestamps
- [ ] Eloquent models with proper relationships (User hasMany Feeds, Feed belongsTo Category, Feed hasMany Articles, etc.)
- [ ] Database indexes on frequently queried columns (user_id, feed_id, is_read, published_at, guid)

### US-004: Feed Subscription (Add Feed)
**Priority:** 4
**Description:** As a user, I want to add an RSS/Atom feed by URL so that I can start receiving articles from sources I follow.

**Acceptance Criteria:**
- [ ] "Add Feed" screen accessible from bottom navigation bar (RSS+ icon)
- [ ] Text input for feed URL with auto-discovery (accepts both direct feed URLs and website URLs)
- [ ] Feed URL validation and duplicate detection
- [ ] Preview of feed title and description before confirming subscription
- [ ] Optional category assignment during subscription (dropdown or create new)
- [ ] On submit: feed is saved, initial articles are fetched and stored
- [ ] Error handling for invalid URLs, unreachable feeds, non-RSS content
- [ ] Loading state while fetching and parsing feed

### US-005: Background Feed Fetching
**Priority:** 5
**Description:** As a user, I want my feeds to be automatically updated in the background so that I always see the latest articles without manual refresh.

**Acceptance Criteria:**
- [ ] Laravel scheduled command to fetch all feeds periodically (configurable, default every 30 min)
- [ ] Each feed fetch is dispatched as a queued job for parallel processing
- [ ] New articles are inserted; existing articles (by guid) are skipped
- [ ] Feed metadata (title, favicon) is updated if changed
- [ ] Failed fetches are logged with retry logic (max 3 retries, exponential backoff)
- [ ] `last_fetched_at` timestamp updated on each successful fetch
- [ ] Manual "refresh" pull-to-refresh gesture on article list triggers immediate fetch for current feed/category

### US-006: Article List View
**Priority:** 6
**Description:** As a user, I want to see my articles in a scrollable list grouped by date so that I can browse recent content from my feeds.

**Acceptance Criteria:**
- [ ] Default view shows "All Feeds" with unread count badge in header
- [ ] Articles grouped by date sections: "Today", "Yesterday", then date labels
- [ ] Each article card shows: title (bold if unread, normal if read), feed name, time ago, thumbnail image (if available, right-aligned)
- [ ] Tapping an article navigates to article view and marks it as read
- [ ] "Mark all as read" action (checkmark icon in header)
- [ ] Infinite scroll / pagination (load more as user scrolls down)
- [ ] Empty state when no unread articles
- [ ] Smooth, native-feel scrolling with no jank
- [ ] Desktop view: compact single-line list layout (feed name, title, excerpt, time) as shown in Feedly desktop

### US-007: Sidebar Navigation & Category Browsing
**Priority:** 7
**Description:** As a user, I want a sidebar/drawer with my categories and feeds so that I can filter articles by source or topic.

**Acceptance Criteria:**
- [ ] Slide-out drawer from left side (hamburger menu icon in bottom nav)
- [ ] Drawer sections: "Today" (smart filter), "Read Later" (bookmarked articles)
- [ ] "FEEDS" section header with "All" showing total unread count
- [ ] Categories listed with expand/collapse chevron and unread count
- [ ] Expanded category shows child feeds with favicon, name, and individual unread count
- [ ] Tapping a category filters article list to that category's feeds
- [ ] Tapping an individual feed filters to just that feed's articles
- [ ] "Edit" button at top of drawer for managing feeds/categories
- [ ] Smooth slide animation, dark themed, overlay on content

### US-008: Individual Article View
**Priority:** 8
**Description:** As a user, I want to read a full article in a clean reading view so that I can consume content comfortably.

**Acceptance Criteria:**
- [ ] Full-screen article view with article title, feed name, author, published date
- [ ] Rendered HTML content with clean typography (readable font size, line height, spacing)
- [ ] Images displayed inline, responsive and lazy-loaded
- [ ] "Save to Read Later" / "Remove from Read Later" toggle action (bookmark icon)
- [ ] "Mark as Unread" action to return article to unread state
- [ ] "Open in Browser" action to view original article in external browser
- [ ] Share action (native Web Share API if available)
- [ ] Back navigation returns to article list at previous scroll position
- [ ] Swipe gestures: swipe right to go back (optional progressive enhancement)

### US-009: Read Later Section
**Priority:** 9
**Description:** As a user, I want a dedicated "Read Later" section so that I can save and revisit articles I don't have time to read now.

**Acceptance Criteria:**
- [ ] "Read Later" accessible from sidebar drawer (bookmark icon)
- [ ] Also accessible from bottom navigation bar (bookmark icon)
- [ ] Shows all articles marked as "read later" in reverse chronological order
- [ ] Same card layout as main article list
- [ ] Articles can be removed from read later via swipe or from article view
- [ ] Unread count / badge shown on Read Later in sidebar
- [ ] Empty state with helpful message when no saved articles

### US-010: Feed & Category Management
**Priority:** 10
**Description:** As a user, I want to manage my feeds and categories so that I can organize, rename, move, or remove subscriptions.

**Acceptance Criteria:**
- [ ] Edit mode in sidebar (accessible via "Edit" button)
- [ ] Create new category with name input
- [ ] Rename existing categories
- [ ] Delete category (with option to move feeds to another category or uncategorize)
- [ ] Move feed between categories (drag or select)
- [ ] Rename feed (override default title)
- [ ] Unsubscribe from feed (with confirmation dialog)
- [ ] Reorder categories via drag handle or up/down controls

### US-011: OPML Import & Export
**Priority:** 11
**Description:** As a user, I want to import my feeds from other RSS readers via OPML file so that I can migrate without manually re-adding each feed.

**Acceptance Criteria:**
- [ ] Import OPML screen accessible from Settings
- [ ] File upload accepting `.opml` and `.xml` files
- [ ] Parse OPML outline structure: categories from folder outlines, feeds from leaf outlines
- [ ] Preview of feeds to be imported with category mapping before confirming
- [ ] Duplicate feed detection (skip already-subscribed feeds)
- [ ] Progress indicator during import (especially for large OPML files with many feeds)
- [ ] Export OPML: generate and download current feed subscriptions as OPML file
- [ ] Handle nested OPML categories (flatten or preserve one level)

### US-012: Settings Screen
**Priority:** 12
**Description:** As a user, I want a settings screen to customize my reading experience and manage my account.

**Acceptance Criteria:**
- [ ] Settings accessible from bottom navigation or sidebar
- [ ] **Appearance:** Dark/Light/System theme toggle
- [ ] **Reading:** Default article view (full content vs summary), font size adjustment
- [ ] **Feeds:** Default refresh interval, mark as read on scroll (toggle)
- [ ] **Account:** Change password, email
- [ ] **Data:** Import OPML (links to import screen), Export OPML (direct download)
- [ ] **About:** App version, link to source code
- [ ] Logout button
- [ ] Settings persisted per-user in database

### US-013: Search Articles
**Priority:** 13
**Description:** As a user, I want to search across my articles so that I can find specific content I've read or saved.

**Acceptance Criteria:**
- [ ] Search icon in bottom navigation bar
- [ ] Full-text search across article titles and content
- [ ] Search results displayed in same card format as article list
- [ ] Search scoped to current view (all feeds, category, or single feed) with option to search all
- [ ] Debounced input with loading indicator
- [ ] Recent searches history (optional)
- [ ] Empty state when no results found

### US-014: Bottom Navigation Bar
**Priority:** 14
**Description:** As a user, I want a persistent bottom navigation bar on mobile so that I can quickly switch between main sections like a native app.

**Acceptance Criteria:**
- [ ] Fixed bottom nav bar with 5 items matching Feedly's layout: Sidebar toggle (hamburger), Read Later (bookmark), Feed view toggle (grid icon), Add Feed (RSS+), Search (magnifying glass)
- [ ] Active tab highlighted
- [ ] Smooth transitions between sections
- [ ] Bottom nav hidden when scrolling down, shown when scrolling up (optional progressive enhancement)
- [ ] Safe area handling for devices with home indicators (iPhone notch/island)
- [ ] Desktop: bottom nav replaced with sidebar-based navigation

### US-015: Offline Support & Caching
**Priority:** 15
**Description:** As a user, I want to read previously loaded articles even when offline so that I can use the app on the go without connectivity.

**Acceptance Criteria:**
- [ ] Service worker caches app shell (HTML, CSS, JS) for instant repeat loads
- [ ] Previously viewed articles available offline from Inertia page cache
- [ ] Article images cached for offline viewing (within storage limits)
- [ ] Offline indicator banner when network is unavailable
- [ ] Actions taken offline (mark read, save to read later) are queued and synced when back online
- [ ] Graceful degradation: show cached content with "last updated" timestamp

### US-016: Pull-to-Refresh & Loading States
**Priority:** 16
**Description:** As a user, I want pull-to-refresh and clear loading states so that the app feels responsive and native.

**Acceptance Criteria:**
- [ ] Pull-to-refresh gesture on article list triggers feed refresh
- [ ] Skeleton loading screens on initial page loads (not blank white screens)
- [ ] Transition animations between pages (slide left/right for navigation depth)
- [ ] Optimistic UI updates (mark as read immediately, sync in background)
- [ ] Toast/snackbar notifications for background actions ("Feed refreshed", "Article saved")

### US-017: Responsive Desktop Layout
**Priority:** 17
**Description:** As a user, I want the app to work well on desktop with a multi-column layout so that I can use it on any device.

**Acceptance Criteria:**
- [ ] Breakpoint at ~768px switches from mobile to desktop layout
- [ ] Desktop: persistent sidebar on left (no drawer), article list in center, article content on right (3-column)
- [ ] Desktop: compact article list rows (single line: feed icon, feed name, title, excerpt, time)
- [ ] Desktop: keyboard shortcuts (j/k to navigate articles, s to save, m to mark read)
- [ ] Sidebar collapsible on desktop for more reading space
- [ ] Proper hover states and cursor styles for desktop interaction
