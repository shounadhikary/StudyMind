/**
 * Token-aware text chunking with overlap, for the RAG pipeline.
 *
 * We approximate tokens by characters (~4 chars/token), which is good enough
 * for staying within embedding/context budgets without a tokenizer dependency.
 * Chunks try to break on paragraph, then sentence, then word boundaries, and
 * each chunk carries a little overlap from the previous one so retrieval keeps
 * context that straddles a boundary.
 */

export interface RawPage {
  pageNumber: number;
  text: string;
}

export interface Chunk {
  index: number;
  content: string;
  /** Source page, when chunking page-segmented input. */
  pageNumber?: number;
}

export interface ChunkOptions {
  /** Target max characters per chunk (~4 chars per token). */
  maxChars?: number;
  /** Characters of trailing context carried into the next chunk. */
  overlapChars?: number;
  /** Chunks shorter than this are merged into the previous chunk. */
  minChars?: number;
}

const DEFAULT_MAX_CHARS = 1800; // ~450 tokens
const DEFAULT_OVERLAP_CHARS = 200; // ~50 tokens
const DEFAULT_MIN_CHARS = 60;

interface Segment {
  text: string;
  pageNumber?: number;
}

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Break text into segments no larger than maxChars: paragraphs, then
 *  sentences, then a hard word-level split as a last resort. */
function splitIntoSegments(text: string, maxChars: number): string[] {
  const segments: string[] = [];

  for (const paragraph of normalize(text).split(/\n{2,}/)) {
    const para = paragraph.trim();
    if (!para) continue;

    if (para.length <= maxChars) {
      segments.push(para);
      continue;
    }

    const sentences = para.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [para];
    for (const sentence of sentences) {
      const sent = sentence.trim();
      if (!sent) continue;

      if (sent.length <= maxChars) {
        segments.push(sent);
        continue;
      }

      let buffer = "";
      for (const word of sent.split(/\s+/)) {
        const candidate = buffer ? `${buffer} ${word}` : word;
        if (candidate.length > maxChars && buffer) {
          segments.push(buffer);
          buffer = word;
        } else {
          buffer = candidate;
        }
      }
      if (buffer) segments.push(buffer);
    }
  }

  return segments;
}

/** Last ~overlapChars of text, snapped to a word boundary. */
function overlapTail(text: string, overlapChars: number): string {
  if (overlapChars <= 0 || text.length <= overlapChars) return "";
  const tail = text.slice(text.length - overlapChars);
  const spaceIndex = tail.indexOf(" ");
  return spaceIndex > -1 ? tail.slice(spaceIndex + 1).trim() : tail.trim();
}

function assemble(segments: Segment[], options: ChunkOptions): Chunk[] {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const overlapChars = options.overlapChars ?? DEFAULT_OVERLAP_CHARS;
  const minChars = options.minChars ?? DEFAULT_MIN_CHARS;

  const chunks: Chunk[] = [];
  let buffer = "";
  let pageForChunk: number | undefined;

  for (const segment of segments) {
    const candidate = buffer ? `${buffer}\n\n${segment.text}` : segment.text;

    if (buffer && candidate.length > maxChars) {
      chunks.push({
        index: chunks.length,
        content: buffer,
        pageNumber: pageForChunk,
      });
      const tail = overlapTail(buffer, overlapChars);
      buffer = tail ? `${tail}\n\n${segment.text}` : segment.text;
      pageForChunk = segment.pageNumber;
    } else {
      if (!buffer) pageForChunk = segment.pageNumber;
      buffer = candidate;
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    if (trailing.length < minChars && chunks.length > 0) {
      chunks[chunks.length - 1].content += `\n\n${trailing}`;
    } else {
      chunks.push({
        index: chunks.length,
        content: trailing,
        pageNumber: pageForChunk,
      });
    }
  }

  return chunks;
}

/** Chunk a single block of text (no page attribution). */
export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const segments = splitIntoSegments(text, maxChars).map((t) => ({ text: t }));
  return assemble(segments, options);
}

/** Chunk page-segmented text, tagging each chunk with its source page. */
export function chunkPages(pages: RawPage[], options: ChunkOptions = {}): Chunk[] {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const segments: Segment[] = [];
  for (const page of pages) {
    for (const text of splitIntoSegments(page.text, maxChars)) {
      segments.push({ text, pageNumber: page.pageNumber });
    }
  }
  return assemble(segments, options);
}
