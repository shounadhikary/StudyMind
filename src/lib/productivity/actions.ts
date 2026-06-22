"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { recordActivity } from "./streak";

export type ProductivityResult = { ok: true } | { ok: false; error: string };

/** Log a completed focus session (duration in seconds) and bump the streak. */
export async function logFocusSession(input: {
  duration: number;
  subject?: string | null;
  documentId?: string | null;
}): Promise<ProductivityResult> {
  const userId = await requireUserId();
  const duration = Math.max(1, Math.round(input.duration));

  await prisma.focusSession.create({
    data: {
      userId,
      duration,
      subject: input.subject?.trim() || null,
      documentId: input.documentId || null,
    },
  });
  await recordActivity(userId);

  revalidatePath("/planner");
  revalidatePath("/progress");
  return { ok: true };
}

/** Set (or update) the daily study-minutes goal. */
export async function setStudyGoal(
  targetMinutes: number,
): Promise<ProductivityResult> {
  const userId = await requireUserId();
  const target = Math.min(Math.max(Math.round(targetMinutes), 5), 600);

  const existing = await prisma.goal.findFirst({
    where: { userId, type: "STUDY_MINUTES", period: "DAILY" },
  });
  if (existing) {
    await prisma.goal.update({ where: { id: existing.id }, data: { target } });
  } else {
    await prisma.goal.create({
      data: { userId, type: "STUDY_MINUTES", period: "DAILY", target },
    });
  }

  revalidatePath("/planner");
  return { ok: true };
}
