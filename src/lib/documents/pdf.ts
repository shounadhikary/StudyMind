import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

import type { RawPage } from "@/lib/rag/chunk";

export interface ExtractedPdf {
  fullText: string;
  pages: RawPage[];
  pageCount: number;
}

/**
 * Extract text from a PDF (server-side) using unpdf - serverless-friendly,
 * no native deps. Returns merged text plus per-page text for RAG page tracking.
 */
export async function extractPdf(bytes: Uint8Array): Promise<ExtractedPdf> {
  const pdf = await getDocumentProxy(bytes);
  const { text, totalPages } = await extractText(pdf, { mergePages: false });

  const pageTexts = Array.isArray(text) ? text : [text];
  const pages: RawPage[] = pageTexts.map((t, i) => ({
    pageNumber: i + 1,
    text: (t ?? "").trim(),
  }));

  const fullText = pages
    .map((p) => p.text)
    .join("\n\n")
    .trim();

  return { fullText, pages, pageCount: totalPages };
}
