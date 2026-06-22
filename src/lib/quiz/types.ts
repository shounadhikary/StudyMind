/** Shared quiz types — safe to import from client and server. */

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type QuizQuestionType = "mcq" | "true_false" | "short_answer";

export interface QuizQuestion {
  /** Stable id within the quiz (assigned at generation time). */
  id: string;
  type: QuizQuestionType;
  question: string;
  /** Present for multiple-choice questions. */
  options?: string[];
  /** The correct answer: an option string, "True"/"False", or expected text. */
  answer: string;
  explanation: string;
}

/** A user's answers, keyed by question id. */
export type QuizAnswers = Record<string, string>;

export interface QuestionResult {
  id: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  /** Percentage score, 0-100. */
  score: number;
  correctCount: number;
  total: number;
  results: QuestionResult[];
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};
