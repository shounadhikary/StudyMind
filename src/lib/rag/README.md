# RAG pipeline (`src/lib/rag`)

A from-scratch retrieval-augmented-generation pipeline (no LangChain).

Planned modules (built in Phase 3):

- `chunk.ts` — token-aware chunking with overlap, preserving page numbers.
- `embed.ts` — embed chunks via Gemini embeddings.
- `retrieve.ts` — vector similarity search (Supabase pgvector) + optional keyword re-rank.
- `context.ts` — assemble retrieved context within a token budget, with citation metadata.

Flow: chunk text → embed → store in pgvector → on query, embed question →
retrieve top-k → re-rank → build context → answer with Groq (streamed) + citations.
