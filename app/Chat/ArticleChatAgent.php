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

    /**
     * Cumulative tool wall-time per turn. Together with maxSteps() and
     * timeout() this bounds the turn at 5x120 + 300 + ~30 = 930s, under the
     * 1200s turn lock TTL.
     */
    private const TOOL_BUDGET_SECONDS = 300.0;

    private ?ToolBudget $toolBudget = null;

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
            $article->url !== null ? 'URL: '.$article->url : null,
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
        $budget = $this->toolBudget ??= new ToolBudget(self::TOOL_BUDGET_SECONDS);

        return [
            new BudgetedTool(new GetArticleTool($this->conversation->article), $budget),
            new BudgetedTool(new SearchArticlesTool($this->user), $budget),
            new BudgetedTool(new GetHighlightsTool($this->user), $budget),
            new BudgetedTool(new SearchChatHistoryTool($this->user, (string) $this->conversation->getKey()), $budget),
            new BudgetedTool(new WebFetchTool, $budget),
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
        return 5;
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
