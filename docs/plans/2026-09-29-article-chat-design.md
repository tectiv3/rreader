# Article Chat — Design Spec

Date: 2026-09-29 (revised: grill + critic rounds 1–2 + critic round 3 = simplification pass)
Status: agreed (grilled) + critic-revised ×3. Round-3 verdict REVISE → applied:
**cut from v1**: auto-summaries (and Prereq "queue job lifecycle"), `chat_turns` side
table, PATCH model-switching, live-merged `/models` listing. Kept: web_fetch with
hardened SSRF validation.

## Goal

Chat with any article: an LLM agent, article-scoped conversations, cross-conversation
memory ("what was said about topic X before" — via `search_chat_history` over stored
message content), and tools over the user's own data. Provider-agnostic; primary targets
are LM Studio on risen (Windows, via Tailscale) and OpenCode Zen
(`https://opencode.ai/zen/v1`). Built on **`laravel/ai` ^1.0** (stable since 2026-09-23).

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
- **Caveat (r3)**: all "verified in 1.x source" claims below were made against an
  unpinned external checkout — the package is not yet in this repo's `vendor/`.
  Prerequisites #2 re-verifies every claim against the installed pinned version
  before any feature code.

## Deployment context

- Dev runs locally (`nix develop` + overmind); **prod is casa** (`/var/www/rreader`,
  `https://casa.tail386db.ts.net`, Ubuntu 24.04). User deploys manually — agents never
  deploy; ask, then verify.
- Prod queue worker unchanged in v1: chat turns run in-request, no AI queue jobs exist
  (summaries cut r3).
- **Verify casa PHP ≥ 8.3** (laravel/ai requires it; dev runs 8.3.6, composer platform
  pinned 8.3.6).
- nginx config lives on casa: the `location /api/chat/` block is a casa-side deploy step.
- LM Studio must be reachable from **wherever rreader runs** — dev box and casa both
  reach `100.78.246.86:1234` via tailnet. LM Studio server must stay on ("serve on
  network") with the API key enabled.

## Configuration model (env, no settings UI)

Providers declared in `.env` (dev + casa). A provider is **configured** when base URL +
key + a non-empty model list are all set. Models are **env-declared comma lists**
(first entry = that provider's default); embedding models simply aren't listed:

```
AI_LMSTUDIO_BASE_URL=http://100.78.246.86:1234/v1
AI_LMSTUDIO_API_KEY=sk-lm-...
AI_LMSTUDIO_MODELS=qwen3.8-27b,qwen3.8-flash-next,gpt-oss-20b
AI_OPENCODE_BASE_URL=https://opencode.ai/zen/v1
AI_OPENCODE_API_KEY=zen-...
AI_OPENCODE_MODELS=...
AI_DEFAULT_PROVIDER=lmstudio           # optional; else first configured in fixed order
```

- `config/ai.php`: two named entries with `driver => 'openai'`, each its own `url` +
  `key`. **`env()` reads live only in `config/ai.php`** — all runtime code resolves
  providers via `config()` only (with `config:cache` in prod, stray `env()` calls
  return null → "0 providers" failure).
- Provider resolution: `AI_DEFAULT_PROVIDER` validated against the configured set;
  stale value falls through to first-configured (fixed order), none → chat disabled.
- **Frozen provider removed from env between turns**: turn dispatch gates on "provider
  currently configured" → 409 + toast prompting a **new conversation** on a current
  provider (otherwise requests silently target `api.openai.com` unauthenticated). Hub
  flags conversations whose provider no longer resolves.
- **No AI section in the settings page.** No keys in the DB or browser at any point.
- Chat entry points (article button, `/chat` tab/sidebar) enabled iff ≥1 provider
  resolves. `GET /api/chat/models` serves the env-declared lists + an `enabled` flag —
  **no live provider `/models` fetching, no cache, no fallback machinery** (cut r3).
- **Model choice frozen at conversation creation**: `POST /conversations` accepts
  optional `{provider, model}` validated against the env lists; default =
  `AI_DEFAULT_PROVIDER` + its first model. Switching = new conversation. Model name
  always displayed in the chat header. No picker UI in v1 (API supports creation-time
  choice; UI can follow without schema change).

## Implementation (laravel/ai ^1.0)

- `composer require laravel/ai:^1.0` (deps are light: `illuminate/*`, `laravel/prompts`,
  `serializable-closure`); pin the exact installed version and re-verify (Prereq #2).
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
  - `SearchChatHistoryTool` — LIKE over user/assistant `content` of
    `agent_conversation_messages` across the user's other conversations (summaries cut
    r3; tool payloads live in `steps`, never scanned), excluding current conversation.
  - `WebFetchTool` — reuse only the parsing layer of `ContentExtractorService`
    (make `extractReadableContent()` public); custom fetch client: manual redirect loop,
    each hop re-resolved + validated against loopback/private/link-local/**CGNAT
    `100.64.0.0/10` (Tailscale — this deployment's own network; r3)** and IPv6
    equivalents (`::1`, `fc00::/7`, `fe80::/10`), resolved IP pinned via
    `CURLOPT_RESOLVE`; **scheme allowlist `http`/`https` on every hop including
    redirect `Location`** (resolved against the current URL; `file:` and other schemes
    rejected); **response size cap before parse**; output stripped + truncated like
    GetArticleTool.
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
- **Iteration cap**: `maxSteps = 8`; package ends the turn at cap. If a forced wrap-up
  is wanted: one extra `prompt()` call with `tools: []` (simpler than `tool_choice:
  none` through the package).
- **Timeout budget** (blocker): declare `timeout(): 120` on `ArticleChatAgent` — the
  package's HTTP client defaults to 60s *total per request including the streamed
  body*, which kills qwen3.8 mid-stream. The chain must satisfy:
  per-step 120s × maxSteps 8 + tool exec ≈ 1160s ≤ **lock TTL 1200s** ≤ nginx
  `fastcgi_read_timeout` (1200s).
  - **r3 corrections**: the ~200s tool-exec share is an estimate — re-derive it
    empirically in smoke test #3, not on paper. Late steps replay the whole
    conversation (the package has no cumulative char budget; tool payloads bounded by
    the per-tool 24k cap), so prefill grows per step on a GPU+CPU-offloaded 27B — the
    smoke test must observe worst-case per-step latency late in a multi-step turn;
    lower `maxSteps` if it approaches 120s. Also: `fastcgi_read_timeout` is a
    between-reads timeout — with SSE frames flowing it is not the binding constraint;
    the binding constraints are FPM `request_terminate_timeout` and the lock TTL.
- **Concurrency**: per-conversation `Cache::lock($key, ttl≈1200s)` (see Timeout
  budget); release in `finally` **and** via `register_shutdown_function` (r3: on a
  client abort PHP terminates at the next output attempt — `finally` does not run);
  the TTL is the backstop after hard kills (worst case: conversation locked ~20 min —
  accepted). Second in-flight turn → 409. Per-user single in-flight turn cap
  (`pm.max_children=10`; PWA on phone + desktop must not starve workers).
  **Client disconnect**: drain all `ob_` levels + `flush()` per SSE frame (FPM output
  buffering otherwise defeats streaming despite `X-Accel-Buffering: no`); check
  `connection_aborted()` in the `each()` callback → stop consuming. Honest limit (r3):
  abort is only detected at the next write — generation can continue through a silent
  prefill gap (≤ per-step 120s).
- **Retry semantics (simplified r3)**: **no `chat_turns` table** — the per-conversation
  cache lock *is* the concurrency guard. Accepted v1 warts: a client retry after a
  turn that completed server-side duplicates the user message in history (the package
  writes it during the turn); whatever rows an aborted turn persisted (per spike
  finding, Prereq #2) simply remain as history.
- **Streaming transport**: SSE over `POST` (SPA uses `fetch` + ReadableStream with
  explicit `X-XSRF-TOKEN`; CSRF applies via `statefulApi()`). `text/event-stream`,
  `X-Accel-Buffering: no`, `set_time_limit(0)`. nginx (casa): dedicated
  `location /api/chat/` — `fastcgi_buffering off`, `gzip off`, `fastcgi_read_timeout`
  1200s (matches the Timeout budget chain). **r3**: verify the PWA service worker
  does not intercept/buffer the streaming fetch — test against the real SW, not a
  bare browser context.
- **Provider failure**: package exception taxonomy (`AiException`,
  `RateLimitedException`, `ProviderOverloadedException`, …) → `error` SSE event +
  toast. Corrupt-conversation detection: one automatic retry on a fresh conversation —
  stored history is what poisons the prompt.

## Decisions (resolved during grilling; r3 cuts marked)

| Decision | Choice |
|---|---|
| AI layer | **laravel/ai ^1.0**, Responses API, package agent loop + **package conversation storage** (extended via follow-up migration). |
| Agent loop | Backend (Laravel). No MCP anywhere. |
| Web search | **Deferred to v2**. v1 ships DB tools + web_fetch. |
| Config | **Env-only**; zero settings UI. |
| Chat UI | Dedicated route `/chat`. Mobile: bottom-nav tab. Desktop: sidebar item. Hub = recent conversations (one per article). |
| Conversation lifecycle | **One per (user, article)**, auto-resume. UNIQUE(participant, article_id) on the package table. |
| Article context | **Lazy via tool**: metadata-only system prompt; `get_article` on demand. |
| DB tools | Core 3 + search_chat_history + web_fetch, all user-scoped. |
| Memory | **Tool-based retrieval only** (content LIKE). Auto-summaries **cut r3**. |
| Model selection | **Frozen at creation** (optional POST params, env-validated). PATCH switching **cut r3**; switch = new conversation. |
| Model listing | **Env-declared comma lists** (live `/models` merge cut r3). |
| Retry idempotency | **None in v1** — `chat_turns` cut r3; cache lock guards concurrency, duplicate-on-retry accepted. |
| Deletion policy | **Cascade** with feed/article deletion. |
| Native LM Studio API | Rejected (MCP-only tools; web-tools plugin hides results; second protocol). |
| Hand-rolled chat/completions client | Rejected after verification: Responses API confirmed on LM Studio, package stable at 1.0. |

## Prerequisites (do first)

1. **SQLite pragmas** (blocker): `journal_mode=WAL` + `busy_timeout=5000` in the sqlite
   connection config — agent loop + feed scheduler + queue + sessions overlap otherwise.
   **r3 caveat (corrected)**: the critic flagged this against Laravel 10, but the
   repo runs Laravel 12 (^12.0, composer.json), whose SQLite connector supports
   pragma config keys natively — keep a one-line runtime verification in the spike
   (Prereq #2) that both pragmas are actually applied to the connection.
2. **Post-install source spike** (gate, r3): after `composer require`, re-verify every
   "verified in source" claim against the pinned `vendor/` copy: event list +
   unknown-event tolerance, `maxConversationMessages()`, per-agent `timeout()` covering
   the streamed body end-to-end, serial vs parallel tool execution, `Error`-event +
   `StreamErrorException` dual delivery, table/column names, `generate_title` config,
   replay of `failed`-status messages, `continue()` ownership enforcement, and what
   rows persist after a mid-stream abort.
3. **Smoke tests** (gate implementation):
   - Zen (**needs your Zen key**): `GET /zen/v1/models` + a **≥2-step streamed tool
     round-trip** on `/zen/v1/responses` — a single-request probe won't catch Zen
     accepting `/responses` but breaking `previous_response_id` continuations, which
     the package uses mid-turn. If it fails: swap the Zen config entry to the package's
     built-in `driver => 'openai-compatible'` (speaks chat/completions) — a config
     change, not a gateway port.
   - LM Studio: full streamed tool-call round-trip **through `ArticleChatAgent`** on
     `/v1/responses` (the hand-rolled probe verified the endpoint, not the SDK's exact
     body: `store`-omitted, parallel tool calls, `tool_choice: auto`). Include a
     multi-step turn and record worst-case per-step latency late in the turn (prefill
     growth — feeds the Timeout budget above).
   - Session/user/config captured before the stream callback starts.

## API routes (auth:sanctum)

- `GET  /api/chat/conversations` — hub list (article title/feed, model, last_message_at)
- `GET  /api/chat/conversations/{id}` — messages, capped/paginated
- `POST /api/chat/conversations` — `{article_id, provider?, model?}` → find-or-create;
  provider/model validated against env lists, defaults applied
- `DELETE /api/chat/conversations/{id}`
- `POST /api/chat/conversations/{id}/messages` — `{content}` → SSE stream
- `GET  /api/chat/models` — env-declared model lists per configured provider +
  `enabled` flag (no live fetching, no cache). No user-supplied URLs/keys at any
  endpoint (SSRF surface from critic round 1 stays eliminated).

## Data model

Package tables (`agent_conversations`, `agent_conversation_messages` — created by
the package migration, names configurable) + **one follow-up migration of ours**:

```
agent_conversations (altered):
    + article_id FK (on delete CASCADE — rides the feed→article cascade),
    + provider, model,                  # frozen at creation, from env lists
    + UNIQUE(participant_type, participant_id, article_id)
    (written via the unguarded Conversation model — no store subclass needed)
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
- **Chat header**: always shows the conversation's frozen provider/model. No switching
  UI in v1 — switching means a new conversation (r3).
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
  refresh, nginx `location /api/chat/` block (incl. FPM `request_terminate_timeout`
  raised/0 — it kills long turns regardless of `set_time_limit(0)`), verify cron
  `schedule:run`, verify PHP ≥ 8.3, verify registration stays closed, SQLite WAL
  after deploy.
- LM Studio down → `error` SSE event + toast; hub/conversations remain browsable.

## Out of scope (v1)

- Web search tool (revisit as drop-in; LM Studio also hosts an embeddings model —
  semantic memory is a natural v2)
- Embeddings/semantic memory, auto-RAG injection
- Auto-summaries, `chat_turns` idempotency, PATCH model-switching, live `/models`
  merge (all **cut in critic round 3**; revisit if memory quality or retry UX demands)
- Multi-profile providers, per-user provider config, settings UI
- Reasoning/"thinking" UI (SSE `reasoning` events plumbed, UI later)
- Anthropic-compatible endpoints
