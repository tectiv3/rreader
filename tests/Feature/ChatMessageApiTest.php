<?php

namespace Tests\Feature;

use App\Chat\ChatProviders;
use App\Chat\ChatService;
use App\Chat\ChatTurnService;
use App\Models\AgentConversation;
use App\Models\Article;
use App\Models\Feed;
use App\Models\User;
use Generator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\Exceptions\StreamErrorException;
use Laravel\Ai\Responses\Data\Meta;
use Laravel\Ai\Responses\Data\TextUsage;
use Laravel\Ai\Responses\Data\ToolCall as ToolCallData;
use Laravel\Ai\Responses\Data\ToolResult as ToolResultData;
use Laravel\Ai\Responses\StreamableAgentResponse;
use Laravel\Ai\Streaming\Events\Error as ErrorEvent;
use Laravel\Ai\Streaming\Events\ReasoningDelta;
use Laravel\Ai\Streaming\Events\StreamEnd;
use Laravel\Ai\Streaming\Events\StreamEvent;
use Laravel\Ai\Streaming\Events\StreamStart;
use Laravel\Ai\Streaming\Events\TextDelta;
use Laravel\Ai\Streaming\Events\TextEnd;
use Laravel\Ai\Streaming\Events\ToolCall as ToolCallEvent;
use Laravel\Ai\Streaming\Events\ToolResult as ToolResultEvent;
use Tests\TestCase;
use Throwable;

class ChatMessageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->configureProviders();
    }

    public function test_guest_requests_are_unauthenticated(): void
    {
        $this->postJson('/api/chat/conversations/'.Str::uuid7().'/messages', ['content' => 'hi'])
            ->assertUnauthorized();
    }

    public function test_turns_are_scoped_to_the_participant(): void
    {
        $owner = User::factory()->create();
        $conversation = $this->conversationFor($owner);
        $this->fakeTurnStream([new TextDelta('t1', 'm1', 'hello', time())]);

        $this->actingAs(User::factory()->create())
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'hi'])
            ->assertNotFound();

        $this->actingAs($owner)
            ->postJson('/api/chat/conversations/'.Str::uuid7().'/messages', ['content' => 'hi'])
            ->assertNotFound();
    }

    public function test_content_is_validated(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);
        $this->fakeTurnStream([]);

        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('content');

        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => str_repeat('a', 5001)])
            ->assertStatus(422)
            ->assertJsonValidationErrors('content');
    }

    public function test_an_unconfigured_provider_is_rejected_before_streaming(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $this->configureProviders(lmstudio: ['key' => null]);

        $state = $this->fakeTurnStream([new TextDelta('t1', 'm1', 'hello', time())]);

        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'hi'])
            ->assertStatus(409)
            ->assertJsonPath('code', 'provider_unavailable')
            ->assertJsonPath('error', 'The lmstudio provider is no longer available. Switch to a configured provider from the chat header to continue.');

        $this->assertSame([], $state->calls);
    }

    public function test_a_second_turn_on_the_same_conversation_conflicts(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);
        $this->fakeTurnStream([new TextDelta('t1', 'm1', 'hello', time())]);

        // The stream callback has not run yet — the first turn holds its locks.
        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'first'])
            ->assertOk();

        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'second'])
            ->assertStatus(409)
            ->assertJsonPath('code', 'turn_in_progress')
            ->assertJsonPath('scope', 'conversation');
    }

    public function test_a_second_conversation_for_the_same_user_conflicts_on_the_user_lock(): void
    {
        $user = User::factory()->create();
        $first = $this->conversationFor($user);
        $second = $this->conversationFor($user);
        $this->fakeTurnStream([new TextDelta('t1', 'm1', 'hello', time())]);

        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$first->id.'/messages', ['content' => 'first'])
            ->assertOk();

        $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$second->id.'/messages', ['content' => 'second'])
            ->assertStatus(409)
            ->assertJsonPath('code', 'turn_in_progress')
            ->assertJsonPath('scope', 'user');

        // The cap is per user, never global.
        $other = User::factory()->create();
        $otherConversation = $this->conversationFor($other);

        $this->actingAs($other)
            ->postJson('/api/chat/conversations/'.$otherConversation->id.'/messages', ['content' => 'mine'])
            ->assertOk();
    }

    public function test_streams_the_turn_as_sse_frames_in_order(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $state = $this->fakeTurnStream([
            new StreamStart('s1', 'lmstudio', 'qwen3.8-27b', time()),
            new ReasoningDelta('r1', 'rs1', 'Thinking...', time()),
            new TextDelta('t1', 'm1', 'Let me check.', time()),
            new TextEnd('te1', 'm1', time()),
            new ToolCallEvent('tc1', new ToolCallData('call-1', 'get_article', ['full' => true]), time()),
            new ToolResultEvent('tr1', new ToolResultData('call-1', 'get_article', [], 'SECRET_PARTIAL_RESULT'), true, null, time(), preliminary: true),
            new ToolResultEvent('tr2', new ToolResultData('call-1', 'get_article', [], 'SECRET_FINAL_RESULT'), true, null, time()),
            new TextDelta('t2', 'm2', ' Done.', time()),
            new TextEnd('te2', 'm2', time()),
            new StreamEnd('se1', 'stop', new TextUsage, time()),
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'summarize']);

        $response->assertOk();
        $response->assertHeaderContains('Content-Type', 'text/event-stream');
        $response->assertHeaderContains('Cache-Control', 'no-cache');
        $response->assertHeader('X-Accel-Buffering', 'no');

        $sse = $response->streamedContent();

        $this->assertSame([[
            'conversation' => $conversation->id,
            'user' => $user->id,
            'content' => 'summarize',
        ]], $state->calls);

        $this->assertSame([
            ['event' => 'reasoning', 'data' => ['text' => 'Thinking...']],
            ['event' => 'delta', 'data' => ['text' => 'Let me check.']],
            ['event' => 'delta_end', 'data' => []],
            ['event' => 'tool', 'data' => ['name' => 'get_article', 'status' => 'running']],
            ['event' => 'tool', 'data' => ['name' => 'get_article', 'status' => 'completed']],
            ['event' => 'delta', 'data' => ['text' => ' Done.']],
            ['event' => 'delta_end', 'data' => []],
            ['event' => 'done', 'data' => ['reason' => 'stop']],
        ], $this->parseFrames($sse));

        // Tool result payloads never leave the server — not even the
        // preliminary one.
        $this->assertStringNotContainsString('SECRET_PARTIAL_RESULT', $sse);
        $this->assertStringNotContainsString('SECRET_FINAL_RESULT', $sse);

        // The exact wire grammar: event line, data line, blank line.
        $this->assertTrue(str_starts_with($sse, "event: reasoning\ndata: {\"text\":\"Thinking...\"}\n\n"));
    }

    public function test_a_provider_error_event_and_exception_emit_exactly_one_error_frame(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $providerError = new ErrorEvent('e1', 'server_error', 'The model exploded.', false, time());

        $this->fakeTurnStream(
            [new StreamStart('s1', 'lmstudio', 'qwen3.8-27b', time()), new TextDelta('t1', 'm1', 'Partial', time()), $providerError],
            new StreamErrorException($providerError),
        );

        $response = $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'hi']);

        $sse = $response->streamedContent();

        $this->assertSame([
            ['event' => 'delta', 'data' => ['text' => 'Partial']],
            ['event' => 'error', 'data' => ['message' => 'The model exploded.', 'code' => 'server_error']],
        ], $this->parseFrames($sse));

        $this->assertSame(1, substr_count($sse, 'event: error'));
        $this->assertStringNotContainsString('event: done', $sse);
    }

    public function test_a_provider_exception_maps_to_a_terse_error_frame(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $this->fakeTurnStream(
            [new StreamStart('s1', 'lmstudio', 'qwen3.8-27b', time())],
            new RateLimitedException('Application rate limited by AI provider [lmstudio].'),
        );

        $response = $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'hi']);

        $sse = $response->streamedContent();

        $this->assertSame([[
            'event' => 'error',
            'data' => [
                'message' => 'The provider is rate limiting requests. Please try again in a moment.',
                'code' => 'rate_limited_exception',
            ],
        ]], $this->parseFrames($sse));
    }

    public function test_a_client_abort_stops_consuming_and_releases_the_locks(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);

        $state = $this->fakeTurnStream([
            new TextDelta('t1', 'm1', 'one', time()),
            new TextDelta('t2', 'm1', 'two', time()),
            new TextDelta('t3', 'm1', 'three', time()),
        ]);

        $turn = $this->app->make(ChatTurnService::class)->begin($user, $conversation, 'hi');

        $emitted = [];

        // The emitter reporting the client gone after the second frame — the
        // same signal the controller's connection_aborted() check produces.
        $turn->run(function (string $frame) use (&$emitted): bool {
            $emitted[] = $frame;

            return count($emitted) < 2;
        });

        $this->assertCount(2, $emitted);

        // The generator was abandoned: the third event was never pulled (an
        // unconsumed package stream persists zero rows — spike #12).
        $this->assertCount(2, $state->pulled);

        $conversationLock = Cache::lock(ChatTurnService::CONVERSATION_LOCK_PREFIX.$conversation->id);
        $userLock = Cache::lock(ChatTurnService::USER_LOCK_PREFIX.$user->id);

        $this->assertTrue($conversationLock->get());
        $this->assertTrue($userLock->get());

        $conversationLock->release();
        $userLock->release();
    }

    public function test_locks_are_released_after_the_stream_completes(): void
    {
        $user = User::factory()->create();
        $conversation = $this->conversationFor($user);
        $this->fakeTurnStream([new TextDelta('t1', 'm1', 'hello', time()), new StreamEnd('se1', 'stop', new TextUsage, time())]);

        $response = $this->actingAs($user)
            ->postJson('/api/chat/conversations/'.$conversation->id.'/messages', ['content' => 'hi']);

        $response->streamedContent();

        $conversationLock = Cache::lock(ChatTurnService::CONVERSATION_LOCK_PREFIX.$conversation->id);
        $userLock = Cache::lock(ChatTurnService::USER_LOCK_PREFIX.$user->id);

        $this->assertTrue($conversationLock->get());
        $this->assertTrue($userLock->get());

        $conversationLock->release();
        $userLock->release();
    }

    /**
     * Swap the container's ChatTurnService for one whose provider stream is a
     * fake package response: `state->calls` records factory invocations,
     * `state->pulled` records the events the turn actually consumed.
     *
     * @param  list<StreamEvent>  $events
     */
    private function fakeTurnStream(array $events, ?Throwable $throw = null): object
    {
        $state = (object) ['calls' => [], 'pulled' => []];

        $this->app->instance(ChatTurnService::class, new ChatTurnService(
            $this->app->make(ChatProviders::class),
            function (AgentConversation $conversation, User $user, string $content) use ($events, $throw, $state): StreamableAgentResponse {
                $state->calls[] = [
                    'conversation' => $conversation->id,
                    'user' => $user->id,
                    'content' => $content,
                ];

                return new StreamableAgentResponse('test-turn', function () use ($events, $throw, $state): Generator {
                    foreach ($events as $event) {
                        $state->pulled[] = $event;

                        yield $event;
                    }

                    if ($throw !== null) {
                        throw $throw;
                    }
                }, new Meta);
            },
        ));

        return $state;
    }

    /**
     * Parse `event: <name>\ndata: <json>` frames back into pairs.
     *
     * @return list<array{event: string, data: array<string, mixed>}>
     */
    private function parseFrames(string $sse): array
    {
        return array_map(
            function (string $block): array {
                [$eventLine, $dataLine] = explode("\n", $block, 2);

                return [
                    'event' => substr($eventLine, strlen('event: ')),
                    'data' => (array) json_decode(substr($dataLine, strlen('data: ')), true),
                ];
            },
            array_values(array_filter(explode("\n\n", $sse))),
        );
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
}
