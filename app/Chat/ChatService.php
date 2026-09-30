<?php

declare(strict_types=1);

namespace App\Chat;

use App\Models\AgentConversation;
use App\Models\AgentConversationMessage;
use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ChatService
{
    private const HUB_LIMIT = 50;

    private const MESSAGES_LIMIT = 100;

    public function __construct(private readonly ChatProviders $providers) {}

    /**
     * The participant-scoped conversation query — the package's continue()
     * enforces no ownership, so every route resolves rows through this.
     *
     * @return Builder<AgentConversation>
     */
    private function scoped(User $user): Builder
    {
        return AgentConversation::query()
            ->where('participant_type', AgentConversation::participantType($user))
            ->where('participant_id', $user->id);
    }

    public function findForUser(User $user, string $id): AgentConversation
    {
        return $this->scoped($user)->findOrFail($id);
    }

    /**
     * Resolve a (provider, model) routing pair against the configured
     * providers. Nulls fall back to the default provider and its first
     * env-listed model.
     *
     * @return array{0: string, 1: string} the resolved [provider, model]
     *
     * @throws ValidationException
     */
    public function validateProviderChoice(?string $provider, ?string $model): array
    {
        $provider ??= $this->providers->defaultProvider();

        if ($provider === null || ! $this->providers->isConfigured($provider)) {
            throw ValidationException::withMessages([
                'provider' => ['The selected provider is unavailable.'],
            ]);
        }

        $model ??= $this->providers->modelsFor($provider)[0] ?? null;

        if ($model === null || ! $this->providers->isValid($provider, $model)) {
            throw ValidationException::withMessages([
                'model' => ['The selected model is unavailable for this provider.'],
            ]);
        }

        return [$provider, $model];
    }

    /**
     * Find-or-create the user's single conversation for the article. A lost
     * double-POST race on the UNIQUE constraint resolves to the winner's row.
     */
    public function findOrCreate(User $user, Article $article, ?string $provider = null, ?string $model = null): AgentConversation
    {
        $existing = $this->scoped($user)->where('article_id', $article->id)->first();
        if ($existing !== null) {
            return $existing;
        }

        [$provider, $model] = $this->validateProviderChoice($provider, $model);

        $id = (string) Str::uuid7();

        try {
            // Package model: unguarded, explicit fields only.
            AgentConversation::create([
                'id' => $id,
                'participant_type' => AgentConversation::participantType($user),
                'participant_id' => $user->id,
                'article_id' => $article->id,
                'title' => Str::limit($article->title, 100),
                'provider' => $provider,
                'model' => $model,
            ]);
        } catch (UniqueConstraintViolationException) {
            // Lost the race — fall through and return the winning row below.
        }

        // Conversation::create() returns a clobbered id on Laravel 12
        // (WithoutIncrementing is inert), so never trust the created instance.
        return $this->scoped($user)->where('article_id', $article->id)->firstOrFail();
    }

    /**
     * Metadata-only routing switch: applies next turn, history untouched.
     */
    public function switchRouting(User $user, string $id, string $provider, string $model): AgentConversation
    {
        $conversation = $this->findForUser($user, $id);

        [$provider, $model] = $this->validateProviderChoice($provider, $model);

        $conversation->update(['provider' => $provider, 'model' => $model]);

        return $conversation;
    }

    public function delete(User $user, string $id): void
    {
        $this->findForUser($user, $id)->delete();
    }

    /**
     * Hub rows: the user's most recently active conversations with article
     * context and a stale-provider flag.
     *
     * @return list<array<string, mixed>>
     */
    public function hub(User $user): array
    {
        $conversations = $this->scoped($user)
            ->withMax('messages as last_message_at', 'created_at')
            ->with(['article:id,title,feed_id', 'article.feed:id,title'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->limit(self::HUB_LIMIT)
            ->get();

        return $conversations
            ->map(fn (AgentConversation $conversation): array => $this->hubData($conversation))
            ->all();
    }

    /**
     * Transcript payload: conversation metadata plus the most recent messages,
     * oldest first. Tool payloads (steps) are never exposed.
     *
     * @return array{conversation: array<string, mixed>, messages: list<array<string, mixed>>}
     */
    public function detail(User $user, string $id): array
    {
        $conversation = $this->findForUser($user, $id);

        $messages = AgentConversationMessage::query()
            ->where('conversation_id', $conversation->getKey())
            ->select('id', 'role', 'content', 'status', 'created_at')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(self::MESSAGES_LIMIT)
            ->get()
            ->reverse()
            ->values()
            ->map(fn (AgentConversationMessage $message): array => [
                'id' => $message->id,
                'role' => $message->role,
                'content' => (string) ($message->content ?? ''),
                'status' => $this->messageStatus($message),
                'created_at' => $message->created_at,
            ])
            ->all();

        return [
            'conversation' => $this->conversationData($conversation),
            'messages' => $messages,
        ];
    }

    /**
     * Conversation metadata shape shared by POST/PATCH responses.
     *
     * @return array<string, mixed>
     */
    public function conversationData(AgentConversation $conversation): array
    {
        $conversation->loadMissing(['article:id,title,feed_id', 'article.feed:id,title']);

        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'article_id' => $conversation->article_id,
            'article_title' => $conversation->article?->title,
            'feed_title' => $conversation->article?->feed?->title,
            'provider' => $conversation->provider,
            'model' => $conversation->model,
            'provider_available' => $this->providers->isConfigured((string) $conversation->provider),
            'created_at' => $conversation->created_at,
            'updated_at' => $conversation->updated_at,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function hubData(AgentConversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'article_id' => $conversation->article_id,
            'article_title' => $conversation->article?->title,
            'feed_title' => $conversation->article?->feed?->title,
            'provider' => $conversation->provider,
            'model' => $conversation->model,
            'provider_available' => $this->providers->isConfigured((string) $conversation->provider),
            'last_message_at' => $conversation->last_message_at,
        ];
    }

    /**
     * Map the stored status via the raw value: a future unknown status must
     * not throw through the enum cast and break the transcript endpoint.
     */
    private function messageStatus(AgentConversationMessage $message): string
    {
        $status = $message->getRawOriginal('status');

        return is_string($status) && in_array($status, ['completed', 'failed', 'paused'], true)
            ? $status
            : 'unknown';
    }
}
