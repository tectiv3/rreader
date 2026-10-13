<?php

namespace Tests\Unit;

use App\Chat\TurnDeadline;
use Tests\TestCase;

class TurnDeadlineTest extends TestCase
{
    public function test_a_future_deadline_is_not_exceeded(): void
    {
        $deadline = new TurnDeadline(60.0);

        $this->assertFalse($deadline->exceeded());
        $this->assertGreaterThan(0.0, $deadline->remaining());
    }

    public function test_a_zero_deadline_is_exceeded(): void
    {
        $deadline = new TurnDeadline(0.0);

        $this->assertTrue($deadline->exceeded());
        $this->assertSame(0.0, $deadline->remaining());
    }
}
