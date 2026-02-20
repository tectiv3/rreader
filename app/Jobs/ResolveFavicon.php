<?php

namespace App\Jobs;

use App\Models\Feed;
use App\Services\FaviconService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ResolveFavicon implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(public Feed $feed) {}

    public function handle(FaviconService $faviconService): void
    {
        $siteUrl = $this->feed->site_url ?: $this->feed->feed_url;

        $localPath = $faviconService->resolveAndStore($siteUrl, $this->feed->id);

        $this->feed->update(['favicon_url' => $localPath]);
    }
}
