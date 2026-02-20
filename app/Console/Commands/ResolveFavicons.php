<?php

namespace App\Console\Commands;

use App\Models\Feed;
use App\Services\FaviconService;
use Illuminate\Console\Command;

class ResolveFavicons extends Command
{
    protected $signature = 'feeds:resolve-favicons
                            {--feed= : Resolve for a specific feed ID}
                            {--force : Re-resolve even if favicon_url is already a local path}';

    protected $description = 'Resolve and locally cache favicons for feeds';

    public function handle(FaviconService $faviconService): int
    {
        $query = Feed::query();

        if ($feedId = $this->option('feed')) {
            $query->where('id', $feedId);
        } elseif (! $this->option('force')) {
            // Only process feeds without a local favicon
            $query->where(function ($q) {
                $q->whereNull('favicon_url')
                    ->orWhere('favicon_url', 'not like', '/storage/%');
            });
        }

        $feeds = $query->get();
        $this->info("Processing {$feeds->count()} feeds...");

        $resolved = 0;
        $failed = 0;

        $bar = $this->output->createProgressBar($feeds->count());
        $bar->start();

        foreach ($feeds as $feed) {
            $siteUrl = $feed->site_url ?: $feed->feed_url;
            $localPath = $faviconService->resolveAndStore($siteUrl, $feed->id);

            if ($localPath) {
                $feed->update(['favicon_url' => $localPath]);
                $resolved++;
            } else {
                $feed->update(['favicon_url' => null]);
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Done: {$resolved} resolved, {$failed} failed.");

        return self::SUCCESS;
    }
}
