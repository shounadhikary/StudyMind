import "server-only";

import { generateJSON } from "@/lib/ai";
import type { DocumentSummary } from "./types";

export type { DocumentSummary };

const SUMMARY_SYSTEM =
  "You are an expert study assistant. You write clear, faithful, well-structured " +
  "summaries of academic material for students. You never invent facts that are " +
  "not present in the source text.";

// Keep within a sensible input budget for the model.
const MAX_INPUT_CHARS = 60_000;

export async function summarizeText(text: string): Promise<DocumentSummary> {
  const source = text.slice(0, MAX_INPUT_CHARS);

  const prompt = `Summarize the study material below. Respond with ONLY a JSON object of this exact shape:

{
  "tldr": "2-3 sentence overview",
  "keyPoints": ["5 to 8 concise key takeaways"],
  "sections": [{ "heading": "section title", "points": ["key points for this section"] }]
}

Rules:
- Base everything strictly on the material; do not add outside facts.
- Keep points concise and student-friendly.
- Use 3-6 sections that mirror the material's structure.

Material:
"""
${source}
"""`;

  return generateJSON<DocumentSummary>(prompt, {
    system: SUMMARY_SYSTEM,
    temperature: 0.3,
  });
}
