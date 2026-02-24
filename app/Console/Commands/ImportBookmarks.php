<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Feed;
use App\Models\User;
use App\Services\BookmarkParserService;
use App\Services\ContentExtractorService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ImportBookmarks extends Command
{
    protected $signature = 'import:bookmarks {file : Path to the Netscape bookmark HTML file} {--email= : Email of the user to import into}';

    protected $description = 'Import bookmarks from a Feedly export HTML file';

    public function handle(BookmarkParserService $parser, ContentExtractorService $extractor): int
    {
        $filePath = $this->argument('file');
        $email = $this->option('email');

        if (! $email) {
            $this->error('The --email option is required.');

            return Command::FAILURE;
        }

        if (! file_exists($filePath) || ! is_readable($filePath)) {
            $this->error("File not found or not readable: {$filePath}");

            return Command::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User not found: {$email}");

            return Command::FAILURE;
        }

        $html = file_get_contents($filePath);
        $bookmarks = $parser->parse($html);

        if (empty($bookmarks)) {
            $this->warn('No bookmarks found in the file.');

            return Command::SUCCESS;
        }

        $count = count($bookmarks);
        $this->info("Found {$count} bookmarks. Starting import...");

        $feedsByDomain = $this->buildFeedDomainMap($user);

        $catchAllFeed = Feed::firstOrCreate(
            ['user_id' => $user->id, 'title' => 'Feedly Imports'],
            ['feed_url' => 'import://feedly', 'site_url' => 'https://feedly.com']
        );

        $existingUrls = Article::pluck('id', 'url');

        $imported = 0;
        $skipped = 0;
        $failed = 0;

        $bar = $this->output->createProgressBar($count);
        $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% — %message%');
        $bar->setMessage('Starting...');
        $bar->start();

        foreach ($bookmarks as $bookmark) {
            $bar->setMessage(mb_strimwidth($bookmark['title'], 0, 50, '...'));

            if ($existingUrls->has($bookmark['url'])) {
                $skipped++;
                $bar->advance();

                continue;
            }

            $domain = parse_url($bookmark['url'], PHP_URL_HOST);
            $feed = $feedsByDomain[$domain] ?? $catchAllFeed;

            $extracted = $extractor->extract($bookmark['url']);

            $publishedAt = $bookmark['add_date'] > 0
                ? Carbon::createFromTimestamp($bookmark['add_date'])
                : now();

            $article = $feed->articles()->create([
                'guid' => $bookmark['url'],
                'url' => $bookmark['url'],
                'title' => $bookmark['title'],
                'content' => $extracted['content'] ?? null,
                'summary' => $extracted['excerpt'] ?? null,
                'published_at' => $publishedAt,
            ]);

            $user->articles()->attach($article->id, [
                'is_read_later' => true,
                'read_at' => $publishedAt,
                'created_at' => $publishedAt,
                'updated_at' => $publishedAt,
            ]);

            if ($extracted === null) {
                $failed++;
            }

            $imported++;
            $existingUrls[$bookmark['url']] = $article->id;
            $bar->advance();
        }

        $bar->setMessage('Done!');
        $bar->finish();
        $this->newLine(2);

        $this->info('Import complete:');
        $this->line("  Imported: {$imported}");
        $this->line("  Skipped (duplicate): {$skipped}");
        $this->line("  No content (title only): {$failed}");

        return Command::SUCCESS;
    }

    /**
     * Build a map of domain => Feed for the user's existing feeds.
     */
    private function buildFeedDomainMap(User $user): array
    {
        $map = [];

        foreach ($user->feeds as $feed) {
            foreach (['site_url', 'feed_url'] as $field) {
                $host = parse_url($feed->{$field} ?? '', PHP_URL_HOST);
                if ($host && ! isset($map[$host])) {
                    $map[$host] = $feed;
                }
            }
        }

        return $map;
    }
}
