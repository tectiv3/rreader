<?php

declare(strict_types=1);

namespace App\Chat;

/**
 * Absolute wall-clock ceiling for one chat turn.
 *
 * The package's step loop has no total-time bound and its retry-once-on-429
 * path can outrun the maxSteps x timeout estimate, so a turn needs a hard
 * backstop under ChatTurnService::LOCK_TTL.
 */
final class TurnDeadline
{
    private readonly float $expiresAt;

    public function __construct(float $seconds)
    {
        $this->expiresAt = microtime(true) + $seconds;
    }

    public function exceeded(): bool
    {
        return microtime(true) >= $this->expiresAt;
    }

    public function remaining(): float
    {
        return max(0.0, $this->expiresAt - microtime(true));
    }
}
