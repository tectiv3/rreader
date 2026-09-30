<?php

namespace Tests\Unit;

use App\Chat\BudgetedTool;
use App\Chat\ToolBudget;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ToolBudgetTest extends TestCase
{
    public function test_budget_reports_remaining_and_exhaustion(): void
    {
        $budget = new ToolBudget(10.0);

        $this->assertSame(10.0, $budget->remaining());
        $this->assertFalse($budget->exhausted());

        $budget->consume(3.5);

        $this->assertSame(6.5, $budget->remaining());
        $this->assertFalse($budget->exhausted());

        $budget->consume(6.5);

        $this->assertSame(0.0, $budget->remaining());
        $this->assertTrue($budget->exhausted());
    }

    public function test_budget_is_exhausted_when_overspent(): void
    {
        $budget = new ToolBudget(1.0);
        $budget->consume(4.0);

        $this->assertTrue($budget->exhausted());
        $this->assertLessThan(0.0, $budget->remaining());
    }

    public function test_budgeted_tool_forwards_name_description_and_schema(): void
    {
        $tool = new FakeTool('get_article', 'Reads the article.');
        $budgeted = new BudgetedTool($tool, new ToolBudget(100.0));
        $schema = $this->createMock(JsonSchema::class);

        $this->assertSame('get_article', $budgeted->name());
        $this->assertSame('Reads the article.', (string) $budgeted->description());
        $this->assertSame([], $budgeted->schema($schema));
        $this->assertSame($schema, $tool->lastSchema);
    }

    public function test_budgeted_tool_exposes_the_wrapped_tool(): void
    {
        $tool = new FakeTool('web_fetch', 'Fetches a page.');
        $budgeted = new BudgetedTool($tool, new ToolBudget(100.0));

        $this->assertSame($tool, $budgeted->tool());
    }

    public function test_budgeted_tool_delegates_and_consumes_elapsed_time(): void
    {
        $tool = new FakeTool('get_article', 'Reads the article.');
        $budget = new ToolBudget(100.0);
        $budgeted = new BudgetedTool($tool, $budget);

        $result = $budgeted->handle(new Request);

        $this->assertSame('result', $result);
        $this->assertSame(1, $tool->calls);
        $this->assertLessThan(100.0, $budget->remaining());
    }

    public function test_budgeted_tool_short_circuits_when_the_budget_is_spent(): void
    {
        $tool = new FakeTool('get_article', 'Reads the article.');
        $budgeted = new BudgetedTool($tool, new ToolBudget(0.0));

        $result = $budgeted->handle(new Request);

        $this->assertStringContainsString('budget', $result);
        $this->assertSame(0, $tool->calls);
    }

    public function test_budgeted_tool_overshoots_once_then_short_circuits(): void
    {
        // The check happens before delegating, so a tool that starts with time
        // left may still overrun the budget once; the next call is refused.
        $tool = new FakeTool('web_fetch', 'Fetches a page.', 3_000);
        $budget = new ToolBudget(0.001);
        $budgeted = new BudgetedTool($tool, $budget);

        $budgeted->handle(new Request);

        $this->assertSame(1, $tool->calls);
        $this->assertTrue($budget->exhausted());

        $this->assertStringContainsString('budget', $budgeted->handle(new Request));
        $this->assertSame(1, $tool->calls);
    }
}

final class FakeTool implements Tool
{
    public int $calls = 0;

    public ?JsonSchema $lastSchema = null;

    public function __construct(
        private readonly string $name,
        private readonly string $description,
        private readonly int $microseconds = 0,
    ) {}

    public function name(): string
    {
        return $this->name;
    }

    public function description(): string
    {
        return $this->description;
    }

    public function handle(Request $request): string
    {
        $this->calls++;

        if ($this->microseconds > 0) {
            usleep($this->microseconds);
        }

        return 'result';
    }

    public function schema(JsonSchema $schema): array
    {
        $this->lastSchema = $schema;

        return [];
    }
}
