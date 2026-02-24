<?php

namespace App\Services;

use fivefilters\Readability\Configuration as ReadabilityConfig;
use fivefilters\Readability\ParseException;
use fivefilters\Readability\Readability;
use Illuminate\Support\Facades\Http;

class ContentExtractorService
{
    private const FETCH_TIMEOUT = 10;

    private const WAYBACK_TIMEOUT = 15;

    /**
     * Fetch a URL and extract article content. Falls back to Wayback Machine.
     *
     * @return array{content: string, excerpt: string|null}|null
     */
    public function extract(string $url): ?array
    {
        $html = $this->fetchUrl($url);

        if ($html === null) {
            $html = $this->fetchFromWayback($url);
        }

        if ($html === null) {
            return null;
        }

        return $this->extractReadableContent($html, $url);
    }

    private function fetchUrl(string $url): ?string
    {
        try {
            $response = Http::timeout(self::FETCH_TIMEOUT)
                ->withHeaders(['User-Agent' => 'RReader/1.0'])
                ->get($url);

            if ($response->successful() && ! empty($response->body())) {
                return $response->body();
            }
        } catch (\Exception) {
            // Fall through to return null
        }

        return null;
    }

    private function fetchFromWayback(string $url): ?string
    {
        try {
            $availability = Http::timeout(self::WAYBACK_TIMEOUT)
                ->get('https://archive.org/wayback/available', ['url' => $url]);

            if (! $availability->successful()) {
                return null;
            }

            $snapshot = $availability->json('archived_snapshots.closest');

            if (! $snapshot || ! ($snapshot['available'] ?? false)) {
                return null;
            }

            $archiveUrl = $snapshot['url'];

            // Use id_ modifier to get raw content without Wayback toolbar
            $archiveUrl = preg_replace('#/web/(\d+)/#', '/web/$1id_/', $archiveUrl);

            $response = Http::timeout(self::WAYBACK_TIMEOUT)
                ->withHeaders(['User-Agent' => 'RReader/1.0'])
                ->get($archiveUrl);

            if ($response->successful() && ! empty($response->body())) {
                return $response->body();
            }
        } catch (\Exception) {
            // Fall through to return null
        }

        return null;
    }

    private function extractReadableContent(string $html, string $url): ?array
    {
        try {
            $config = new ReadabilityConfig([
                'fixRelativeURLs' => true,
                'originalURL' => $url,
            ]);

            $readability = new Readability($config);
            $readability->parse($html);

            $content = $readability->getContent();

            if (empty(trim(strip_tags($content ?? '')))) {
                return null;
            }

            return [
                'content' => $content,
                'excerpt' => $readability->getExcerpt(),
            ];
        } catch (ParseException|\TypeError) {
            return null;
        }
    }
}
