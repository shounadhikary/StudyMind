import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Documents for a user, with counts of derived artifacts, newest first. */
export function listDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      pageCount: true,
      language: true,
      fileUrl: true,
      createdAt: true,
      _count: {
        select: {
          summaries: true,
          quizzes: true,
          flashcardDecks: true,
          mindMaps: true,
          chunks: true,
        },
      },
    },
  });
}

export type DocumentListItem = Awaited<
  ReturnType<typeof listDocuments>
>[number];

/** A single document (scoped to its owner) with its latest summary. */
export function getDocument(id: string, userId: string) {
  return prisma.document.findFirst({
    where: { id, userId },
    include: {
      summaries: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export type DocumentDetail = NonNullable<Awaited<ReturnType<typeof getDocument>>>;
