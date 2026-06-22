/** Shared settings types - safe to import from client and server. */

export type AiProviderPref = "auto" | "gemini" | "groq";
export type DifficultyPref = "EASY" | "MEDIUM" | "HARD";

export interface AppPreferences {
  language: string;
  defaultProvider: AiProviderPref;
  defaultDifficulty: DifficultyPref;
  notificationsEnabled: boolean;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  language: "en",
  defaultProvider: "auto",
  defaultDifficulty: "MEDIUM",
  notificationsEnabled: false,
};

export const LANGUAGES = [
  { value: "en", label: "English", available: true },
  { value: "bn", label: "বাংলা (Bengali)", available: false },
  { value: "de", label: "Deutsch (German)", available: false },
];

export const PROVIDER_OPTIONS: { value: AiProviderPref; label: string }[] = [
  { value: "auto", label: "Auto (recommended)" },
  { value: "gemini", label: "Gemini" },
  { value: "groq", label: "Groq" },
];
