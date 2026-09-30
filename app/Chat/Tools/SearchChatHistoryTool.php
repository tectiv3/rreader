<?php

namespace App\Chat\Tools;

use App\Models\AgentConversation;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Models\ConversationMessage;
use Laravel\Ai\Tools\Request;

class SearchChatHistoryTool implements Tool
{
    private const LIMIT = 20;

    private const SNIPPET_LENGTH = 300;

    public function __construct(
        private readonly User $user,
        private readonly string $currentConversationId,
    ) {}

    public function name(): string
    {
        return 'search_chat_history';
    }

    public function description(): string
    {
        return 'Search the user and assistant message text of the user\'s other chat conversations by keyword, excluding the current one. Use this to recall what was already discussed before re-processing a request.';
    }

    public function handle(Request $request): string
    {
        $term = trim((string) $request['query']);

        if ($term === '') {
            return 'Provide a non-empty search term.';
        }

        $messages = ConversationMessage::query()
            ->where('participant_type', AgentConversation::participantType($this->user))
            ->where('participant_id', $this->user->id)
            ->where('conversation_id', '!=', $this->currentConversationId)
            ->whereIn('role', ['user', 'assistant'])
            ->where('content', 'like', "%{$term}%")
            ->orderByDesc('updated_at')
            ->limit(self::LIMIT)
            ->get(['id', 'conversation_id', 'role', 'content', 'created_at']);

        if ($messages->isEmpty()) {
            return 'No chat history found matching "'.$term.'".';
        }

        $titles = AgentConversation::query()
            ->whereIn('id', $messages->pluck('conversation_id')->unique())
            ->with('article:id,title')
            ->get()
            ->mapWithKeys(fn (AgentConversation $conversation): array => [
                $conversation->id => $conversation->article?->title,
            ]);

        $lines = $messages->map(function (ConversationMessage $message) use ($titles): string {
            $createdAt = $message->getAttribute('created_at');

            $context = collect(array_filter([
                $titles[$message->getAttribute('conversation_id')] ?? null,
                $createdAt instanceof Carbon ? $createdAt->format('Y-m-d') : null,
            ]))->implode(', ');

            return sprintf(
                '- [%s] %s: %s',
                $message->role,
                $context !== '' ? $context : 'no context',
                Str::limit($message->content ?? '', self::SNIPPET_LENGTH),
            );
        });

        return 'Chat history matching "'.$term.'":'."\n".$lines->implode("\n");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('The keyword to search for in past chat messages.')
                ->required(),
        ];
    }
}
