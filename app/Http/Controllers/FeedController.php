<?php

namespace App\Http\Controllers;

use App\Services\FeedParserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeedController extends Controller
{
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
            return back()->withErrors(['url' => $e->getMessage()]);
        }

        // Check for duplicate
        $existingFeed = $request->user()->feeds()
            ->where('feed_url', $data['feed_url'])
            ->first();

        if ($existingFeed) {
            return back()->withErrors(['url' => 'You are already subscribed to this feed.']);
        }

        $categories = $request->user()->categories()->orderBy('sort_order')->get(['id', 'name']);

        return Inertia::render('Feeds/Create', [
            'categories' => $categories,
            'preview' => [
                'feed_url' => $data['feed_url'],
                'site_url' => $data['site_url'],
                'title' => $data['title'],
                'description' => $data['description'],
                'favicon_url' => $data['favicon_url'],
                'article_count' => count($data['articles']),
            ],
        ]);
    }

    public function store(Request $request, FeedParserService $parser)
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

        // Check for duplicate
        $existingFeed = $request->user()->feeds()
            ->where('feed_url', $validated['feed_url'])
            ->first();

        if ($existingFeed) {
            return back()->withErrors(['feed_url' => 'You are already subscribed to this feed.']);
        }

        // Parse the feed to get articles
        try {
            $data = $parser->discoverAndParse($validated['feed_url']);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['feed_url' => $e->getMessage()]);
        }

        DB::transaction(function () use ($request, $validated, $data) {
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

            // Create the feed
            $feed = $request->user()->feeds()->create([
                'category_id' => $categoryId,
                'title' => $validated['title'] ?: $data['title'],
                'feed_url' => $data['feed_url'],
                'site_url' => $data['site_url'],
                'description' => $data['description'],
                'favicon_url' => $data['favicon_url'],
                'last_fetched_at' => now(),
            ]);

            // Store initial articles
            foreach ($data['articles'] as $articleData) {
                $feed->articles()->create($articleData);
            }
        });

        return redirect()->route('dashboard')->with('success', 'Feed added successfully!');
    }
}
