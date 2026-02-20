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

    public function __construct(
        public Feed $feed
    ) {}

    public function handle(FeedParserService $parser): void
    {
        if ($this->feed->isDisabled()) {
            return;
        }

        try {
            $data = $parser->discoverAndParse($this->feed->feed_url);
        } catch (\RuntimeException|\Illuminate\Http\Client\ConnectionException $e) {
            $this->feed->recordFailure($e->getMessage());

            return;
        }

        // Update feed metadata if changed
        $metadataUpdates = [];
        if ($data['title'] && $data['title'] !== $this->feed->title) {
            $metadataUpdates['title'] = $data['title'];
        }
        if ($data['favicon_url'] && $data['favicon_url'] !== $this->feed->favicon_url) {
            $metadataUpdates['favicon_url'] = $data['favicon_url'];
        }

        $articles = $data['articles'];

        // On first fetch (new subscription), limit to 10 most recent articles
        if ($this->feed->last_fetched_at === null) {
            $articles = array_slice($articles, 0, 10);
        }

        $existingArticles = $this->feed->articles()->pluck('id', 'guid');

        foreach ($articles as $articleData) {
            $existingId = $existingArticles->get($articleData['guid']);

            if ($existingId) {
                $this->feed->articles()->where('id', $existingId)->update([
                    'title' => $articleData['title'],
                    'author' => $articleData['author'],
                    'content' => $articleData['content'],
                    'summary' => $articleData['summary'],
                    'url' => $articleData['url'],
                    'image_url' => $articleData['image_url'],
                ]);
            } else {
                $this->feed->articles()->create($articleData);
            }
        }

        // Update last_fetched_at and any metadata changes
        $this->feed->update(array_merge($metadataUpdates, [
            'last_fetched_at' => now(),
        ]));

        $this->feed->recordSuccess();
    }
}
