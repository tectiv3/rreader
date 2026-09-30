# Article Chat — Design Spec

Date: 2026-09-29 (revised: grill + critic ×3 simplification + critic rounds 4–5)
Status: agreed (grilled) + critic-revised ×4, round 5 **PROCEED**. Round 3 cut: auto-summaries, `chat_turns`
side table, live-merged `/models` listing. Round 4: **PATCH provider/model switching
restored as a metadata-only, history-preserving UPDATE** (user decision — switching
must not destroy conversation history); corrupt-conversation auto-retry cut; web_fetch
hop limits added; UNIQUE-vs-switching contradiction resolved. Round 5 (final review
before implementation): text-level hardening applied — authz/ownership clauses,
FK-cascade gate, find-or-create race, mass-assignment discipline, deploy-verification
step. No round 6 needed.

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
- OpenCode Zen `/responses`: **RESOLVED by smoke test — rejected** for our declared
  models (`ModelProtocolUnsupported`); the spec's pre-approved fallback
  (`driver => 'openai-compatible'`, chat/completions) is adopted and verified — see
  "Smoke outcomes".
- Pi harness config confirms LM Studio usage via `openai-completions` + key — both wire
  protocols exist on risen; laravel/ai uses the Responses one.
- **Prereq #2 spike DONE** (laravel/ai v1.0.1, installed `vendor/`): all "verified
  in source" claims re-verified with citations; two refutations (messages FK,
  `continue()` ownership) and several surprises folded into this spec — see
  "Source spike outcomes" section.

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
AI_LMSTUDIO_MODELS=qwen3.8-27b,gpt-oss-20b   # flash-next unloadable on risen (smoke)
AI_OPENCODE_BASE_URL=https://opencode.ai/zen/v1
AI_OPENCODE_API_KEY=zen-...
AI_OPENCODE_MODELS=...
AI_DEFAULT_PROVIDER=lmstudio           # optional; else first configured in fixed order
```

- `config/ai.php`: `lmstudio` entry `driver => 'openai'` (stateful default —
  `previous_response_id` continuations verified **through the SDK** on qwen3.8-27b);
  `opencode` entry **`driver => 'openai-compatible'`** (chat/completions — smoke:
  Zen rejects `/responses` for our declared models; the pre-approved fallback,
  `store` moot). Also explicitly `conversations.generate_title => false`.
  **`env()` reads live only in `config/ai.php`** — all runtime code resolves
  providers via `config()` only (with `config:cache` in prod, stray `env()` calls
  return null → "0 providers" failure).
- Provider resolution: `AI_DEFAULT_PROVIDER` validated against the configured set;
  stale value falls through to first-configured (fixed order), none → chat disabled.
- **Frozen provider removed from env between turns** (i.e. unresolvable **after a
  `config:cache` refresh** — with cached config, deleting env vars alone changes
  nothing): turn dispatch gates on "provider
  currently configured" → 409 + toast prompting an **in-place switch** via the header
  dropdown/`PATCH` (history preserved; otherwise requests silently target
  `api.openai.com` unauthenticated). Hub flags conversations whose provider no longer
  resolves.
- **No AI section in the settings page.** No keys in the DB or browser at any point.
- Chat entry points (article button, `/chat` tab/sidebar) enabled iff ≥1 provider
  resolves. `GET /api/chat/models` serves the env-declared lists + an `enabled` flag —
  **no live provider `/models` fetching, no cache, no fallback machinery** (cut r3).
- **Model choice**: frozen at conversation creation (`POST /conversations` accepts
  optional `{provider, model}` validated against the env lists; default =
  `AI_DEFAULT_PROVIDER` + its first model). **In-place switching** (r4, user
  decision): `PATCH` updates only the routing columns — provider/model apply next
  turn, conversation history is untouched. A genuinely fresh start on the same
  article = `DELETE` + `POST` (recreate; destroys history by intent). Model name
  always displayed in the chat header; dropdown when >1 env-listed option.

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
    (SQLite LIKE is ASCII-case-insensitive only — accepted for v1, noted so it isn't
    filed as a bug later.)
  - `WebFetchTool` — reuse only the parsing layer of `ContentExtractorService`
    (make `extractReadableContent()` public); custom fetch client: manual redirect loop
    (**max 5 hops**, r4), each hop re-resolved with **every resolved address validated**
    (multi-record + dual-stack DNS) against loopback/private/link-local/**CGNAT
    `100.64.0.0/10` (Tailscale — this deployment's own network; r3)**, `0.0.0.0/8`, and
    IPv6 equivalents (`::1`, `fc00::/7`, `fe80::/10`, **IPv4-mapped `::ffff:0:0/96`**),
    resolved IPs pinned via `CURLOPT_RESOLVE`; **per-hop timeouts** (r4:
    `CURLOPT_CONNECTTIMEOUT` ~5s, `CURLOPT_TIMEOUT` ~15s — a slow or looping server
    must not pin an FPM worker under `set_time_limit(0)`); **scheme allowlist
    `http`/`https` on every hop including redirect `Location`** (resolved against the
    current URL; `file:` and other schemes rejected); **response size cap before
    parse**; output stripped + truncated like GetArticleTool.
- **Persistence is the package's** (`RemembersConversations` + `DatabaseConversationStore` +
  the `agent_conversations`/`agent_conversation_messages` tables, table/connection
  configurable in `config/ai.php`), extended by **one follow-up migration** (below).
  What the package already covers, verified in 1.x source: per-turn write of user
  message + **one assistant row whose `steps` longText embeds all tool calls/results**
  (atomic by construction — no transactional-pair handling needed); failed turns are
  recorded with completed steps + exception marker (`rememberFailedTurn`); replay/
  hydration is theirs (no `call_id`-pairing code on our side); tool payloads live in
  `steps`, not `content`, so LIKE search never scans them. **All rows (conversation,
  user message, assistant row) are written at stream drain or on exception — never
  incrementally** (spike #12). `generate_title`: the **code default is true** (the
  shipped config lacks the key) — our `config/ai.php` must explicitly set
  `conversations.generate_title => false` (it makes a synchronous LLM call via the
  default provider); titles fall back to the truncated first message.
  **`continue()` does NOT enforce ownership** (spike #9 — the
  `VerifiesConversationOwnership` contract exists but has zero internal callers);
  our controllers scope every conversation query to the participant before
  `continue()`.
  - Our `ChatService` consumes `$agent->forParticipant($user)->continue($id)` streams
    via `->each()` inside the controller's `StreamedResponse` (lazy generator —
    per-event delivery holds); package events (`TextDelta`, `ToolCall`, `ToolResult`,
    `ReasoningDelta`, `Error`, `StreamEnd`, plus `StreamStart`/`TextStart`/`TextEnd`/
    `ReasoningStart`/`ReasoningEnd`/citations — **unknown event types are ignored, not
    fatal**) map to our SSE vocabulary: `delta`, `tool`, `reasoning` (optional;
    qwen3.8 emits reasoning — collapsible "thinking" UI later), `done`, `error`. Flush
    the client-side delta buffer on `TextEnd`. Tool **result payloads are never sent
    to the client**; only tool name + status go out (drop `preliminary: true`
    tool-result events — spike surprise 7 — or the UI will re-render partial results
    as final). **Error dedup**: a provider
    failure arrives as an `Error` event *and* a thrown `StreamErrorException` — emit
    the SSE `error` event exactly once per turn.
  - **Replay cap**: `maxConversationMessages()` on the agent (~40 override — package
    default is 100, spike #3; count-based rows, no cumulative char budget — tool
    payloads are bounded by our per-tool 24k truncation instead). Failed rows ARE
    replayed (no status filter, spike #8) but non-poisoning: unanswered calls get
    synthetic "interrupted" results; completed steps still enter context (accepted).
- **Iteration cap**: `maxSteps = 8`; package ends the turn at cap. If a forced wrap-up
  is wanted: one extra `prompt()` call with `tools: []` (simpler than `tool_choice:
  none` through the package).
- **Timeout budget** (blocker): declare `timeout(): 120` on `ArticleChatAgent` — the
  package's HTTP client defaults to 60s *total per request including the streamed
  body*, which kills qwen3.8 mid-stream. The chain must satisfy:
  per-step 120s × maxSteps 8 + tool exec ≈ 1160s ≤ **lock TTL 1200s** ≤ FPM
  `request_terminate_timeout` (≥1200s or 0). (`fastcgi_read_timeout` 1200s kept as
  harmless redundancy only — it is a between-reads timeout, not a total cap.)
  - **r3 corrections**: the ~200s tool-exec share is an estimate — re-derive it
    empirically in smoke test #3, not on paper. Late steps replay the whole
    conversation (the package has no cumulative char budget; tool payloads bounded by
    the per-tool 24k cap), so prefill grows per step on a GPU+CPU-offloaded 27B — the
    smoke test must observe worst-case per-step latency late in a multi-step turn;
    lower `maxSteps` if it approaches 120s. Binding constraints are FPM
    `request_terminate_timeout` and the lock TTL, not `fastcgi_read_timeout` (see
    chain above). **Spike confirmations (#4, #5)**: the per-agent timeout covers the
    streamed body end-to-end (CURLOPT_TIMEOUT semantics, default 60 — hence
    `timeout(): 120` is required); tool execution within a step is **serial** — worst
    case tool time per step is bounded by our per-tool limits (web_fetch: 5 hops ×
    ~20s).
- **Concurrency**: per-conversation `Cache::lock($key, ttl≈1200s)` (see Timeout
  budget); release in `finally` **and** via `register_shutdown_function` (r3: on a
  client abort PHP terminates at the next output attempt — `finally` does not run);
  the TTL is the backstop after hard kills (worst case: conversation locked ~20 min —
  accepted). Second in-flight turn → 409. Per-user single in-flight turn cap: a second
  `Cache::lock` keyed on the user, sharing the same `finally` +
  `register_shutdown_function` release path (an abort must not burn the cap for 20
  min); hitting it → 409 with the same error shape (`pm.max_children=10`; PWA on
  phone + desktop must not starve workers). **Spike check (r4)**: casa's cache
  driver must support atomic locks (`array` no-ops cross-process).
  **Client disconnect**: drain all `ob_` levels + `flush()` per SSE frame (FPM output
  buffering otherwise defeats streaming despite `X-Accel-Buffering: no`); check
  `connection_aborted()` in the `each()` callback → stop consuming. Honest limit (r3):
  abort is only detected at the next write — generation can continue through a silent
  prefill gap (≤ per-step 120s).
- **Retry semantics (simplified r3, corrected by spike #12)**: **no `chat_turns`
  table** — the per-conversation cache lock *is* the concurrency guard. Spike
  finding: rows are written only at drain/exception, so **a mid-stream abort leaves
  zero rows** (not even the user message) — retry after an abort is clean. The only
  remaining wart: a client retry after a turn that *completed server-side* duplicates
  the user message in history (accepted).
- **Streaming transport**: SSE over `POST` (SPA uses `fetch` + ReadableStream with
  explicit `X-XSRF-TOKEN`; CSRF applies via `statefulApi()`). `text/event-stream`,
  `X-Accel-Buffering: no`, `set_time_limit(0)`. nginx (casa): dedicated
  `location /api/chat/` — `fastcgi_buffering off`, `gzip off`, `fastcgi_read_timeout`
  1200s (matches the Timeout budget chain). **r3**: verify the PWA service worker
  does not intercept/buffer the streaming fetch — test against the real SW, not a
  bare browser context.
- **Provider failure**: package exception taxonomy (`AiException`,
  `RateLimitedException`, `ProviderOverloadedException`, …) → `error` SSE event +
  toast. **No automatic corrupt-conversation retry** (cut r4 — it violated the
  UNIQUE constraint, had no detection heuristic vs an ordinary provider 500, and
  left the streaming client unaware of the new conversation); if stored history is
  poisoning the prompt, the toast advises `DELETE` + new conversation.

## Source spike outcomes (Prereq #2, laravel/ai v1.0.1 — 2026-09-30)

All 16 checklist items settled with file:line citations (scout report in session
log). Summary of what changed vs prior assumptions:

- **Stateful continuation is the default**: mid-turn steps send only
  `function_call_output` + `previous_response_id` — NOT full history — unless the
  provider is configured stateless (`store => false` ⇒ full-history mode).
  Consequence: **LM Studio** keeps default (hand-rolled probe verified
  `previous_response_id` works there); **Zen must be configured `store => false`**
  (pi's own catalog tags Zen responses models `openai-nosession`) — otherwise every
  continuation step breaks. Client-side prefill growth concern shrinks (requests are
  deltas), but server-side re-processing still grows — smoke test #3 still observes
  late-step latency.
- **`continue()` enforces nothing** — ownership checks are entirely ours.
- **No FK on messages** — our follow-up migration adds the cascade FK (see Data
  model).
- **Abort ⇒ zero persisted rows** (even the user message) — clean retry after abort.
- **`generate_title` defaults true** — explicitly disable in our config.
- **Serial tool execution**, per-step timeout covering the streamed body,
  unknown-event tolerance, Error-event + `StreamErrorException` dual delivery,
  unguarded models, `openai-compatible` fallback driver: all verified as assumed.
- Minor: `preliminary` tool-result events exist (filter them); message `status` has
  a third value `Paused` (approval flows — we don't use approvals; map unknown
  statuses defensively); default `maxConversationMessages` is 100; default maxSteps
  is 25 (our explicit 8 overrides).

## Smoke outcomes (Prerequisite #3, 2026-09-30)

Harness: `scripts/spike-chat-smoke.php` (kept, reproducible; `php scripts/spike-chat-smoke.php <A|B1|B2|C|D|E>`).

- **Zen `/models`**: 200, 79 models, both declared models present.
- **Zen `/responses`**: 400 `ModelProtocolUnsupported` for `deepseek-v4.1-flash` and
  `glm-5.3` at step 1 — on `zen/v1` **and** `go/v1` (the latter also demands an
  `x-opencode-session` header). The predicted `previous_response_id` failure never
  got that far. **Fallback adopted**: `driver => 'openai-compatible'` — 2-step
  streamed tool round-trips verified on both models, persistence-at-drain confirmed.
  `/responses` on Zen works only for other models (gpt-6-luna, grok-4.6/4.7,
  muse-spark) — a future option via the package `headers` config key if ever wanted.
- **LM Studio through the SDK**: 3 sequential tool calls + summary on `qwen3.8-27b`,
  fully streamed, stateful continuations working — PASS. `steps` JSON structure
  verified (`tool_calls[]{id,name,arguments,result}` + reasoning).
- **Latency vs 120s budget**: worst per-step **40.6s** (the cold *first* step —
  prefill, not history depth); late steps 11–23s at 3-call depth. Budget holds with
  margin; `maxSteps: 8` unchanged. Re-observe at deeper history during the demo.
- **Abort test**: consume 3 events then break → **zero rows** in both tables
  (reconfirms spike #12); `$response->conversationId` is knowable pre-drain.
- **`qwen3.8-flash-next` is broken on risen** (`400 Failed to load model`,
  reproducible) — dropped from `AI_LMSTUDIO_MODELS`; re-add when fixed server-side.
- **L12 gotchas**: `Conversation::create()` returns a clobbered `id`
  (`WithoutIncrementing` attribute inert on illuminate/database 12) — track the UUID
  ourselves; package migration not auto-loaded — verbatim copy lives in
  `database/migrations/` (committed; needed for `schema:dump --prune` anyway).

## Decisions (resolved during grilling; r3 cuts marked)

| Decision | Choice |
|---|---|
| AI layer | **laravel/ai ^1.0**, Responses API, package agent loop + **package conversation storage** (extended via follow-up migration). |
| Agent loop | Backend (Laravel). No MCP anywhere. |
| Web search | **Deferred to v2**. v1 ships DB tools + web_fetch. |
| Config | **Env-only**; zero settings UI. |
| Chat UI | Dedicated route `/chat`. Mobile: bottom-nav tab. Desktop: sidebar item. Hub = recent conversations (one per article). |
| Conversation lifecycle | **One per (user, article)**, auto-resume. UNIQUE(participant, article_id) **kept (r4)**; fresh start on same article = delete + recreate. |
| Article context | **Lazy via tool**: metadata-only system prompt; `get_article` on demand. |
| DB tools | Core 3 + search_chat_history + web_fetch, all user-scoped. |
| Memory | **Tool-based retrieval only** (content LIKE). Auto-summaries **cut r3**. |
| Model selection | Frozen at creation (optional POST params, env-validated); **in-place switch via metadata-only PATCH** — history preserved, applies next turn (restored r4, user decision). |
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
2. **Post-install source spike** (gate, r3/r4): **DONE 2026-09-30** — see "Source
   spike outcomes"; all items settled with citations.
3. **Smoke tests** (gate implementation): **DONE 2026-09-30 — see "Smoke
   outcomes"**. All gates passed: Zen via the fallback driver, LM Studio SDK-exact
   multi-step round-trip, worst per-step latency 40.6s ≪ 120s budget. SW gate closed
   at source level (all three service workers intercept only GET navigations or
   `/_share-target`; POST streaming fetches bypass). Session-driver observation
   rides the first end-to-end demo (dev = `database` sessions, casa = `file` —
   fallback pre-decided: `SESSION_DRIVER=database`).
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
   - Streaming fetch verified against the **real PWA service worker** (r4 — moved
     from body text into this gate).
   - Session/user/config captured before the stream callback starts; observe session
     driver behavior during the long streamed POST (file-driver serialization on
     casa — free observation; the per-user cap bounds the stakes). Fallback decided
     in advance: if serialization is observed, `SESSION_DRIVER=database`.

## API routes (auth:sanctum)

All conversation routes scoped to **participant = the authenticated user** —
GET/{id}, PATCH, DELETE included (the turn path is covered by `continue()`
ownership, Prereq #2).

- `GET  /api/chat/conversations` — hub list (article title/feed, model, last_message_at)
- `GET  /api/chat/conversations/{id}` — messages, capped/paginated
- `POST /api/chat/conversations` — `{article_id, provider?, model?}` → find-or-create;
  **article validated to belong to a feed of the requesting user** (articles are
  shared rows on per-user feeds — otherwise any authed user reads any article body
  via `get_article`); provider/model validated against env lists, defaults applied;
  double-POST race on the UNIQUE constraint → catch + return the existing
  conversation (r5)
- `PATCH /api/chat/conversations/{id}` — `{provider, model}`: metadata-only routing
  update (validated against env lists); history untouched; applies next turn
- `DELETE /api/chat/conversations/{id}`
- `POST /api/chat/conversations/{id}/messages` — `{content}` → SSE stream
- `GET  /api/chat/models` — env-declared model lists per configured provider + a
  global `enabled` flag (true iff ≥1 provider resolves — the SPA's chat-entry gating
  signal). No live fetching, no cache. No user-supplied URLs/keys at any endpoint
  (SSRF surface from critic round 1 stays eliminated).

## Data model

Package tables (`agent_conversations`, `agent_conversation_messages` — created by
the package migration, names configurable) + **one follow-up migration of ours**:

```
agent_conversations (altered):
    + article_id FK (on delete CASCADE — rides the feed→article cascade),
    + provider, model,                  # set at creation; PATCH-switchable routing metadata
    + UNIQUE(participant_type, participant_id, article_id)
    (written via the unguarded Conversation model — no store subclass needed;
    **always with explicit field lists** — never pass `$request` arrays into
    `fill()/create()/update()` on the unguarded model)

agent_conversation_messages (altered — spike #10: the package migration defines
NO FK on conversation_id, just a plain index; a DB-level article cascade would
orphan messages):
    + real FK conversation_id → agent_conversations.id, ON DELETE CASCADE
      (SQLite table-recreate in our migration — safe: table is empty at deploy;
      use the same connection resolution as the package's AiMigration)
```

Messages (theirs): `role`, `content` (user/assistant text only — LIKE-searched by
`search_chat_history`), `steps` longText (tool calls/results/args — never scanned),
`status` (failed turns recorded with completed steps), `usage`, `meta`.

Conversation rows are created directly via the `Conversation` model on
`POST /api/chat/conversations` (participant = User morph, title from article/first
message); turns then run via `$agent->forParticipant($user)->continue($id)`.
**L12 gotcha (smoke)**: `#[WithoutIncrementing]` is inert on illuminate/database 12 —
`Conversation::create()` returns a model whose `id` is clobbered by `lastInsertId`;
the row is stored fine, but generate and track the UUID ourselves. The package's
migration is **not auto-loaded** (`publishesMigrations` without a tag) — the verbatim
copy in `database/migrations/` is committed (required for `schema:dump --prune`
anyway); our follow-up migration extends that set.

## Frontend

- Route `/chat` (hub) and `/chat/:conversationId`. `ChatView.vue` + `ChatPanel.vue`
  (message list, input, tool-activity indicator, streaming via fetch/ReadableStream
  parser). Article toolbar button (desktop inline expansion + mobile
  `ArticleDetailView`) → `POST /conversations {article_id}` → navigate to `/chat/:id`.
- **Chat header**: always shows the conversation's provider/model; dropdown when >1
  env-listed option; selection persists via `PATCH` and applies next turn (r4).
  A fresh start on the same article = delete the conversation, then recreate via the
  article's chat button (the hub row disappears on delete).
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
  refresh, nginx `location /api/chat/` block (`fastcgi_buffering off`, `gzip off`,
  `fastcgi_read_timeout` 1200s), **FPM pool `www.conf`: `request_terminate_timeout`
  ≥1200s or 0** — a pool directive, not an nginx one; pool-wide consequence: any
  endpoint may then hold a worker 20 min (accepted — small-user-count box)), verify
  cron `schedule:run`, verify PHP ≥ 8.3, verify registration stays closed, SQLite WAL
  after deploy, **verify a streamed chat turn end-to-end through
  `https://casa.tail386db.ts.net`** (SSE framing only matters through real
  nginx+FPM).
- LM Studio down → `error` SSE event + toast; hub/conversations remain browsable.

## Out of scope (v1)

- Web search tool (revisit as drop-in; LM Studio also hosts an embeddings model —
  semantic memory is a natural v2)
- Embeddings/semantic memory, auto-RAG injection
- Auto-summaries, `chat_turns` idempotency, live `/models` merge, stale-model
  flagging against live listings (cut in critic round 3; the metadata-only PATCH was
  restored in round 4 by user decision). Revisit if memory quality or retry UX
  demands.
- Multi-profile providers, per-user provider config, settings UI
- Reasoning/"thinking" UI (SSE `reasoning` events plumbed, UI later)
- Anthropic-compatible endpoints
