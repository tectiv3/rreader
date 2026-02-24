<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Laminas\Feed\Reader\Reader as FeedReader;

class FeedParserService
{
    /**
     * Discover and parse a feed from a URL.
     * Accepts direct feed URLs or website URLs (auto-discovery).
     *
     * @return array{feed_url: string, site_url: string|null, title: string|null, description: string|null, favicon_url: string|null, articles: array}
     *
     * @throws \RuntimeException
     * @throws \Illuminate\Http\Client\ConnectionException
     */
    public function discoverAndParse(string $url): array
    {
        $url = $this->normalizeUrl($url);

        $response = Http::timeout(15)
            ->withUserAgent('RReader/1.0')
            ->get($url);

        if (! $response->successful()) {
            throw new \RuntimeException('Could not fetch the URL. Please check the address and try again.');
        }

        $contentType = (string) $response->header('Content-Type');
        $body = $response->body();

        // Check if the response is directly a feed
        if ($this->isFeedContentType($contentType) || $this->looksLikeFeed($body)) {
            return $this->parseFeedContent($body, $url);
        }

        // Try auto-discovery from HTML page
        $feedUrl = $this->discoverFeedUrl($body, $url);

        if (! $feedUrl) {
            throw new \RuntimeException('No RSS or Atom feed found at this URL.');
        }

        $feedResponse = Http::timeout(15)
            ->withUserAgent('RReader/1.0')
            ->get($feedUrl);

        if (! $feedResponse->successful()) {
            throw new \RuntimeException('Found a feed link but could not fetch it.');
        }

        return $this->parseFeedContent($feedResponse->body(), $feedUrl, $url);
    }

    private function normalizeUrl(string $url): string
    {
        $url = trim($url);

        if (! preg_match('#^https?://#i', $url)) {
            $url = 'https://'.$url;
        }

        return $url;
    }

    private function isFeedContentType(string $contentType): bool
    {
        return str_contains($contentType, 'xml')
            || str_contains($contentType, 'rss')
            || str_contains($contentType, 'atom');
    }

    private function looksLikeFeed(string $body): bool
    {
        $trimmed = ltrim($body);

        return str_starts_with($trimmed, '<?xml')
            || str_starts_with($trimmed, '<rss')
            || str_starts_with($trimmed, '<feed');
    }

    private function discoverFeedUrl(string $html, string $baseUrl): ?string
    {
        $feedTypes = [
            'application/rss+xml',
            'application/atom+xml',
            'application/xml',
            'text/xml',
        ];

        // Use regex to find <link> tags with feed types
        preg_match_all('/<link[^>]+>/i', $html, $matches);

        foreach ($matches[0] as $linkTag) {
            foreach ($feedTypes as $type) {
                if (stripos($linkTag, $type) !== false) {
                    if (preg_match('/href=["\']([^"\']+)["\']/i', $linkTag, $hrefMatch)) {
                        return $this->resolveUrl($hrefMatch[1], $baseUrl);
                    }
                }
            }
        }

        return null;
    }

    private function resolveUrl(string $href, string $baseUrl): string
    {
        // Already absolute
        if (preg_match('#^https?://#i', $href)) {
            return $href;
        }

        $parsed = parse_url($baseUrl);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';

        if (str_starts_with($href, '//')) {
            return $scheme.':'.$href;
        }

        if (str_starts_with($href, '/')) {
            return $scheme.'://'.$host.$href;
        }

        $path = $parsed['path'] ?? '/';
        $dir = dirname($path);

        return $scheme.'://'.$host.$dir.'/'.$href;
    }

    /**
     * @return array{feed_url: string, site_url: string|null, title: string|null, description: string|null, favicon_url: string|null, articles: array}
     */
    private function parseFeedContent(string $xml, string $feedUrl, ?string $siteUrl = null): array
    {
        try {
            $feed = FeedReader::importString($xml);
        } catch (\Exception $e) {
            throw new \RuntimeException('The URL does not contain a valid RSS or Atom feed.');
        }

        $feedLink = $feed->getLink() ?: $siteUrl;

        // Build favicon URL from site domain
        $faviconUrl = null;
        $domain = $feedLink ?: $feedUrl;
        $parsed = parse_url($domain);
        if (isset($parsed['host'])) {
            $faviconUrl = ($parsed['scheme'] ?? 'https').'://'.$parsed['host'].'/favicon.ico';
        }

        $articles = [];
        foreach ($feed as $entry) {
            $imageUrl = $this->extractImageUrl($entry->getContent() ?: $entry->getDescription());

            if (! $imageUrl) {
                $enclosure = $entry->getEnclosure();
                if ($enclosure && isset($enclosure->url) && str_starts_with($enclosure->type ?? '', 'image/')) {
                    $imageUrl = $enclosure->url;
                }
            }

            if (! $imageUrl) {
                $imageUrl = $this->extractMediaContent($entry->getElement());
            }

            $articles[] = [
                'guid' => $entry->getId() ?: $entry->getLink() ?: md5($entry->getTitle().$entry->getDateCreated()?->format('c')),
                'title' => $entry->getTitle(),
                'author' => $entry->getAuthor()['name'] ?? null,
                'content' => $entry->getContent(),
                'summary' => strip_tags($entry->getDescription()),
                'url' => $entry->getLink(),
                'image_url' => $imageUrl,
                'published_at' => $entry->getDateCreated()?->format('Y-m-d H:i:s')
                    ?? $entry->getDateModified()?->format('Y-m-d H:i:s'),
            ];
        }

        return [
            'feed_url' => $feedUrl,
            'site_url' => $feedLink,
            'title' => $feed->getTitle(),
            'description' => $feed->getDescription(),
            'favicon_url' => $faviconUrl,
            'articles' => $articles,
        ];
    }

    private function extractMediaContent(\DOMElement $element): ?string
    {
        $mediaNs = 'http://search.yahoo.com/mrss/';

        $mediaContents = $element->getElementsByTagNameNS($mediaNs, 'content');
        foreach ($mediaContents as $media) {
            $medium = $media->getAttribute('medium');
            $type = $media->getAttribute('type');
            $url = $media->getAttribute('url');

            if ($url && ($medium === 'image' || str_starts_with($type, 'image/'))) {
                return $url;
            }
        }

        $thumbnails = $element->getElementsByTagNameNS($mediaNs, 'thumbnail');
        foreach ($thumbnails as $thumb) {
            $url = $thumb->getAttribute('url');
            if ($url) {
                return $url;
            }
        }

        return null;
    }

    private function extractImageUrl(?string $html): ?string
    {
        if (! $html) {
            return null;
        }

        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $html, $match)) {
            return $match[1];
        }

        return null;
    }
}
