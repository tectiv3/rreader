<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class SidebarApiController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(self::buildSidebarData($request->user()));
    }

    /**
     * Build full sidebar data including counts. Used by the API endpoint
     * and the SPA catch-all route for initial hydration.
     */
    public static function buildSidebarData($user): array
    {
        $allFeedIds = $user->feeds()->pluck('feeds.id');

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
            ->with(['feeds' => fn ($q) => $q->orderBy('title')])
            ->get()
            ->map(function ($category) use ($feedUnreadCounts) {
                $feeds = $category->feeds->map(fn ($feed) => [
                    'id' => $feed->id,
                    'title' => $feed->title,
                    'favicon_url' => $feed->favicon_url,
                    'description' => $feed->description,
                    'site_url' => $feed->site_url,
                    'unread_count' => $feedUnreadCounts[$feed->id] ?? 0,
                    'disabled_at' => $feed->disabled_at,
                ]);

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'unread_count' => $feeds->sum('unread_count'),
                    'feeds' => $feeds->values()->all(),
                ];
            });

        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get()
            ->map(fn ($feed) => [
                'id' => $feed->id,
                'title' => $feed->title,
                'favicon_url' => $feed->favicon_url,
                'description' => $feed->description,
                'site_url' => $feed->site_url,
                'unread_count' => $feedUnreadCounts[$feed->id] ?? 0,
                'disabled_at' => $feed->disabled_at,
            ])
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
}
