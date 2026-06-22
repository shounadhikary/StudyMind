"use server";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";

export type ShareKind = "QUIZ" | "FLASHCARD_DECK";

export type ShareResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

/** Create (or reuse) a public read-only share link for a quiz or deck. */
export async function createShareLink(
  resourceType: ShareKind,
  resourceId: string,
): Promise<ShareResult> {
  const userId = await requireUserId();

  const owned =
    resourceType === "QUIZ"
      ? await prisma.quiz.findFirst({
          where: { id: resourceId, userId },
          select: { id: true },
        })
      : await prisma.flashcardDeck.findFirst({
          where: { id: resourceId, userId },
          select: { id: true },
        });
  if (!owned) return { ok: false, error: "Resource not found." };

  const existing = await prisma.share.findFirst({
    where: { resourceType, resourceId },
  });
  if (existing) return { ok: true, token: existing.publicToken };

  const token = randomUUID().replace(/-/g, "");
  await prisma.share.create({
    data: { resourceType, resourceId, publicToken: token },
  });
  return { ok: true, token };
}
