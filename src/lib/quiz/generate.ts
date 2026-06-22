import "server-only";

import { generateJSON } from "@/lib/ai";
import type { Difficulty, QuizQuestion, QuizQuestionType } from "./types";

const MAX_INPUT_CHARS = 50_000;

interface RawQuestion {
  type?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

function normalizeQuestion(raw: RawQuestion, index: number): QuizQuestion {
  const type: QuizQuestionType =
    raw.type === "true_false" || raw.type === "short_answer"
      ? raw.type
      : raw.options && raw.options.length > 0
        ? "mcq"
        : "short_answer";

  return {
    id: `q${index + 1}`,
    type,
    question: String(raw.question ?? "").trim(),
    options:
      type === "mcq"
        ? (raw.options ?? []).map((o) => String(o))
        : type === "true_false"
          ? ["True", "False"]
          : undefined,
    answer: String(raw.answer ?? "").trim(),
    explanation: String(raw.explanation ?? "").trim(),
  };
}

export async function generateQuizQuestions(
  text: string,
  difficulty: Difficulty,
  count: number,
): Promise<QuizQuestion[]> {
  const source = text.slice(0, MAX_INPUT_CHARS);

  const prompt = `Create a ${count}-question quiz from the study material below, at ${difficulty} difficulty.

Return ONLY a JSON object of this shape:
{
  "questions": [
    {
      "type": "mcq" | "true_false" | "short_answer",
      "question": "the question text",
      "options": ["four options — MCQ only"],
      "answer": "the exact correct option, or \\"True\\"/\\"False\\", or a short expected answer",
      "explanation": "a brief explanation of the correct answer"
    }
  ]
}

Guidelines:
- Mostly multiple-choice; include a couple of true/false and at most two short-answer.
- For MCQ, "answer" must exactly match one of the "options".
- Base every question strictly on the material. Keep explanations concise.

Study material:
"""
${source}
"""`;

  const data = await generateJSON<{ questions: RawQuestion[] }>(prompt, {
    system: "You are an expert exam writer who creates fair, accurate quizzes for students.",
    temperature: 0.4,
  });

  const raw = Array.isArray(data?.questions) ? data.questions : [];
  return raw
    .filter((q) => q.question && q.answer)
    .map(normalizeQuestion)
    .slice(0, count);
}
