import "server-only";

import { generateJSON } from "@/lib/ai";
import type { GeneratedCard } from "./types";

const MAX_INPUT_CHARS = 50_000;

export async function generateFlashcards(
  text: string,
  count: number,
): Promise<GeneratedCard[]> {
  const source = text.slice(0, MAX_INPUT_CHARS);

  const prompt = `Create ${count} study flashcards from the material below.

Return ONLY a JSON object of this shape:
{ "cards": [ { "front": "a question or term", "back": "the answer or definition" } ] }

Guidelines:
- Keep the front concise (a question, term, or concept).
- Make the back clear and self-contained.
- Cover the most important, testable ideas. Base everything strictly on the material.

Study material:
"""
${source}
"""`;

  const data = await generateJSON<{ cards: GeneratedCard[] }>(prompt, {
    system: "You are an expert at creating effective, accurate study flashcards.",
    temperature: 0.4,
  });

  const raw = Array.isArray(data?.cards) ? data.cards : [];
  return raw
    .filter((c) => c.front && c.back)
    .map((c) => ({ front: String(c.front).trim(), back: String(c.back).trim() }))
    .slice(0, count);
}
