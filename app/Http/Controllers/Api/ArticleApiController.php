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
                    DB::raw('COALESCE(user_articles.is_read, 0) as is_read'),
                    DB::raw('COALESCE(user_articles.is_read_later, 0) as is_read_later'),
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

        $articles = $query->limit(1000)->get();

        // Attach feed metadata
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
        ]);
    }
}
