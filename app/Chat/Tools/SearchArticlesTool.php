<?php

namespace App\Chat\Tools;

use App\Chat\ToolText;
use App\Models\Article;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class SearchArticlesTool implements Tool
{
    private const LIMIT = 10;

    private const SNIPPET_LENGTH = 200;

    public function __construct(private readonly User $user) {}

    public function name(): string
    {
        return 'search_articles';
    }

    public function description(): string
    {
        return 'Search the articles from the user\'s subscribed feeds by keyword. Returns the most recent matches with id, title, date and a short snippet.';
    }

    public function handle(Request $request): string
    {
        $term = trim((string) $request['query']);

        if ($term === '') {
            return 'Provide a non-empty search term.';
        }

        $articles = Article::query()
            ->whereHas('feed', fn (Builder $feed): Builder => $feed->where('user_id', $this->user->id))
            ->search($term)
            ->orderByDesc('published_at')
            ->limit(self::LIMIT)
            ->get();

        if ($articles->isEmpty()) {
            return 'No articles found matching "'.$term.'".';
        }

        $lines = $articles->map(fn (Article $article): string => sprintf(
            '- [%s] #%d %s — %s',
            $article->published_at?->format('Y-m-d') ?? 'no date',
            $article->id,
            $article->title,
            $this->snippet($article),
        ));

        return 'Articles matching "'.$term.'":'."\n".$lines->implode("\n");
    }

    private function snippet(Article $article): string
    {
        $source = filled($article->summary) ? $article->summary : (string) $article->content;

        return Str::limit(ToolText::clean((string) $source), self::SNIPPET_LENGTH);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('The keyword to search for in article titles, summaries and content.')
                ->required(),
        ];
    }
}
