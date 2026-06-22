import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getQuiz } from "@/lib/quiz/queries";
import { DIFFICULTY_LABELS, type QuizQuestion } from "@/lib/quiz/types";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const quiz = userId ? await getQuiz(id, userId) : null;
  if (!quiz) notFound();

  const questions = (quiz.questions as unknown as QuizQuestion[]) ?? [];
  const best = quiz.attempts.reduce(
    (max, a) => Math.max(max, a.score),
    quiz.attempts.length ? 0 : Number.NaN,
  );

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 text-muted-foreground"
          render={<Link href={`/quiz?doc=${quiz.document.id}`} />}
        >
          <ArrowLeft className="size-4" />
          {quiz.document.title}
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Quiz · {questions.length} questions
          </h1>
          <Badge variant="secondary">
            {DIFFICULTY_LABELS[quiz.difficulty]}
          </Badge>
          {Number.isFinite(best) ? (
            <span className="text-sm text-muted-foreground">
              Best score {best}%
            </span>
          ) : null}
        </div>
      </div>

      <QuizRunner quizId={quiz.id} questions={questions} />
    </div>
  );
}
