# SPA Architecture Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Inertia-driven article navigation with a Pinia + Vue Router SPA inside an Inertia auth shell — making the frontend the single source of truth for article state.

**Architecture:** One Inertia "AppShell" page boots Vue Router + Pinia. Vue Router handles all in-app navigation. Pinia stores own all article/sidebar state. Laravel becomes a JSON API. Auth pages stay on Inertia/Breeze.

**Tech Stack:** Vue 3, Pinia, Vue Router 4, Laravel 11, Axios, Tailwind CSS 4

**Design doc:** `docs/plans/2026-02-18-spa-architecture-overhaul-design.md`

---

## Phase 1: Foundation

### Task 1: Install Pinia and Vue Router

**Files:**
- Modify: `package.json`
- Modify: `resources/js/app.js`

**Step 1: Install dependencies**

Run: `npm install pinia vue-router@4`

**Step 2: Create Pinia instance and register in app**

Modify `resources/js/app.js` — add Pinia to the Vue app setup inside `createInertiaApp`:

```js
import { createPinia } from 'pinia'

// Inside setup():
return createApp({ render: () => h(App, props) })
    .use(plugin)
    .use(ZiggyVue)
    .use(createPinia())
    .mount(el)
```

Do NOT add Vue Router here yet — it will be mounted inside AppShell.vue, not at the app root.

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 4: Commit**

```
feat: install pinia and vue-router
```

---

### Task 2: Create Vue Router instance

**Files:**
- Create: `resources/js/router.js`

**Step 1: Create router with placeholder routes**

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/articles',
        name: 'articles.index',
        component: () => import('@/Views/ArticleListView.vue'),
    },
    {
        path: '/articles/search',
        name: 'articles.search',
        component: () => import('@/Views/SearchView.vue'),
    },
    {
        path: '/articles/:id',
        name: 'articles.show',
        component: () => import('@/Views/ArticleDetailView.vue'),
        props: route => ({ id: Number(route.params.id) }),
    },
    {
        path: '/feeds/manage',
        name: 'feeds.manage',
        component: () => import('@/Views/FeedManageView.vue'),
    },
    {
        path: '/feeds/create',
        name: 'feeds.create',
        component: () => import('@/Views/FeedCreateView.vue'),
    },
    {
        path: '/feeds/:id/edit',
        name: 'feeds.edit',
        component: () => import('@/Views/FeedEditView.vue'),
        props: route => ({ id: Number(route.params.id) }),
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/Views/SettingsView.vue'),
    },
    {
        path: '/opml/import',
        name: 'opml.import',
        component: () => import('@/Views/OpmlImportView.vue'),
    },
    // Catch-all: redirect to articles
    {
        path: '/:pathMatch(.*)*',
        redirect: '/articles',
    },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
```

**Step 2: Create placeholder view components**

Create `resources/js/Views/` directory with these stub files. Each is a minimal `<template><div>ViewName placeholder</div></template>`:

- `ArticleListView.vue`
- `ArticleDetailView.vue`
- `SearchView.vue`
- `FeedManageView.vue`
- `FeedCreateView.vue`
- `FeedEditView.vue`
- `SettingsView.vue`
- `OpmlImportView.vue`

**Step 3: Verify build passes**

Run: `npm run build`

**Step 4: Commit**

```
feat: add vue router with placeholder views
```

---

### Task 3: Create AppShell Inertia page

**Files:**
- Create: `resources/js/Pages/AppShell.vue`
- Modify: `routes/web.php`

**Step 1: Create AppShell.vue**

This is the one Inertia page that boots the SPA. It receives initial sidebar data from the server (so the first paint has sidebar content without a second request) and mounts the Vue Router.

```vue
<script setup>
import router from '@/router.js'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

defineProps({
    initialSidebar: { type: Object, default: () => ({}) },
    user: { type: Object, required: true },
})

// Mount Vue Router into this component
// The router is used via <router-view> in the template
</script>

<template>
    <router-view />
</template>
```

Note: Pinia stores will consume `initialSidebar` and `user` in a later task. For now, just pass them through.

**Step 2: Add catch-all route in Laravel**

Add to `routes/web.php`, inside the `auth` middleware group, AFTER all existing routes but BEFORE the `require auth.php` line. This ensures specific Inertia routes (auth pages) still match first:

```php
// SPA catch-all — must be last in the auth group
Route::get('/{any}', function (Request $request) {
    $user = $request->user();
    $allFeedIds = $user->feeds()->pluck('feeds.id');
    $sidebarData = app(ArticleController::class)->getSidebarData($user, $allFeedIds);

    return Inertia::render('AppShell', [
        'initialSidebar' => $sidebarData,
        'user' => $user,
    ]);
})->where('any', '^(?!api/).*$')->name('spa');
```

This needs `use Illuminate\Http\Request;` at the top of the file (already imported if not present).

Also make `getSidebarData` public instead of private in `ArticleController.php`.

**Step 3: Test that visiting /articles renders AppShell**

Run: `npm run build && php artisan serve`
Visit `/articles` in browser. Should see the placeholder text from ArticleListView.

**Step 4: Commit**

```
feat: add AppShell Inertia page with catch-all route
```

---

### Task 4: Create empty Pinia stores

**Files:**
- Create: `resources/js/Stores/useArticleStore.js`
- Create: `resources/js/Stores/useSidebarStore.js`
- Create: `resources/js/Stores/useUIStore.js`

**Step 1: Create useArticleStore**

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useArticleStore = defineStore('articles', () => {
    // --- State ---
    const articles = ref([])
    const contentCache = ref(new Map())
    const inFlightRequests = new Map() // not reactive, just tracking promises
    const activeView = ref({ type: 'all' })
    const loading = ref(false)

    const CONTENT_CACHE_MAX = 20

    // --- Getters ---
    const unreadCount = computed(() =>
        articles.value.filter(a => !a.is_read).length
    )

    const readLaterCount = computed(() =>
        articles.value.filter(a => a.is_read_later).length
    )

    const unreadByFeed = computed(() => {
        const counts = {}
        for (const a of articles.value) {
            if (!a.is_read) {
                counts[a.feed_id] = (counts[a.feed_id] || 0) + 1
            }
        }
        return counts
    })

    function getContent(id) {
        return contentCache.value.get(id) ?? null
    }

    function adjacentIds(id) {
        const idx = articles.value.findIndex(a => a.id === id)
        if (idx === -1) return { prev: null, next: null }
        return {
            prev: idx > 0 ? articles.value[idx - 1].id : null,
            next: idx < articles.value.length - 1 ? articles.value[idx + 1].id : null,
        }
    }

    // --- Actions (stubs for now) ---
    async function fetchArticles(view) {
        // TODO: Phase 2
    }

    async function fetchContent(id) {
        // TODO: Phase 2
    }

    function prefetchAdjacent(id) {
        // TODO: Phase 2
    }

    function markRead(id) {
        // TODO: Phase 3
    }

    function markUnread(id) {
        // TODO: Phase 3
    }

    function toggleReadLater(id) {
        // TODO: Phase 3
    }

    function markAllRead(feedId = null) {
        // TODO: Phase 3
    }

    return {
        // state
        articles, contentCache, activeView, loading,
        // getters
        unreadCount, readLaterCount, unreadByFeed,
        getContent, adjacentIds,
        // actions
        fetchArticles, fetchContent, prefetchAdjacent,
        markRead, markUnread, toggleReadLater, markAllRead,
    }
})
```

**Step 2: Create useSidebarStore**

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
    const categories = ref([])
    const uncategorizedFeeds = ref([])
    const loaded = ref(false)

    function initialize(data) {
        categories.value = data.categories ?? []
        uncategorizedFeeds.value = data.uncategorizedFeeds ?? []
        loaded.value = true
    }

    async function fetchSidebar() {
        // TODO: Phase 2
    }

    return { categories, uncategorizedFeeds, loaded, initialize, fetchSidebar }
})
```

**Step 3: Create useUIStore**

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const sidebarOpen = ref(false)

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value
    }

    function closeSidebar() {
        sidebarOpen.value = false
    }

    return { sidebarOpen, toggleSidebar, closeSidebar }
})
```

Note: dark mode and toasts already have working composables (`useDarkMode`, `useToast`). No need to duplicate them into Pinia — they can stay as composables and be used directly in views.

**Step 4: Verify build passes**

Run: `npm run build`

**Step 5: Commit**

```
feat: add pinia stores (article, sidebar, ui)
```

---

## Phase 2: API Endpoints

### Task 5: Add API routes and article list endpoint

**Files:**
- Create: `routes/api.php`
- Create: `app/Http/Controllers/Api/ArticleApiController.php`
- Modify: `bootstrap/app.php` (or `app/Providers/RouteServiceProvider.php` — check which exists)

**Step 1: Register API routes**

Check how routes are loaded. In Laravel 11, `bootstrap/app.php` has a `withRouting()` call. Add api route file there if not already present. Create `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\ArticleApiController;
use App\Http\Controllers\Api\SidebarApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Articles
    Route::get('/articles', [ArticleApiController::class, 'index']);
    Route::get('/articles/search', [ArticleApiController::class, 'search']);
    Route::get('/articles/{article}', [ArticleApiController::class, 'show']);
    Route::patch('/articles/{article}', [ArticleApiController::class, 'update']);
    Route::post('/articles/mark-all-read', [ArticleApiController::class, 'markAllRead']);

    // Sidebar
    Route::get('/sidebar', [SidebarApiController::class, 'index']);
});
```

Note: Since we're using session-based auth (Breeze), `auth:sanctum` with the Sanctum middleware works for same-domain SPA requests using cookies. Check if Sanctum is installed (`composer show laravel/sanctum`). If not, use `auth:web` instead.

**Step 2: Create ArticleApiController with index method**

Create `app/Http/Controllers/Api/ArticleApiController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $allFeedIds = $user->feeds()->pluck('feeds.id');
        $feedId = $request->query('feed_id');
        $categoryId = $request->query('category_id');
        $filter = $request->query('filter');

        $feedIds = $allFeedIds;
        $filterTitle = 'All Feeds';

        if ($feedId) {
            $feed = $user->feeds()->where('feeds.id', $feedId)->first();
            if ($feed) {
                $feedIds = collect([$feed->id]);
                $filterTitle = $feed->title;
            }
        } elseif ($categoryId) {
            $category = $user->categories()->where('id', $categoryId)->first();
            if ($category) {
                $catFeedIds = $category->feeds()->pluck('feeds.id');
                $feedIds = $catFeedIds->isNotEmpty() ? $catFeedIds : collect([]);
                $filterTitle = $category->name;
            }
        } elseif ($filter === 'today') {
            $filterTitle = 'Today';
        } elseif ($filter === 'read_later') {
            $filterTitle = 'Read Later';
        } elseif ($filter === 'recently_read') {
            $filterTitle = 'Recently Read';
        }

        if ($filter === 'read_later') {
            $query = Article::whereIn('feed_id', $allFeedIds)
                ->join('user_articles', function ($join) use ($user) {
                    $join->on('articles.id', '=', 'user_articles.article_id')
                        ->where('user_articles.user_id', '=', $user->id)
                        ->where('user_articles.is_read_later', '=', true);
                })
                ->select([
                    'articles.id', 'articles.title', 'articles.summary',
                    'articles.feed_id', 'articles.image_url',
                    'articles.published_at', 'articles.url',
                    'user_articles.is_read', 'user_articles.is_read_later',
                    'user_articles.read_at',
                ]);
        } elseif ($filter === 'recently_read') {
            $query = Article::whereIn('feed_id', $allFeedIds)
                ->join('user_articles', function ($join) use ($user) {
                    $join->on('articles.id', '=', 'user_articles.article_id')
                        ->where('user_articles.user_id', '=', $user->id)
                        ->where('user_articles.is_read', '=', true);
                })
                ->select([
                    'articles.id', 'articles.title', 'articles.summary',
                    'articles.feed_id', 'articles.image_url',
                    'articles.published_at', 'articles.url',
                    'user_articles.is_read', 'user_articles.is_read_later',
                    'user_articles.read_at',
                ])
                ->orderByDesc('user_articles.read_at');
        } else {
            $query = Article::whereIn('feed_id', $feedIds)
                ->leftJoin('user_articles', function ($join) use ($user) {
                    $join->on('articles.id', '=', 'user_articles.article_id')
                        ->where('user_articles.user_id', '=', $user->id);
                })
                ->select([
                    'articles.id', 'articles.title', 'articles.summary',
                    'articles.feed_id', 'articles.image_url',
                    'articles.published_at', 'articles.url',
                    \DB::raw('COALESCE(user_articles.is_read, 0) as is_read'),
                    \DB::raw('COALESCE(user_articles.is_read_later, 0) as is_read_later'),
                    'user_articles.read_at',
                ]);

            if ($filter === 'today') {
                $query->whereDate('articles.published_at', today());
            }
        }

        // For non-recently_read views, order by published_at desc
        if ($filter !== 'recently_read') {
            $query->orderByDesc('articles.published_at')
                  ->orderByDesc('articles.id');
        }

        // Eager-load feed info via a subquery to avoid join conflicts
        // We'll attach feed data after the query
        $articles = $query->limit(1000)->get();

        // Attach feed metadata
        $feedMap = $user->feeds()
            ->select('feeds.id', 'feeds.title', 'feeds.favicon_url')
            ->pluck(null, 'feeds.id')
            ->keyBy('id');

        $articles->transform(function ($article) use ($feedMap) {
            $feed = $feedMap[$article->feed_id] ?? null;
            $article->feed_title = $feed?->title;
            $article->feed_favicon_url = $feed?->favicon_url;
            return $article;
        });

        return response()->json([
            'articles' => $articles,
            'filter_title' => $filterTitle,
        ]);
    }
}
```

**Step 3: Verify endpoint works**

Run: `php artisan serve`
Test: `curl -b cookies.txt http://localhost:8000/api/articles` (or use browser dev tools on an authenticated session).

**Step 4: Commit**

```
feat: add GET /api/articles endpoint with full metadata list
```

---

### Task 6: Add article content and update endpoints

**Files:**
- Modify: `app/Http/Controllers/Api/ArticleApiController.php`

**Step 1: Add show method (article content)**

```php
public function show(Request $request, Article $article)
{
    $user = $request->user();
    $userFeedIds = $user->feeds()->pluck('feeds.id');

    if (!$userFeedIds->contains($article->feed_id)) {
        abort(404);
    }

    return response()->json([
        'id' => $article->id,
        'content' => $article->content,
        'summary' => $article->summary,
        'author' => $article->author,
        'url' => $article->url,
    ]);
}
```

**Step 2: Add update method (PATCH read/bookmark state)**

```php
public function update(Request $request, Article $article)
{
    $user = $request->user();
    $userFeedIds = $user->feeds()->pluck('feeds.id');

    if (!$userFeedIds->contains($article->feed_id)) {
        abort(404);
    }

    $data = $request->validate([
        'is_read' => 'sometimes|boolean',
        'is_read_later' => 'sometimes|boolean',
    ]);

    $pivot = [];
    if (array_key_exists('is_read', $data)) {
        $pivot['is_read'] = $data['is_read'];
        if ($data['is_read']) {
            $pivot['read_at'] = now();
        }
    }
    if (array_key_exists('is_read_later', $data)) {
        $pivot['is_read_later'] = $data['is_read_later'];
    }

    $user->articles()->syncWithoutDetaching([
        $article->id => $pivot,
    ]);

    return response()->noContent();
}
```

**Step 3: Add markAllRead method**

```php
public function markAllRead(Request $request)
{
    $user = $request->user();
    $feedId = $request->input('feed_id');
    $categoryId = $request->input('category_id');
    $filter = $request->input('filter');

    $allFeedIds = $user->feeds()->pluck('feeds.id');
    $feedIds = $allFeedIds;

    if ($feedId) {
        $feedIds = collect([$feedId])->intersect($allFeedIds);
    } elseif ($categoryId) {
        $category = $user->categories()->where('id', $categoryId)->first();
        if ($category) {
            $feedIds = $category->feeds()->pluck('feeds.id');
        }
    }

    $articleIds = Article::whereIn('feed_id', $feedIds)
        ->when($filter === 'today', fn($q) => $q->whereDate('published_at', today()))
        ->pluck('id');

    // Upsert read state for all articles
    $records = $articleIds->mapWithKeys(fn($id) => [
        $id => ['is_read' => true, 'read_at' => now()]
    ])->all();

    $user->articles()->syncWithoutDetaching($records);

    return response()->noContent();
}
```

**Step 4: Add search method**

```php
public function search(Request $request)
{
    $user = $request->user();
    $q = $request->query('q', '');

    if (strlen($q) < 2) {
        return response()->json(['articles' => []]);
    }

    $feedIds = $user->feeds()->pluck('feeds.id');

    $articles = Article::whereIn('feed_id', $feedIds)
        ->where(function ($query) use ($q) {
            $query->where('title', 'like', "%{$q}%")
                  ->orWhere('summary', 'like', "%{$q}%");
        })
        ->leftJoin('user_articles', function ($join) use ($user) {
            $join->on('articles.id', '=', 'user_articles.article_id')
                ->where('user_articles.user_id', '=', $user->id);
        })
        ->select([
            'articles.id', 'articles.title', 'articles.summary',
            'articles.feed_id', 'articles.image_url',
            'articles.published_at', 'articles.url',
            \DB::raw('COALESCE(user_articles.is_read, 0) as is_read'),
            \DB::raw('COALESCE(user_articles.is_read_later, 0) as is_read_later'),
        ])
        ->orderByDesc('articles.published_at')
        ->limit(100)
        ->get();

    $feedMap = $user->feeds()
        ->select('feeds.id', 'feeds.title', 'feeds.favicon_url')
        ->pluck(null, 'feeds.id')
        ->keyBy('id');

    $articles->transform(function ($article) use ($feedMap) {
        $feed = $feedMap[$article->feed_id] ?? null;
        $article->feed_title = $feed?->title;
        $article->feed_favicon_url = $feed?->favicon_url;
        return $article;
    });

    return response()->json(['articles' => $articles]);
}
```

**Step 5: Commit**

```
feat: add article show, update, markAllRead, and search API endpoints
```

---

### Task 7: Add sidebar API endpoint

**Files:**
- Create: `app/Http/Controllers/Api/SidebarApiController.php`

**Step 1: Create SidebarApiController**

This returns structural data only — no unread counts (those are computed client-side).

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SidebarApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = $user->categories()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['feeds' => fn($q) => $q->orderBy('title')])
            ->get()
            ->map(fn($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'feeds' => $cat->feeds->map(fn($f) => [
                    'id' => $f->id,
                    'title' => $f->title,
                    'favicon_url' => $f->favicon_url,
                    'disabled_at' => $f->disabled_at,
                ])->values()->all(),
            ]);

        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get()
            ->map(fn($f) => [
                'id' => $f->id,
                'title' => $f->title,
                'favicon_url' => $f->favicon_url,
                'disabled_at' => $f->disabled_at,
            ])
            ->values()
            ->all();

        return response()->json([
            'categories' => $categories->values()->all(),
            'uncategorizedFeeds' => $uncategorizedFeeds,
        ]);
    }
}
```

**Step 2: Commit**

```
feat: add GET /api/sidebar endpoint
```

---

### Task 8: Article retention rules

**Files:**
- Create: `app/Console/Commands/PurgeOldArticles.php`
- Modify: `app/Http/Controllers/FeedController.php` (store method — limit to 10 on subscribe)

**Step 1: Create artisan command for article retention**

```php
<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\User;
use Illuminate\Console\Command;

class PurgeOldArticles extends Command
{
    protected $signature = 'articles:purge';
    protected $description = 'Enforce article retention: 1000 per user, auto-read articles older than 1 year';

    public function handle()
    {
        User::chunk(50, function ($users) {
            foreach ($users as $user) {
                $feedIds = $user->feeds()->pluck('feeds.id');

                // Auto-mark articles older than 1 year as read
                $oldArticleIds = Article::whereIn('feed_id', $feedIds)
                    ->where('published_at', '<', now()->subYear())
                    ->whereDoesntHave('users', fn($q) =>
                        $q->where('user_id', $user->id)->where('is_read', true)
                    )
                    ->pluck('id');

                if ($oldArticleIds->isNotEmpty()) {
                    $records = $oldArticleIds->mapWithKeys(fn($id) => [
                        $id => ['is_read' => true, 'read_at' => now()]
                    ])->all();
                    $user->articles()->syncWithoutDetaching($records);
                }

                // Purge beyond 1000: delete oldest articles per user's feeds
                $totalCount = Article::whereIn('feed_id', $feedIds)->count();
                if ($totalCount > 1000) {
                    $excess = $totalCount - 1000;
                    $toDelete = Article::whereIn('feed_id', $feedIds)
                        ->orderBy('published_at', 'asc')
                        ->limit($excess)
                        ->pluck('id');

                    Article::whereIn('id', $toDelete)->delete();
                }
            }
        });

        $this->info('Article retention enforced.');
    }
}
```

**Step 2: Limit new feed import to 10 articles**

In `FeedController.php`, find the `store` method where articles are imported after subscribing. Add `->take(10)` or `->limit(10)` to the article fetch/insert loop. The exact location depends on how articles are fetched — check the store method and the feed refresh job.

**Step 3: Schedule the command**

Add to `routes/console.php` (or `app/Console/Kernel.php` depending on Laravel version):

```php
Schedule::command('articles:purge')->daily();
```

**Step 4: Commit**

```
feat: add article retention (1000 cap, 1-year auto-read, 10 on subscribe)
```

---

## Phase 3: Article Store + List View

### Task 9: Implement useArticleStore actions

**Files:**
- Modify: `resources/js/Stores/useArticleStore.js`

**Step 1: Implement fetchArticles**

Replace the stub:

```js
async function fetchArticles(view) {
    // Don't refetch if same view is already loaded
    if (
        loaded.value &&
        activeView.value.type === view.type &&
        activeView.value.feedId === view.feedId &&
        activeView.value.categoryId === view.categoryId
    ) {
        return
    }

    loading.value = true
    activeView.value = view

    const params = new URLSearchParams()
    if (view.feedId) params.set('feed_id', view.feedId)
    if (view.categoryId) params.set('category_id', view.categoryId)
    if (view.type === 'today') params.set('filter', 'today')
    if (view.type === 'read_later') params.set('filter', 'read_later')
    if (view.type === 'recently_read') params.set('filter', 'recently_read')

    try {
        const response = await axios.get('/api/articles?' + params.toString())
        articles.value = response.data.articles
        filterTitle.value = response.data.filter_title
        loaded.value = true
    } finally {
        loading.value = false
    }
}
```

Add `loaded` and `filterTitle` to state:

```js
const loaded = ref(false)
const filterTitle = ref('All Feeds')
```

**Step 2: Implement fetchContent with LRU cache**

```js
async function fetchContent(id) {
    // 1. Cache hit
    const cached = contentCache.value.get(id)
    if (cached) {
        // Move to end (most recently used)
        contentCache.value.delete(id)
        contentCache.value.set(id, cached)
        return cached
    }

    // 2. In-flight dedup
    if (inFlightRequests.has(id)) {
        return inFlightRequests.get(id)
    }

    // 3. Fetch
    const promise = axios.get(`/api/articles/${id}`).then(res => {
        const content = res.data
        contentCache.value.set(id, content)

        // Evict LRU if over max
        if (contentCache.value.size > CONTENT_CACHE_MAX) {
            const firstKey = contentCache.value.keys().next().value
            contentCache.value.delete(firstKey)
        }

        inFlightRequests.delete(id)
        return content
    }).catch(err => {
        inFlightRequests.delete(id)
        throw err
    })

    inFlightRequests.set(id, promise)
    return promise
}
```

**Step 3: Implement prefetchAdjacent**

```js
function prefetchAdjacent(id) {
    const { prev, next } = adjacentIds(id)
    if (next) fetchContent(next).catch(() => {})
    if (prev) fetchContent(prev).catch(() => {})
}
```

**Step 4: Implement optimistic mutations**

```js
function markRead(id) {
    const article = articles.value.find(a => a.id === id)
    if (!article || article.is_read) return
    article.is_read = true
    article.read_at = new Date().toISOString()
    axios.patch(`/api/articles/${id}`, { is_read: true }).catch(() => {
        // Revert on failure
        article.is_read = false
        article.read_at = null
    })
}

function markUnread(id) {
    const article = articles.value.find(a => a.id === id)
    if (!article || !article.is_read) return
    article.is_read = false
    article.read_at = null
    axios.patch(`/api/articles/${id}`, { is_read: false }).catch(() => {
        article.is_read = true
    })
}

function toggleReadLater(id) {
    const article = articles.value.find(a => a.id === id)
    if (!article) return
    const was = article.is_read_later
    article.is_read_later = !was
    axios.patch(`/api/articles/${id}`, { is_read_later: !was }).catch(() => {
        article.is_read_later = was
    })
}

function markAllRead(feedId = null) {
    const targets = feedId
        ? articles.value.filter(a => a.feed_id === feedId && !a.is_read)
        : articles.value.filter(a => !a.is_read)

    targets.forEach(a => {
        a.is_read = true
        a.read_at = new Date().toISOString()
    })

    axios.post('/api/articles/mark-all-read', {
        feed_id: activeView.value.feedId ?? null,
        category_id: activeView.value.categoryId ?? null,
        filter: ['today', 'read_later'].includes(activeView.value.type)
            ? activeView.value.type : null,
    }).catch(() => {
        // Revert on failure
        targets.forEach(a => {
            a.is_read = false
            a.read_at = null
        })
    })
}
```

**Step 5: Add a forceRefresh action for manual reload**

```js
function forceRefresh() {
    loaded.value = false
    return fetchArticles(activeView.value)
}
```

**Step 6: Export all new state/actions and verify build**

Run: `npm run build`

**Step 7: Commit**

```
feat: implement article store actions (fetch, cache, mutations)
```

---

### Task 10: Build the app layout shell

**Files:**
- Create: `resources/js/Views/AppLayout.vue` (SPA version — NOT the Inertia one)

**Step 1: Build the layout**

This replaces `resources/js/Layouts/AppLayout.vue` for the SPA context. It contains:
- Sticky header with slot-based left/right sections
- Sidebar drawer (reuse existing `SidebarDrawer.vue` or rebuild to read from Pinia)
- Bottom mobile nav
- Toast container
- Add Feed modal
- `<router-view>` for page content
- `<keep-alive>` wrapping ArticleListView

Port the template and styles from the existing `resources/js/Layouts/AppLayout.vue` but:
- Remove all Inertia `router` usage — replace with Vue Router's `useRouter()`
- Remove `isNavigating` / `ArticleListSkeleton` — no more skeleton, the store drives the UI
- Read sidebar data from `useSidebarStore()` + unread counts from `useArticleStore().unreadByFeed`
- Bottom nav clicks use `router.push()` instead of Inertia `router.get()`
- Sidebar feed/category clicks use `router.push()` and close sidebar

For `<keep-alive>`, wrap the `<router-view>` like this:

```vue
<router-view v-slot="{ Component, route }">
    <keep-alive include="ArticleListView">
        <component :is="Component" :key="route.fullPath" />
    </keep-alive>
</router-view>
```

This keeps ArticleListView alive (preserving scroll and state) while other views mount/unmount normally.

**Step 2: Update AppShell.vue to use the layout**

```vue
<script setup>
import AppLayout from '@/Views/AppLayout.vue'
import { useSidebarStore } from '@/Stores/useSidebarStore.js'
import { onMounted } from 'vue'

const props = defineProps({
    initialSidebar: { type: Object, default: () => ({}) },
    user: { type: Object, required: true },
})

const sidebarStore = useSidebarStore()

// Hydrate sidebar from server-provided initial data (avoids an API round-trip on first load)
if (!sidebarStore.loaded) {
    sidebarStore.initialize(props.initialSidebar)
}
</script>

<template>
    <AppLayout />
</template>
```

**Step 3: Commit**

```
feat: build SPA app layout with keep-alive and pinia-driven sidebar
```

---

### Task 11: Build ArticleListView

**Files:**
- Modify: `resources/js/Views/ArticleListView.vue`

**Step 1: Implement the view**

Port the template from `resources/js/Pages/Articles/Index.vue` but:
- Replace all `props.*` with `articleStore.*`
- On mount: derive view from route query params, call `articleStore.fetchArticles(view)`
- Watch route changes: if query params change, call `fetchArticles()` with new view
- Article click: `router.push({ name: 'articles.show', params: { id } })`
- Swipe-to-action: `articleStore.markRead(id)`, `articleStore.toggleReadLater(id)`
- Mark all read: `articleStore.markAllRead()`
- Pull-to-refresh: `articleStore.forceRefresh()`
- No `adjustUnreadCount` calls — counters update reactively via computed getters
- No `useArticleReadState` — the store IS the read state
- Add component name for keep-alive: `defineOptions({ name: 'ArticleListView' })`

Header sections (title, unread badge) read from `articleStore.filterTitle` and `articleStore.unreadCount`.

The view should define the `name` option for `<keep-alive>` matching:

```js
defineOptions({ name: 'ArticleListView' })
```

**Step 2: Verify the list renders from the store**

Run dev server, navigate to `/articles`. Should see the full article list loaded from `/api/articles`.

**Step 3: Commit**

```
feat: build ArticleListView reading from pinia store
```

---

## Phase 4: Article Detail View

### Task 12: Build ArticleDetailView

**Files:**
- Modify: `resources/js/Views/ArticleDetailView.vue`

**Step 1: Implement the view**

Port template from `resources/js/Pages/Articles/Show.vue` but:

```vue
<script setup>
import { useArticleStore } from '@/Stores/useArticleStore.js'
import { useRouter } from 'vue-router'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/Composables/useToast.js'

const props = defineProps({
    id: { type: Number, required: true },
})

const store = useArticleStore()
const router = useRouter()
const { success } = useToast()

// Metadata from store (instant — already loaded)
const meta = computed(() => store.articles.find(a => a.id === props.id))

// Full content (may need fetching)
const content = ref(null)
const loadingContent = ref(false)

async function loadContent(articleId) {
    loadingContent.value = true
    try {
        const data = await store.fetchContent(articleId)
        content.value = data
    } finally {
        loadingContent.value = false
    }
    store.prefetchAdjacent(articleId)
    store.markRead(articleId)
}

// Load on mount and when id changes (swipe navigation)
onMounted(() => loadContent(props.id))
watch(() => props.id, (newId) => {
    content.value = null
    loadContent(newId)
    window.scrollTo(0, 0)
})

// Navigation
const { prev, next } = computed(() => store.adjacentIds(props.id)).value
// This needs to be reactive:
const adjacent = computed(() => store.adjacentIds(props.id))

function navigateToArticle(direction) {
    const targetId = direction === 'next' ? adjacent.value.next : adjacent.value.prev
    if (!targetId) return
    router.replace({ name: 'articles.show', params: { id: targetId } })
}

function goBack() {
    router.back()
}

// Keyboard navigation
function onKeydown(e) {
    if (e.key === 'ArrowRight') navigateToArticle('next')
    else if (e.key === 'ArrowLeft') navigateToArticle('prev')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

// Swipe navigation (same touch logic as before)
let touchStartX = 0
let touchStartY = 0
const SWIPE_THRESHOLD = 80
const SWIPE_ANGLE_LIMIT = 30

function onSwipeStart(e) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
}

function onSwipeEnd(e) {
    const deltaX = e.changedTouches[0].clientX - touchStartX
    const deltaY = e.changedTouches[0].clientY - touchStartY
    const angle = Math.abs((Math.atan2(deltaY, deltaX) * 180) / Math.PI)
    if (angle > SWIPE_ANGLE_LIMIT && angle < 180 - SWIPE_ANGLE_LIMIT) return

    if (deltaX < -SWIPE_THRESHOLD) navigateToArticle('next')
    else if (deltaX > SWIPE_THRESHOLD) navigateToArticle('prev')
}
</script>
```

Key differences from old Show.vue:
- **No Inertia** — uses Vue Router for navigation
- **No props from server** — metadata from store, content fetched lazily
- **`router.replace()`** for swipe navigation — no history stacking
- **`router.back()`** for back button — returns to kept-alive list view instantly
- **No skeleton, no loading animation** — metadata renders immediately, content fills in
- **No `useArticleReadState` composable** — the store handles everything
- **`watch(() => props.id)`** handles swipe — component stays mounted, just re-fetches content

**Step 2: Verify article navigation works**

- Click article from list → detail view with content
- Swipe/arrow keys → next/prev article
- Back → list with scroll position preserved
- Unread count updates as articles are read

**Step 3: Commit**

```
feat: build ArticleDetailView with store-driven navigation
```

---

## Phase 5: Remaining Views + Cleanup

### Task 13: Migrate feed management views

**Files:**
- Modify: `resources/js/Views/FeedManageView.vue`
- Modify: `resources/js/Views/FeedCreateView.vue`
- Modify: `resources/js/Views/FeedEditView.vue`

Port from the existing Inertia pages (`Feeds/Manage.vue`, `Feeds/Create.vue`) to use axios + Vue Router instead of Inertia forms. The existing controllers already have JSON responses or can be adapted.

This is a straightforward port — the feed management views don't have complex state interactions. Use `axios.get/post/put/delete` instead of `router.post()`.

**Commit:**

```
feat: migrate feed management views to SPA
```

---

### Task 14: Migrate settings, search, OPML views

**Files:**
- Modify: `resources/js/Views/SettingsView.vue`
- Modify: `resources/js/Views/SearchView.vue`
- Modify: `resources/js/Views/OpmlImportView.vue`

Same pattern as Task 13. Port from Inertia pages to axios + Vue Router.

For SearchView, use `articleStore` search or a dedicated search action that hits `/api/articles/search`.

**Commit:**

```
feat: migrate settings, search, OPML views to SPA
```

---

### Task 15: Add "Recently Read" sidebar filter

**Files:**
- Modify: `resources/js/Views/AppLayout.vue` (add to sidebar)
- The API endpoint already handles `filter=recently_read` (added in Task 5)
- The store already handles the `recently_read` view type (added in Task 9)

**Step 1: Add to sidebar navigation**

In the sidebar component, add a "Recently Read" entry alongside "Today" and "Read Later":

```vue
<button @click="navigateTo({ type: 'recently_read' })">
    Recently Read
</button>
```

**Step 2: Add to bottom mobile nav if desired, or just sidebar**

**Step 3: Commit**

```
feat: add Recently Read sidebar filter
```

---

### Task 16: Update service worker for SPA

**Files:**
- Modify: `vite.config.js`
- Modify: `public/sw-reading-state.js` (if needed)

**Step 1: Update Workbox config for SPA navigation**

The SW currently caches Inertia responses. For the SPA, navigation requests should return the app shell (the HTML document), not individual Inertia JSON responses. Update the `navigateFallback` and runtime caching:

```js
// In VitePWA config:
workbox: {
    navigateFallback: '/index.html', // or the appropriate HTML shell
    // ... keep existing image/font caching ...
}
```

Remove or update the Inertia-specific caching rule (the one checking `X-Inertia` header).

Add a rule for caching `/api/*` JSON responses:

```js
{
    urlPattern: /^https?:\/\/.*\/api\/.*/i,
    handler: 'NetworkFirst',
    options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        cacheableResponse: { statuses: [0, 200] },
        networkTimeoutSeconds: 5,
    },
}
```

**Step 2: Commit**

```
feat: update service worker caching for SPA architecture
```

---

### Task 17: Cleanup — remove old Inertia pages and dead code

**Files:**
- Delete: `resources/js/Pages/Articles/Index.vue`
- Delete: `resources/js/Pages/Articles/Show.vue`
- Delete: `resources/js/Pages/Articles/Search.vue`
- Delete: `resources/js/Pages/Feeds/Manage.vue`
- Delete: `resources/js/Pages/Feeds/Create.vue`
- Delete: `resources/js/Pages/Settings/Index.vue`
- Delete: `resources/js/Pages/Dashboard.vue`
- Delete: `resources/js/Layouts/AppLayout.vue` (old Inertia layout)
- Delete: `resources/js/Components/ArticleListSkeleton.vue`
- Delete: `resources/js/Composables/useArticleReadState.js`
- Delete: `resources/js/Composables/useReadingState.js` (SW reading state — evaluate if still needed)
- Modify: `routes/web.php` — remove old Inertia article/feed/settings routes (keep auth routes)
- Modify: `app/Http/Controllers/ArticleController.php` — remove Inertia rendering, keep only what's needed

**Important:** Keep these Inertia pages:
- `resources/js/Pages/Auth/*` — all auth pages
- `resources/js/Pages/Welcome.vue` — landing page
- `resources/js/Pages/AppShell.vue` — the SPA shell

**Step 1: Delete files**

**Step 2: Clean up routes/web.php**

Keep: auth routes, welcome page, dashboard redirect, SPA catch-all.
Remove: all article, feed, settings, OPML Inertia routes.

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build with no missing import errors.

**Step 4: Verify app works end-to-end**

- Login → redirects to /articles → SPA boots → list loads
- Click article → detail view → swipe navigation works
- Back → list with scroll preserved
- Sidebar → switch feeds/categories → list reloads
- Mark read/unread/bookmark → store updates → counters reactive
- Recently Read filter works

**Step 5: Commit**

```
chore: remove old Inertia pages and dead composables
```

---

### Task 18: Final polish

**Files:** Various

- Run `npm run format` on all changed files
- Run `npm run build` — clean production build
- Test on mobile (PWA): install, swipe navigation, back button, offline
- Verify auth flow still works (login, register, logout)

**Commit:**

```
chore: final formatting and cleanup after SPA migration
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Foundation | 1-4 | Pinia + Vue Router installed, stores created, AppShell route |
| 2: API | 5-8 | Full JSON API, article retention rules |
| 3: List View | 9-11 | Store-driven article list with optimistic mutations |
| 4: Detail View | 12 | Swipe navigation from store order, content cache, prefetch |
| 5: Cleanup | 13-18 | Remaining views migrated, old code removed, Recently Read |

Each task has a commit. Each phase produces a working app.
