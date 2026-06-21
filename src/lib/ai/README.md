# AI abstraction layer (`src/lib/ai`)

Multi-provider AI architecture. Providers are swappable behind a unified interface,
with automatic fallback (e.g. if Gemini rate-limits, fall back to Groq).

Planned modules (built in later phases):

- `types.ts` — shared request/response types for `generate`, `chat`, `embed`.
- `gemini.ts` — Google Gemini implementation (summaries, quizzes, flashcards, mind maps, embeddings).
- `groq.ts` — Groq / Llama 3.3 70B implementation (fast streaming chat).
- `router.ts` — unified `generate()` / `chat()` / `embed()` that picks a provider and falls back on rate-limit/error.

All calls run server-side only — API keys are never exposed to the client.
