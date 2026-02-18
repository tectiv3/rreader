<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\FetchFeed;
use App\Services\OpmlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OpmlApiController extends Controller
{
    public function preview(Request $request, OpmlService $opmlService): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:text/xml,application/xml,text/plain,text/x-opml', 'max:5120'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['opml', 'xml'])) {
            return response()->json(['errors' => ['file' => ['Please upload an .opml or .xml file.']]], 422);
        }

        try {
            $content = file_get_contents($file->getRealPath());
            $parsed = $opmlService->parse($content);
        } catch (\RuntimeException $e) {
            return response()->json(['errors' => ['file' => [$e->getMessage()]]], 422);
        }

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
            return response()->json(['errors' => ['file' => ['No feeds found in the OPML file.']]], 422);
        }

        $request->session()->put('opml_parsed', $parsed);

        return response()->json([
            'preview' => $parsed,
            'totalFeeds' => $totalFeeds,
            'duplicateCount' => $duplicateCount,
        ]);
    }

    public function import(Request $request, OpmlService $opmlService): JsonResponse
    {
        $request->validate([
            'selected_feeds' => ['required', 'array', 'min:1'],
            'selected_feeds.*' => ['required', 'string', 'url:http,https', 'max:2048'],
        ]);

        $parsed = $request->session()->get('opml_parsed');

        if (! $parsed) {
            return response()->json(['errors' => ['file' => ['No OPML data found. Please upload a file first.']]], 422);
        }

        $result = $opmlService->import(
            $request->user(),
            $parsed,
            $request->input('selected_feeds'),
        );

        $request->session()->forget('opml_parsed');

        $newFeedUrls = $request->input('selected_feeds');
        $newFeeds = $request->user()->feeds()
            ->whereNull('last_fetched_at')
            ->whereIn('feed_url', $newFeedUrls)
            ->get();

        foreach ($newFeeds as $feed) {
            FetchFeed::dispatch($feed);
        }

        return response()->json([
            'imported' => $result['imported'],
            'skipped' => $result['skipped'],
            'categories_created' => $result['categories_created'],
        ]);
    }
}
