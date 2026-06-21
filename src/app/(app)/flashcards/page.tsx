import type { Metadata } from "next";
import { Layers } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Flashcards" };

export default function FlashcardsPage() {
  return (
    <FeaturePlaceholder
      title="Flashcards"
      description="Study flashcards with spaced repetition that adapts to you."
      icon={Layers}
      phase="Phase 4"
      highlights={[
        "AI-generated front/back cards from any document",
        "Flip animation and keyboard navigation",
        "SM-2 spaced repetition (Again / Hard / Good / Easy)",
        "A \"due today\" review queue",
      ]}
    />
  );
}
