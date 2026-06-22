import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  DEFAULT_PREFERENCES,
  type AppPreferences,
  type AiProviderPref,
  type DifficultyPref,
} from "./types";

/** Read a user's app preferences, merged over sensible defaults. */
export async function getPreferences(userId: string): Promise<AppPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const stored = (user?.preferences as Record<string, unknown> | null) ?? {};

  return {
    language:
      typeof stored.language === "string"
        ? stored.language
        : DEFAULT_PREFERENCES.language,
    defaultProvider: (["auto", "gemini", "groq"].includes(
      stored.defaultProvider as string,
    )
      ? stored.defaultProvider
      : DEFAULT_PREFERENCES.defaultProvider) as AiProviderPref,
    defaultDifficulty: (["EASY", "MEDIUM", "HARD"].includes(
      stored.defaultDifficulty as string,
    )
      ? stored.defaultDifficulty
      : DEFAULT_PREFERENCES.defaultDifficulty) as DifficultyPref,
    notificationsEnabled: stored.notificationsEnabled === true,
  };
}
