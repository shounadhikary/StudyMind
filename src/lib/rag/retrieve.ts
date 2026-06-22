import "server-only";

import { prisma } from "@/lib/db/prisma";

import { embedQuery } from "./embed";
import type { RetrievedChunk } from "./context";

export interface RetrieveOptions {
  /** Number of chunks to return. */
  topK?: number;
}

interface ChunkRow {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number | null;
  documentTitle: string | null;
  score: number;
}

/** pgvector wants a bracketed literal like "[0.1,0.2,...]". */
function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

/**
 * Retrieve the most relevant chunks across the given documents using pgvector
 * cosine similarity (`<=>`). Returns chunks with a 0..1 similarity score and
 * the metadata needed to build citations.
 *
 * Note: keyword re-ranking can be layered on top of these vector results in a
 * later iteration; vector similarity is the primary signal.
 */
export async function retrieve(
  query: string,
  documentIds: string[],
  options: RetrieveOptions = {},
): Promise<RetrievedChunk[]> {
  if (documentIds.length === 0) return [];

  const topK = options.topK ?? 6;
  const vectorLiteral = toVectorLiteral(await embedQuery(query));

  const rows = await prisma.$queryRaw<ChunkRow[]>`
    SELECT
      dc.id,
      dc.document_id AS "documentId",
      dc.content,
      dc.page_number AS "pageNumber",
      d.title AS "documentTitle",
      1 - (dc.embedding <=> ${vectorLiteral}::vector) AS score
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE dc.document_id = ANY(${documentIds}::text[])
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `;

  return rows.map((row) => ({
    id: row.id,
    documentId: row.documentId,
    documentTitle: row.documentTitle ?? undefined,
    content: row.content,
    pageNumber: row.pageNumber,
    score: row.score,
  }));
}
