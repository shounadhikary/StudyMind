import {
  BookOpen,
  Brain,
  Flame,
  Layers,
  ListChecks,
  Network,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface AchievementStats {
  documents: number;
  quizzes: number;
  cardsReviewed: number;
  summaries: number;
  mindMaps: number;
  longestStreak: number;
  bestQuizScore: number;
}

export interface AchievementDef {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  earned: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first-document",
    label: "First upload",
    description: "Add your first document",
    icon: BookOpen,
    earned: (s) => s.documents >= 1,
  },
  {
    key: "librarian",
    label: "Librarian",
    description: "Add 10 documents",
    icon: Layers,
    earned: (s) => s.documents >= 10,
  },
  {
    key: "summarizer",
    label: "Summarizer",
    description: "Generate your first summary",
    icon: Sparkles,
    earned: (s) => s.summaries >= 1,
  },
  {
    key: "first-quiz",
    label: "Quiz starter",
    description: "Take your first quiz",
    icon: ListChecks,
    earned: (s) => s.quizzes >= 1,
  },
  {
    key: "perfect-score",
    label: "Perfect score",
    description: "Score 100% on a quiz",
    icon: Target,
    earned: (s) => s.bestQuizScore >= 100,
  },
  {
    key: "century",
    label: "Century",
    description: "Review 100 flashcards",
    icon: Brain,
    earned: (s) => s.cardsReviewed >= 100,
  },
  {
    key: "on-a-roll",
    label: "On a roll",
    description: "Reach a 7-day streak",
    icon: Flame,
    earned: (s) => s.longestStreak >= 7,
  },
  {
    key: "cartographer",
    label: "Cartographer",
    description: "Create a mind map",
    icon: Network,
    earned: (s) => s.mindMaps >= 1,
  },
];
