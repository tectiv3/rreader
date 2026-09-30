<?php

namespace Tests\Feature;

use App\Chat\ChatService;
use App\Models\AgentConversation;
use App\Models\Article;
use App\Models\Feed;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Ai\Enums\MessageStatus;
use Laravel\Ai\Models\ConversationMessage;
use Tests\TestCase;

class ChatConversationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->configureProviders();
    }

    public function test_guest_requests_are_unauthenticated(): void
    {
        $id = (string) Str::uuid7();

        foreach ([
            ['get', '/api/chat/conversations'],
            ['post', '/api/chat/conversations'],
            ['get', '/api/chat/conversations/'.$id],
            ['patch', '/api/chat/conversations/'.$id],
            ['delete', '/api/chat/conversations/'.$id],
        ] as [$method, $uri]) {
            $this->json($method, $uri)->assertUnauthorized();
        }
    }

    public function test_hub_lists_own_conversations_most_recent_first_and_flags_stale_providers(): void
    {
        $user = User::factory()->create();

        $old = $this->conversationFor($user, 'Old article');
        $recent = $this->conversationFor($user, 'Recent article');
        $quiet = $this->conversationFor($user, 'Quiet article');

        $this->message($old, $user, 'user', 'old question', minutesAgo: 120);
        $this->message($recent, $user, 'user', 'new question', minutesAgo: 5);

        $intruder = User::factory()->create();
        $this->conversationFor($intruder, 'Someone else');

        $response = $this->actingAs($user)->getJson('/api/chat/conversations');

        $response->assertOk();

        $rows = $response->json('conversations');
        $this->assertCount(3, $rows);

        $this->assertSame($recent->id, $rows[0]['id']);
        $this->assertSame('Recent article', $rows[0]['article_title']);
        $this->assertSame('Test Feed', $rows[0]['feed_title']);
        $this->assertSame('lmstudio', $rows[0]['provider']);
        $this->assertSame('qwen3.8-27b', $rows[0]['model']);
        $this->assertTrue($rows[0]['provider_available']);
        $this->assertNotNull($rows[0]['last_message_at']);

        $this->assertSame($old->id, $rows[1]['id']);
        $this->assertNull($rows[2]['last_message_at']);

        $this->assertNotContains($intruder->id, array_column($rows, 'id'));

        $this->configureProviders(lmstudio: ['key' => null]);

        $this->assertFalse(
            $this->actingAs($user)->getJson('/api/chat/conversations')->json('conversations.0.provider_available')
        );
    }

    public function test_detail_returns_transcript_without_tool_payloads_and_maps_status_defensively(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $this->message($conversation, $user, 'user', 'What is this about?', minutesAgo: 30);
        $this->message($conversation, $user, 'assistant', 'It is about testing.', minutesAgo: 29, steps: [
            ['tool_calls' => [
                ['id' => 'call-1', 'name' => 'get_article', 'arguments' => [], 'result' => 'SECRET_TOOL_PAYLOAD'],
            ]],
        ]);
        $this->message($conversation, $user, 'assistant', '', MessageStatus::Failed, minutesAgo: 28);
        $this->message($conversation, $user, 'assistant', 'Paused answer', MessageStatus::Paused, minutesAgo: 27);

        DB::table('agent_conversation_messages')->insert([
            'id' => (string) Str::uuid7(),
            'conversation_id' => $conversation->id,
            'participant_type' => AgentConversation::participantType($user),
            'participant_id' => $user->id,
            'agent' => 'ArticleChatAgent',
            'role' => 'assistant',
            'content' => 'Future status row',
            'attachments' => '[]',
            'steps' => '[]',
            'usage' => '[]',
            'meta' => '[]',
            'status' => 'awaiting_approval',
            'created_at' => now()->subMinutes(26),
            'updated_at' => now()->subMinutes(26),
        ]);

        $response = $this->actingAs($user)->getJson('/api/chat/conversations/'.$conversation->id);

        $response->assertOk();

        $this->assertSame('lmstudio', $response->json('conversation.provider'));
        $this->assertSame('qwen3.8-27b', $response->json('conversation.model'));
        $this->assertTrue($response->json('conversation.provider_available'));
        $this->assertSame('Test Article', $response->json('conversation.article_title'));

        $messages = $response->json('messages');
        $this->assertCount(5, $messages);
        $this->assertSame('What is this about?', $messages[0]['content']);
        $this->assertSame(
            ['completed', 'completed', 'failed', 'paused', 'unknown'],
            array_column($messages, 'status')
        );
        $this->assertSame(
            ['id', 'role', 'content', 'status', 'created_at'],
            array_keys($messages[0])
        );
        $this->assertStringNotContainsString('SECRET_TOOL_PAYLOAD', $response->getContent());
    }

    public function test_detail_caps_the_transcript_at_the_most_recent_hundred_messages(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $rows = [];
        foreach (range(0, 104) as $i) {
            $at = now()->subMinutes(300 - $i);
            $rows[] = [
                'id' => (string) Str::uuid7(),
                'conversation_id' => $conversation->id,
                'participant_type' => AgentConversation::participantType($user),
                'participant_id' => $user->id,
                'agent' => 'ArticleChatAgent',
                'role' => 'user',
                'content' => 'message-'.$i,
                'attachments' => '[]',
                'steps' => '[]',
                'usage' => '[]',
                'meta' => '[]',
                'status' => 'completed',
                'created_at' => $at,
                'updated_at' => $at,
            ];
        }
        DB::table('agent_conversation_messages')->insert($rows);

        $messages = $this
            ->actingAs($user)
            ->getJson('/api/chat/conversations/'.$conversation->id)
            ->json('messages');

        $this->assertCount(100, $messages);
        $this->assertSame('message-5', $messages[0]['content']);
        $this->assertSame('message-104', $messages[99]['content']);
    }

    public function test_conversation_routes_are_scoped_to_the_participant(): void
    {
        $owner = User::factory()->create();
        $conversation = $this->conversationFor($owner);
        $this->message($conversation, $owner, 'user', 'hello');

        $intruder = User::factory()->create();

        $this->actingAs($intruder)->getJson('/api/chat/conversations/'.$conversation->id)->assertNotFound();
        $this->actingAs($intruder)
            ->patchJson('/api/chat/conversations/'.$conversation->id, ['provider' => 'lmstudio', 'model' => 'qwen3.8-27b'])
            ->assertNotFound();
        $this->actingAs($intruder)->deleteJson('/api/chat/conversations/'.$conversation->id)->assertNotFound();

        $this->actingAs($owner)->getJson('/api/chat/conversations/'.Str::uuid7())->assertNotFound();

        $this->assertDatabaseHas('agent_conversations', ['id' => $conversation->id]);
        $this->assertDatabaseCount('agent_conversation_messages', 1);
    }

    public function test_store_creates_a_conversation_with_the_default_provider_and_model(): void
    {
        $user = User::factory()->create();
        $article = $this->articleFor($user);

        $response = $this->actingAs($user)->postJson('/api/chat/conversations', [
            'article_id' => $article->id,
        ]);

        $response->assertCreated();
        $this->assertSame('Test Article', $response->json('article_title'));

        $this->assertDatabaseHas('agent_conversations', [
            'id' => $response->json('id'),
            'participant_type' => AgentConversation::participantType($user),
            'participant_id' => $user->id,
            'article_id' => $article->id,
            'provider' => 'lmstudio',
            'model' => 'qwen3.8-27b',
        ]);
    }

    public function test_store_defaults_to_the_configured_default_provider(): void
    {
        $this->configureProviders(default: 'opencode');

        $user = User::factory()->create();
        $article = $this->articleFor($user);

        $response = $this->actingAs($user)->postJson('/api/chat/conversations', [
            'article_id' => $article->id,
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('agent_conversations', [
            'id' => $response->json('id'),
            'provider' => 'opencode',
            'model' => 'deepseek-v4.1-flash',
        ]);
    }

    public function test_store_freezes_the_requested_provider_and_model(): void
    {
        $user = User::factory()->create();
        $article = $this->articleFor($user);

        $response = $this->actingAs($user)->postJson('/api/chat/conversations', [
            'article_id' => $article->id,
            'provider' => 'opencode',
            'model' => 'glm-5.3',
        ]);

        $response->assertCreated();
        $this->assertSame('opencode', $response->json('provider'));
        $this->assertSame('glm-5.3', $response->json('model'));
    }

    public function test_store_is_idempotent_for_the_same_article(): void
    {
        $user = User::factory()->create();
        $article = $this->articleFor($user);

        $first = $this->actingAs($user)->postJson('/api/chat/conversations', ['article_id' => $article->id]);
        $second = $this->actingAs($user)->postJson('/api/chat/conversations', ['article_id' => $article->id]);

        $first->assertCreated();
        $second->assertCreated();
        $this->assertSame($first->json('id'), $second->json('id'));
        $this->assertDatabaseCount('agent_conversations', 1);
    }

    public function test_find_or_create_returns_the_existing_row_untouched(): void
    {
        $user = User::factory()->create();
        $article = $this->articleFor($user);
        $service = app(ChatService::class);

        $first = $service->findOrCreate($user, $article, 'lmstudio', 'qwen3.8-27b');
        $second = $service->findOrCreate($user, $article, 'opencode', 'glm-5.3');

        $this->assertSame($first->id, $second->id);
        $this->assertSame('lmstudio', $second->provider);
        $this->assertSame('qwen3.8-27b', $second->model);
        $this->assertDatabaseCount('agent_conversations', 1);
    }

    public function test_find_or_create_resolves_the_unique_race_to_the_winners_row(): void
    {
        $user = User::factory()->create();
        $article = $this->articleFor($user);
        $service = app(ChatService::class);

        $winnerId = (string) Str::uuid7();

        // Insert the "concurrent winner" between the service's find and create,
        // so its insert violates the UNIQUE(participant, article) constraint.
        AgentConversation::creating(function () use ($user, $article, $winnerId): bool {
            if (AgentConversation::query()->whereKey($winnerId)->exists()) {
                return true;
            }

            AgentConversation::query()->insert([
                'id' => $winnerId,
                'participant_type' => AgentConversation::participantType($user),
                'participant_id' => $user->id,
                'article_id' => $article->id,
                'title' => 'Race winner',
                'provider' => 'lmstudio',
                'model' => 'qwen3.8-27b',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return true;
        });

        try {
            $returned = $service->findOrCreate($user, $article);
        } finally {
            AgentConversation::flushEventListeners();
        }

        $this->assertSame($winnerId, $returned->id);
        $this->assertDatabaseCount('agent_conversations', 1);
    }

    public function test_store_rejects_articles_from_other_users_feeds(): void
    {
        $user = User::factory()->create();
        $stranger = User::factory()->create();
        $foreignArticle = $this->articleFor($stranger);

        $this->actingAs($user)
            ->postJson('/api/chat/conversations', ['article_id' => $foreignArticle->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors('article_id');

        $this->actingAs($user)
            ->postJson('/api/chat/conversations', ['article_id' => 999999])
            ->assertStatus(422)
            ->assertJsonValidationErrors('article_id');

        $this->assertDatabaseCount('agent_conversations', 0);
    }

    public function test_store_validates_provider_and_model_against_the_env_lists(): void
    {
        $user = User::factory()->create();
        $article = $this->articleFor($user);

        $this->actingAs($user)
            ->postJson('/api/chat/conversations', ['article_id' => $article->id, 'provider' => 'unknown'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('provider');

        $this->actingAs($user)
            ->postJson('/api/chat/conversations', ['article_id' => $article->id, 'provider' => 'lmstudio', 'model' => 'glm-5.3'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('model');

        $this->configureProviders(lmstudio: ['key' => null], opencode: ['key' => null]);

        $this->actingAs($user)
            ->postJson('/api/chat/conversations', ['article_id' => $article->id])
            ->assertStatus(422)
            ->assertJsonValidationErrors('provider');

        $this->assertDatabaseCount('agent_conversations', 0);
    }

    public function test_update_switches_routing_without_touching_history(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);
        $messageId = $this->message($conversation, $user, 'user', 'hello');
        $before = DB::table('agent_conversation_messages')->where('id', $messageId)->first();

        $response = $this->actingAs($user)->patchJson('/api/chat/conversations/'.$conversation->id, [
            'provider' => 'opencode',
            'model' => 'glm-5.3',
        ]);

        $response->assertOk();
        $this->assertSame('opencode', $response->json('provider'));
        $this->assertSame('glm-5.3', $response->json('model'));
        $this->assertSame($conversation->id, $response->json('id'));

        $this->assertDatabaseHas('agent_conversations', [
            'id' => $conversation->id,
            'provider' => 'opencode',
            'model' => 'glm-5.3',
        ]);

        $after = DB::table('agent_conversation_messages')->where('id', $messageId)->first();
        $this->assertEquals($before, $after);
    }

    public function test_update_validates_the_new_pair(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $this->actingAs($user)
            ->patchJson('/api/chat/conversations/'.$conversation->id, ['provider' => 'lmstudio', 'model' => 'glm-5.3'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('model');

        $this->assertDatabaseHas('agent_conversations', [
            'id' => $conversation->id,
            'provider' => 'lmstudio',
            'model' => 'qwen3.8-27b',
        ]);
    }

    public function test_destroy_deletes_the_conversation_and_cascades_its_messages(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);
        $this->message($conversation, $user, 'user', 'hello');
        $this->message($conversation, $user, 'assistant', 'hi');

        $this->actingAs($user)
            ->deleteJson('/api/chat/conversations/'.$conversation->id)
            ->assertNoContent();

        $this->assertDatabaseMissing('agent_conversations', ['id' => $conversation->id]);
        $this->assertDatabaseMissing('agent_conversation_messages', ['conversation_id' => $conversation->id]);
    }

    private function configureProviders(
        array $lmstudio = [],
        array $opencode = [],
        ?string $default = 'lmstudio',
    ): void {
        config([
            'ai.default' => $default,
            'ai.providers' => [
                'lmstudio' => array_merge([
                    'driver' => 'openai',
                    'url' => 'http://100.78.246.86:1234/v1',
                    'key' => 'sk-lm-test',
                    'models' => ['qwen3.8-27b', 'gpt-oss-20b'],
                ], $lmstudio),
                'opencode' => array_merge([
                    'driver' => 'openai-compatible',
                    'url' => 'https://opencode.ai/zen/v1',
                    'key' => 'zen-test',
                    'models' => ['deepseek-v4.1-flash', 'glm-5.3'],
                ], $opencode),
            ],
        ]);
    }

    private function articleFor(User $user, string $title = 'Test Article'): Article
    {
        $feed = Feed::create([
            'user_id' => $user->id,
            'title' => 'Test Feed',
            'feed_url' => 'https://example.com/'.Str::random(8).'.xml',
        ]);

        return Article::create([
            'feed_id' => $feed->id,
            'guid' => (string) Str::uuid7(),
            'title' => $title,
        ]);
    }

    private function conversationFor(User $user, string $articleTitle = 'Test Article'): AgentConversation
    {
        return app(ChatService::class)->findOrCreate($user, $this->articleFor($user, $articleTitle));
    }

    private function message(
        AgentConversation $conversation,
        User $user,
        string $role,
        string $content,
        MessageStatus $status = MessageStatus::Completed,
        ?int $minutesAgo = null,
        array $steps = [],
    ): string {
        $id = (string) Str::uuid7();
        $at = now()->subMinutes($minutesAgo ?? 0);

        ConversationMessage::create([
            'id' => $id,
            'conversation_id' => $conversation->id,
            'participant_type' => AgentConversation::participantType($user),
            'participant_id' => $user->id,
            'agent' => 'ArticleChatAgent',
            'role' => $role,
            'content' => $content,
            'attachments' => [],
            'steps' => $steps,
            'usage' => [],
            'meta' => [],
            'status' => $status,
            'created_at' => $at,
            'updated_at' => $at,
        ]);

        return $id;
    }
}
