<?php

declare(strict_types=1);

namespace App\Chat;

/**
 * Cumulative wall-clock budget shared by every tool in one chat turn.
 *
 * The package's generation loop runs every tool a step returns, serially,
 * with no per-step tool cap, so a per-call timeout is not a turn bound. A
 * single shared budget is what makes the turn's worst case enforceable.
 */
final class ToolBudget
{
    private float $consumed = 0.0;

    public function __construct(private readonly float $seconds) {}

    public function remaining(): float
    {
        return $this->seconds - $this->consumed;
    }

    public function exhausted(): bool
    {
        return $this->remaining() <= 0.0;
    }

    public function consume(float $seconds): void
    {
        $this->consumed += $seconds;
    }
}
