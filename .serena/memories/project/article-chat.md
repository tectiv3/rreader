# Article Chat — design decisions (2026-09-29)

Spec: `docs/plans/2026-09-29-article-chat-design.md`

- Implemented on **laravel/ai ^1.0** (stable 2026-09-23). Its `openai` driver speaks the
  **Responses API only** — verified in v1.0.0 source. Package agent loop + tools +
  **package conversation storage** (agent_conversations tables; one follow-up
  migration adds article_id/provider/model/summary + UNIQUE(participant, article_id);
  a small chat_turns side table handles turn_id idempotency). SSE endpoint consumes
  stream via `->each()`. Tool payloads live in their `steps` longText — LIKE search
  over `content` never scans them. Auto-title generation kept OFF.

- LLM chat with articles: backend agent loop in Laravel, **OpenAI-compatible protocol only**
  for both providers. No MCP anywhere (explicitly rejected).
- Providers: LM Studio on **risen** at `http://100.78.246.86:1234/v1` (tailnet IP —
  pi's `~/.pi/agent/models.json` uses the IP; hostname probe flaked once) — **requires
  API key** (`sk-lm-…`), `/v1/responses` verified working incl. reasoning items.
  OpenCode Zen `https://opencode.ai/zen/v1` — `/responses` support UNVERIFIED (gated
  smoke test, needs Zen key; fallback = Ai::extend custom chat/completions gateway).
  Must be reachable from **casa (prod)** and dev box.
- **Config is env-only** (AI_* vars in .env; no settings UI, no keys in DB/browser).
  Model choice is per-chat via chat-header dropdown when >1 option; model name always
  shown. Providers declared per-env; conversation rows freeze provider+model.
- LM Studio **native** `/api/v1/chat` was investigated and rejected: it supports only
  MCP-managed tools (plugins / ephemeral MCP), no client-side tool calling; the
  `npacker/web-tools` plugin is native-only and hides tool args/results from the client.
  Client-side tool calling exists only on `/v1/chat/completions`. Evidence:
  `../openclient-llm` (Swift app using native API) + LM Studio docs.
- Web search deferred to v2; `web_fetch` reuses only the parsing layer of
  `ContentExtractorService` (custom SSRF-guarded fetch client with pinned IPs).
- Conversation = 1 per (user, article), auto-resume, cascade-deleted with the article
  (user decision — memory does not survive feed pruning). Article content loaded lazily
  via `get_article` tool (metadata-only system prompt).
- Memory: `search_chat_history` LIKE tool over summaries + dialogue content (not tool
  payloads); auto-summaries via scheduler + queued job (claim-at-dispatch, rate-limited,
  skipped during active turns). Tool results persisted as `role=tool` messages.
- LM Studio currently loads: qwen3.8-27b, qwen3.8-flash-next, qwen3.6-35b-a3b-*,
  gpt-oss-20b, and nomic-embed-text-v1.5 (embeddings — v2 semantic memory candidate).
- UI: `/chat` route — mobile bottom-nav tab, desktop sidebar item; article toolbar button.
- Spec survived two plan-critic rounds: crash-safe transactional tool-pair persistence,
  turn_id idempotency with lifecycle states, group-atomic + cumulative history caps,
  queue retry_after > timeout (prod systemd worker on casa has --timeout=90), SQLite
  WAL + busy_timeout prerequisite, SSE via fetch+ReadableStream with X-XSRF-TOKEN,
  nginx location block on casa, schema:dump --prune AFTER prod migrate.
