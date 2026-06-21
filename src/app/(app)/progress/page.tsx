import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <FeaturePlaceholder
      title="Progress"
      description="See study time, accuracy trends, and focus areas."
      icon={TrendingUp}
      phase="Phase 7"
      highlights={[
        "Overview cards: study time, accuracy, cards, streak",
        "Charts for study time and quiz accuracy over time",
        "Subject-wise performance breakdowns",
        "Automatic weakness detection (focus areas)",
      ]}
    />
  );
}
