<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;

class BookmarkParserService
{
    /**
     * Parse Netscape bookmark HTML and return an array of bookmark entries.
     *
     * @return array<int, array{url: string, title: string, add_date: int}>
     */
    public function parse(string $html): array
    {
        libxml_use_internal_errors(true);

        $dom = new DOMDocument;
        $dom->loadHTML($html, LIBXML_NOWARNING | LIBXML_NOERROR);

        $xpath = new DOMXPath($dom);
        $links = $xpath->query('//dt/a[@href]');

        $bookmarks = [];

        foreach ($links as $link) {
            $url = trim($link->getAttribute('href'));
            $addDate = (int) $link->getAttribute('add_date');
            $title = trim(preg_replace('/\s+/', ' ', $link->textContent));

            if ($url === '') {
                continue;
            }

            $bookmarks[] = [
                'url' => $url,
                'title' => $title,
                'add_date' => $addDate,
            ];
        }

        libxml_clear_errors();

        return $bookmarks;
    }
}
