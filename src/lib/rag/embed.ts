import "server-only";

import { embed } from "@/lib/ai";

import type { Chunk } from "./chunk";

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

// Embed in batches to stay friendly to free-tier limits.
const EMBED_BATCH_SIZE = 64;

/** Embed an array of chunks, preserving their index/page metadata. */
export async function embedChunks(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  const embedded: EmbeddedChunk[] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await embed(batch.map((chunk) => chunk.content));
    batch.forEach((chunk, j) => {
      embedded.push({ ...chunk, embedding: vectors[j] ?? [] });
    });
  }
  return embedded;
}

/** Embed a single query string. */
export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embed([query]);
  return vector ?? [];
}
