<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArticleApiController extends Controller
{
    private const DEFAULT_PER_PAGE = 30;

    private const MAX_PER_PAGE = 100;

    public function index(Request $request)
    {
        $user = $request->user();
        $filter = $request->query('filter');
        $cursor = $request->query('cursor');
        $perPage = $this->perPage($request);

        [$feedIds, $filterTitle] = $this->resolveFilter(
            $user,
            $request->query('feed_id'),
            $request->query('category_id')
        );

        $filterTitle = match ($filter) {
            'today' => 'Today',
            'read_later' => 'Read Later',
            'recently_read' => 'Recently Read',
            default => $filterTitle,
        };

        if ($filter === 'read_later') {
            $query = $user
                ->feedArticles()
                ->withRequiredUserState($user->id)
                ->readLater()
                ->select($this->listSelect());

            if ($cursor) {
                [$cursorDate, $cursorId] = explode(',', $cursor, 2);
                $query->publishedAtCursor($cursorDate, $cursorId);
            }
        } elseif ($filter === 'recently_read') {
            $query = $user
                ->feedArticles()
                ->withRequiredUserState($user->id)
                ->recentlyRead()
                ->select($this->listSelect())
                ->orderByDesc('user_articles.read_at');

            if ($cursor) {
                [$cursorReadAt, $cursorId] = explode(',', $cursor, 2);
                $query->readAtCursor($cursorReadAt, $cursorId);
            }
        } else {
            $query = $user
                ->feedArticles()
                ->when($feedIds !== null, fn($q) => $q->whereIn('articles.feed_id', $feedIds))
                ->withUserState($user->id)
                ->select($this->listSelect());

            if ($filter === 'today') {
                $query->whereDate('articles.published_at', today());
            }

            $hideRead = $user->settings['hide_read_articles'] ?? false;
            $showAll = $request->query('feed_id') && $request->boolean('show_all');
            if ($hideRead && !$showAll) {
                $query->whereNull('user_articles.read_at');
            }

            if ($cursor) {
                [$cursorDate, $cursorId] = explode(',', $cursor, 2);
                $query->publishedAtCursor($cursorDate, $cursorId);
            }
        }

        if ($filter !== 'recently_read') {
            $query->orderByDesc('articles.published_at')->orderByDesc('articles.id');
        }

        $cursorField = $filter === 'recently_read' ? 'read_at' : 'published_at';
        [$articles, $hasMore, $nextCursor] = $this->paginateWithCursor(
            $query,
            $perPage,
            $cursorField
        );
        $this->attachFeedMeta($articles, $user);

        return response()->json([
            'articles' => ArticleResource::collection($articles),
            'filter_title' => $filterTitle,
            'has_more' => $hasMore,
            'next_cursor' => $nextCursor,
        ]);
    }

    public function show(Request $request, Article $article)
    {
        $user = $request->user();
        $article->load('feed');

        $userArticle = $user
            ->articles()
            ->where('article_id', $article->id)
            ->first();
        $article->is_read_later = (bool) $userArticle?->pivot?->is_read_later;

        return response()->json((new ArticleResource($article))->asDetail());
    }

    public function update(Request $request, Article $article)
    {
        $user = $request->user();

        $data = $request->validate([
            'is_read' => 'sometimes|boolean',
            'is_read_later' => 'sometimes|boolean',
        ]);

        $pivot = [];
        if (array_key_exists('is_read', $data)) {
            $pivot['read_at'] = $data['is_read'] ? now() : null;
        }
        if (array_key_exists('is_read_later', $data)) {
            $pivot['is_read_later'] = $data['is_read_later'];
        }

        $user->articles()->syncWithoutDetaching([$article->id => $pivot]);

        return response()->noContent();
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        $filter = $request->input('filter');

        [$feedIds] = $this->resolveFilter(
            $user,
            $request->input('feed_id'),
            $request->input('category_id')
        );

        $articleIds = $user
            ->feedArticles()
            ->when($feedIds !== null, fn($q) => $q->whereIn('articles.feed_id', $feedIds))
            ->when(
                $filter === 'today',
                fn($q) => $q->whereDate('articles.published_at', today())
            )
            ->pluck('articles.id');

        $records = $articleIds->mapWithKeys(fn($id) => [$id => ['read_at' => now()]])->all();

        $user->articles()->syncWithoutDetaching($records);

        return response()->noContent();
    }

    public function search(Request $request)
    {
        $user = $request->user();
        $q = $request->query('q', '');
        $cursor = $request->query('cursor');
        $perPage = $this->perPage($request);

        if (strlen($q) < 2) {
            return response()->json([
                'articles' => [],
                'has_more' => false,
                'next_cursor' => null,
            ]);
        }

        $query = $user
            ->feedArticles()
            ->search($q)
            ->withUserState($user->id)
            ->select($this->listSelect())
            ->orderByDesc('articles.published_at')
            ->orderByDesc('articles.id');

        if ($cursor) {
            [$cursorDate, $cursorId] = explode(',', $cursor, 2);
            $query->publishedAtCursor($cursorDate, $cursorId);
        }

        [$articles, $hasMore, $nextCursor] = $this->paginateWithCursor(
            $query,
            $perPage,
            'published_at'
        );
        $this->attachFeedMeta($articles, $user);

        return response()->json([
            'articles' => ArticleResource::collection($articles),
            'has_more' => $hasMore,
            'next_cursor' => $nextCursor,
        ]);
    }

    // Private helpers

    private function listSelect(): array
    {
        return [
            'articles.id',
            'articles.title',
            'articles.feed_id',
            'articles.image_url',
            'articles.published_at',
            'articles.url',
            DB::raw(
                'CASE WHEN user_articles.read_at IS NOT NULL THEN 1 ELSE 0 END as is_read'
            ),
            DB::raw('COALESCE(user_articles.is_read_later, 0) as is_read_later'),
            'user_articles.read_at',
        ];
    }

    private function resolveFilter($user, ?string $feedId, ?string $categoryId): array
    {
        $feedIds = null;
        $filterTitle = 'All Feeds';

        if ($feedId) {
            $feed = $user
                ->feeds()
                ->where('feeds.id', $feedId)
                ->first();
            if ($feed) {
                $feedIds = [$feed->id];
                $filterTitle = $feed->title;
            }
        } elseif ($categoryId) {
            $category = $user
                ->categories()
                ->where('id', $categoryId)
                ->first();
            if ($category) {
                $catFeedIds = $category
                    ->feeds()
                    ->pluck('feeds.id')
                    ->all();
                $feedIds = !empty($catFeedIds) ? $catFeedIds : [];
                $filterTitle = $category->name;
            }
        }

        return [$feedIds, $filterTitle];
    }

    private function attachFeedMeta($articles, $user): void
    {
        $feedMap = $user
            ->feeds()
            ->select('feeds.id', 'feeds.title', 'feeds.favicon_url')
            ->get()
            ->keyBy('id');

        $articles->transform(function ($article) use ($feedMap) {
            $feed = $feedMap[$article->feed_id] ?? null;
            $article->feed_title = $feed?->title;
            $article->feed_favicon_url = $feed?->favicon_url;

            return $article;
        });
    }

    private function paginateWithCursor($query, int $perPage, string $cursorField): array
    {
        $articles = $query->limit($perPage + 1)->get();
        $hasMore = $articles->count() > $perPage;
        if ($hasMore) {
            $articles->pop();
        }

        $lastArticle = $articles->last();
        $nextCursor = null;
        if ($hasMore && $lastArticle) {
            $nextCursor = $lastArticle->$cursorField . ',' . $lastArticle->id;
        }

        return [$articles, $hasMore, $nextCursor];
    }

    private function perPage(Request $request): int
    {
        return min($request->integer('per_page', self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
    }
}
