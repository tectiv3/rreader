<?php

namespace Tests\Feature;

use App\Chat\ArticleChatAgent;
use App\Chat\Tools\GetArticleTool;
use App\Chat\Tools\GetHighlightsTool;
use App\Chat\Tools\SearchArticlesTool;
use App\Chat\Tools\SearchChatHistoryTool;
use App\Models\AgentConversation;
use App\Models\Article;
use App\Models\Feed;
use App\Models\Highlight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Ai\Enums\MessageStatus;
use Laravel\Ai\Models\ConversationMessage;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ChatToolsTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_article_returns_stripped_metadata_and_body(): void
    {
        [$user, $article] = $this->userWithArticle();

        $result = (new GetArticleTool($article->load('feed')))->handle(new Request);

        $this->assertStringContainsString('Title: Quantum Computing Breakthrough', $result);
        $this->assertStringContainsString('Author: Jane Doe', $result);
        $this->assertStringContainsString('Feed: Papers Feed', $result);
        $this->assertStringContainsString('Published: 2026-09-28', $result);
        $this->assertStringContainsString('URL: https://example.com/quantum', $result);
        $this->assertStringContainsString('Hello world & friends', $result);
        $this->assertStringNotContainsString('<p>', $result);
        $this->assertStringNotContainsString('&amp;', $result);
    }

    public function test_get_article_truncates_oversized_bodies_head_and_tail(): void
    {
        [$user, $article] = $this->userWithArticle();

        $article->content = 'HEADMARK'.str_repeat('x', 280_000).'TAILMARK';

        $result = (new GetArticleTool($article))->handle(new Request);

        $this->assertLessThanOrEqual(24_200, mb_strlen($result));
        $this->assertStringContainsString('HEADMARK', $result);
        $this->assertStringContainsString('TAILMARK', $result);
        $this->assertStringContainsString('characters truncated', $result);
    }

    public function test_get_article_without_an_article_is_graceful(): void
    {
        $this->assertSame(
            'No article is attached to this conversation.',
            (new GetArticleTool(null))->handle(new Request),
        );
    }

    public function test_search_articles_is_scoped_to_the_users_feeds(): void
    {
        [$user, $article] = $this->userWithArticle();
        $otherUser = User::factory()->create();
        $this->createArticle($this->createFeed($otherUser), 'Quantum results by someone else');

        $result = (new SearchArticlesTool($user))->handle(new Request(['query' => 'Quantum']));

        $this->assertStringContainsString('Quantum Computing Breakthrough', $result);
        $this->assertStringContainsString('#'.$article->id, $result);
        $this->assertStringNotContainsString('someone else', $result);
    }

    public function test_search_articles_requires_a_term_and_reports_no_matches(): void
    {
        [$user] = $this->userWithArticle();

        $tool = new SearchArticlesTool($user);

        $this->assertSame(
            'Provide a non-empty search term.',
            $tool->handle(new Request(['query' => '   '])),
        );
        $this->assertSame(
            'No articles found matching "zeppelin".',
            $tool->handle(new Request(['query' => 'zeppelin'])),
        );
    }

    public function test_get_highlights_lists_the_users_highlights_with_article_filter(): void
    {
        [$user, $article] = $this->userWithArticle();
        $otherArticle = $this->createArticle($article->feed, 'Second article');
        $otherUser = User::factory()->create();

        Highlight::create([
            'user_id' => $user->id,
            'article_id' => $article->id,
            'text' => 'qubits entangle at scale',
            'note' => 'verify the claim',
        ]);
        Highlight::create([
            'user_id' => $user->id,
            'article_id' => $otherArticle->id,
            'text' => 'unrelated passage',
        ]);
        Highlight::create([
            'user_id' => $otherUser->id,
            'article_id' => $article->id,
            'text' => 'someone else highlight',
        ]);

        $tool = new GetHighlightsTool($user);

        $all = $tool->handle(new Request);
        $this->assertStringContainsString('qubits entangle at scale', $all);
        $this->assertStringContainsString('unrelated passage', $all);
        $this->assertStringContainsString('note: verify the claim', $all);
        $this->assertStringContainsString('Quantum Computing Breakthrough', $all);
        $this->assertStringNotContainsString('someone else highlight', $all);

        $scoped = $tool->handle(new Request(['article_id' => $otherArticle->id]));
        $this->assertStringContainsString('unrelated passage', $scoped);
        $this->assertStringNotContainsString('qubits entangle at scale', $scoped);
    }

    public function test_search_chat_history_finds_other_conversations_only(): void
    {
        [$user, $article] = $this->userWithArticle();
        $otherUser = User::factory()->create();

        $current = $this->createConversation($user, $article, 'current');
        $this->createMessage($current, $user, 'user', 'kubernetes in the current conversation');

        $past = $this->createConversation($user, $this->createArticle($article->feed, 'Kubernetes Past Article'), 'past');
        $this->createMessage($past, $user, 'user', 'Tell me about kubernetes operators');
        $this->createMessage($past, $user, 'assistant', 'Kubernetes operators are controllers');

        $foreign = $this->createConversation($otherUser, null, 'foreign');
        $this->createMessage($foreign, $otherUser, 'user', 'kubernetes of another user');

        $tool = new SearchChatHistoryTool($user, $current);

        $result = $tool->handle(new Request(['query' => 'kubernetes']));

        $this->assertStringContainsString('Tell me about kubernetes operators', $result);
        $this->assertStringContainsString('Kubernetes operators are controllers', $result);
        $this->assertStringContainsString('[user] Kubernetes Past Article, 2026-09-30:', $result);
        $this->assertStringNotContainsString('current conversation', $result);
        $this->assertStringNotContainsString('another user', $result);
    }

    public function test_search_chat_history_never_scans_tool_payload_steps(): void
    {
        [$user, $article] = $this->userWithArticle();

        $current = $this->createConversation($user, $article, 'current');
        $past = $this->createConversation($user, null, 'past');

        $this->createMessage($past, $user, 'assistant', 'clean content only', steps: [
            ['tool_calls' => [['id' => '1', 'name' => 'get_article', 'arguments' => [], 'result' => 'zeppelin payload']]],
        ]);

        $tool = new SearchChatHistoryTool($user, $current);

        $this->assertSame(
            'No chat history found matching "zeppelin".',
            $tool->handle(new Request(['query' => 'zeppelin'])),
        );
    }

    /**
     * @return array{User, Article}
     */
    private function userWithArticle(): array
    {
        $user = User::factory()->create();

        $feed = $this->createFeed($user);

        $article = Article::create([
            'feed_id' => $feed->id,
            'guid' => (string) Str::uuid7(),
            'title' => 'Quantum Computing Breakthrough',
            'author' => 'Jane Doe',
            'content' => '<p>Hello <b>world</b> &amp; friends</p>',
            'url' => 'https://example.com/quantum',
            'published_at' => '2026-09-28 08:00:00',
        ]);

        return [$user, $article];
    }

    private function createFeed(User $user): Feed
    {
        return Feed::create([
            'user_id' => $user->id,
            'title' => 'Papers Feed',
            'feed_url' => 'https://'.Str::uuid7().'.example.com/feed.xml',
        ]);
    }

    private function createArticle(Feed $feed, string $title): Article
    {
        return Article::create([
            'feed_id' => $feed->id,
            'guid' => (string) Str::uuid7(),
            'title' => $title,
        ]);
    }

    private function createConversation(User $participant, ?Article $article, string $title): string
    {
        $id = (string) Str::uuid7();

        AgentConversation::create([
            'id' => $id,
            'participant_type' => AgentConversation::participantType($participant),
            'participant_id' => $participant->id,
            'article_id' => $article?->id,
            'title' => $title,
            'provider' => 'lmstudio',
            'model' => 'qwen3.8-27b',
        ]);

        return $id;
    }

    private function createMessage(
        string $conversationId,
        User $participant,
        string $role,
        string $content,
        array $steps = [],
    ): void {
        ConversationMessage::create([
            'id' => (string) Str::uuid7(),
            'conversation_id' => $conversationId,
            'participant_type' => AgentConversation::participantType($participant),
            'participant_id' => $participant->id,
            'agent' => ArticleChatAgent::class,
            'role' => $role,
            'content' => $content,
            'attachments' => [],
            'steps' => $steps,
            'usage' => [],
            'meta' => [],
            'status' => MessageStatus::Completed,
        ]);
    }
}
