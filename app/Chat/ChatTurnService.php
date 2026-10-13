<?php

declare(strict_types=1);

namespace App\Chat;

use App\Models\AgentConversation;
use App\Models\User;
use Closure;
use Generator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Ai\Exceptions\AiException;
use Laravel\Ai\Exceptions\InsufficientCreditsException;
use Laravel\Ai\Exceptions\ProviderConnectionException;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\Exceptions\StreamErrorException;
use Laravel\Ai\Responses\StreamableAgentResponse;
use Laravel\Ai\Streaming\Events\Error as ErrorEvent;
use Laravel\Ai\Streaming\Events\ReasoningDelta;
use Laravel\Ai\Streaming\Events\StreamEnd;
use Laravel\Ai\Streaming\Events\TextDelta;
use Laravel\Ai\Streaming\Events\TextEnd;
use Laravel\Ai\Streaming\Events\ToolCall as ToolCallEvent;
use Laravel\Ai\Streaming\Events\ToolResult as ToolResultEvent;
use Throwable;

/**
 * Executes one chat turn and maps the package's stream events to SSE frames.
 *
 * Concurrency (spec): a turn holds a per-conversation and a per-user cache
 * lock for its whole duration. The TTL is the hard-kill backstop. The
 * enforced worst case is maxSteps(5) x timeout(120s) + tool budget(300s) +
 * the largest single tool (~30s) = 930s, below LOCK_TTL and below the FPM
 * request_terminate_timeout; a killed worker leaves the conversation locked
 * for up to 20 minutes — accepted by the spec. ArticleChatAgent also declares
 * a 1000s hard-deadline Stop middleware as a backstop against retry/overrun
 * cases.
 */
final class ChatTurnService
{
    public const LOCK_TTL = 1200;

    public const CONVERSATION_LOCK_PREFIX = 'chat-turn:';

    public const USER_LOCK_PREFIX = 'chat-user:';

    /**
     * Provider-side conditions that occur in normal operation (the provider is
     * down, rate limiting, overloaded, out of credits) and are already mapped
     * to a client-facing message. They must not be reported as errors.
     *
     * @var list<class-string<AiException>>
     */
    private const EXPECTED_PROVIDER_FAILURES = [
        RateLimitedException::class,
        ProviderOverloadedException::class,
        ProviderConnectionException::class,
        InsufficientCreditsException::class,
        StreamErrorException::class,
    ];

    /**
     * Builds the package stream for one turn. Injectable so tests can fake
     * the provider stream; the default resolves provider/model from the
     * conversation row via the agent's provider()/model().
     *
     * @var Closure(AgentConversation, User, string): StreamableAgentResponse
     */
    private Closure $streamFactory;

    public function __construct(
        private readonly ChatProviders $providers,
        ?Closure $streamFactory = null,
    ) {
        $this->streamFactory = $streamFactory ?? static fn (AgentConversation $conversation, User $user, string $content): StreamableAgentResponse => (new ArticleChatAgent($conversation, $user))
            ->continue((string) $conversation->getKey(), $user)
            ->stream($content);
    }

    /**
     * Gate and lock one turn. Throws the 409 conflicts before any provider
     * work starts, so the controller can still answer with a plain JSON
     * error instead of an already-started SSE stream.
     *
     * @throws ChatTurnConflictException provider unconfigured or a turn in flight
     * @throws ModelNotFoundException the conversation belongs to another user
     */
    public function begin(User $user, AgentConversation $conversation, string $content): ChatTurn
    {
        // begin() is the only choke point before the package's ownership-free
        // continue(), so never trust the caller: an unowned conversation is a
        // 404, not a cross-user stream.
        if ($conversation->getAttribute('participant_type') !== AgentConversation::participantType($user)
            || (string) $conversation->getAttribute('participant_id') !== (string) $user->id) {
            throw (new ModelNotFoundException)->setModel(AgentConversation::class, [$conversation->getKey()]);
        }

        $provider = (string) $conversation->provider;

        if (! $this->providers->isConfigured($provider)) {
            throw ChatTurnConflictException::providerUnavailable($provider);
        }

        // Both locks are always taken in this fixed order (conversation, then
        // user) — with one global order, two concurrent turns can never each
        // hold the lock the other needs.
        $conversationLock = Cache::lock(self::CONVERSATION_LOCK_PREFIX.$conversation->id, self::LOCK_TTL);

        if (! $conversationLock->get()) {
            throw ChatTurnConflictException::conversationInFlight();
        }

        $userLock = Cache::lock(self::USER_LOCK_PREFIX.$user->id, self::LOCK_TTL);

        if (! $userLock->get()) {
            // Never hold the first lock past a failed second acquisition.
            $conversationLock->release();

            throw ChatTurnConflictException::userInFlight();
        }

        return new ChatTurn(
            $this->frames($user, $conversation, $content),
            $conversationLock,
            $userLock,
        );
    }

    /**
     * Map one package stream to SSE frames (`event: <name>\ndata: <json>\n\n`).
     *
     * Tool result payloads never leave the server (name + status only);
     * preliminary tool results are dropped entirely (spike surprise 7). A
     * provider failure arrives as an Error event AND a thrown
     * StreamErrorException — exactly one error frame is emitted per turn.
     *
     * @return Generator<string>
     */
    private function frames(User $user, AgentConversation $conversation, string $content): Generator
    {
        $errorSent = false;

        try {
            // Construction is inside the try: the package's default factory can
            // throw eagerly (before the first event) while resolving provider
            // config or replaying history, and the SSE response headers are
            // already on the wire by now.
            $response = ($this->streamFactory)($conversation, $user, $content);

            foreach ($response as $event) {
                if ($errorSent) {
                    // After an Error event the stream is terminal; keep pulling
                    // only so the follow-up exception surfaces and the package
                    // records the failed turn (RememberConversation's catch).
                    continue;
                }

                if ($event instanceof TextDelta) {
                    yield self::frame('delta', ['text' => $event->delta]);
                } elseif ($event instanceof ReasoningDelta) {
                    yield self::frame('reasoning', ['text' => $event->delta]);
                } elseif ($event instanceof TextEnd) {
                    // Lets the frontend flush its delta buffer at a safe boundary
                    yield self::frame('delta_end');
                } elseif ($event instanceof ToolCallEvent) {
                    yield self::frame('tool', ['name' => $event->toolCall->name, 'status' => 'running']);
                } elseif ($event instanceof ToolResultEvent && ! $event->preliminary) {
                    yield self::frame('tool', [
                        'name' => $event->toolResult->name,
                        'status' => $event->successful ? 'completed' : 'failed',
                    ]);
                } elseif ($event instanceof StreamEnd) {
                    yield self::frame('done', ['reason' => $event->reason]);
                } elseif ($event instanceof ErrorEvent) {
                    $errorSent = true;

                    yield self::frame('error', [
                        'message' => Str::limit($event->message, 200),
                        'code' => $event->type,
                    ]);
                }

                // StreamStart/TextStart/ReasoningStart/ReasoningEnd/citations and
                // unknown future event types are ignored, never fatal.
            }
        } catch (Throwable $exception) {
            if (! $errorSent) {
                yield self::frame('error', $this->errorPayload($exception));
            }

            // Only genuinely unexpected failures are bugs worth an error-level
            // log; the mapped provider conditions are normal operation.
            if (! $this->isExpectedProviderFailure($exception)) {
                report($exception);
            }
        }
    }

    /**
     * Map the package exception taxonomy to a terse, human-facing message.
     *
     * @return array{message: string, code: string}
     */
    private function errorPayload(Throwable $exception): array
    {
        $message = match (true) {
            $exception instanceof RateLimitedException => 'The provider is rate limiting requests. Please try again in a moment.',
            $exception instanceof ProviderOverloadedException => 'The provider is overloaded right now. Please try again in a moment.',
            $exception instanceof ProviderConnectionException => 'The provider could not be reached. Check that it is running and try again.',
            $exception instanceof InsufficientCreditsException => 'The provider account is out of credits or quota.',
            $exception instanceof StreamErrorException => 'The provider reported an error: '.Str::limit($exception->getMessage(), 200),
            $exception instanceof AiException => 'The request to the provider failed.',
            default => 'The chat turn failed unexpectedly.',
        };

        return ['message' => $message, 'code' => Str::snake(class_basename($exception))];
    }

    /**
     * Whether the exception is a provider condition already mapped to a
     * client-facing message rather than a bug worth reporting.
     */
    private function isExpectedProviderFailure(Throwable $exception): bool
    {
        foreach (self::EXPECTED_PROVIDER_FAILURES as $class) {
            if ($exception instanceof $class) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function frame(string $event, array $data = []): string
    {
        $json = json_encode((object) $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

        // INVALID_UTF8_SUBSTITUTE makes failure practically impossible; stay
        // well-formed regardless so the client's parser never desynchronizes.
        return "event: {$event}\ndata: ".($json === false ? '{}' : $json)."\n\n";
    }
}
