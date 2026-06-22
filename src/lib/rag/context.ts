/**
 * Assemble retrieved chunks into a numbered context block (within a token
 * budget) plus the matching citations, so answers can point back to exact
 * sources with document + page. Pure: no I/O.
 */

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle?: string;
  content: string;
  pageNumber?: number | null;
  /** Cosine similarity (0..1), higher is more relevant. */
  score?: number;
}

export interface Citation {
  /** 1-based reference number, matching `[n]` markers in the context. */
  ref: number;
  chunkId: string;
  documentId: string;
  documentTitle?: string;
  pageNumber?: number | null;
  snippet: string;
}

export interface AssembledContext {
  context: string;
  citations: Citation[];
  usedChunks: number;
}

const DEFAULT_MAX_CHARS = 12000; // ~3000 tokens of context
const DEFAULT_SNIPPET_CHARS = 220;

function sourceLabel(chunk: RetrievedChunk): string {
  const parts: string[] = [];
  if (chunk.documentTitle) parts.push(chunk.documentTitle);
  if (chunk.pageNumber != null) parts.push(`p.${chunk.pageNumber}`);
  return parts.join(", ");
}

function makeSnippet(content: string, snippetChars: number): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > snippetChars
    ? `${clean.slice(0, snippetChars).trimEnd()}…`
    : clean;
}

export function assembleContext(
  chunks: RetrievedChunk[],
  options: { maxChars?: number; snippetChars?: number } = {},
): AssembledContext {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const snippetChars = options.snippetChars ?? DEFAULT_SNIPPET_CHARS;

  const blocks: string[] = [];
  const citations: Citation[] = [];
  let used = 0;

  for (const chunk of chunks) {
    const ref = citations.length + 1;
    const label = sourceLabel(chunk);
    const header = label ? `[${ref}] (${label})` : `[${ref}]`;
    const block = `${header}\n${chunk.content.trim()}`;

    // Always include at least one source, even if it exceeds the budget alone.
    if (used > 0 && used + block.length + 2 > maxChars) break;

    blocks.push(block);
    citations.push({
      ref,
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      pageNumber: chunk.pageNumber ?? null,
      snippet: makeSnippet(chunk.content, snippetChars),
    });
    used += block.length + 2;
  }

  return {
    context: blocks.join("\n\n"),
    citations,
    usedChunks: citations.length,
  };
}
