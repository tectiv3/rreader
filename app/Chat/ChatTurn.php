<?php

declare(strict_types=1);

namespace App\Chat;

use Closure;
use Generator;
use Illuminate\Contracts\Cache\Lock;

/**
 * One in-flight chat turn: the SSE frame generator plus the two concurrency
 * locks guarding it.
 */
final class ChatTurn
{
    private bool $released = false;

    /**
     * @param  Generator<string>  $frames  lazy — no provider work until run() pulls
     */
    public function __construct(
        private readonly Generator $frames,
        private readonly Lock $conversationLock,
        private readonly Lock $userLock,
    ) {
        // On a client abort PHP terminates the request at its next output
        // attempt, so run()'s finally never executes — without this backstop
        // both locks (and the per-user cap) would stay held until TTL expiry.
        register_shutdown_function($this->release(...));
    }

    /**
     * Drive every frame through the emitter until the turn ends. The emitter
     * returns false once the client is gone: we stop pulling the generator and
     * abandon it — an unconsumed stream persists zero rows (spike #12), so a
     * retry after an abort starts clean.
     *
     * @param  Closure(string): bool  $emit  sends one frame, returns false to stop
     */
    public function run(Closure $emit): void
    {
        try {
            foreach ($this->frames as $frame) {
                if ($emit($frame) === false) {
                    return;
                }
            }
        } finally {
            $this->release();
        }
    }

    /**
     * Idempotent: safe to call from the finally path and again from the
     * shutdown hook. Owner-checked at the store, so a stale hook can never
     * release a lock a later turn has re-acquired.
     */
    public function release(): void
    {
        if ($this->released) {
            return;
        }

        $this->released = true;

        $this->conversationLock->release();
        $this->userLock->release();
    }
}
