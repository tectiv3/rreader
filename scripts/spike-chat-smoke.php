#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Prerequisite #3 smoke tests — docs/plans/2026-09-29-article-chat-design.md.
 *
 * Usage: php scripts/spike-chat-smoke.php <A|B1|B2|C|D|E>
 *
 * Throwaway spike harness. Defines its own agent + tool inline; no app/ classes.
 */

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Ai\AiManager;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Models\Conversation;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\StreamableAgentResponse;
use Laravel\Ai\Streaming\Events\Error as ErrorEvent;
use Laravel\Ai\Streaming\Events\ReasoningDelta;
use Laravel\Ai\Streaming\Events\StreamEnd;
use Laravel\Ai\Streaming\Events\StreamEvent;
use Laravel\Ai\Streaming\Events\StreamStart;
use Laravel\Ai\Streaming\Events\TextDelta;
use Laravel\Ai\Streaming\Events\ToolCall as ToolCallEvent;
use Laravel\Ai\Streaming\Events\ToolResult as ToolResultEvent;
use Laravel\Ai\Tools\Request;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

final class EchoTextTool implements Tool
{
    public function name(): string
    {
        return 'echo_text';
    }

    public function description(): string
    {
        return 'Echoes the given value back with its characters reversed.';
    }

    public function handle(Request $request): string
    {
        return strrev((string) $request['value']);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'value' => $schema->string()->required(),
        ];
    }
}

final class SpikeChatAgent implements Agent, Conversational, HasTools
{
    use Promptable;
    use RemembersConversations;

    public function instructions(): string
    {
        return 'You are a spike-test agent. When asked to use a tool, use it exactly as instructed.';
    }

    public function tools(): array
    {
        return [new EchoTextTool];
    }

    public function maxSteps(): int
    {
        return 8;
    }

    public function timeout(): int
    {
        return 120;
    }
}

function scrub(string $text): string
{
    // getenv, not env(): this is a CLI spike script and larastan rightly forbids
    // env() outside config (it returns null under cached config).
    foreach (['AI_LMSTUDIO_API_KEY', 'AI_OPENCODE_API_KEY'] as $name) {
        $value = (string) getenv($name);
        if ($value !== '') {
            $text = str_replace($value, '***REDACTED***', $text);
        }
    }

    return $text;
}

function ms(): int
{
    return (int) round((hrtime(true) / 1_000_000));
}

/**
 * Consume a streamed agent turn, logging every event with a monotonic timestamp.
 *
 * @return array{log: string[], toolCalls: int, text: string, errorEvents: string[], exception: ?string, aborted: bool, endMs: ?int}
 */
function consume(StreamableAgentResponse $response, int $t0, ?int $breakAfter = null): array
{
    $state = ['log' => [], 'toolCalls' => 0, 'text' => '', 'errorEvents' => [], 'exception' => null, 'aborted' => false, 'endMs' => null];
    $seen = 0;
    $reasoningDeltas = 0;

    try {
        $response->each(function (StreamEvent $event) use (&$state, &$seen, &$reasoningDeltas, $t0, $breakAfter) {
            $elapsed = ms() - $t0;
            $seen++;

            if ($event instanceof StreamStart) {
                $state['log'][] = sprintf('[%6dms] StreamStart provider=%s model=%s', $elapsed, $event->provider, $event->model);
            } elseif ($event instanceof ToolCallEvent) {
                $state['toolCalls']++;
                $state['log'][] = sprintf('[%6dms] ToolCall#%d name=%s args=%s', $elapsed, $state['toolCalls'], $event->toolCall->name, json_encode($event->toolCall->arguments));
            } elseif ($event instanceof ToolResultEvent) {
                if (! $event->preliminary) {
                    $state['log'][] = sprintf('[%6dms] ToolResult name=%s result=%s successful=%s', $elapsed, $event->toolResult->name, json_encode($event->toolResult->result), $event->successful ? 'true' : 'false');
                }
            } elseif ($event instanceof TextDelta) {
                $state['text'] .= $event->delta;
                $state['log'][] = sprintf('[%6dms] TextDelta %s', $elapsed, json_encode($event->delta));
            } elseif ($event instanceof ReasoningDelta) {
                $reasoningDeltas++;
            } elseif ($event instanceof ErrorEvent) {
                $line = sprintf('[%6dms] Error type=%s recoverable=%s message=%s', $elapsed, $event->type, var_export($event->recoverable, true), scrub(Str::limit($event->message, 400)));
                $state['log'][] = $line;
                $state['errorEvents'][] = $line;
            } elseif ($event instanceof StreamEnd) {
                $state['endMs'] = $elapsed;
                $state['log'][] = sprintf('[%6dms] StreamEnd reason=%s', $elapsed, $event->reason);
            } else {
                $state['log'][] = sprintf('[%6dms] %s', $elapsed, $event::class);
            }

            if ($breakAfter !== null && $seen >= $breakAfter) {
                $state['aborted'] = true;

                return false;
            }

            return true;
        });
    } catch (Throwable $e) {
        $elapsed = ms() - $t0;
        $body = method_exists($e, 'response') ? scrub(Str::limit((string) $e->response()->body(), 600)) : '';
        $state['exception'] = sprintf('[%6dms] EXCEPTION %s: %s%s', $elapsed, $e::class, scrub(Str::limit($e->getMessage(), 500)), $body !== '' ? " | response body: {$body}" : '');
    }

    if ($reasoningDeltas > 0) {
        $state['log'][] = sprintf('[note] %d ReasoningDelta event(s) suppressed from log', $reasoningDeltas);
    }

    return $state;
}

function perStepLatencies(array $state, int $t0): void
{
    $boundaries = [[0, 'turn-start']];
    $n = 0;
    foreach ($state['log'] as $line) {
        if (preg_match('/^\[\s*(\d+)ms\] ToolCall#(\d+)/', $line, $m)) {
            $boundaries[] = [(int) $m[1], 'ToolCall#'.$m[2]];
        }
    }
    $end = $state['endMs'] ?? (ms() - $t0);
    $boundaries[] = [$end, $state['exception'] !== null ? 'EXCEPTION' : 'stream-end'];

    echo "--- per-step wall time (step = span up to the next ToolCall boundary) ---\n";
    $worst = ['label' => '', 'ms' => -1];
    for ($i = 0; $i < count($boundaries) - 1; $i++) {
        [$from, $label] = $boundaries[$i];
        [$to] = $boundaries[$i + 1];
        $span = $to - $from;
        printf("step %-12s starts +%dms, span to next boundary: %dms\n", $label, $from, $span);
        if ($span > $worst['ms']) {
            $worst = ['label' => $label, 'ms' => $span];
        }
    }
    printf("WORST per-step latency: %dms (%s -> next boundary)\n", $worst['ms'], $worst['label']);
}

/**
 * The package's #[WithoutIncrementing] attribute is inert on Laravel 12 (the attribute
 * class does not exist in illuminate/database 12), so the model's post-insert id is
 * clobbered by lastInsertId. Track the generated UUID ourselves.
 */
function makeConversation(User $user, string $title): string
{
    $id = (string) Str::uuid7();

    Conversation::create([ // package model: unguarded; explicit fields only
        'id' => $id,
        'participant_type' => Conversation::participantType($user),
        'participant_id' => $user->getKey(),
        'title' => $title,
    ]);

    return $id;
}

function firstUser(): User
{
    $user = User::query()->first();
    if ($user === null) {
        fwrite(STDERR, "BLOCKED: no users in DB\n");
        exit(1);
    }

    return $user;
}

function runTurn(User $user, string $provider, string $model, string $prompt, ?string $conversationId): array
{
    $agent = new SpikeChatAgent;
    $conversationId !== null
        ? $agent->continue($conversationId, $user)
        : $agent->forParticipant($user);

    $t0 = ms();
    $response = $agent->stream($prompt, provider: $provider, model: $model);
    echo 'stream() returned; response->conversationId = '.($response->conversationId ?? 'null')."\n";

    $state = consume($response, $t0);

    foreach ($state['log'] as $line) {
        echo $line."\n";
    }
    if ($state['exception'] !== null) {
        echo $state['exception']."\n";
    }
    echo sprintf('TOTAL turn wall time: %dms | ToolCalls=%d | text=%s', ms() - $t0, $state['toolCalls'], json_encode(Str::limit($state['text'], 300)))."\n";

    return $state;
}

function dumpConversationRows(string $conversationId): void
{
    echo "--- persisted rows for conversation {$conversationId} ---\n";
    $conv = DB::table('agent_conversations')->where('id', $conversationId)->first();
    echo 'conversation row: '.($conv === null ? 'MISSING' : json_encode((array) $conv, JSON_UNESCAPED_SLASHES))."\n";
    $rows = DB::table('agent_conversation_messages')->where('conversation_id', $conversationId)->orderBy('created_at')->get();
    echo 'message rows: '.$rows->count()."\n";
    foreach ($rows as $row) {
        echo sprintf("- role=%s status=%s agent=%s\n", $row->role, $row->status, $row->agent);
        echo sprintf("  content[:300]=%s\n", json_encode(Str::limit((string) $row->content, 300)));
        echo sprintf("  steps[:500]=%s\n", json_encode(Str::limit((string) $row->steps, 500)));
    }
}

function setOpencodeStore(?bool $store): void
{
    // Retained for reference: only meaningful for driver 'openai' (Responses API).
    config(['ai.providers.opencode.store' => $store]);
    app(AiManager::class)->forgetInstance('opencode');
}

$test = strtoupper((string) ($argv[1] ?? ''));

match ($test) {
    'A' => (function () {
        echo "=== TEST A: Zen /models listing ===\n";
        $base = rtrim((string) config('ai.providers.opencode.url'), '/');
        $t0 = ms();
        $response = Http::withToken((string) config('ai.providers.opencode.key'))->timeout(30)->acceptJson()->get($base.'/models');
        printf("GET %s/models -> HTTP %d (%dms)\n", $base, $response->status(), ms() - $t0);

        if ($response->status() === 404) {
            $alt = 'https://opencode.ai/zen/go/v1';
            $t1 = ms();
            $response2 = Http::withToken((string) config('ai.providers.opencode.key'))->timeout(30)->acceptJson()->get($alt.'/models');
            printf("GET %s/models -> HTTP %d (%dms)\n", $alt, $response2->status(), ms() - $t1);
            if ($response2->successful()) {
                echo "RESULT: go/v1 base works — UPDATE .env AI_OPENCODE_BASE_URL={$alt}\n";
                $response = $response2;
            } else {
                echo "RESULT: FAIL — neither base lists /models\n";
                exit(1);
            }
        } elseif (! $response->successful()) {
            echo 'RESULT: FAIL — body: '.scrub(Str::limit($response->body(), 300))."\n";
            exit(1);
        }

        $ids = collect($response->json('data') ?? [])->pluck('id')->filter()->values();
        echo 'models ('.$ids->count().'): '.$ids->take(30)->implode(', ').($ids->count() > 30 ? ' …' : '')."\n";
        echo 'TEST A: PASS'."\n";
    })(),

    'B1' => (function () {
        echo "=== TEST B1: Zen streamed tool round-trip, deepseek-v4.1-flash (openai-compatible / chat/completions) ===\n";
        echo "(adapted: declared Zen models reject the Responses protocol — see Test A notes; stateful-vs-store distinction is moot on chat/completions)\n";
        $conversation = makeConversation(firstUser(), 'Spike B1 deepseek-v4.1-flash');
        $state = runTurn(
            firstUser(), 'opencode', 'deepseek-v4.1-flash',
            "Use the echo_text tool with value 'alpha', then with value 'beta', then tell me what you got",
            $conversation,
        );
        dumpConversationRows($conversation);
        $ok = $state['toolCalls'] >= 2 && trim($state['text']) !== '' && $state['exception'] === null;
        echo sprintf("TEST B1: %s (ToolCalls=%d, final text %s)\n", $ok ? 'PASS' : 'FAIL', $state['toolCalls'], trim($state['text']) !== '' ? 'present' : 'MISSING');
        if (! $ok) {
            exit(1);
        }
    })(),

    'B2' => (function () {
        echo "=== TEST B2: Zen streamed tool round-trip, glm-5.3 (openai-compatible / chat/completions) ===\n";
        echo "(adapted: second declared Zen model instead of the store=false variant)\n";
        $conversation = makeConversation(firstUser(), 'Spike B2 glm-5.3');
        $state = runTurn(
            firstUser(), 'opencode', 'glm-5.3',
            "Use the echo_text tool with value 'alpha', then with value 'beta', then tell me what you got",
            $conversation,
        );
        dumpConversationRows($conversation);
        $ok = $state['toolCalls'] >= 2 && trim($state['text']) !== '' && $state['exception'] === null;
        echo sprintf("TEST B2: %s (ToolCalls=%d, final text %s)\n", $ok ? 'PASS' : 'FAIL', $state['toolCalls'], trim($state['text']) !== '' ? 'present' : 'MISSING');
        if (! $ok) {
            exit(1);
        }
    })(),

    'C' => (function () {
        echo "=== TEST C: LM Studio multi-step round-trip (qwen3.8-27b) ===\n";
        $conversation = makeConversation(firstUser(), 'Spike C multi-step');
        $t0 = ms();
        $state = runTurn(
            firstUser(), 'lmstudio', 'qwen3.8-27b',
            "Call the echo_text tool with value 'one'. After receiving its result, call echo_text with value 'two'. After that result, call echo_text with value 'three'. Only after all three calls, write a one-sentence summary of the reversed values you received.",
            $conversation,
        );
        perStepLatencies($state, $t0);
        dumpConversationRows($conversation);
        $ok = $state['toolCalls'] >= 3 && trim($state['text']) !== '' && $state['exception'] === null;
        echo sprintf("TEST C: %s (ToolCalls=%d >= 3: %s)\n", $ok ? 'PASS' : 'FAIL', $state['toolCalls'], $state['toolCalls'] >= 3 ? 'yes' : 'NO');
        if (! $ok) {
            exit(1);
        }
    })(),

    'D' => (function () {
        echo "=== TEST D: LM Studio silent abort (gpt-oss-20b; qwen3.8-flash-next fails to load in LM Studio — see report) ===\n";
        $agent = new SpikeChatAgent;
        $agent->forParticipant(firstUser());
        $response = $agent->stream('Use the echo_text tool with value "abort-test", then tell me what you got.', provider: 'lmstudio', model: 'gpt-oss-20b');
        $conversationId = $response->conversationId;
        echo 'stream() returned; would-be conversationId = '.$conversationId."\n";

        $seen = 0;
        $t0 = ms();
        $response->each(function (StreamEvent $event) use (&$seen, $t0) {
            $seen++;
            echo sprintf('[%6dms] event#%d: %s %s', ms() - $t0, $seen, class_basename($event), json_encode(Str::limit($event->toArray()['type'] ?? '', 80)))."\n";
            if ($seen >= 3) {
                echo '[abort] breaking out of the stream after 3 events (simulated client disconnect)'."\n";

                return false;
            }

            return true;
        });

        unset($response, $agent);
        gc_collect_cycles();
        echo '[abort] stream dropped; sleeping 2s before counting rows…'."\n";
        sleep(2);

        $conversations = DB::table('agent_conversations')->where('id', $conversationId)->count();
        $messages = DB::table('agent_conversation_messages')->where('conversation_id', $conversationId)->count();
        echo sprintf("rows after abort: agent_conversations=%d agent_conversation_messages=%d\n", $conversations, $messages);
        $ok = $conversations === 0 && $messages === 0;
        echo 'TEST D: '.($ok ? 'PASS (zero rows persisted on silent abort)' : 'FAIL (rows persisted on abort)')."\n";
        if (! $ok) {
            exit(1);
        }
    })(),

    'E' => (function () {
        echo "=== TEST E: DB sanity ===\n";
        $tables = collect(DB::select("SELECT name FROM sqlite_master WHERE type='table'"))->pluck('name');
        foreach (['agent_conversations', 'agent_conversation_messages'] as $table) {
            printf("table %-30s %s\n", $table, $tables->contains($table) ? 'EXISTS' : 'MISSING');
        }
        echo 'PRAGMA journal_mode = '.DB::select('PRAGMA journal_mode')[0]->journal_mode."\n";
        echo 'PRAGMA busy_timeout = '.DB::select('PRAGMA busy_timeout')[0]->timeout."\n";
        $ok = $tables->contains('agent_conversations') && $tables->contains('agent_conversation_messages')
            && DB::select('PRAGMA journal_mode')[0]->journal_mode === 'wal';
        echo 'TEST E: '.($ok ? 'PASS' : 'FAIL')."\n";
        if (! $ok) {
            exit(1);
        }
    })(),

    default => (function () {
        fwrite(STDERR, "Usage: php scripts/spike-chat-smoke.php <A|B1|B2|C|D|E>\n");
        exit(2);
    })(),
};
