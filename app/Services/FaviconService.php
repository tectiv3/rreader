<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FaviconService
{
    /**
     * Resolve a favicon for the given site URL and store it locally.
     *
     * @return string|null Local path (relative to public disk) or null on failure.
     */
    public function resolveAndStore(string $siteUrl, int $feedId): ?string
    {
        $parsed = parse_url($siteUrl);
        if (! isset($parsed['host'])) {
            return null;
        }

        $baseUrl = ($parsed['scheme'] ?? 'https') . '://' . $parsed['host'];

        // Step 1: Try parsing HTML <link> tags
        $iconUrl = $this->resolveFromHtml($baseUrl);

        // Step 2: Try /favicon.ico
        if (! $iconUrl) {
            $iconUrl = $this->resolveFromFaviconIco($baseUrl);
        }

        // Step 3: Try Google Favicon API
        if (! $iconUrl) {
            $iconUrl = $this->resolveFromGoogle($parsed['host'], $feedId);
            if ($iconUrl) {
                return $iconUrl; // Already stored by resolveFromGoogle
            }

            return null;
        }

        // Download and store the resolved icon
        return $this->downloadAndStore($iconUrl, $feedId);
    }

    private function resolveFromHtml(string $baseUrl): ?string
    {
        try {
            $response = Http::timeout(5)
                ->withUserAgent('RReader/1.0')
                ->get($baseUrl);

            if (! $response->successful()) {
                return null;
            }

            $html = $response->body();

            return $this->extractIconFromHtml($html, $baseUrl);
        } catch (\Exception $e) {
            Log::debug('Favicon HTML fetch failed: ' . $e->getMessage());

            return null;
        }
    }

    private function extractIconFromHtml(string $html, string $baseUrl): ?string
    {
        // Suppress DOM warnings for malformed HTML
        $doc = new \DOMDocument;
        @$doc->loadHTML($html, LIBXML_NOERROR);

        $links = $doc->getElementsByTagName('link');
        $candidates = [];

        foreach ($links as $link) {
            $rel = strtolower(trim($link->getAttribute('rel')));
            $href = trim($link->getAttribute('href'));
            $type = strtolower(trim($link->getAttribute('type')));

            if (! $href) {
                continue;
            }

            if ($rel === 'icon' && $type === 'image/svg+xml') {
                $candidates[0] = $href; // Highest priority
            } elseif ($rel === 'icon' && ! isset($candidates[1])) {
                $candidates[1] = $href;
            } elseif ($rel === 'shortcut icon' && ! isset($candidates[2])) {
                $candidates[2] = $href;
            } elseif ($rel === 'apple-touch-icon' && ! isset($candidates[3])) {
                $candidates[3] = $href;
            }
        }

        if (empty($candidates)) {
            return null;
        }

        ksort($candidates);
        $iconHref = reset($candidates);

        return $this->resolveIconUrl($iconHref, $baseUrl);
    }

    private function resolveIconUrl(string $href, string $baseUrl): string
    {
        // Already absolute
        if (str_starts_with($href, 'http://') || str_starts_with($href, 'https://')) {
            return $href;
        }

        // Protocol-relative
        if (str_starts_with($href, '//')) {
            return 'https:' . $href;
        }

        // Absolute path
        if (str_starts_with($href, '/')) {
            return rtrim($baseUrl, '/') . $href;
        }

        // Relative path
        return rtrim($baseUrl, '/') . '/' . $href;
    }

    private function resolveFromFaviconIco(string $baseUrl): ?string
    {
        try {
            $url = rtrim($baseUrl, '/') . '/favicon.ico';
            $response = Http::timeout(5)
                ->withUserAgent('RReader/1.0')
                ->head($url);

            if ($response->successful()) {
                return $url;
            }
        } catch (\Exception $e) {
            Log::debug('Favicon .ico check failed: ' . $e->getMessage());
        }

        return null;
    }

    private function resolveFromGoogle(string $host, int $feedId): ?string
    {
        try {
            $url = 'https://www.google.com/s2/favicons?domain=' . urlencode($host) . '&sz=64';
            $response = Http::timeout(5)->get($url);

            if (! $response->successful()) {
                return null;
            }

            $body = $response->body();

            // Google returns a ~726-byte generic globe icon when it has no favicon
            if (strlen($body) <= 726) {
                return null;
            }

            $storagePath = 'favicons/' . $feedId . '.png';
            Storage::disk('public')->put($storagePath, $body);

            return '/storage/' . $storagePath;
        } catch (\Exception $e) {
            Log::debug('Favicon Google API failed: ' . $e->getMessage());

            return null;
        }
    }

    private function downloadAndStore(string $iconUrl, int $feedId): ?string
    {
        try {
            $response = Http::timeout(5)
                ->withUserAgent('RReader/1.0')
                ->get($iconUrl);

            if (! $response->successful()) {
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $ext = $this->extensionFromContentType($contentType, $iconUrl);

            $storagePath = 'favicons/' . $feedId . '.' . $ext;
            Storage::disk('public')->put($storagePath, $response->body());

            return '/storage/' . $storagePath;
        } catch (\Exception $e) {
            Log::debug('Favicon download failed: ' . $e->getMessage());

            return null;
        }
    }

    private function extensionFromContentType(string $contentType, string $url): string
    {
        $contentType = strtolower(explode(';', $contentType)[0]);

        return match (true) {
            str_contains($contentType, 'svg') => 'svg',
            str_contains($contentType, 'png') => 'png',
            str_contains($contentType, 'gif') => 'gif',
            str_contains($contentType, 'jpeg'), str_contains($contentType, 'jpg') => 'jpg',
            str_contains($contentType, 'webp') => 'webp',
            str_contains($contentType, 'icon') || str_contains($contentType, 'x-icon') => 'ico',
            default => pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'ico',
        };
    }
}
