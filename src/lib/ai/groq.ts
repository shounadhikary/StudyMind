import "server-only";

import Groq from "groq-sdk";

import {
  AIError,
  toAIError,
  type AIChatMessage,
  type ChatOptions,
  type GenerateOptions,
  type TextProvider,
} from "./types";

// Llama 3.3 70B on Groq: very fast inference — our primary for real-time chat
// and a capable fallback for generation.
const GROQ_MODEL = "llama-3.3-70b-versatile";

let client: Groq | null = null;

function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIError("GROQ_API_KEY is not set", { provider: "groq" });
  }
  client ??= new Groq({ apiKey });
  return client;
}

export const groq: TextProvider = {
  name: "groq",

  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (options.system) {
      messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const completion = await getClient().chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxOutputTokens,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        stream: false,
      });
      const text = completion.choices[0]?.message?.content;
      if (!text) {
        throw new AIError("Groq returned an empty response", {
          provider: "groq",
        });
      }
      return text;
    } catch (error) {
      throw toAIError(error, "groq");
    }
  },

  async *chatStream(
    messages: AIChatMessage[],
    options: ChatOptions = {},
  ): AsyncIterable<string> {
    let stream;
    try {
      stream = await getClient().chat.completions.create({
        model: GROQ_MODEL,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options.temperature,
        max_tokens: options.maxOutputTokens,
        stream: true,
      });
    } catch (error) {
      throw toAIError(error, "groq");
    }

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  },
};
