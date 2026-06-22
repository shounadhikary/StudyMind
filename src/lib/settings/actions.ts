"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserId } from "@/lib/auth/require-user";
import type { AppPreferences } from "./types";

/** Merge a partial preferences update into the user's stored preferences. */
export async function updatePreferences(
  patch: Partial<AppPreferences>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const current = (user?.preferences as Record<string, unknown> | null) ?? {};

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: { ...current, ...patch } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/settings");
  return { ok: true };
}
