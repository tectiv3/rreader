<?php

namespace App\Http\Controllers;

use App\Jobs\FetchFeed;
use App\Services\FeedParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeedController extends Controller
{
    public function manage(Request $request)
    {
        $user = $request->user();

        $categories = $user->categories()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->with(['feeds' => function ($query) {
                $query->orderBy('title');
            }])
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'sort_order' => $category->sort_order,
                    'feeds' => $category->feeds->map(function ($feed) {
                        return [
                            'id' => $feed->id,
                            'title' => $feed->title,
                            'feed_url' => $feed->feed_url,
                            'favicon_url' => $feed->favicon_url,
                            'disabled_at' => $feed->disabled_at,
                            'last_error' => $feed->last_error,
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();

        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get()
            ->map(function ($feed) {
                return [
                    'id' => $feed->id,
                    'title' => $feed->title,
                    'feed_url' => $feed->feed_url,
                    'favicon_url' => $feed->favicon_url,
                    'disabled_at' => $feed->disabled_at,
                    'last_error' => $feed->last_error,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Feeds/Manage', [
            'categories' => $categories,
            'uncategorizedFeeds' => $uncategorizedFeeds,
        ]);
    }

    public function create(Request $request)
    {
        $categories = $request->user()->categories()->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('Feeds/Create', [
            'categories' => $categories,
        ]);
    }

    public function preview(Request $request, FeedParserService $parser)
    {
        $request->validate([
            'url' => ['required', 'string', 'max:2048'],
        ]);

        try {
            $data = $parser->discoverAndParse($request->input('url'));
        } catch (\RuntimeException $e) {
            if ($request->wantsJson()) {
                return response()->json(['errors' => ['url' => [$e->getMessage()]]], 422);
            }

            return back()->withErrors(['url' => $e->getMessage()]);
        }

        // Check for duplicate
        $existingFeed = $request->user()->feeds()
            ->where('feed_url', $data['feed_url'])
            ->first();

        if ($existingFeed) {
            $error = 'You are already subscribed to this feed.';
            if ($request->wantsJson()) {
                return response()->json(['errors' => ['url' => [$error]]], 422);
            }

            return back()->withErrors(['url' => $error]);
        }

        $request->session()->put('feed_preview', $data);

        $categories = $request->user()->categories()->orderBy('sort_order')->get(['id', 'name']);

        $preview = [
            'feed_url' => $data['feed_url'],
            'site_url' => $data['site_url'],
            'title' => $data['title'],
            'description' => $data['description'],
            'favicon_url' => $data['favicon_url'],
            'article_count' => count($data['articles']),
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'categories' => $categories,
                'preview' => $preview,
            ]);
        }

        return Inertia::render('Feeds/Create', [
            'categories' => $categories,
            'preview' => $preview,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'feed_url' => ['required', 'string', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'new_category' => ['nullable', 'string', 'max:255'],
        ]);

        // Verify category belongs to user if provided
        if (! empty($validated['category_id'])) {
            $category = $request->user()->categories()->find($validated['category_id']);
            if (! $category) {
                return back()->withErrors(['category_id' => 'Invalid category.']);
            }
        }

        $data = $request->session()->get('feed_preview');

        if (! $data || $data['feed_url'] !== $validated['feed_url']) {
            return back()->withErrors(['feed_url' => 'Feed preview expired. Please search for the feed again.']);
        }

        // Check for duplicate using the discovered feed URL
        $existingFeed = $request->user()->feeds()
            ->where('feed_url', $data['feed_url'])
            ->first();

        if ($existingFeed) {
            return back()->withErrors(['feed_url' => 'You are already subscribed to this feed.']);
        }

        $feed = DB::transaction(function () use ($request, $validated, $data) {
            $categoryId = $validated['category_id'] ?? null;

            // Create new category if requested
            if (! empty($validated['new_category'])) {
                $maxOrder = $request->user()->categories()->max('sort_order') ?? 0;
                $category = $request->user()->categories()->create([
                    'name' => $validated['new_category'],
                    'sort_order' => $maxOrder + 1,
                ]);
                $categoryId = $category->id;
            }

            // Create the feed record using cached preview data
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

        return redirect()->route('articles.index')->with('success', 'Feed added successfully!');
    }

    public function update(Request $request, \App\Models\Feed $feed)
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer'],
        ]);

        // Verify category belongs to user if provided
        if (! empty($validated['category_id'])) {
            $category = $request->user()->categories()->find($validated['category_id']);
            if (! $category) {
                return back()->withErrors(['category_id' => 'Invalid category.']);
            }
        }

        $feed->update([
            'title' => $validated['title'],
            'category_id' => $validated['category_id'] ?? null,
        ]);

        return back();
    }

    public function destroy(Request $request, \App\Models\Feed $feed)
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        $feed->delete();

        return back();
    }

    public function reenable(Request $request, \App\Models\Feed $feed)
    {
        if ($feed->user_id !== $request->user()->id) {
            abort(404);
        }

        $feed->recordSuccess();
        FetchFeed::dispatch($feed);

        return back();
    }

    public function refresh(Request $request)
    {
        $feedIds = $request->input('feed_ids', []);

        if (empty($feedIds)) {
            // Refresh all user feeds
            $feeds = $request->user()->feeds;
        } else {
            $feeds = $request->user()->feeds()->whereIn('id', $feedIds)->get();
        }

        foreach ($feeds as $feed) {
            FetchFeed::dispatch($feed);
        }

        return back()->with('success', 'Feeds are being refreshed.');
    }
}
