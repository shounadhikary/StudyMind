import type { Metadata } from "next";
import { ListChecks } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return (
    <FeaturePlaceholder
      title="Quiz"
      description="Generate and take quizzes, then review your results."
      icon={ListChecks}
      phase="Phase 4"
      highlights={[
        "MCQ, true/false, and short-answer questions",
        "Easy / Medium / Hard difficulty levels",
        "Auto-grading with explanations",
        "Attempts saved for progress analytics",
      ]}
    />
  );
}
