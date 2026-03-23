<?php

namespace App\Services;

use fivefilters\Readability\Configuration as ReadabilityConfig;
use fivefilters\Readability\ParseException;
use fivefilters\Readability\Readability;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContentExtractorService
{
    private const FETCH_TIMEOUT = 10;

    private const WAYBACK_TIMEOUT = 15;

    /**
     * Fetch a URL and extract article content. Falls back to Wayback Machine.
     *
     * @return array{title: string|null, content: string, excerpt: string|null}|null
     */
    public function extract(string $url): ?array
    {
        $html = $this->fetchUrl($url);

        if ($html === null) {
            Log::info('ContentExtractor: direct fetch failed, trying Wayback Machine', ['url' => $url]);
            $html = $this->fetchFromWayback($url);
        }

        if ($html === null) {
            Log::warning('ContentExtractor: all fetch sources failed', ['url' => $url]);

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
        } catch (\Exception $e) {
            Log::warning('ContentExtractor: direct fetch threw exception', ['url' => $url, 'error' => $e->getMessage()]);
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
        } catch (\Exception $e) {
            Log::warning('ContentExtractor: Wayback fetch threw exception', ['url' => $url, 'error' => $e->getMessage()]);
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

            // Readability requires a <body> tag
            if (stripos($html, '<body') === false) {
                $html = '<html><body>'.$html.'</body></html>';
            }

            $readability = new Readability($config);
            $readability->parse($html);

            $content = $readability->getContent();

            if (empty(trim(strip_tags($content ?? '')))) {
                Log::warning('ContentExtractor: readability returned empty content', ['url' => $url, 'raw_length' => strlen($html)]);

                return null;
            }

            return [
                'title' => $readability->getTitle(),
                'content' => $content,
                'excerpt' => $readability->getExcerpt(),
            ];
        } catch (ParseException $e) {
            Log::warning('ContentExtractor: readability parse failed', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        } catch (\TypeError $e) {
            Log::warning('ContentExtractor: readability type error', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }
    }
}
