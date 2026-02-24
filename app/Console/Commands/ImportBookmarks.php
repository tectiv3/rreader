<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Feed;
use App\Models\User;
use App\Services\BookmarkParserService;
use App\Services\ContentExtractorService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

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
        $this->newLine();

        $feedsByDomain = $this->buildFeedDomainMap($user);
        $feedsBySlug = $this->buildFeedSlugMap($user);

        $catchAllFeed = Feed::firstOrCreate(
            ['user_id' => $user->id, 'title' => 'Feedly Imports'],
            ['feed_url' => 'import://feedly', 'site_url' => 'https://feedly.com']
        );

        $existingUrls = Article::pluck('id', 'url');

        $imported = 0;
        $skipped = 0;
        $noContent = 0;

        foreach ($bookmarks as $i => $bookmark) {
            $num = str_pad($i + 1, strlen((string) $count), ' ', STR_PAD_LEFT);
            $originalUrl = $bookmark['url'];
            $title = mb_strimwidth($bookmark['title'], 0, 60, '...');

            // Resolve feedproxy URLs and upgrade to HTTPS
            $resolvedUrl = $this->resolveUrl($originalUrl);
            $finalUrl = $this->upgradeToHttps($resolvedUrl);

            // Check duplicate against both original and resolved URLs
            if ($existingUrls->has($originalUrl) || $existingUrls->has($finalUrl)) {
                $this->line("  <fg=gray>{$num}/{$count}</> <fg=yellow>SKIP</> {$title}");
                $skipped++;

                continue;
            }

            // Match feed: feedproxy slug → domain → catch-all
            $feed = $this->matchFeed($originalUrl, $finalUrl, $feedsByDomain, $feedsBySlug, $catchAllFeed);
            $feedName = mb_strimwidth($feed->title, 0, 25, '...');

            $extracted = $extractor->extract($finalUrl);

            $publishedAt = $bookmark['add_date'] > 0
                ? Carbon::createFromTimestamp($bookmark['add_date'])
                : now();

            $article = $feed->articles()->create([
                'guid' => $finalUrl,
                'url' => $finalUrl,
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

            $urlChanged = ($finalUrl !== $originalUrl) ? " <fg=gray>→ {$finalUrl}</>" : '';
            $hasContent = $extracted !== null;

            if ($hasContent) {
                $this->line("  <fg=gray>{$num}/{$count}</> <fg=green>OK  </> {$title} → <fg=cyan>{$feedName}</>{$urlChanged}");
            } else {
                $this->line("  <fg=gray>{$num}/{$count}</> <fg=red>NOCN</> {$title} → <fg=cyan>{$feedName}</>{$urlChanged}");
                $noContent++;
            }

            $imported++;
            $existingUrls[$finalUrl] = $article->id;
        }

        $this->newLine();
        $this->info('Import complete:');
        $this->line("  Imported:    {$imported}");
        $this->line("  Skipped:     {$skipped}");
        $this->line("  No content:  {$noContent}");

        return Command::SUCCESS;
    }

    /**
     * Try to follow redirects for feedproxy/feedburner URLs.
     * Returns the final resolved URL, or the original if resolution fails.
     */
    private function resolveUrl(string $url): string
    {
        if (! $this->isFeedProxy($url)) {
            return $url;
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'RReader/1.0'])
                ->get($url);

            // If we got redirected to a real URL, use it
            $effectiveUrl = $response->effectiveUri()?->__toString();
            if ($effectiveUrl && $effectiveUrl !== $url && ! str_contains($effectiveUrl, 'feedproxy.google.com')) {
                return $effectiveUrl;
            }
        } catch (\Exception) {
            // Fall through
        }

        return $url;
    }

    /**
     * Try upgrading http URL to https via HEAD request.
     */
    private function upgradeToHttps(string $url): string
    {
        if (! str_starts_with($url, 'http://')) {
            return $url;
        }

        // Don't bother upgrading dead feedproxy URLs
        if ($this->isFeedProxy($url)) {
            return $url;
        }

        $httpsUrl = preg_replace('/^http:/', 'https:', $url);

        try {
            $response = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'RReader/1.0'])
                ->head($httpsUrl);

            if ($response->successful()) {
                return $httpsUrl;
            }
        } catch (\Exception) {
            // Fall through
        }

        return $url;
    }

    private function isFeedProxy(string $url): bool
    {
        return str_contains($url, 'feedproxy.google.com');
    }

    /**
     * Extract the feed slug from a feedproxy URL.
     * e.g. feedproxy.google.com/~r/smartfiction/~3/hash/ → "smartfiction"
     */
    private function extractFeedProxySlug(string $url): ?string
    {
        if (preg_match('#feedproxy\.google\.com/~r/([^/]+)/#', $url, $m)) {
            return strtolower($m[1]);
        }

        return null;
    }

    /**
     * Match a bookmark URL to an existing feed.
     * Priority: feedproxy slug → resolved URL domain → catch-all.
     */
    private function matchFeed(string $originalUrl, string $finalUrl, array $feedsByDomain, array $feedsBySlug, Feed $catchAllFeed): Feed
    {
        // Feedproxy: match by slug against feedburner slugs and feed titles
        $slug = $this->extractFeedProxySlug($originalUrl);
        if ($slug && isset($feedsBySlug[$slug])) {
            return $feedsBySlug[$slug];
        }

        // Domain match on resolved URL
        $domain = parse_url($finalUrl, PHP_URL_HOST);
        if ($domain && isset($feedsByDomain[$domain])) {
            return $feedsByDomain[$domain];
        }

        // Domain match on original URL (for non-feedproxy)
        if ($finalUrl !== $originalUrl) {
            $origDomain = parse_url($originalUrl, PHP_URL_HOST);
            if ($origDomain && isset($feedsByDomain[$origDomain])) {
                return $feedsByDomain[$origDomain];
            }
        }

        return $catchAllFeed;
    }

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

    /**
     * Build a map of slug => Feed for feedproxy matching.
     * Indexes by: feedburner slug from feed_url + lowercase feed title.
     */
    private function buildFeedSlugMap(User $user): array
    {
        $map = [];

        foreach ($user->feeds as $feed) {
            // Extract slug from feedburner URLs
            if (preg_match('#feeds?\.feedburner\.com/([^/?]+)#i', $feed->feed_url ?? '', $m)) {
                $map[strtolower($m[1])] = $feed;
            }

            // Also index by lowercase title for direct matches
            $titleSlug = strtolower(trim($feed->title));
            if ($titleSlug && ! isset($map[$titleSlug])) {
                $map[$titleSlug] = $feed;
            }
        }

        return $map;
    }
}
