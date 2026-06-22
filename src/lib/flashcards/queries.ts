import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Decks for a document, with total + due-now card counts. */
export async function listDecks(userId: string, documentId: string) {
  const decks = await prisma.flashcardDeck.findMany({
    where: { userId, documentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { flashcards: true } },
    },
  });

  if (decks.length === 0) return [];

  const dueGroups = await prisma.flashcard.groupBy({
    by: ["deckId"],
    where: {
      deckId: { in: decks.map((d) => d.id) },
      dueDate: { lte: new Date() },
    },
    _count: { _all: true },
  });
  const dueByDeck = new Map(dueGroups.map((g) => [g.deckId, g._count._all]));

  return decks.map((d) => ({
    id: d.id,
    title: d.title,
    createdAt: d.createdAt,
    total: d._count.flashcards,
    due: dueByDeck.get(d.id) ?? 0,
  }));
}

export type DeckListItem = Awaited<ReturnType<typeof listDecks>>[number];

/** A deck (scoped to owner) with all its cards + the due subset for studying. */
export async function getDeck(id: string, userId: string) {
  const deck = await prisma.flashcardDeck.findFirst({
    where: { id, userId },
    select: { id: true, title: true, documentId: true },
  });
  if (!deck) return null;

  const cards = await prisma.flashcard.findMany({
    where: { deckId: id },
    orderBy: { createdAt: "asc" },
    take: 300,
    select: { id: true, front: true, back: true, dueDate: true },
  });

  const now = Date.now();
  const strip = (c: (typeof cards)[number]) => ({
    id: c.id,
    front: c.front,
    back: c.back,
  });
  const dueCards = cards
    .filter((c) => c.dueDate && c.dueDate.getTime() <= now)
    .map(strip);
  const allCards = cards.map(strip);

  return {
    deck: { id: deck.id, title: deck.title, documentId: deck.documentId },
    total: cards.length,
    dueCards,
    allCards,
  };
}
