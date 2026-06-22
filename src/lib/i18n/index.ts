import { en, type Messages } from "./locales/en";

export type { Messages };

export type Locale = "en" | "bn" | "de";

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that are fully translated and selectable today. */
export const AVAILABLE_LOCALES: Locale[] = ["en"];

const dictionaries: Partial<Record<Locale, Messages>> = {
  en,
};

/** Get the message dictionary for a locale, falling back to English. */
export function getMessages(locale: string): Messages {
  return dictionaries[locale as Locale] ?? en;
}
