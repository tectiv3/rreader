# Article chat — Prereq #3 smoke test outcomes (2026-09-30)

Harness: `scripts/spike-chat-smoke.php` (tests A, B1, B2, C, D, E), `config/ai.php` two providers. Full report in the session that ran them; durable facts:

## Zen (opencode) — contradicts the design doc's Responses assumption
- The declared models `deepseek-v4.1-flash` and `glm-5.3` **reject the Responses protocol entirely** (`ModelProtocolUnsupported`, HTTP 400) on both `https://opencode.ai/zen/v1/responses` and `https://opencode.ai/zen/go/v1/responses`. The failure is at step 1 — not a `previous_response_id` issue.
- `/responses` on zen works only for other models (gpt-6-luna, grok-4.6/4.7, muse-spark). `go/v1/responses` additionally requires an `x-opencode-session` header.
- **User decision (2026-09-30): keep the declared models, use the spec's pre-approved fallback** — provider `opencode` runs `driver => 'openai-compatible'` (chat/completions, full history every step, no store flag). Both declared models passed a full streamed 2-tool-call round-trip through the package (~5–6s) with persistence-at-drain.
- `/zen/v1/models` lists 79 models; no per-model protocol metadata.

## LM Studio (lmstudio, driver `openai` — Responses API works)
- Full streamed multi-step round-trip through the package on `qwen3.8-27b`: 3 sequential tool calls + summary in 86.9s. Worst per-step latency **40.6s (first step)**; late steps 11–23s — nowhere near the 120s budget; prefill-growth fear not observed at this history size.
- `qwen3.8-flash-next` **fails to load in LM Studio** ("Failed to load model", 400) — broken server-side as of 2026-09-30; it should be dropped from `AI_LMSTUDIO_MODELS` or repaired. `gpt-oss-20b` loads fine and was used for the abort test.
- Silent mid-stream abort (break after 3 events): **zero rows persisted** in both tables — confirms spike #12 retry-cleanliness.
- Persistence at drain confirmed: conversation row + user row + assistant row with `steps` JSON (`tool_calls[]` with id/name/arguments/result + `reasoning` per step).

## Package gotcha (laravel/ai v1.0.1 on Laravel 12)
- `Conversation` model's `#[WithoutIncrementing]` attribute is **inert** (attribute class doesn't exist in illuminate/database 12) — after `Conversation::create([...])` the model's `id` is clobbered by `lastInsertId` (e.g. "1") while the row keeps the UUID. Never trust the returned model's id on Laravel 12; track the UUID you generated.
- Package migrations are NOT auto-loaded (`publishesMigrations`, no `loadMigrationsFrom`); `vendor:publish --tag=ai-migrations` has no group — the migration file was copied manually into `database/migrations/`.
