<?php

namespace App\Chat\Tools;

use App\Models\Highlight;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class GetHighlightsTool implements Tool
{
    private const LIMIT = 20;

    public function __construct(private readonly User $user) {}

    public function name(): string
    {
        return 'get_highlights';
    }

    public function description(): string
    {
        return 'List the user\'s saved article highlights (quoted passages with optional notes), most recent first. Optionally restrict to a single article by id.';
    }

    public function handle(Request $request): string
    {
        $articleId = $request->filled('article_id') ? $request->integer('article_id') : null;

        $highlights = Highlight::query()
            ->where('user_id', $this->user->id)
            ->when($articleId !== null, fn (Builder $query): Builder => $query->where('article_id', $articleId))
            ->with('article:id,title')
            ->orderByDesc('created_at')
            ->limit(self::LIMIT)
            ->get();

        if ($highlights->isEmpty()) {
            return 'No highlights found'.($articleId !== null ? ' for this article.' : '.');
        }

        $lines = $highlights->map(function (Highlight $highlight): string {
            $context = collect(array_filter([
                $highlight->article?->title,
                $highlight->created_at?->format('Y-m-d'),
            ]))->implode(', ');

            $line = '- "'.$highlight->text.'"';

            if ($context !== '') {
                $line .= ' ('.$context.')';
            }

            if (filled($highlight->note)) {
                $line .= "\n  note: ".$highlight->note;
            }

            return $line;
        });

        return "The user's highlights:\n".$lines->implode("\n");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'article_id' => $schema->integer()
                ->description('Optional article id to restrict the highlights to.'),
        ];
    }
}
