<?php

namespace App\Jobs;

use App\Models\Feed;
use App\Services\FeedParserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class FetchFeed implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [60, 300, 900];

    public function __construct(
        public Feed $feed
    ) {}

    public function handle(FeedParserService $parser): void
    {
        try {
            $data = $parser->discoverAndParse($this->feed->feed_url);
        } catch (\RuntimeException $e) {
            Log::warning("FetchFeed failed for feed {$this->feed->id}: {$e->getMessage()}");
            throw $e;
        }

        // Update feed metadata if changed
        $metadataUpdates = [];
        if ($data['title'] && $data['title'] !== $this->feed->title) {
            $metadataUpdates['title'] = $data['title'];
        }
        if ($data['favicon_url'] && $data['favicon_url'] !== $this->feed->favicon_url) {
            $metadataUpdates['favicon_url'] = $data['favicon_url'];
        }

        // Insert new articles, skip existing by guid
        $existingGuids = $this->feed->articles()->pluck('guid')->toArray();

        foreach ($data['articles'] as $articleData) {
            if (in_array($articleData['guid'], $existingGuids)) {
                continue;
            }
            $this->feed->articles()->create($articleData);
        }

        // Update last_fetched_at and any metadata changes
        $this->feed->update(array_merge($metadataUpdates, [
            'last_fetched_at' => now(),
        ]));
    }
}
