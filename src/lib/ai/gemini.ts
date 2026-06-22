import "server-only";

import { GoogleGenAI, type Content } from "@google/genai";

import {
  AIError,
  EMBEDDING_DIMENSIONS,
  toAIError,
  type AIChatMessage,
  type ChatOptions,
  type EmbeddingProvider,
  type GenerateOptions,
  type TextProvider,
} from "./types";

// gemini-2.5-flash: large context window, strong structured output - our
// primary for generation/summaries. gemini-embedding-001 is the current GA
// embedding model; we request 768 dims to match the pgvector column.
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const GEMINI_EMBED_MODEL = "gemini-embedding-001";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIError("GEMINI_API_KEY is not set", { provider: "gemini" });
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** Map our chat messages to Gemini's Content[] (assistant -> "model"), pulling
 *  any system messages out into a single system instruction. */
function toGeminiContents(messages: AIChatMessage[]): {
  system?: string;
  contents: Content[];
} {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents: Content[] = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  return { system: system || undefined, contents };
}

export const gemini: TextProvider & EmbeddingProvider = {
  name: "gemini",

  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    try {
      const response = await getClient().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          systemInstruction: options.system,
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
          ...(options.json ? { responseMimeType: "application/json" } : {}),
        },
      });
      const text = response.text;
      if (!text) {
        throw new AIError("Gemini returned an empty response", {
          provider: "gemini",
        });
      }
      return text;
    } catch (error) {
      throw toAIError(error, "gemini");
    }
  },

  async *chatStream(
    messages: AIChatMessage[],
    options: ChatOptions = {},
  ): AsyncIterable<string> {
    const { system, contents } = toGeminiContents(messages);
    let stream;
    try {
      stream = await getClient().models.generateContentStream({
        model: GEMINI_TEXT_MODEL,
        contents,
        config: {
          systemInstruction: system,
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
        },
      });
    } catch (error) {
      throw toAIError(error, "gemini");
    }

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield text;
    }
  },

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    try {
      const response = await getClient().models.embedContent({
        model: GEMINI_EMBED_MODEL,
        contents: texts,
        config: { outputDimensionality: EMBEDDING_DIMENSIONS },
      });
      const embeddings = response.embeddings;
      if (!embeddings || embeddings.length === 0) {
        throw new AIError("Gemini returned no embeddings", {
          provider: "gemini",
        });
      }
      return embeddings.map((embedding) => embedding.values ?? []);
    } catch (error) {
      throw toAIError(error, "gemini");
    }
  },
};
