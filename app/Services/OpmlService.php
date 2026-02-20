<?php

namespace App\Services;

use App\Jobs\ResolveFavicon;
use App\Models\Feed;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OpmlService
{
    /**
     * Parse an OPML file and return structured feed data.
     *
     * @return array{categories: array<array{name: string, feeds: array}>, uncategorized: array}
     *
     * @throws \RuntimeException
     */
    public function parse(string $content): array
    {
        $previousErrors = libxml_use_internal_errors(true);

        try {
            $xml = simplexml_load_string($content);

            if ($xml === false) {
                throw new \RuntimeException('Invalid OPML file. The file could not be parsed as XML.');
            }

            if (! isset($xml->body)) {
                throw new \RuntimeException('Invalid OPML file. Missing <body> element.');
            }
        } catch (\RuntimeException $e) {
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrors);

            throw $e;
        }

        libxml_clear_errors();
        libxml_use_internal_errors($previousErrors);

        $categories = [];
        $uncategorized = [];

        foreach ($xml->body->outline as $outline) {
            $xmlUrl = (string) ($outline['xmlUrl'] ?? '');

            if ($xmlUrl) {
                // Top-level feed (no category)
                $feed = $this->extractFeedFromOutline($outline);
                if ($feed['feed_url'] !== '') {
                    $uncategorized[] = $feed;
                }
            } else {
                // Category folder — extract child feeds
                $categoryName = (string) ($outline['text'] ?? $outline['title'] ?? 'Unnamed');
                $feeds = [];

                if (isset($outline->outline)) {
                    foreach ($outline->outline as $child) {
                        $childXmlUrl = (string) ($child['xmlUrl'] ?? '');
                        if ($childXmlUrl) {
                            $childFeed = $this->extractFeedFromOutline($child);
                            if ($childFeed['feed_url'] !== '') {
                                $feeds[] = $childFeed;
                            }
                        }
                        // Handle nested categories: flatten into this category
                        if (! $childXmlUrl && isset($child->outline)) {
                            foreach ($child->outline as $grandchild) {
                                $grandchildXmlUrl = (string) ($grandchild['xmlUrl'] ?? '');
                                if ($grandchildXmlUrl) {
                                    $grandchildFeed = $this->extractFeedFromOutline($grandchild);
                                    if ($grandchildFeed['feed_url'] !== '') {
                                        $feeds[] = $grandchildFeed;
                                    }
                                }
                            }
                        }
                    }
                }

                if (! empty($feeds)) {
                    $categories[] = [
                        'name' => $categoryName,
                        'feeds' => $feeds,
                    ];
                }
            }
        }

        return [
            'categories' => $categories,
            'uncategorized' => $uncategorized,
        ];
    }

    /**
     * Import parsed OPML data for a user, skipping duplicates.
     *
     * @return array{imported: int, skipped: int, categories_created: int}
     */
    public function import(User $user, array $parsedData, array $selectedFeeds): array
    {
        $imported = 0;
        $skipped = 0;
        $categoriesCreated = 0;

        $existingFeedUrls = $user->feeds()->pluck('feed_url')->toArray();

        DB::transaction(function () use ($user, $parsedData, $selectedFeeds, $existingFeedUrls, &$imported, &$skipped, &$categoriesCreated) {
            $maxOrder = $user->categories()->max('sort_order') ?? 0;

            // Import categorized feeds
            foreach ($parsedData['categories'] as $categoryData) {
                $categoryFeeds = array_filter($categoryData['feeds'], function ($feed) use ($selectedFeeds) {
                    return in_array($feed['feed_url'], $selectedFeeds);
                });

                if (empty($categoryFeeds)) {
                    continue;
                }

                // Find or create category
                $category = $user->categories()->where('name', $categoryData['name'])->first();
                if (! $category) {
                    $maxOrder++;
                    $category = $user->categories()->create([
                        'name' => mb_substr($categoryData['name'], 0, 255),
                        'sort_order' => $maxOrder,
                    ]);
                    $categoriesCreated++;
                }

                foreach ($categoryFeeds as $feedData) {
                    if (in_array($feedData['feed_url'], $existingFeedUrls)) {
                        $skipped++;
                        continue;
                    }

                    $feed = $user->feeds()->create([
                        'category_id' => $category->id,
                        'title' => $feedData['title'],
                        'feed_url' => $feedData['feed_url'],
                        'site_url' => $feedData['site_url'],
                        'description' => $feedData['description'],
                        'favicon_url' => $feedData['favicon_url'],
                    ]);
                    ResolveFavicon::dispatch($feed);
                    $existingFeedUrls[] = $feedData['feed_url'];
                    $imported++;
                }
            }

            // Import uncategorized feeds
            foreach ($parsedData['uncategorized'] as $feedData) {
                if (! in_array($feedData['feed_url'], $selectedFeeds)) {
                    continue;
                }

                if (in_array($feedData['feed_url'], $existingFeedUrls)) {
                    $skipped++;
                    continue;
                }

                $feed = $user->feeds()->create([
                    'title' => $feedData['title'],
                    'feed_url' => $feedData['feed_url'],
                    'site_url' => $feedData['site_url'],
                    'description' => $feedData['description'],
                    'favicon_url' => $feedData['favicon_url'],
                ]);
                ResolveFavicon::dispatch($feed);
                $existingFeedUrls[] = $feedData['feed_url'];
                $imported++;
            }
        });

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'categories_created' => $categoriesCreated,
        ];
    }

    /**
     * Generate OPML XML for a user's subscriptions.
     */
    public function export(User $user): string
    {
        $categories = $user->categories()
            ->orderBy('sort_order')
            ->with(['feeds' => fn ($q) => $q->orderBy('title')])
            ->get();

        $uncategorizedFeeds = $user->feeds()
            ->whereNull('category_id')
            ->orderBy('title')
            ->get();

        $xml = new \XMLWriter();
        $xml->openMemory();
        $xml->setIndent(true);
        $xml->setIndentString('  ');

        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('opml');
        $xml->writeAttribute('version', '2.0');

        // Head
        $xml->startElement('head');
        $xml->writeElement('title', 'RReader Subscriptions');
        $xml->writeElement('dateCreated', now()->toRfc2822String());
        $xml->endElement(); // head

        // Body
        $xml->startElement('body');

        foreach ($categories as $category) {
            if ($category->feeds->isEmpty()) {
                continue;
            }

            $xml->startElement('outline');
            $xml->writeAttribute('text', $category->name);
            $xml->writeAttribute('title', $category->name);

            foreach ($category->feeds as $feed) {
                $this->writeFeedOutline($xml, $feed);
            }

            $xml->endElement(); // category outline
        }

        foreach ($uncategorizedFeeds as $feed) {
            $this->writeFeedOutline($xml, $feed);
        }

        $xml->endElement(); // body
        $xml->endElement(); // opml

        return $xml->outputMemory();
    }

    private function extractFeedFromOutline(\SimpleXMLElement $outline): array
    {
        $feedUrl = $this->sanitizeUrl((string) ($outline['xmlUrl'] ?? ''));
        $siteUrl = $this->sanitizeUrl((string) ($outline['htmlUrl'] ?? ''));
        $title = (string) ($outline['text'] ?? $outline['title'] ?? '');

        // Build favicon URL from site domain
        $faviconUrl = null;
        $domain = $siteUrl ?: $feedUrl;
        $parsed = parse_url($domain);
        if (isset($parsed['host'])) {
            $faviconUrl = ($parsed['scheme'] ?? 'https') . '://' . $parsed['host'] . '/favicon.ico';
        }

        return [
            'feed_url' => $feedUrl,
            'site_url' => $siteUrl ?: null,
            'title' => mb_substr($title ?: 'Untitled Feed', 0, 255),
            'description' => (string) ($outline['description'] ?? ''),
            'favicon_url' => $faviconUrl,
        ];
    }

    private function sanitizeUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        if ($scheme !== null && ! in_array(strtolower($scheme), ['http', 'https'])) {
            return '';
        }

        return $url;
    }

    private function writeFeedOutline(\XMLWriter $xml, Feed $feed): void
    {
        $xml->startElement('outline');
        $xml->writeAttribute('type', 'rss');
        $xml->writeAttribute('text', $feed->title ?? '');
        $xml->writeAttribute('title', $feed->title ?? '');
        $xml->writeAttribute('xmlUrl', $feed->feed_url ?? '');

        if ($feed->site_url) {
            $xml->writeAttribute('htmlUrl', $feed->site_url);
        }

        if ($feed->description) {
            $xml->writeAttribute('description', $feed->description);
        }

        $xml->endElement(); // outline
    }
}
