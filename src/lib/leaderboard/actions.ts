"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserId } from "@/lib/auth/require-user";

export type LeaderboardOptInResult =
  | { ok: true }
  | { ok: false; error: string };

/** Opt in/out of the public leaderboard and set a display name. Opt-in only. */
export async function setLeaderboardOptIn(
  optIn: boolean,
  displayName: string,
): Promise<LeaderboardOptInResult> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true, name: true },
  });

  const prefs = (user?.preferences as Record<string, unknown> | null) ?? {};
  const name = displayName.trim() || user?.name || "Student";

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: {
        ...prefs,
        leaderboardOptIn: optIn,
        leaderboardName: name,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/leaderboard");
  return { ok: true };
}
