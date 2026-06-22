/**
 * StudyMind AI abstraction layer.
 *
 * Import the unified helpers from here:
 *   import { generate, generateJSON, chatStream, embed } from "@/lib/ai";
 *
 * Providers (Gemini, Groq) are swappable and the router falls back
 * automatically on rate-limit/error. All usage is server-side only.
 */

export { generate, generateJSON, chatStream, embed } from "./router";
export {
  AIError,
  EMBEDDING_DIMENSIONS,
  type AIChatMessage,
  type AIRole,
  type ChatOptions,
  type GenerateOptions,
  type ProviderName,
} from "./types";
