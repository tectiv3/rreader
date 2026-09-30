<?php

namespace App\Chat\Tools;

use App\Chat\ToolText;
use App\Models\Article;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class GetArticleTool implements Tool
{
    public function __construct(private readonly ?Article $article) {}

    public function name(): string
    {
        return 'get_article';
    }

    public function description(): string
    {
        return 'Get the metadata and full text of the article under discussion. HTML is stripped and very long articles are truncated.';
    }

    public function handle(Request $request): string
    {
        $article = $this->article;

        if ($article === null) {
            return 'No article is attached to this conversation.';
        }

        $metadata = array_filter([
            'Title: '.$article->title,
            $article->author !== null ? 'Author: '.$article->author : null,
            $article->feed?->title !== null ? 'Feed: '.$article->feed->title : null,
            $article->published_at !== null ? 'Published: '.$article->published_at->format('Y-m-d') : null,
            'URL: '.$article->url,
        ], fn (?string $line): bool => $line !== null);

        $body = ToolText::prepare($article->content ?? $article->summary ?? '');

        return implode("\n", $metadata)."\n\n---\n\n".$body;
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
