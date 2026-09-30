<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Feed;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Ai\Enums\MessageStatus;
use Laravel\Ai\Models\Conversation;
use Laravel\Ai\Models\ConversationMessage;
use Tests\TestCase;

class ArticleChatCascadeTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_an_article_cascades_away_its_conversations_and_messages(): void
    {
        [$user, $article, $conversationId, $messageId] = $this->articleWithConversationAndMessage();

        $this->assertDatabaseHas('agent_conversations', [
            'id' => $conversationId,
            'participant_type' => Conversation::participantType($user),
            'participant_id' => $user->id,
            'article_id' => $article->id,
        ]);
        $this->assertDatabaseHas('agent_conversation_messages', ['id' => $messageId]);

        $article->delete();

        $this->assertDatabaseMissing('agent_conversations', ['id' => $conversationId]);
        $this->assertDatabaseMissing('agent_conversation_messages', ['id' => $messageId]);
    }

    public function test_deleting_a_conversation_cascades_away_its_messages(): void
    {
        [$user, $article, $conversationId, $messageId] = $this->articleWithConversationAndMessage();

        Conversation::query()->where('id', $conversationId)->delete();

        $this->assertDatabaseMissing('agent_conversations', ['id' => $conversationId]);
        $this->assertDatabaseMissing('agent_conversation_messages', ['id' => $messageId]);
        $this->assertDatabaseHas('articles', ['id' => $article->id]);
    }

    public function test_a_participant_can_have_only_one_conversation_per_article(): void
    {
        [$user, $article, $conversationId, $messageId] = $this->articleWithConversationAndMessage();

        try {
            // Package model: unguarded, explicit fields only.
            Conversation::create([
                'id' => (string) Str::uuid7(),
                'participant_type' => Conversation::participantType($user),
                'participant_id' => $user->id,
                'article_id' => $article->id,
                'title' => 'Duplicate conversation',
                'provider' => 'lmstudio',
                'model' => 'qwen3.8-27b',
            ]);
        } catch (UniqueConstraintViolationException) {
            $this->assertDatabaseCount('agent_conversations', 1);
            $this->assertDatabaseHas('agent_conversations', ['id' => $conversationId]);
            $this->assertDatabaseHas('agent_conversation_messages', ['id' => $messageId]);

            return;
        }

        $this->fail('A duplicate (participant, article) conversation was accepted.');
    }

    /**
     * The package models' #[WithoutIncrementing] attribute is inert on Laravel 12,
     * so create() returns a clobbered id — the generated UUIDs are tracked here.
     *
     * @return array{User, Article, string, string}
     */
    private function articleWithConversationAndMessage(): array
    {
        $user = User::factory()->create();

        $feed = Feed::create([
            'user_id' => $user->id,
            'title' => 'Test Feed',
            'feed_url' => 'https://example.com/feed.xml',
        ]);

        $article = Article::create([
            'feed_id' => $feed->id,
            'guid' => (string) Str::uuid7(),
            'title' => 'Test Article',
        ]);

        $conversationId = (string) Str::uuid7();

        Conversation::create([
            'id' => $conversationId,
            'participant_type' => Conversation::participantType($user),
            'participant_id' => $user->id,
            'article_id' => $article->id,
            'title' => 'Test conversation',
            'provider' => 'lmstudio',
            'model' => 'qwen3.8-27b',
        ]);

        $messageId = (string) Str::uuid7();

        ConversationMessage::create([
            'id' => $messageId,
            'conversation_id' => $conversationId,
            'participant_type' => Conversation::participantType($user),
            'participant_id' => $user->id,
            'agent' => 'ArticleChatAgent',
            'role' => 'user',
            'content' => 'What is this article about?',
            'attachments' => [],
            'steps' => [],
            'usage' => [],
            'meta' => [],
            'status' => MessageStatus::Completed,
        ]);

        return [$user, $article, $conversationId, $messageId];
    }
}
