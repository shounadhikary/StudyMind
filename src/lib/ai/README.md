# AI abstraction layer (`src/lib/ai`)

Multi-provider AI architecture. Providers are swappable behind a unified
interface, with automatic fallback (e.g. if Gemini rate-limits, fall back to
Groq). All calls run server-side only - API keys are never exposed to the client.

## Usage

```ts
import { generate, generateJSON, chatStream, embed } from "@/lib/ai";

const summary = await generate(prompt, { system, temperature: 0.3 });
const quiz = await generateJSON<Quiz>(prompt); // JSON-only + safe parse + retry
for await (const token of chatStream(messages)) { /* stream */ }
const vectors = await embed([text1, text2]); // 768-dim, Gemini
```

## Modules

- `types.ts` - shared types, `AIError`, and rate-limit/fallback classification.
- `gemini.ts` - Google Gemini (`gemini-2.0-flash` for text, `text-embedding-004`
  for embeddings). Primary for generation; the only embedder.
- `groq.ts` - Groq / Llama 3.3 70B. Primary for fast streaming chat; fallback
  for generation.
- `router.ts` - the unified `generate` / `generateJSON` / `chatStream` / `embed`
  with provider selection and fallback on rate-limit/transient error.
- `index.ts` - public barrel.

## Routing & fallback

| Operation     | Primary | Fallback | Notes                                    |
| ------------- | ------- | -------- | ---------------------------------------- |
| `generate`    | Gemini  | Groq     | falls back on rate-limit/5xx/unknown     |
| `chatStream`  | Groq    | Gemini   | only falls back if nothing emitted yet   |
| `embed`       | Gemini  | -        | Groq has no embedding model              |

`generateJSON` instructs the model to return JSON only, strips code fences,
parses defensively, and retries once with a firmer instruction on parse failure.
