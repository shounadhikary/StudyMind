"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserId } from "@/lib/auth/require-user";
import { generateQuizQuestions } from "./generate";
import { gradeQuiz } from "./grade";
import type {
  Difficulty,
  QuizAnswers,
  QuizQuestion,
  QuizResult,
} from "./types";

export type GenerateQuizResult =
  | { ok: true; quizId: string }
  | { ok: false; error: string };

export async function generateQuiz(
  documentId: string,
  difficulty: Difficulty,
  count: number,
): Promise<GenerateQuizResult> {
  const userId = await requireUserId();
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, rawText: true },
  });
  if (!doc?.rawText) {
    return { ok: false, error: "This document has no text to quiz on." };
  }

  const count_ = Math.min(Math.max(Math.round(count), 3), 15);
  let questions: QuizQuestion[];
  try {
    questions = await generateQuizQuestions(doc.rawText, difficulty, count_);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Quiz generation failed.",
    };
  }
  if (questions.length === 0) {
    return { ok: false, error: "Couldn't generate questions. Please retry." };
  }

  const quiz = await prisma.quiz.create({
    data: {
      documentId,
      userId,
      difficulty,
      questions: questions as unknown as Prisma.InputJsonValue,
    },
  });
  revalidatePath("/quiz");
  return { ok: true, quizId: quiz.id };
}

export async function submitQuizAttempt(
  quizId: string,
  answers: QuizAnswers,
): Promise<{ ok: true; result: QuizResult } | { ok: false; error: string }> {
  const userId = await requireUserId();
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { id: true, questions: true },
  });
  if (!quiz) return { ok: false, error: "Quiz not found." };

  const questions = (quiz.questions as unknown as QuizQuestion[]) ?? [];
  const result = gradeQuiz(questions, answers);

  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
      answers: answers as unknown as Prisma.InputJsonValue,
      score: result.score,
    },
  });
  revalidatePath(`/quiz/${quizId}`);
  return { ok: true, result };
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.quiz.deleteMany({ where: { id: quizId, userId } });
  revalidatePath("/quiz");
}
