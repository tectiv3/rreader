<?php

namespace Tests\Unit;

use App\Services\BookmarkParserService;
use PHPUnit\Framework\TestCase;

class BookmarkParserServiceTest extends TestCase
{
    private BookmarkParserService $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new BookmarkParserService;
    }

    public function test_parses_standard_bookmark_entries(): void
    {
        $html = <<<'HTML'
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <TITLE>Bookmarks</TITLE>
        <DL><p>
          <DT><A HREF="http://example.com/article1" ADD_DATE="1372577798">First Article</A>
          <DT><A HREF="http://example.com/article2" ADD_DATE="1388534400">Second Article</A>
        </DL>
        HTML;

        $bookmarks = $this->parser->parse($html);

        $this->assertCount(2, $bookmarks);
        $this->assertEquals('http://example.com/article1', $bookmarks[0]['url']);
        $this->assertEquals('First Article', $bookmarks[0]['title']);
        $this->assertEquals(1372577798, $bookmarks[0]['add_date']);
        $this->assertEquals('http://example.com/article2', $bookmarks[1]['url']);
        $this->assertEquals('Second Article', $bookmarks[1]['title']);
    }

    public function test_handles_nested_year_folders(): void
    {
        $html = <<<'HTML'
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <DL><p>
          <DT><H3>Saved in 2013</H3>
          <DL><p>
            <DT><A HREF="http://example.com/a" ADD_DATE="1372577798">Article A</A>
          </DL>
          <DT><H3>Saved in 2014</H3>
          <DL><p>
            <DT><A HREF="http://example.com/b" ADD_DATE="1388534400">Article B</A>
          </DL>
        </DL>
        HTML;

        $bookmarks = $this->parser->parse($html);

        $this->assertCount(2, $bookmarks);
    }

    public function test_handles_multiline_title(): void
    {
        $html = <<<'HTML'
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <DL><p>
          <DT><A HREF="http://example.com/multi" ADD_DATE="1372577798">"Boy, have we got a vacation for you."

        Westworld...</A>
        </DL>
        HTML;

        $bookmarks = $this->parser->parse($html);

        $this->assertCount(1, $bookmarks);
        $this->assertStringContainsString('Westworld', $bookmarks[0]['title']);
    }

    public function test_returns_empty_array_for_no_bookmarks(): void
    {
        $html = '<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p></DL>';

        $bookmarks = $this->parser->parse($html);

        $this->assertCount(0, $bookmarks);
    }
}
