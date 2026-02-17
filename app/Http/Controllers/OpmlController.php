<?php

namespace App\Http\Controllers;

use App\Jobs\FetchFeed;
use App\Services\OpmlService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpmlController extends Controller
{
    public function index()
    {
        return Inertia::render('Opml/Import');
    }

    public function preview(Request $request, OpmlService $opmlService)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:text/xml,application/xml,text/plain,text/x-opml', 'max:5120'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['opml', 'xml'])) {
            return back()->withErrors(['file' => 'Please upload an .opml or .xml file.']);
        }

        try {
            $content = file_get_contents($file->getRealPath());
            $parsed = $opmlService->parse($content);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['file' => $e->getMessage()]);
        }

        // Mark already-subscribed feeds
        $existingFeedUrls = $request->user()->feeds()->pluck('feed_url')->toArray();

        $totalFeeds = 0;
        $duplicateCount = 0;

        foreach ($parsed['categories'] as &$category) {
            foreach ($category['feeds'] as &$feed) {
                $feed['is_duplicate'] = in_array($feed['feed_url'], $existingFeedUrls);
                if ($feed['is_duplicate']) {
                    $duplicateCount++;
                }
                $totalFeeds++;
            }
        }

        foreach ($parsed['uncategorized'] as &$feed) {
            $feed['is_duplicate'] = in_array($feed['feed_url'], $existingFeedUrls);
            if ($feed['is_duplicate']) {
                $duplicateCount++;
            }
            $totalFeeds++;
        }

        if ($totalFeeds === 0) {
            return back()->withErrors(['file' => 'No feeds found in the OPML file.']);
        }

        // Store parsed data in session for secure import
        $request->session()->put('opml_parsed', $parsed);

        return Inertia::render('Opml/Import', [
            'preview' => $parsed,
            'totalFeeds' => $totalFeeds,
            'duplicateCount' => $duplicateCount,
        ]);
    }

    public function import(Request $request, OpmlService $opmlService)
    {
        $request->validate([
            'selected_feeds' => ['required', 'array', 'min:1'],
            'selected_feeds.*' => ['required', 'string', 'url:http,https', 'max:2048'],
        ]);

        $parsed = $request->session()->get('opml_parsed');

        if (! $parsed) {
            return back()->withErrors(['file' => 'No OPML data found. Please upload a file first.']);
        }

        $result = $opmlService->import(
            $request->user(),
            $parsed,
            $request->input('selected_feeds'),
        );

        $request->session()->forget('opml_parsed');

        // Dispatch fetch jobs for newly imported feeds (only those without last_fetched_at)
        $newFeedUrls = $request->input('selected_feeds');
        $newFeeds = $request->user()->feeds()
            ->whereNull('last_fetched_at')
            ->whereIn('feed_url', $newFeedUrls)
            ->get();

        foreach ($newFeeds as $feed) {
            FetchFeed::dispatch($feed);
        }

        return redirect()->route('articles.index')
            ->with('success', "Imported {$result['imported']} feeds ({$result['skipped']} skipped, {$result['categories_created']} categories created).");
    }

    public function export(Request $request, OpmlService $opmlService)
    {
        $xml = $opmlService->export($request->user());

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => 'attachment; filename="rreader-subscriptions.opml"',
        ]);
    }
}
