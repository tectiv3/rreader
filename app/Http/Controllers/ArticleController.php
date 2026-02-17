<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $allFeedIds = $user->feeds()->pluck('feeds.id');

        // Determine which feeds to show based on filters
        $feedId = $request->query('feed_id');
        $categoryId = $request->query('category_id');
        $filter = $request->query('filter');

        $feedIds = $allFeedIds;
        $filterTitle = 'All Feeds';
        $activeFeedId = null;
        $activeCategoryId = null;
        $activeFilter = null;

        if ($feedId) {
            $feed = $user->feeds()->where('feeds.id', $feedId)->first();
            if ($feed) {
                $feedIds = collect([$feed->id]);
                $filterTitle = $feed->title;
                $activeFeedId = (int) $feedId;
            }
        } elseif ($categoryId) {
            $category = $user->categories()->where('id', $categoryId)->first();
            if ($category) {
                $catFeedIds = $category->feeds()->pluck('feeds.id');
                $feedIds = $catFeedIds->isNotEmpty() ? $catFeedIds : collect([]);
                $filterTitle = $category->name;
                $activeCategoryId = (int) $categoryId;
            }
        } elseif ($filter === 'today') {
            $activeFilter = 'today';
            $filterTitle = 'Today';
        } elseif ($filter === 'read_later') {
            $activeFilter = 'read_later';
            $filterTitle = 'Read Later';
        }

        if ($activeFilter === 'read_later') {
            $query = Article::whereIn('feed_id', $allFeedIds)
                ->with('feed:id,title,favicon_url')
                ->join('user_articles', function ($join) use ($user) {
                    $join->on('articles.id', '=', 'user_articles.article_id')
                        ->where('user_articles.user_id', '=', $user->id)
                        ->where('user_articles.is_read_later', '=', true);
                })
                ->select([
                    'articles.*',
                    'user_articles.is_read',
                    'user_articles.is_read_later',
                ]);
        } else {
            $query = Article::whereIn('feed_id', $feedIds)
                ->with('feed:id,title,favicon_url')
                ->leftJoin('user_articles', function ($join) use ($user) {
                    $join->on('articles.id', '=', 'user_articles.article_id')
                        ->where('user_articles.user_id', '=', $user->id);
                })
                ->select([
                    'articles.*',
                    'user_articles.is_read',
                    'user_articles.is_read_later',
                ]);

            if ($activeFilter === 'today') {
                $query->whereDate('articles.published_at', today());
            }
        }

        $articles = $query->orderByDesc('articles.published_at')
            ->paginate(30)
            ->withQueryString();

        // Sidebar data includes totalUnread, so reuse it
        $sidebarData = $this->getSidebarData($user, $allFeedIds);

        // Compute view-specific unread count
        if (!$activeFeedId && !$activeCategoryId && !$activeFilter) {
            $unreadCount = $sidebarData['totalUnread'];
        } else {
            $unreadCount = Article::whereIn('feed_id', $feedIds)
                ->whereDoesntHave('users', function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->where('is_read', true);
                })
                ->when($activeFilter === 'today', function ($query) {
                    $query->whereDate('published_at', today());
                })
                ->count();
        }

        return Inertia::render('Articles/Index', [
            'articles' => $articles,
            'unreadCount' => $unreadCount,
            'filterTitle' => $filterTitle,
            'activeFeedId' => $activeFeedId,
            'activeCategoryId' => $activeCategoryId,
            'activeFilter' => $activeFilter,
            'sidebar' => $sidebarData,
        ]);
    }

    private function getSidebarData($user, $allFeedIds): array
    {
        $totalUnread = Article::whereIn('feed_id', $allFeedIds)
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_read', true);
            })
            ->count();

        $readLaterCount = $user->articles()
            ->wherePivot('is_read_later', true)
            ->count();

        $todayCount = Article::whereIn('feed_id', $allFeedIds)
            ->whereDate('published_at', today())
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_read', true);
            })
            ->count();

        // Get per-feed unread counts
        $feedUnreadCounts = Article::whereIn('feed_id', $allFeedIds)
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_read', true);
            })
            ->selectRaw('feed_id, count(*) as unread_count')
            ->groupBy('feed_id')
            ->pluck('unread_count', 'feed_id');

        $categories = $user->categories()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['feeds' => function ($query) {
                $query->orderBy('title');
            }])
            ->get()
            ->map(function ($category) use ($feedUnreadCounts) {
                $feeds = $category->feeds->map(function ($feed) use ($feedUnreadCounts) {
                    return [
                        'id' => $feed->id,
                        'title' => $feed->title,
                        'favicon_url' => $feed->favicon_url,
                        'unread_count' => $feedUnreadCounts[$feed->id] ?? 0,
                    ];
                });

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'unread_count' => $feeds->sum('unread_count'),
                    'feeds' => $feeds->values()->all(),
                ];
            });

        // Uncategorized feeds
        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get()
            ->map(function ($feed) use ($feedUnreadCounts) {
                return [
                    'id' => $feed->id,
                    'title' => $feed->title,
                    'favicon_url' => $feed->favicon_url,
                    'unread_count' => $feedUnreadCounts[$feed->id] ?? 0,
                ];
            })
            ->values()
            ->all();

        return [
            'totalUnread' => $totalUnread,
            'readLaterCount' => $readLaterCount,
            'todayCount' => $todayCount,
            'categories' => $categories->values()->all(),
            'uncategorizedFeeds' => $uncategorizedFeeds,
        ];
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'article_ids' => 'required|array',
            'article_ids.*' => 'integer|exists:articles,id',
        ]);

        $user = $request->user();

        foreach ($request->article_ids as $articleId) {
            $user->articles()->syncWithoutDetaching([
                $articleId => [
                    'is_read' => true,
                    'read_at' => now(),
                ],
            ]);
        }

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $allFeedIds = $user->feeds()->pluck('feeds.id');

        $feedId = $request->input('feed_id');
        $categoryId = $request->input('category_id');
        $filter = $request->input('filter');

        $feedIds = $allFeedIds;

        if ($feedId) {
            $feed = $user->feeds()->where('feeds.id', $feedId)->first();
            if ($feed) {
                $feedIds = collect([$feed->id]);
            }
        } elseif ($categoryId) {
            $category = $user->categories()->where('id', $categoryId)->first();
            if ($category) {
                $catFeedIds = $category->feeds()->pluck('feeds.id');
                if ($catFeedIds->isNotEmpty()) {
                    $feedIds = $catFeedIds;
                }
            }
        }

        $query = Article::whereIn('feed_id', $feedIds)
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_read', true);
            });

        if ($filter === 'today') {
            $query->whereDate('published_at', today());
        }

        $query->chunkById(500, function ($articles) use ($user) {
            $syncData = [];
            foreach ($articles as $article) {
                $syncData[$article->id] = [
                    'is_read' => true,
                    'read_at' => now(),
                ];
            }
            $user->articles()->syncWithoutDetaching($syncData);
        });

        return back();
    }

    public function show(Request $request, Article $article)
    {
        $user = $request->user();

        // Ensure the article belongs to one of the user's feeds
        $userFeedIds = $user->feeds()->pluck('feeds.id');
        if (!$userFeedIds->contains($article->feed_id)) {
            abort(404);
        }

        $article->load('feed:id,title,favicon_url,site_url');

        // Get read state
        $userArticle = $user->articles()->where('article_id', $article->id)->first();
        $article->is_read = $userArticle?->pivot?->is_read ?? false;
        $article->is_read_later = $userArticle?->pivot?->is_read_later ?? false;

        // Mark as read
        $user->articles()->syncWithoutDetaching([
            $article->id => [
                'is_read' => true,
                'read_at' => now(),
            ],
        ]);

        return Inertia::render('Articles/Show', [
            'article' => $article,
        ]);
    }

    public function toggleReadLater(Request $request, Article $article)
    {
        $user = $request->user();
        $userFeedIds = $user->feeds()->pluck('feeds.id');
        if (!$userFeedIds->contains($article->feed_id)) {
            abort(404);
        }

        $existing = $user->articles()->where('article_id', $article->id)->first();
        $isReadLater = !($existing?->pivot?->is_read_later ?? false);

        $user->articles()->syncWithoutDetaching([
            $article->id => [
                'is_read_later' => $isReadLater,
            ],
        ]);

        return back();
    }

    public function markAsUnread(Request $request, Article $article)
    {
        $user = $request->user();
        $userFeedIds = $user->feeds()->pluck('feeds.id');
        if (!$userFeedIds->contains($article->feed_id)) {
            abort(404);
        }

        $user->articles()->syncWithoutDetaching([
            $article->id => [
                'is_read' => false,
                'read_at' => null,
            ],
        ]);

        return back();
    }
}
