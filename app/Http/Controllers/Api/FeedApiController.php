<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\FetchFeed;
use App\Jobs\ResolveFavicon;
use App\Models\Feed;
use App\Services\FeedParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

final class FeedApiController extends Controller
{
    public function preview(Request $request, FeedParserService $parser): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string', 'max:2048'],
        ]);

        try {
            $data = $parser->discoverAndParse($request->input('url'));
        } catch (\RuntimeException $e) {
            return response()->json(['errors' => ['url' => [$e->getMessage()]]], 422);
        }

        $existingFeed = $request->user()->feeds()
            ->where('feed_url', $data['feed_url'])
            ->first();

        if ($existingFeed) {
            return response()->json(['errors' => ['url' => ['You are already subscribed to this feed.']]], 422);
        }

        $request->session()->put('feed_preview', $data);

        $categories = $request->user()->categories()->orderBy('sort_order')->get(['id', 'name']);

        return response()->json([
            'preview' => [
                'feed_url' => $data['feed_url'],
                'site_url' => $data['site_url'],
                'title' => $data['title'],
                'description' => $data['description'],
                'favicon_url' => $data['favicon_url'],
                'article_count' => count($data['articles']),
            ],
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'feed_url' => ['required', 'string', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer'],
            'new_category' => ['nullable', 'string', 'max:255'],
        ]);

        if (! empty($validated['category_id'])) {
            $category = $request->user()->categories()->find($validated['category_id']);
            if (! $category) {
                return response()->json(['errors' => ['category_id' => ['Invalid category.']]], 422);
            }
        }

        $data = $request->session()->get('feed_preview');

        if (! $data || $data['feed_url'] !== $validated['feed_url']) {
            return response()->json(['errors' => ['feed_url' => ['Feed preview expired. Please search for the feed again.']]], 422);
        }

        $existingFeed = $request->user()->feeds()
            ->where('feed_url', $data['feed_url'])
            ->first();

        if ($existingFeed) {
            return response()->json(['errors' => ['feed_url' => ['You are already subscribed to this feed.']]], 422);
        }

        $feed = DB::transaction(function () use ($request, $validated, $data) {
            $categoryId = $validated['category_id'] ?? null;

            if (! empty($validated['new_category'])) {
                $maxOrder = $request->user()->categories()->max('sort_order') ?? 0;
                $category = $request->user()->categories()->create([
                    'name' => $validated['new_category'],
                    'sort_order' => $maxOrder + 1,
                ]);
                $categoryId = $category->id;
            }

            return $request->user()->feeds()->create([
                'category_id' => $categoryId,
                'title' => $validated['title'] ?: $data['title'],
                'feed_url' => $data['feed_url'],
                'site_url' => $data['site_url'],
                'description' => $data['description'],
                'favicon_url' => $data['favicon_url'],
            ]);
        });

        $request->session()->forget('feed_preview');

        FetchFeed::dispatch($feed);
        ResolveFavicon::dispatch($feed);

        return response()->json(['id' => $feed->id], 201);
    }

    public function manage(Request $request): JsonResponse
    {
        $user = $request->user();

        $categories = $user->categories()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['feeds' => fn ($q) => $q->orderBy('title')])
            ->get()
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'feeds' => $category->feeds->map(fn ($feed) => [
                    'id' => $feed->id,
                    'title' => $feed->title,
                    'favicon_url' => $feed->favicon_url,
                    'feed_url' => $feed->feed_url,
                    'site_url' => $feed->site_url,
                    'disabled_at' => $feed->disabled_at,
                    'last_error' => $feed->last_error,
                ]),
            ]);

        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get()
            ->map(fn ($feed) => [
                'id' => $feed->id,
                'title' => $feed->title,
                'favicon_url' => $feed->favicon_url,
                'feed_url' => $feed->feed_url,
                'site_url' => $feed->site_url,
                'disabled_at' => $feed->disabled_at,
                'last_error' => $feed->last_error,
            ]);

        return response()->json([
            'categories' => $categories,
            'uncategorizedFeeds' => $uncategorizedFeeds,
        ]);
    }

    public function update(Request $request, Feed $feed): Response
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'feed_url' => ['sometimes', 'url', 'max:2048'],
            'category_id' => ['nullable', 'integer'],
        ]);

        if (! empty($validated['category_id'])) {
            $category = $request->user()->categories()->find($validated['category_id']);
            if (! $category) {
                abort(response()->json(['errors' => ['category_id' => ['Invalid category.']]], 422));
            }
        }

        $data = [
            'title' => $validated['title'],
            'category_id' => $validated['category_id'] ?? null,
        ];

        $urlChanged = isset($validated['feed_url']) && $validated['feed_url'] !== $feed->feed_url;

        if (isset($validated['feed_url'])) {
            $data['feed_url'] = $validated['feed_url'];
        }

        $feed->update($data);

        if ($urlChanged) {
            ResolveFavicon::dispatch($feed);
        }

        return response()->noContent();
    }

    public function destroy(Request $request, Feed $feed): Response
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        $feed->delete();

        return response()->noContent();
    }

    public function refresh(Request $request, Feed $feed): Response
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        FetchFeed::dispatchSync($feed);

        return response()->noContent();
    }

    public function reenable(Request $request, Feed $feed): Response
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        $feed->recordSuccess();
        FetchFeed::dispatch($feed);

        return response()->noContent();
    }
}
