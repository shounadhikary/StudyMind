import "server-only";

import { gemini } from "./gemini";
import { groq } from "./groq";
import {
  AIError,
  shouldFallback,
  type AIChatMessage,
  type ChatOptions,
  type GenerateOptions,
} from "./types";

/**
 * One-shot text generation. Gemini is primary (large context, strong structured
 * output); Groq is the fallback when Gemini rate-limits or errors transiently.
 */
export async function generate(
  prompt: string,
  options?: GenerateOptions,
): Promise<string> {
  try {
    return await gemini.generate(prompt, options);
  } catch (primaryError) {
    if (!shouldFallback(primaryError)) throw primaryError;
    try {
      return await groq.generate(prompt, options);
    } catch (fallbackError) {
      throw new AIError(
        "Both Gemini and Groq failed to generate a response.",
        { cause: fallbackError },
      );
    }
  }
}

/**
 * Streamed chat. Groq is primary (fastest), Gemini is the fallback - but only
 * if the Groq stream fails before emitting anything, to avoid duplicate output.
 */
export async function* chatStream(
  messages: AIChatMessage[],
  options?: ChatOptions,
): AsyncIterable<string> {
  let emitted = false;
  try {
    for await (const token of groq.chatStream(messages, options)) {
      emitted = true;
      yield token;
    }
  } catch (primaryError) {
    if (emitted || !shouldFallback(primaryError)) throw primaryError;
    yield* gemini.chatStream(messages, options);
  }
}

/** Embeddings are Gemini-only (Groq has no embedding model). */
export function embed(texts: string[]): Promise<number[][]> {
  return gemini.embed(texts);
}

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced ? fenced[1] : trimmed).trim();
}

function tryParseJSON<T>(raw: string): { ok: true; value: T } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(stripCodeFences(raw)) as T };
  } catch {
    return { ok: false };
  }
}

/**
 * Generate a value as strict JSON. Instructs the model to return JSON only,
 * parses defensively, and retries once with a firmer instruction on failure
 * (the spec's "parse safely with try/catch; retry on parse failure").
 */
export async function generateJSON<T>(
  prompt: string,
  options?: GenerateOptions,
): Promise<T> {
  let lastRaw = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const finalPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No prose, no explanations, no markdown code fences.`;
    lastRaw = await generate(finalPrompt, { ...options, json: true });
    const parsed = tryParseJSON<T>(lastRaw);
    if (parsed.ok) return parsed.value;
  }
  throw new AIError(
    `Model did not return valid JSON after retry. Last output started with: ${lastRaw.slice(0, 120)}`,
  );
}
