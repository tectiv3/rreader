# Article Chat — Design Spec

Date: 2026-09-29 (revised: grill + two plan-critic rounds + env-config + laravel/ai adoption)
Status: agreed (grilled) + critic-revised ×2 + implementation pinned to laravel/ai ^1.0

## Goal

Chat with any article: an LLM agent, article-scoped conversations, cross-conversation
memory ("what was said about topic X before"), and tools over the user's own data.
Provider-agnostic; primary targets are LM Studio on risen (Windows, via Tailscale) and
OpenCode Zen (`https://opencode.ai/zen/v1`). Built on **`laravel/ai` ^1.0** (stable since
2026-09-23).

## Verified facts (2026-09-29, live probes)

- LM Studio on risen: `http://100.78.246.86:1234/v1` (tailnet IP; the name `risen`
  resolves to the same IP but probe via name timed out once — use the IP, as pi's own
  `~/.pi/agent/models.json` does). **Requires API key** (`sk-lm-…`, sent as Bearer).
  `GET /v1/models` works (qwen3.8-27b, qwen3.8-flash-next, qwen3.6-35b-a3b-*, gpt-oss-20b,
  nomic-embed-text-v1.5). **`POST /v1/responses` works** — full Responses API incl.
  reasoning items and `previous_response_id`.
- laravel/ai v1.0.0's `openai` driver speaks **only the Responses API** (verified in
  source: `mergeSharedResponsesRequestOptions`, `function_call_output` input items,
  `response.*` stream events). No chat/completions mode.
- OpenCode Zen `/responses` support: **unverified** — gated smoke test (needs Zen key).
- Pi harness config confirms LM Studio usage via `openai-completions` + key — both wire
  protocols exist on risen; laravel/ai uses the Responses one.

## Deployment context

- Dev runs locally (`nix develop` + overmind); **prod is casa** (`/var/www/rreader`,
  `https://casa.tail386db.ts.net`, Ubuntu 24.04). User deploys manually — agents never
  deploy; ask, then verify.
- Prod queue worker: `php artisan queue:work --sleep=3 --tries=3 --timeout=90
  --max-time=3600` as www-data (self-restarts hourly). The `--timeout=90` must be raised
  for summary jobs (see Prerequisites #2) — a manual systemd/service edit on casa.
- **Verify casa PHP ≥ 8.3** (laravel/ai requires it; dev runs 8.3.6, composer platform
  pinned 8.3.6).
- nginx config lives on casa: the `location /api/chat/` block is a casa-side deploy step.
- LM Studio must be reachable from **wherever rreader runs** — dev box and casa both
  reach `100.78.246.86:1234` via tailnet. LM Studio server must stay on ("serve on
  network") with the API key enabled.

## Configuration model (env, no settings UI)

Providers declared in `.env` (dev + casa). A provider is **configured** when base URL +
key + default model are all set:

```
AI_LMSTUDIO_BASE_URL=http://100.78.246.86:1234/v1
AI_LMSTUDIO_API_KEY=sk-lm-...
AI_LMSTUDIO_MODEL=qwen3.8-27b
AI_OPENCODE_BASE_URL=https://opencode.ai/zen/v1
AI_OPENCODE_API_KEY=zen-...
AI_OPENCODE_MODEL=...
AI_DEFAULT_PROVIDER=lmstudio           # optional; else first configured in fixed order
```

- `config/ai.php`: two named entries with `driver => 'openai'`, each its own `url` +
  `key`. **`env()` reads live only in `config/ai.php`** — all runtime code resolves
  providers via `config()` only (with `config:cache` in prod, stray `env()` calls
  return null → "0 providers" failure).
- Provider resolution: `AI_DEFAULT_PROVIDER` validated against the configured set;
  stale value falls through to first-configured (fixed order), none → chat disabled.
  **Frozen provider removed from env between turns**: turn dispatch, summary dispatch,
  and PATCH all gate on "provider currently configured" → 409/422 + toast prompting a
  model switch (otherwise requests silently target `api.openai.com` unauthenticated).
- **No AI section in the settings page.** No keys in the DB or browser at any point.
- Chat entry points (article button, `/chat` tab/sidebar) enabled iff ≥1 provider
  resolves. `GET /api/chat/models` merges each configured provider's `/models` listing
  (hand-rolled `Http::withToken($key)->get("$url/models")` — the package has no model
  listing) + env defaults as fallback.
- **Per-chat model choice**: dropdown in chat header only when >1 option; selection
  frozen on the conversation (`provider`, `model`), switchable via `PATCH`. Model name
  always displayed. New conversations use `AI_DEFAULT_PROVIDER` / provider default.

## Implementation (laravel/ai ^1.0)

- `composer require laravel/ai:^1.0` (deps are light: `illuminate/*`, `laravel/prompts`,
  `serializable-closure`).
- **Agent**: dedicated `ArticleChatAgent implements Agent, HasTools`:
  `instructions()` = metadata-only system prompt (title, author,
  feed, date, URL + "check search_chat_history before re-processing" instruction);
  `tools()` = the five tools below; `provider()`/`model()` resolved from the
  conversation row; `maxSteps(): 8` (explicit — package default is
  `round(count(tools)*1.5)`).
- **Tools** as `Tool` classes (`schema()` via the JsonSchema fluent builder, `handle()`
  returns string; all scoped to the requesting user captured before streaming):
  `GetArticleTool`, `SearchArticlesTool` (existing LIKE `scopeSearch`),
  `GetHighlightsTool`, `SearchChatHistoryTool`, `WebFetchTool`.
  - `GetArticleTool` — metadata + body, HTML stripped, truncated (cap ~24k chars
    head+tail; article worst case 272KB).
  - `SearchChatHistoryTool` — LIKE over past conversations' summaries (our columns) +
    user/assistant `content` of `agent_conversation_messages` (tool payloads live in
    `steps`, never scanned), excluding current conversation.
  - `WebFetchTool` — reuse only the parsing layer of `ContentExtractorService`
    (make `extractReadableContent()` public); custom fetch client: manual redirect loop,
    each hop re-resolved + validated against private/loopback/link-local, resolved IP
    pinned via `CURLOPT_RESOLVE`. Output stripped + truncated like GetArticleTool.
- **Persistence is the package's** (`RemembersConversations` + `DatabaseConversationStore` +
  the `agent_conversations`/`agent_conversation_messages` tables, table/connection
  configurable in `config/ai.php`), extended by **one follow-up migration** (below).
  What the package already covers, verified in 1.x source: per-turn write of user
  message + **one assistant row whose `steps` longText embeds all tool calls/results**
  (atomic by construction — no transactional-pair handling needed); failed turns are
  recorded with completed steps + exception marker (`rememberFailedTurn`); replay/
  hydration is theirs (no `call_id`-pairing code on our side); tool payloads live in
  `steps`, not `content`, so LIKE search never scans them. `config('ai.conversations.
  generate_title', false)` — keep title auto-generation **off** (it makes a synchronous
  LLM call via the default provider inside the turn path); titles fall back to the
  truncated first message.
  - Our `ChatService` consumes `$agent->forParticipant($user)->continue($id)` streams
    via `->each()` inside the controller's `StreamedResponse` (lazy generator —
    per-event delivery holds); package events (`TextDelta`, `ToolCall`, `ToolResult`,
    `ReasoningDelta`, `Error`, `StreamEnd`, plus `StreamStart`/`TextStart`/`TextEnd`/
    `ReasoningStart`/`ReasoningEnd`/citations — **unknown event types are ignored, not
    fatal**) map to our SSE vocabulary: `delta`, `tool`, `reasoning` (optional;
    qwen3.8 emits reasoning — collapsible "thinking" UI later), `done`, `error`. Flush
    the client-side delta buffer on `TextEnd`. Tool **result payloads are never sent
    to the client**; only tool name + status go out. **Error dedup**: a provider
    failure arrives as an `Error` event *and* a thrown `StreamErrorException` — emit
    the SSE `error` event exactly once per turn.
  - **Replay cap**: `maxConversationMessages()` on the agent (~40; count-based — no
    cumulative char budget exists, tool payloads are bounded by our per-tool 24k
    truncation instead).
  - **Verify at implementation time**: whether replay includes `failed`-status
    messages (poisoned-context risk — the corrupt-conversation retry stays in the
    spec), and `continue()` ownership enforcement (`VerifiesConversationOwnership`).
- **Iteration cap**: `maxSteps = 8`; package ends the turn at cap. If a forced wrap-up
  is wanted: one extra `prompt()` call with `tools: []` (simpler than `tool_choice:
  none` through the package).
- **Timeout budget** (blocker): declare `timeout(): 120` on `ArticleChatAgent` — the
  package's HTTP client defaults to 60s *total per request including the streamed
  body*, which kills qwen3.8 mid-stream. The chain must satisfy:
  per-step 120s × maxSteps 8 + tool exec (~200s) ≈ 1160s ≤ **lock TTL 1200s** ≤
  nginx `fastcgi_read_timeout` (1200s).
- **Concurrency**: per-conversation `Cache::lock($key, ttl≈1200s)` (see Timeout
  budget), release in `finally`; second in-flight turn → 409. Per-user single in-flight
  turn cap (`pm.max_children=10`; PWA on phone + desktop must not starve workers).
  **Client disconnect**: drain all `ob_` levels + `flush()` per SSE frame (FPM output
  buffering otherwise defeats streaming despite `X-Accel-Buffering: no`); check
  `connection_aborted()` in the `each()` callback → stop consuming, mark turn
  `aborted` (don't burn the GPU on a gone client).
- **Retry semantics / turn lifecycle**: `chat_turns` side table (UNIQUE(turn_id));
  inside the lock: `in_progress` → 409, `done` → 200 with conversation state,
  `aborted` → mark their partial rows for exclusion and regenerate (their failed-
  status rows stay as history unless replay-verification forces deletion). User
  message written only after the check (their middleware writes it during the turn).
- **Summaries**: scheduler (15 min) → conversations idle >15 min with stale summary →
  queued job (long timeout; see Prerequisites #2) prompting the **conversation's own
  provider/model** (gated: skip conversations whose provider is no longer configured)
  with capped input (recent messages + previous summary).
  Claim-at-dispatch (`summarized_at = now()` when enqueuing, reset on failure),
  `ShouldBeUnique` backstop, existence re-check + `deleteSilently` in `handle()`,
  rate-limit ~2/hour per conversation, skip during active turns (LM Studio serializes).
  Title = first user message truncated.
- **Streaming transport**: SSE over `POST` (SPA uses `fetch` + ReadableStream with
  explicit `X-XSRF-TOKEN`; CSRF applies via `statefulApi()`). `text/event-stream`,
  `X-Accel-Buffering: no`, `set_time_limit(0)`. nginx (casa): dedicated
  `location /api/chat/` — `fastcgi_buffering off`, `gzip off`, `fastcgi_read_timeout`
  1200s (matches the Timeout budget chain).
- **Provider failure**: package exception taxonomy (`AiException`,
  `RateLimitedException`, `ProviderOverloadedException`, …) → `error` SSE event +
  toast. Corrupt-conversation detection: one automatic retry on a fresh conversation —
  stored history is what poisons the prompt.

## Decisions (resolved during grilling)

| Decision | Choice |
|---|---|
| AI layer | **laravel/ai ^1.0**, Responses API, package agent loop + **package conversation storage** (extended via follow-up migration). |
| Agent loop | Backend (Laravel). No MCP anywhere. |
| Web search | **Deferred to v2**. v1 ships DB tools + web_fetch. |
| Config | **Env-only**; model choice per-chat; zero settings UI. |
| Chat UI | Dedicated route `/chat`. Mobile: bottom-nav tab. Desktop: sidebar item. Hub = recent conversations (one per article). |
| Conversation lifecycle | **One per (user, article)**, auto-resume. UNIQUE(participant, article_id) on the package table. |
| Article context | **Lazy via tool**: metadata-only system prompt; `get_article` on demand. |
| DB tools | Core 3 + search_chat_history + web_fetch, all user-scoped. |
| Memory | Tool-based retrieval + auto-summaries (scheduler + queued job). |
| Deletion policy | **Cascade** with feed/article deletion. |
| Native LM Studio API | Rejected (MCP-only tools; web-tools plugin hides results; second protocol). |
| Hand-rolled chat/completions client | Rejected after verification: Responses API confirmed on LM Studio, package stable at 1.0. |

## Prerequisites (do first)

1. **SQLite pragmas** (blocker): `journal_mode=WAL` + `busy_timeout=5000` in the sqlite
   connection config — agent loop + feed scheduler + queue + sessions overlap otherwise.
2. **Queue job lifecycle** (blocker): raise dev Procfile (`--timeout=60`) and prod casa
   systemd worker (`--timeout=90`) to ~900s for summary jobs, **and** set `retry_after`
   (config/queue.php, default 90) above it (e.g. 910) — otherwise running jobs are
   marked failed and duplicates stack. Casa service edit is manual.
3. **Smoke tests** (gate implementation):
   - Zen (**needs your Zen key**): `GET /zen/v1/models` + a **≥2-step streamed tool
     round-trip** on `/zen/v1/responses` — a single-request probe won't catch Zen
     accepting `/responses` but breaking `previous_response_id` continuations, which
     the package uses mid-turn. If it fails: swap the Zen config entry to the package's
     built-in `driver => 'openai-compatible'` (speaks chat/completions) — a config
     change, not a gateway port.
   - LM Studio: full streamed tool-call round-trip **through `ArticleChatAgent`** on
     `/v1/responses` (the hand-rolled probe verified the endpoint, not the SDK's exact
     body: `store`-omitted, parallel tool calls, `tool_choice: auto`).
   - Session/user/config captured before the stream callback starts.

## API routes (auth:sanctum)

- `GET  /api/chat/conversations` — hub list (article title/feed, model, summary, last_message_at)
- `GET  /api/chat/conversations/{id}` — messages, capped/paginated
- `POST /api/chat/conversations` — `{article_id}` → find-or-create
- `PATCH /api/chat/conversations/{id}` — `{provider, model}` switch; validated
  provider ∈ configured, model ∈ that provider's current listing; hub/detail flag
  conversations whose frozen model no longer resolves
- `DELETE /api/chat/conversations/{id}`
- `POST /api/chat/conversations/{id}/messages` — `{content, turn_id}` → SSE stream
- `GET  /api/chat/models` — merged listing from configured providers: per-provider
  `Http::timeout(5)` + try/catch (one dead provider must not hang the UI), short
  cache (~60s), env defaults always served on listing failure, **embedding models
  filtered out** (e.g. nomic-embed — selectable but dead). Response includes an
  `enabled` flag (the SPA's chat-entry gating signal). No user-supplied URLs/keys
  (SSRF surface from critic round 1 eliminated).

## Data model

Package tables (`agent_conversations`, `agent_conversation_messages` — created by
the package migration, names configurable) + **one follow-up migration of ours**:

```
agent_conversations (altered):
    + article_id FK (on delete CASCADE — rides the feed→article cascade),
    + provider, model,                  # frozen choice, switchable via PATCH
    + summary nullable, summarized_at nullable
    + UNIQUE(participant_type, participant_id, article_id)
    (written via the unguarded Conversation model — no store subclass needed)

chat_turns (ours, side table):
    id, conversation_id FK, turn_id uuid UNIQUE, state (in_progress|done|aborted),
    timestamps                          # retry idempotency — their rows carry no
                                         # turn identifier
```

Messages (theirs): `role`, `content` (user/assistant text only — LIKE-searched by
`search_chat_history`), `steps` longText (tool calls/results/args — never scanned),
`status` (failed turns recorded with completed steps), `usage`, `meta`.

Conversation rows are created directly via the `Conversation` model on
`POST /api/chat/conversations` (participant = User morph, title from article/first
message); turns then run via `$agent->forParticipant($user)->continue($id)`.

## Frontend

- Route `/chat` (hub) and `/chat/:conversationId`. `ChatView.vue` + `ChatPanel.vue`
  (message list, input, tool-activity indicator, streaming via fetch/ReadableStream
  parser). Article toolbar button (desktop inline expansion + mobile
  `ArticleDetailView`) → `POST /conversations {article_id}` → navigate to `/chat/:id`.
- **Chat header**: always shows provider/model; dropdown only when >1 option
  (`GET /api/chat/models`); switching persists via `PATCH`, applies next turn.
- **Assistant output**: `marked` + `DOMPurify`, debounced re-parse (~150ms) during
  streaming. Add deps if missing.
- Mobile: new bottom-nav tab. Desktop: sidebar section.
- Entry points hidden when no provider resolvable and when offline. Chat is online-only;
  add `chat` to `SPA_PATHS` in `public/sw-navigation.js` for offline deep-link shells;
  never show the "cached content" banner over a dead chat view.

## Operational notes

- qwen3.8-27b is slow (GPU+CPU offload) — SSE streaming + generous timeouts mandatory.
- **Rollout order**: deploy migrations → `migrate` on prod (casa) → only then
  `php artisan schema:dump --prune` (project convention for `sqlite-schema.sql`).
- Casa deploy checklist (manual, user-driven): `.env` AI_* vars → `config:cache`
  refresh, queue service `--timeout` raise + `queue:restart`, nginx
  `location /api/chat/` block (incl. FPM `request_terminate_timeout` raised/0 — it
  kills long turns regardless of `set_time_limit(0)`), verify cron `schedule:run`,
  verify PHP ≥ 8.3, verify
  registration stays closed, SQLite WAL after deploy.
- LM Studio down → `error` SSE event + toast; hub/conversations remain browsable.

## Out of scope (v1)

- Web search tool (revisit as drop-in; LM Studio also hosts an embeddings model —
  semantic memory is a natural v2)
- Embeddings/semantic memory, auto-RAG injection
- Multi-profile providers, per-user provider config, settings UI
- Reasoning/"thinking" UI (SSE `reasoning` events plumbed, UI later)
- Anthropic-compatible endpoints
