<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Services\ContentExtractorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ResolveFeedproxy extends Command
{
    protected $signature = 'import:resolve-feedproxy {--dry-run : Show what would be resolved without updating}';

    protected $description = 'Resolve feedproxy URLs to real article links via Wayback feed archives and DuckDuckGo';

    private const WAYBACK_CDX = 'https://web.archive.org/cdx/search/cdx';

    private const WAYBACK_RAW = 'https://web.archive.org/web/%sid_/%s';

    public function handle(ContentExtractorService $extractor): int
    {
        $dryRun = $this->option('dry-run');

        $articles = Article::where('url', 'like', '%feedproxy.google.com%')->get();

        if ($articles->isEmpty()) {
            $this->info('No feedproxy articles found.');

            return Command::SUCCESS;
        }

        $this->info("Found {$articles->count()} feedproxy articles to resolve.");
        $this->newLine();

        // Group by feedproxy slug
        $grouped = $articles->groupBy(fn ($a) => $this->extractSlug($a->url));

        // Phase 1: Mine Wayback feed archives
        $this->info('<fg=cyan>Phase 1:</> Mining Wayback feed archives...');
        $this->newLine();

        $titleToUrl = [];
        foreach ($grouped as $slug => $slugArticles) {
            $this->line("  <fg=yellow>{$slug}</> ({$slugArticles->count()} articles)");

            $feedUrl = "feeds.feedburner.com/{$slug}";
            $mappings = $this->mineWaybackFeed($feedUrl);

            $mapCount = count($mappings);
            $this->line("    Found {$mapCount} title→URL mappings across archived snapshots");

            $titleToUrl[$slug] = $mappings;
        }

        $this->newLine();

        // Match and resolve
        $resolved = 0;
        $searchFallback = [];

        foreach ($articles as $article) {
            $slug = $this->extractSlug($article->url);
            $normalizedTitle = $this->normalizeTitle($article->title);
            $mappings = $titleToUrl[$slug] ?? [];

            $realUrl = $mappings[$normalizedTitle] ?? null;

            if ($realUrl) {
                $realUrl = $this->upgradeToHttps($realUrl);
                $this->line("  <fg=green>FOUND</> {$article->title}");
                $this->line("         <fg=gray>{$article->url}</>");
                $this->line("       → <fg=white>{$realUrl}</>");

                if (! $dryRun) {
                    $this->updateArticle($article, $realUrl, $extractor);
                }
                $resolved++;
            } else {
                $searchFallback[] = $article;
            }
        }

        // Phase 2: DuckDuckGo fallback
        if (! empty($searchFallback)) {
            $this->newLine();
            $fallbackCount = count($searchFallback);
            $this->info("<fg=cyan>Phase 2:</> DuckDuckGo search for {$fallbackCount} unresolved articles...");
            $this->newLine();

            foreach ($searchFallback as $article) {
                $slug = $this->extractSlug($article->url);
                $result = $this->searchDuckDuckGo($article->title, $slug);

                if ($result) {
                    $result = $this->upgradeToHttps($result);
                    $this->line("  <fg=green>FOUND</> {$article->title}");
                    $this->line("       → <fg=white>{$result}</>");

                    if (! $dryRun) {
                        $this->updateArticle($article, $result, $extractor);
                    }
                    $resolved++;
                } else {
                    $this->line("  <fg=red>MISS </> {$article->title}");
                }

                // Rate limit DDG requests
                usleep(1_500_000);
            }
        }

        $this->newLine();
        $prefix = $dryRun ? '[DRY RUN] ' : '';
        $this->info("{$prefix}Resolved: {$resolved}/{$articles->count()}");

        return Command::SUCCESS;
    }

    private function extractSlug(string $url): string
    {
        if (preg_match('#feedproxy\.google\.com/~r/([^/]+)/#', $url, $m)) {
            return $m[1];
        }

        return 'unknown';
    }

    /**
     * Fetch all archived snapshots of a feedburner feed from Wayback,
     * parse each for title→origLink mappings.
     */
    private function mineWaybackFeed(string $feedUrl): array
    {
        $mappings = [];

        try {
            $cdx = Http::timeout(15)->get(self::WAYBACK_CDX, [
                'url' => $feedUrl,
                'output' => 'json',
                'filter' => ['statuscode:200', 'mimetype:text/xml'],
            ]);

            if (! $cdx->successful()) {
                $this->line('    <fg=red>CDX query failed</>');

                return [];
            }

            $rows = $cdx->json();
            array_shift($rows); // remove header row

            // Sample snapshots evenly to avoid hammering Wayback
            $timestamps = array_column($rows, 1);
            if (count($timestamps) > 20) {
                $step = (int) ceil(count($timestamps) / 20);
                $timestamps = array_values(array_filter($timestamps, fn ($_, $i) => $i % $step === 0, ARRAY_FILTER_USE_BOTH));
            }

            foreach ($timestamps as $ts) {
                $archiveUrl = sprintf(self::WAYBACK_RAW, $ts, $feedUrl);
                $this->line("    <fg=gray>Fetching snapshot {$ts}...</>");

                try {
                    $response = Http::timeout(15)
                        ->withHeaders(['User-Agent' => 'RReader/1.0'])
                        ->get($archiveUrl);

                    if (! $response->successful()) {
                        continue;
                    }

                    $newMappings = $this->parseFeedXml($response->body());
                    $mappings = array_merge($mappings, $newMappings);
                } catch (\Exception) {
                    continue;
                }

                // Be polite to Wayback
                usleep(500_000);
            }
        } catch (\Exception $e) {
            $this->line("    <fg=red>Error: {$e->getMessage()}</>");
        }

        return $mappings;
    }

    /**
     * Parse RSS/Atom feed XML, return normalized_title => origLink map.
     */
    private function parseFeedXml(string $xml): array
    {
        $mappings = [];

        libxml_use_internal_errors(true);
        $rss = @simplexml_load_string($xml);

        if (! $rss) {
            libxml_clear_errors();

            return [];
        }

        $ns = $rss->getNamespaces(true);

        // RSS 2.0
        if (isset($rss->channel->item)) {
            foreach ($rss->channel->item as $item) {
                $fb = isset($ns['feedburner']) ? $item->children($ns['feedburner']) : null;
                $origLink = ($fb && $fb->origLink) ? (string) $fb->origLink : (string) $item->link;
                $title = $this->normalizeTitle((string) $item->title);

                if ($title && $origLink) {
                    $mappings[$title] = $origLink;
                }
            }
        }

        // Atom
        if (isset($rss->entry)) {
            foreach ($rss->entry as $entry) {
                $link = '';
                foreach ($entry->link as $l) {
                    if ((string) $l['rel'] === 'alternate' || empty((string) $l['rel'])) {
                        $link = (string) $l['href'];
                        break;
                    }
                }
                $title = $this->normalizeTitle((string) $entry->title);

                if ($title && $link) {
                    $mappings[$title] = $link;
                }
            }
        }

        libxml_clear_errors();

        return $mappings;
    }

    private function normalizeTitle(string $title): string
    {
        $title = html_entity_decode($title, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $title = trim(preg_replace('/\s+/', ' ', $title));
        $title = mb_strtolower($title);

        return $title;
    }

    private function searchDuckDuckGo(string $title, string $slug): ?string
    {
        try {
            $query = "\"{$title}\" {$slug}";
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                ])
                ->get('https://html.duckduckgo.com/html/', ['q' => $query]);

            if (! $response->successful()) {
                return null;
            }

            $body = $response->body();

            // Extract first result URL from DDG HTML
            if (preg_match('/class="result__a"[^>]*href="([^"]+)"/', $body, $m)) {
                $url = $m[1];

                // DDG wraps URLs in a redirect; extract the actual URL
                if (preg_match('/uddg=([^&]+)/', $url, $u)) {
                    return urldecode($u[1]);
                }

                return $url;
            }
        } catch (\Exception) {
            // Fall through
        }

        return null;
    }

    private function upgradeToHttps(string $url): string
    {
        if (! str_starts_with($url, 'http://')) {
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

    private function updateArticle(Article $article, string $realUrl, ContentExtractorService $extractor): void
    {
        $article->url = $realUrl;
        $article->guid = $realUrl;

        // Try to fetch content now that we have the real URL
        if (empty($article->content)) {
            $extracted = $extractor->extract($realUrl);
            if ($extracted) {
                $article->content = $extracted['content'];
                $article->summary = $extracted['excerpt'];
            }
        }

        $article->save();
    }
}
