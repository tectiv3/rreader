<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArticleApiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $allFeedIds = $user->feeds()->pluck('feeds.id');
        $feedId = $request->query('feed_id');
        $categoryId = $request->query('category_id');
        $filter = $request->query('filter');
        $cursor = $request->query('cursor');
        $perPage = 30;

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

            if ($cursor) {
                [$cursorDate, $cursorId] = explode(',', $cursor, 2);
                $query->where(function ($q) use ($cursorDate, $cursorId) {
                    $q->where('articles.published_at', '<', $cursorDate)
                      ->orWhere(function ($q2) use ($cursorDate, $cursorId) {
                          $q2->where('articles.published_at', '=', $cursorDate)
                              ->where('articles.id', '<', $cursorId);
                      });
                });
            }
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

            if ($cursor) {
                [$cursorReadAt, $cursorId] = explode(',', $cursor, 2);
                $query->where(function ($q) use ($cursorReadAt, $cursorId) {
                    $q->where('user_articles.read_at', '<', $cursorReadAt)
                      ->orWhere(function ($q2) use ($cursorReadAt, $cursorId) {
                          $q2->where('user_articles.read_at', '=', $cursorReadAt)
                              ->where('articles.id', '<', $cursorId);
                      });
                });
            }
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
                    DB::raw('COALESCE(user_articles.is_read, 0) as is_read'),
                    DB::raw('COALESCE(user_articles.is_read_later, 0) as is_read_later'),
                    'user_articles.read_at',
                ]);

            if ($filter === 'today') {
                $query->whereDate('articles.published_at', today());
            }

            $hideRead = $user->settings['hide_read_articles'] ?? false;
            if ($hideRead) {
                $query->where(fn ($q) => $q->whereNull('user_articles.is_read')
                                            ->orWhere('user_articles.is_read', false));
            }

            if ($cursor) {
                [$cursorDate, $cursorId] = explode(',', $cursor, 2);
                $query->where(function ($q) use ($cursorDate, $cursorId) {
                    $q->where('articles.published_at', '<', $cursorDate)
                      ->orWhere(function ($q2) use ($cursorDate, $cursorId) {
                          $q2->where('articles.published_at', '=', $cursorDate)
                              ->where('articles.id', '<', $cursorId);
                      });
                });
            }
        }

        if ($filter !== 'recently_read') {
            $query->orderByDesc('articles.published_at')
                  ->orderByDesc('articles.id');
        }

        $articles = $query->limit($perPage + 1)->get();
        $hasMore = $articles->count() > $perPage;
        if ($hasMore) {
            $articles->pop();
        }

        $lastArticle = $articles->last();
        $nextCursor = null;
        if ($hasMore && $lastArticle) {
            if ($filter === 'recently_read') {
                $nextCursor = $lastArticle->read_at . ',' . $lastArticle->id;
            } else {
                $nextCursor = $lastArticle->published_at . ',' . $lastArticle->id;
            }
        }

        $feedMap = $user->feeds()
            ->select('feeds.id', 'feeds.title', 'feeds.favicon_url')
            ->get()
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
            'has_more' => $hasMore,
            'next_cursor' => $nextCursor,
        ]);
    }

    public function show(Request $request, Article $article)
    {
        $user = $request->user();
        $userFeedIds = $user->feeds()->pluck('feeds.id');

        if (!$userFeedIds->contains($article->feed_id)) {
            abort(404);
        }

        $feed = $article->feed;

        // Check user read state
        $userArticle = $user->articles()->where('article_id', $article->id)->first();

        return response()->json([
            'id' => $article->id,
            'title' => $article->title,
            'content' => $article->content,
            'summary' => $article->summary,
            'author' => $article->author,
            'url' => $article->url,
            'image_url' => $article->image_url,
            'published_at' => $article->published_at,
            'feed_id' => $article->feed_id,
            'feed_title' => $feed?->title,
            'feed_favicon_url' => $feed?->favicon_url,
            'is_read_later' => (bool) $userArticle?->pivot?->is_read_later,
        ]);
    }

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
            ->when($filter === 'today', fn ($q) => $q->whereDate('published_at', today()))
            ->pluck('id');

        // Upsert read state for all articles
        $records = $articleIds->mapWithKeys(fn ($id) => [
            $id => ['is_read' => true, 'read_at' => now()],
        ])->all();

        $user->articles()->syncWithoutDetaching($records);

        return response()->noContent();
    }

    public function search(Request $request)
    {
        $user = $request->user();
        $q = $request->query('q', '');
        $cursor = $request->query('cursor');
        $perPage = 30;

        if (strlen($q) < 2) {
            return response()->json([
                'articles' => [],
                'has_more' => false,
                'next_cursor' => null,
            ]);
        }

        $feedIds = $user->feeds()->pluck('feeds.id');

        $query = Article::whereIn('feed_id', $feedIds)
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
                DB::raw('COALESCE(user_articles.is_read, 0) as is_read'),
                DB::raw('COALESCE(user_articles.is_read_later, 0) as is_read_later'),
            ])
            ->orderByDesc('articles.published_at')
            ->orderByDesc('articles.id');

        if ($cursor) {
            [$cursorDate, $cursorId] = explode(',', $cursor, 2);
            $query->where(function ($q) use ($cursorDate, $cursorId) {
                $q->where('articles.published_at', '<', $cursorDate)
                  ->orWhere(function ($q2) use ($cursorDate, $cursorId) {
                      $q2->where('articles.published_at', '=', $cursorDate)
                          ->where('articles.id', '<', $cursorId);
                  });
            });
        }

        $articles = $query->limit($perPage + 1)->get();
        $hasMore = $articles->count() > $perPage;
        if ($hasMore) {
            $articles->pop();
        }

        $lastArticle = $articles->last();
        $nextCursor = null;
        if ($hasMore && $lastArticle) {
            $nextCursor = $lastArticle->published_at . ',' . $lastArticle->id;
        }

        $feedMap = $user->feeds()
            ->select('feeds.id', 'feeds.title', 'feeds.favicon_url')
            ->get()
            ->keyBy('id');

        $articles->transform(function ($article) use ($feedMap) {
            $feed = $feedMap[$article->feed_id] ?? null;
            $article->feed_title = $feed?->title;
            $article->feed_favicon_url = $feed?->favicon_url;
            return $article;
        });

        return response()->json([
            'articles' => $articles,
            'has_more' => $hasMore,
            'next_cursor' => $nextCursor,
        ]);
    }
}
