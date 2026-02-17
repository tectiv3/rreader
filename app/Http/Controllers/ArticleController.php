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
        $feedIds = $user->feeds()->pluck('feeds.id');

        $articles = Article::whereIn('feed_id', $feedIds)
            ->with('feed:id,title,favicon_url')
            ->leftJoin('user_articles', function ($join) use ($user) {
                $join->on('articles.id', '=', 'user_articles.article_id')
                    ->where('user_articles.user_id', '=', $user->id);
            })
            ->select([
                'articles.*',
                'user_articles.is_read',
                'user_articles.is_read_later',
            ])
            ->orderByDesc('articles.published_at')
            ->paginate(30)
            ->withQueryString();

        $unreadCount = Article::whereIn('feed_id', $feedIds)
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_read', true);
            })
            ->count();

        return Inertia::render('Articles/Index', [
            'articles' => $articles,
            'unreadCount' => $unreadCount,
        ]);
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
        $feedIds = $user->feeds()->pluck('feeds.id');

        $unreadArticleIds = Article::whereIn('feed_id', $feedIds)
            ->whereDoesntHave('users', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('is_read', true);
            })
            ->pluck('id');

        $syncData = [];
        foreach ($unreadArticleIds as $id) {
            $syncData[$id] = [
                'is_read' => true,
                'read_at' => now(),
            ];
        }

        $user->articles()->syncWithoutDetaching($syncData);

        return back();
    }
}
