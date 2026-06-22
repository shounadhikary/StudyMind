import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db/prisma";
import { chunkPages, chunkText, type RawPage } from "./chunk";
import { embedChunks } from "./embed";

/**
 * Build the RAG index for a document: chunk its text, embed each chunk with
 * Gemini, and store chunks + embeddings in pgvector (replacing any existing
 * chunks). Returns the number of chunks indexed.
 */
export async function indexDocument(
  documentId: string,
  input: { rawText: string; pages?: RawPage[] },
): Promise<number> {
  const chunks =
    input.pages && input.pages.length > 0
      ? chunkPages(input.pages)
      : chunkText(input.rawText);

  if (chunks.length === 0) return 0;

  const embedded = await embedChunks(chunks);

  // Replace existing chunks for an idempotent (re)index.
  await prisma.$executeRaw`DELETE FROM document_chunks WHERE document_id = ${documentId}`;

  for (const chunk of embedded) {
    const vectorLiteral = `[${chunk.embedding.join(",")}]`;
    await prisma.$executeRaw`
      INSERT INTO document_chunks (id, document_id, chunk_index, content, page_number, embedding)
      VALUES (
        ${randomUUID()},
        ${documentId},
        ${chunk.index},
        ${chunk.content},
        ${chunk.pageNumber ?? null},
        ${vectorLiteral}::vector
      )
    `;
  }

  return embedded.length;
}

/** Whether a document already has a RAG index. */
export async function hasIndex(documentId: string): Promise<boolean> {
  const count = await prisma.documentChunk.count({ where: { documentId } });
  return count > 0;
}
