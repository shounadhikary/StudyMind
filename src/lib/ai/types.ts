/**
 * Shared types and constants for the AI abstraction layer.
 *
 * The layer exposes a small, provider-agnostic surface - `generate`,
 * `generateJSON`, `chatStream`, and `embed` - implemented by swappable
 * providers (Gemini, Groq) behind a router that falls back on rate-limit/error.
 */

export type AIRole = "system" | "user" | "assistant";

export interface AIChatMessage {
  role: AIRole;
  content: string;
}

export interface GenerateOptions {
  /** System instruction that steers the model's behavior. */
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Ask the model to return only valid JSON (used for structured outputs). */
  json?: boolean;
}

export interface ChatOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

export type ProviderName = "gemini" | "groq";

/** A provider that can produce text (single-shot and streamed). */
export interface TextProvider {
  readonly name: ProviderName;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  chatStream(
    messages: AIChatMessage[],
    options?: ChatOptions,
  ): AsyncIterable<string>;
}

/** A provider that can produce embeddings. */
export interface EmbeddingProvider {
  readonly name: ProviderName;
  embed(texts: string[]): Promise<number[][]>;
}

/** Embedding dimensionality (Gemini text-embedding-004) - matches the
 *  `vector(768)` column in the Prisma schema. */
export const EMBEDDING_DIMENSIONS = 768;

/** Normalized AI error so callers (and the router) can react to rate limits. */
export class AIError extends Error {
  readonly provider?: ProviderName;
  readonly status?: number;
  readonly isRateLimit: boolean;

  constructor(
    message: string,
    options: {
      provider?: ProviderName;
      status?: number;
      isRateLimit?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AIError";
    this.provider = options.provider;
    this.status = options.status;
    this.isRateLimit = options.isRateLimit ?? false;
  }
}

/** Best-effort classification of an unknown thrown value into an AIError. */
export function toAIError(error: unknown, provider: ProviderName): AIError {
  if (error instanceof AIError) return error;

  const err = error as { status?: number; message?: string; name?: string };
  const status = typeof err?.status === "number" ? err.status : undefined;
  const message = err?.message ?? String(error);
  const haystack = `${err?.name ?? ""} ${message}`.toLowerCase();

  const isRateLimit =
    status === 429 ||
    haystack.includes("rate limit") ||
    haystack.includes("quota") ||
    haystack.includes("resource_exhausted") ||
    haystack.includes("too many requests");

  return new AIError(message, { provider, status, isRateLimit, cause: error });
}

/** Whether the router should try the fallback provider for this error. */
export function shouldFallback(error: unknown): boolean {
  if (error instanceof AIError) {
    return (
      error.isRateLimit ||
      error.status === undefined ||
      error.status === 429 ||
      error.status >= 500
    );
  }
  return true;
}
