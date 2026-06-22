import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { PublicQuiz } from "@/components/share/public-quiz";
import { PublicDeck } from "@/components/share/public-deck";
import type { QuizQuestion } from "@/lib/quiz/types";

export const metadata: Metadata = { title: "Shared" };

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await prisma.share.findUnique({
    where: { publicToken: token },
  });
  if (!share) notFound();

  if (share.resourceType === "QUIZ") {
    const quiz = await prisma.quiz.findUnique({
      where: { id: share.resourceId },
      include: { document: { select: { title: true } } },
    });
    if (!quiz) notFound();
    return (
      <PublicQuiz
        title={quiz.document.title}
        difficulty={quiz.difficulty}
        questions={(quiz.questions as unknown as QuizQuestion[]) ?? []}
      />
    );
  }

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: share.resourceId },
    include: {
      flashcards: {
        orderBy: { createdAt: "asc" },
        select: { id: true, front: true, back: true },
      },
    },
  });
  if (!deck) notFound();

  return <PublicDeck title={deck.title} cards={deck.flashcards} />;
}
