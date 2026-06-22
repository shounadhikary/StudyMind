# RAG pipeline (`src/lib/rag`)

A from-scratch retrieval-augmented-generation pipeline (no LangChain).

Flow: chunk text → embed → store in pgvector → on query, embed question →
retrieve top-k by cosine similarity → assemble context → answer with citations.

## Modules

- `chunk.ts` - token-aware chunking with overlap (`chunkText`, `chunkPages`),
  breaking on paragraph → sentence → word boundaries and preserving page
  numbers. Pure functions (unit-tested).
- `embed.ts` - batch-embed chunks and queries via the AI layer (Gemini, 768-dim).
- `retrieve.ts` - vector similarity search over Supabase pgvector (`<=>` cosine
  distance) returning chunks with a 0..1 score and citation metadata.
- `context.ts` - assemble retrieved chunks into a numbered, budget-bounded
  context block plus matching `Citation`s (document + page). Pure functions.

## Notes

- Embedding dimensionality (768) matches the `vector(768)` column in the Prisma
  schema and `EMBEDDING_DIMENSIONS` in `@/lib/ai`.
- `retrieve.ts` and `embed.ts` need the database + Gemini at runtime; the pure
  `chunk.ts` / `context.ts` are independently testable.
- Keyword re-ranking can be layered on top of the vector results later; vector
  similarity is the primary signal.
