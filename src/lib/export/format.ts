import type { DocumentSummary } from "@/lib/documents/types";
import type { QuizQuestion } from "@/lib/quiz/types";

export type PdfBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "bullets"; items: string[] };

interface Card {
  front: string;
  back: string;
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export function summaryToMarkdown(
  title: string,
  summary: DocumentSummary,
): string {
  const lines = [`# ${title}`, "", "## TL;DR", "", summary.tldr, ""];
  if (summary.keyPoints?.length) {
    lines.push("## Key points", "");
    for (const p of summary.keyPoints) lines.push(`- ${p}`);
    lines.push("");
  }
  for (const section of summary.sections ?? []) {
    lines.push(`## ${section.heading}`, "");
    for (const p of section.points) lines.push(`- ${p}`);
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

export function notesToMarkdown(title: string, text: string): string {
  return `# ${title}\n\n${text}\n`;
}

export function quizToMarkdown(title: string, questions: QuizQuestion[]): string {
  const lines = [`# ${title}`, ""];
  questions.forEach((q, i) => {
    lines.push(`### ${i + 1}. ${q.question}`, "");
    if (q.options?.length) {
      q.options.forEach((o, j) =>
        lines.push(`${String.fromCharCode(97 + j)}. ${o}`),
      );
      lines.push("");
    }
    lines.push(`**Answer:** ${q.answer}`);
    if (q.explanation) lines.push("", `_${q.explanation}_`);
    lines.push("");
  });
  return lines.join("\n").trim() + "\n";
}

// ---------------------------------------------------------------------------
// CSV (Anki-importable: front,back)
// ---------------------------------------------------------------------------

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function flashcardsToCsv(cards: Card[]): string {
  return cards.map((c) => `${csvCell(c.front)},${csvCell(c.back)}`).join("\r\n");
}

// ---------------------------------------------------------------------------
// PDF block builders (rendered by lib/export/pdf.ts)
// ---------------------------------------------------------------------------

export function summaryToPdfBlocks(summary: DocumentSummary): PdfBlock[] {
  const blocks: PdfBlock[] = [
    { type: "h2", text: "TL;DR" },
    { type: "p", text: summary.tldr },
  ];
  if (summary.keyPoints?.length) {
    blocks.push({ type: "h2", text: "Key points" });
    blocks.push({ type: "bullets", items: summary.keyPoints });
  }
  for (const section of summary.sections ?? []) {
    blocks.push({ type: "h2", text: section.heading });
    blocks.push({ type: "bullets", items: section.points });
  }
  return blocks;
}

export function quizToPdfBlocks(questions: QuizQuestion[]): PdfBlock[] {
  const blocks: PdfBlock[] = [];
  questions.forEach((q, i) => {
    blocks.push({ type: "h2", text: `${i + 1}. ${q.question}` });
    if (q.options?.length) {
      blocks.push({
        type: "bullets",
        items: q.options.map(
          (o, j) => `${String.fromCharCode(97 + j)}. ${o}`,
        ),
      });
    }
    blocks.push({ type: "p", text: `Answer: ${q.answer}` });
    if (q.explanation) blocks.push({ type: "p", text: q.explanation });
  });
  return blocks;
}

export function flashcardsToPdfBlocks(cards: Card[]): PdfBlock[] {
  const blocks: PdfBlock[] = [];
  cards.forEach((c, i) => {
    blocks.push({ type: "h2", text: `${i + 1}. ${c.front}` });
    blocks.push({ type: "p", text: c.back });
  });
  return blocks;
}
