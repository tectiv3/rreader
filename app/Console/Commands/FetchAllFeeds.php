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

        $this->info("Dispatching fetch jobs for {$feeds->count()} feeds...");

        foreach ($feeds as $feed) {
            FetchFeed::dispatch($feed);
        }

        $this->info('All feed fetch jobs dispatched.');

        return Command::SUCCESS;
    }
}
