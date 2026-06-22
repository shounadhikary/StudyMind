import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Quizzes for a document, with attempt count and best score. */
export async function listQuizzes(userId: string, documentId: string) {
  const quizzes = await prisma.quiz.findMany({
    where: { userId, documentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      difficulty: true,
      questions: true,
      createdAt: true,
      attempts: {
        orderBy: { score: "desc" },
        take: 1,
        select: { score: true },
      },
      _count: { select: { attempts: true } },
    },
  });

  return quizzes.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    questionCount: Array.isArray(q.questions) ? q.questions.length : 0,
    createdAt: q.createdAt,
    attemptCount: q._count.attempts,
    bestScore: q.attempts[0]?.score ?? null,
  }));
}

export type QuizListItem = Awaited<ReturnType<typeof listQuizzes>>[number];

/** A single quiz (scoped to owner) with its document title and past attempts. */
export function getQuiz(id: string, userId: string) {
  return prisma.quiz.findFirst({
    where: { id, userId },
    include: {
      document: { select: { id: true, title: true } },
      attempts: { orderBy: { takenAt: "desc" } },
    },
  });
}
