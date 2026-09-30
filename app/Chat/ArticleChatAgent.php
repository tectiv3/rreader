<?php

namespace App\Chat;

use App\Chat\Tools\GetArticleTool;
use App\Chat\Tools\GetHighlightsTool;
use App\Chat\Tools\SearchArticlesTool;
use App\Chat\Tools\SearchChatHistoryTool;
use App\Chat\Tools\WebFetchTool;
use App\Models\AgentConversation;
use App\Models\User;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Promptable;

class ArticleChatAgent implements Agent, Conversational, HasTools
{
    use Promptable;
    use RemembersConversations;

    public function __construct(
        protected readonly AgentConversation $conversation,
        protected readonly User $user,
    ) {}

    public function instructions(): string
    {
        $article = $this->conversation->article;

        if ($article === null) {
            return <<<'TEXT'
                You are a reading assistant in an RSS reader, chatting with the user about an article.

                The full article text is not loaded yet: call the get_article tool when you need to read it. Before re-processing a request the user may have discussed before, call search_chat_history to recall what was already said.
                TEXT;
        }

        $metadata = array_filter([
            'Title: '.$article->title,
            $article->author !== null ? 'Author: '.$article->author : null,
            $article->feed?->title !== null ? 'Feed: '.$article->feed->title : null,
            $article->published_at !== null ? 'Published: '.$article->published_at->format('Y-m-d') : null,
            'URL: '.$article->url,
        ], fn (?string $line): bool => $line !== null);

        return implode("\n", [
            'You are a reading assistant in an RSS reader, chatting with the user about this article:',
            '',
            ...$metadata,
            '',
            'The full article text is not loaded yet: call the get_article tool when you need to read it. Before re-processing a request the user may have discussed before, call search_chat_history to recall what was already said.',
        ]);
    }

    /**
     * @return list<Tool>
     */
    public function tools(): array
    {
        return [
            new GetArticleTool($this->conversation->article),
            new SearchArticlesTool($this->user),
            new GetHighlightsTool($this->user),
            new SearchChatHistoryTool($this->user, (string) $this->conversation->getKey()),
            new WebFetchTool,
        ];
    }

    public function provider(): ?string
    {
        return $this->conversation->provider;
    }

    public function model(): ?string
    {
        return $this->conversation->model;
    }

    public function maxSteps(): int
    {
        return 8;
    }

    public function timeout(): int
    {
        return 120;
    }

    protected function maxConversationMessages(): int
    {
        return 40;
    }
}
