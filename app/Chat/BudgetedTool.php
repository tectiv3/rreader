<?php

declare(strict_types=1);

namespace App\Chat;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Laravel\Ai\Tools\ToolNameResolver;
use Stringable;

/**
 * Decorates a real tool with the turn's shared wall-clock budget.
 *
 * Once the budget is spent the tool short-circuits with an ordinary result
 * rather than throwing, so the model can wrap up instead of the turn failing.
 */
final class BudgetedTool implements Tool
{
    private const EXHAUSTED_MESSAGE = 'The tool-time budget for this turn is exhausted. Do not call more tools; answer using the information you already have.';

    public function __construct(
        private readonly Tool $tool,
        private readonly ToolBudget $budget,
    ) {}

    /**
     * The package resolves tool names by duck-typing a name() method (it is
     * not on the Tool contract), so delegate to its own resolver to keep the
     * forwarded name identical to the wrapped tool's.
     */
    public function name(): string
    {
        return ToolNameResolver::resolve($this->tool);
    }

    public function description(): Stringable|string
    {
        return $this->tool->description();
    }

    public function handle(Request $request): string
    {
        if ($this->budget->exhausted()) {
            return self::EXHAUSTED_MESSAGE;
        }

        $startedAt = hrtime(true);

        try {
            return (string) $this->tool->handle($request);
        } finally {
            $this->budget->consume((hrtime(true) - $startedAt) / 1_000_000_000);
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return $this->tool->schema($schema);
    }

    public function tool(): Tool
    {
        return $this->tool;
    }
}
