<?php

namespace App\Chat;

/**
 * Single source of truth for preparing text returned by chat tools: HTML is
 * stripped and oversized text is truncated head+tail so the beginning and the
 * end of an article survive.
 */
class ToolText
{
    public const MAX_LENGTH = 24000;

    /**
     * Strip HTML tags, decode entities and normalize whitespace.
     */
    public static function clean(string $html): string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = (string) preg_replace('/[ \t]+/u', ' ', $text);
        $text = (string) preg_replace('/\n{3,}/u', "\n\n", $text);

        return trim($text);
    }

    /**
     * Truncate to at most $max characters, keeping head and tail halves with a
     * marker naming the cut size in between.
     */
    public static function truncate(string $text, int $max = self::MAX_LENGTH): string
    {
        $length = mb_strlen($text);

        if ($length <= $max) {
            return $text;
        }

        $marker = sprintf("\n\n[… %s characters truncated …]\n\n", number_format($length));

        if ($max <= mb_strlen($marker) + 2) {
            return mb_substr($text, 0, $max);
        }

        $half = intdiv($max - mb_strlen($marker), 2);

        return mb_substr($text, 0, $half).$marker.mb_substr($text, $length - $half);
    }

    /**
     * Strip HTML and truncate.
     */
    public static function prepare(string $html, int $max = self::MAX_LENGTH): string
    {
        return self::truncate(self::clean($html), $max);
    }
}
