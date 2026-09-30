<?php

namespace Tests\Unit;

use App\Chat\ToolText;
use Tests\TestCase;

class ToolTextTest extends TestCase
{
    public function test_short_text_is_returned_unchanged(): void
    {
        $this->assertSame('Hello world', ToolText::truncate('Hello world'));
    }

    public function test_clean_strips_html_decodes_entities_and_normalizes_whitespace(): void
    {
        $this->assertSame(
            "First line\n\nSecond & last",
            ToolText::clean("<p>First   line</p>\n\n\n<p>Second &amp; last</p>\n")
        );
    }

    public function test_truncate_keeps_head_and_tail_within_the_cap(): void
    {
        $text = 'HEADMARK'.str_repeat('x', 30_000).'TAILMARK';

        $truncated = ToolText::truncate($text);

        $this->assertLessThanOrEqual(ToolText::MAX_LENGTH, mb_strlen($truncated));
        $this->assertStringStartsWith('HEADMARK', $truncated);
        $this->assertStringEndsWith('TAILMARK', $truncated);
        $this->assertStringContainsString('characters truncated', $truncated);
    }

    public function test_truncate_reports_the_elided_character_count(): void
    {
        $truncated = ToolText::truncate(str_repeat('x', 30_000), 100);

        $this->assertStringContainsString(number_format(30_000 - 100).' characters truncated', $truncated);
        $this->assertStringNotContainsString(number_format(30_000).' characters truncated', $truncated);
    }

    public function test_truncate_honors_a_custom_cap(): void
    {
        $text = str_repeat('x', 500);

        $this->assertSame(10, mb_strlen(ToolText::truncate($text, 10)));
    }

    public function test_prepare_strips_and_truncates(): void
    {
        $html = '<p>'.str_repeat('y', 30_000).'</p>';

        $prepared = ToolText::prepare($html);

        $this->assertLessThanOrEqual(ToolText::MAX_LENGTH, mb_strlen($prepared));
        $this->assertStringContainsString('characters truncated', $prepared);
        $this->assertStringNotContainsString('<p>', $prepared);
    }
}
