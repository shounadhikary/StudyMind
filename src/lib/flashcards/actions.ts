"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserId } from "@/lib/auth/require-user";
import { generateFlashcards } from "./generate";
import { INITIAL_SR_STATE, review, type Rating, type SrState } from "@/lib/sr/sm2";

export type GenerateDeckResult =
  | { ok: true; deckId: string }
  | { ok: false; error: string };

export async function generateDeck(
  documentId: string,
  count: number,
): Promise<GenerateDeckResult> {
  const userId = await requireUserId();
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, title: true, rawText: true },
  });
  if (!doc?.rawText) {
    return { ok: false, error: "This document has no text to study." };
  }

  const n = Math.min(Math.max(Math.round(count), 5), 30);
  let cards;
  try {
    cards = await generateFlashcards(doc.rawText, n);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Flashcard generation failed.",
    };
  }
  if (cards.length === 0) {
    return { ok: false, error: "Couldn't generate flashcards. Please retry." };
  }

  const now = new Date();
  const deck = await prisma.flashcardDeck.create({
    data: {
      documentId,
      userId,
      title: doc.title,
      flashcards: {
        create: cards.map((c) => ({
          front: c.front,
          back: c.back,
          srState: INITIAL_SR_STATE as unknown as Prisma.InputJsonValue,
          dueDate: now,
        })),
      },
    },
  });

  revalidatePath("/flashcards");
  return { ok: true, deckId: deck.id };
}

export async function reviewCard(
  cardId: string,
  rating: Rating,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const card = await prisma.flashcard.findFirst({
    where: { id: cardId, deck: { userId } },
    select: { id: true, srState: true },
  });
  if (!card) return { ok: false, error: "Card not found." };

  const { state, dueDate } = review(
    card.srState as unknown as Partial<SrState>,
    rating,
  );
  await prisma.flashcard.update({
    where: { id: card.id },
    data: {
      srState: state as unknown as Prisma.InputJsonValue,
      dueDate,
    },
  });
  return { ok: true };
}

export async function deleteDeck(deckId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.flashcardDeck.deleteMany({ where: { id: deckId, userId } });
  revalidatePath("/flashcards");
}
