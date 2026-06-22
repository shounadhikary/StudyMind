import type {
  QuizAnswers,
  QuizQuestion,
  QuizResult,
} from "./types";

/** Normalize an answer for comparison (case/space/punctuation-insensitive). */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function isCorrect(question: QuizQuestion, userAnswer: string): boolean {
  const user = normalize(userAnswer);
  const correct = normalize(question.answer);
  if (!user) return false;
  if (question.type === "short_answer") {
    // Lenient: exact, or one contains the other (handles extra words).
    return user === correct || user.includes(correct) || correct.includes(user);
  }
  return user === correct;
}

/** Grade a quiz attempt. Pure - no I/O. */
export function gradeQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswers,
): QuizResult {
  const results = questions.map((q) => {
    const userAnswer = answers[q.id] ?? "";
    return {
      id: q.id,
      correct: isCorrect(q, userAnswer),
      userAnswer,
      correctAnswer: q.answer,
      explanation: q.explanation,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const total = questions.length || 1;

  return {
    score: Math.round((correctCount / total) * 100),
    correctCount,
    total: questions.length,
    results,
  };
}
