<?php

namespace App\Console\Commands;

use App\Jobs\FetchFeed;
use App\Models\Feed;
use Illuminate\Console\Command;

class FetchAllFeeds extends Command
{
    protected $signature = 'feeds:fetch-all';

    protected $description = 'Fetch new articles for all feeds';

    public function handle(): int
    {
        $feeds = Feed::all();
        $dispatched = 0;
        $skipped = 0;

        foreach ($feeds as $feed) {
            if ($feed->isDisabled()) {
                $this->line("Skipping disabled feed [{$feed->id}]: {$feed->title}");
                $skipped++;

                continue;
            }

            if ($feed->shouldSkipRefresh()) {
                $this->line("Skipping backoff feed [{$feed->id}] ({$feed->consecutive_failures} failures): {$feed->title}");
                $skipped++;

                continue;
            }

            FetchFeed::dispatch($feed);
            $dispatched++;
        }

        $this->info("Dispatched {$dispatched} feed fetch jobs, skipped {$skipped}.");

        return Command::SUCCESS;
    }
}
