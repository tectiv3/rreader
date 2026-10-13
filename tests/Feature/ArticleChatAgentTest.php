<?php

namespace Tests\Feature;

use App\Chat\ArticleChatAgent;
use App\Chat\BudgetedTool;
use App\Chat\Tools\GetArticleTool;
use App\Chat\Tools\GetHighlightsTool;
use App\Chat\Tools\SearchArticlesTool;
use App\Chat\Tools\SearchChatHistoryTool;
use App\Chat\Tools\WebFetchTool;
use App\Chat\TurnDeadline;
use App\Models\AgentConversation;
use App\Models\Article;
use App\Models\Feed;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Gateway\StepResult;
use Laravel\Ai\Middleware\Stop;
use Laravel\Ai\PendingStep;
use Tests\TestCase;

class ArticleChatAgentTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructions_are_metadata_only_with_history_hint(): void
    {
        $agent = $this->agent();

        $instructions = $agent->instructions();

        $this->assertStringContainsString('Title: Spectral Graph Partitioning', $instructions);
        $this->assertStringContainsString('Author: Jane Doe', $instructions);
        $this->assertStringContainsString('Feed: Papers Feed', $instructions);
        $this->assertStringContainsString('Published: 2026-09-28', $instructions);
        $this->assertStringContainsString('URL: https://example.com/spectral', $instructions);
        $this->assertStringContainsString('search_chat_history', $instructions);
        $this->assertStringContainsString('get_article', $instructions);
        $this->assertStringNotContainsString('BODYMARK', $instructions);
    }

    public function test_provider_and_model_come_from_the_conversation_row(): void
    {
        $agent = $this->agent();

        $this->assertSame('lmstudio', $agent->provider());
        $this->assertSame('qwen3.8-27b', $agent->model());
    }

    public function test_tools_are_the_five_chat_tools_bound_to_user_and_article(): void
    {
        $agent = $this->agent();

        $tools = $agent->tools();

        $this->assertCount(5, $tools);
        $this->assertContainsOnlyInstancesOf(BudgetedTool::class, $tools);

        // name() is duck-typed by the package (not on the Tool contract), so
        // the wrapper forwards the wrapped tool's name through the resolver.
        $names = array_map(fn (BudgetedTool $tool): string => $tool->name(), $tools);
        $this->assertSame(
            ['get_article', 'search_articles', 'get_highlights', 'search_chat_history', 'web_fetch'],
            $names,
        );
        $this->assertInstanceOf(GetArticleTool::class, $tools[0]->tool());
        $this->assertInstanceOf(SearchArticlesTool::class, $tools[1]->tool());
        $this->assertInstanceOf(GetHighlightsTool::class, $tools[2]->tool());
        $this->assertInstanceOf(SearchChatHistoryTool::class, $tools[3]->tool());
        $this->assertInstanceOf(WebFetchTool::class, $tools[4]->tool());
    }

    public function test_loop_limits_follow_the_spec(): void
    {
        $agent = $this->agent();

        $this->assertSame(5, $agent->maxSteps());
        $this->assertSame(120, $agent->timeout());

        $maxConversationMessages = \Closure::bind(
            fn (): int => $this->maxConversationMessages(),
            $agent,
            $agent::class,
        );

        $this->assertSame(40, $maxConversationMessages());
    }

    public function test_the_agent_declares_a_stop_middleware_bound_to_the_deadline(): void
    {
        $agent = $this->agent();

        $this->assertInstanceOf(HasMiddleware::class, $agent);
        $this->assertCount(1, $agent->middleware());
        $this->assertInstanceOf(Stop::class, $agent->middleware()[0]);
    }

    public function test_the_deadline_middleware_stops_an_expired_turn(): void
    {
        $agent = $this->agent(new TurnDeadline(0.0));
        $middleware = $agent->middleware()[0];
        $step = new PendingStep(0, false, 'lmstudio', 'qwen3.8-27b', null, [], [], null, null);

        $result = $middleware->handle($step, fn () => throw new \RuntimeException('next must not run'));

        $this->assertTrue($result->stopped());
    }

    public function test_the_deadline_middleware_passes_a_live_turn_through(): void
    {
        $agent = $this->agent(new TurnDeadline(60.0));
        $middleware = $agent->middleware()[0];
        $step = new PendingStep(0, false, 'lmstudio', 'qwen3.8-27b', null, [], [], null, null);
        $sentinel = StepResult::stop();

        $this->assertSame($sentinel, $middleware->handle($step, fn () => $sentinel));
    }

    private function agent(?TurnDeadline $deadline = null): ArticleChatAgent
    {
        [$user, $article] = $this->userWithArticle();

        $conversationId = (string) Str::uuid7();

        AgentConversation::create([
            'id' => $conversationId,
            'participant_type' => AgentConversation::participantType($user),
            'participant_id' => $user->id,
            'article_id' => $article->id,
            'title' => 'Spectral Graph Partitioning',
            'provider' => 'lmstudio',
            'model' => 'qwen3.8-27b',
        ]);

        $conversation = AgentConversation::query()
            ->with('article.feed')
            ->findOrFail($conversationId);

        return new ArticleChatAgent($conversation, $user, $deadline);
    }

    /**
     * @return array{User, Article}
     */
    private function userWithArticle(): array
    {
        $user = User::factory()->create();

        $feed = Feed::create([
            'user_id' => $user->id,
            'title' => 'Papers Feed',
            'feed_url' => 'https://example.com/feed.xml',
        ]);

        $article = Article::create([
            'feed_id' => $feed->id,
            'guid' => (string) Str::uuid7(),
            'title' => 'Spectral Graph Partitioning',
            'author' => 'Jane Doe',
            'content' => '<p>BODYMARK long body</p>',
            'url' => 'https://example.com/spectral',
            'published_at' => '2026-09-28 08:00:00',
        ]);

        return [$user, $article];
    }
}
