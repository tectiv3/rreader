<?php

declare(strict_types=1);

namespace App\Chat;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * A chat turn cannot start: the conversation's provider is no longer
 * configured, or another turn is already in flight. Rendered as a 409 the
 * SPA turns into a toast; expected client contention, never logged.
 */
final class ChatTurnConflictException extends Exception
{
    /**
     * @param  array<string, mixed>  $payload
     */
    private function __construct(private readonly array $payload)
    {
        parent::__construct((string) $payload['error']);
    }

    public static function providerUnavailable(string $provider): self
    {
        return new self([
            'error' => "The {$provider} provider is no longer available. Switch to a configured provider from the chat header to continue.",
            'code' => 'provider_unavailable',
        ]);
    }

    public static function conversationInFlight(): self
    {
        return new self([
            'error' => 'A response is still being generated for this conversation.',
            'code' => 'turn_in_progress',
            'scope' => 'conversation',
        ]);
    }

    public static function userInFlight(): self
    {
        return new self([
            'error' => 'You already have a chat response in progress. Let it finish before starting another.',
            'code' => 'turn_in_progress',
            'scope' => 'user',
        ]);
    }

    public function render(): JsonResponse
    {
        return response()->json($this->payload, status: 409);
    }
}
