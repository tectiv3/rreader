<?php

namespace App\Chat\Tools;

use App\Chat\ToolText;
use App\Chat\WebFetchClient;
use App\Services\ContentExtractorService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class WebFetchTool implements Tool
{
    public function __construct(
        private readonly WebFetchClient $client = new WebFetchClient,
        private readonly ContentExtractorService $extractor = new ContentExtractorService,
    ) {}

    public function name(): string
    {
        return 'web_fetch';
    }

    public function description(): string
    {
        return 'Fetch a public web page by its http(s) URL and return its readable text, stripped of HTML and truncated if very long.';
    }

    public function handle(Request $request): string
    {
        $url = trim((string) ($request['url'] ?? ''));

        if ($url === '') {
            return 'Provide a URL to fetch.';
        }

        $result = $this->client->fetch($url);

        if ($result->failed()) {
            return 'Fetch failed: '.$result->error;
        }

        $parsed = $this->extractor->extractReadableContent($result->body, $result->finalUrl);
        $title = trim((string) ($parsed['title'] ?? ''));
        $text = ToolText::prepare($parsed['content'] ?? $result->body);

        if ($text === '') {
            return 'The page at '.$result->finalUrl.' contained no readable text.';
        }

        $header = array_filter([
            $title !== '' ? 'Title: '.$title : null,
            'URL: '.$result->finalUrl,
        ]);

        return implode("\n", $header)."\n\n---\n\n".$text;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'url' => $schema->string()
                ->description('The http:// or https:// URL of the page to fetch.')
                ->required(),
        ];
    }
}
