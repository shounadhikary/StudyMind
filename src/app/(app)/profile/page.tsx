import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <FeaturePlaceholder
      title="Profile"
      description="Your study stats and earned achievement badges."
      icon={UserRound}
      phase="Phase 9"
      highlights={[
        "Avatar, name, and a study-stats summary",
        "Achievement badges (streaks, milestones, firsts)",
        "Your recent activity at a glance",
      ]}
    />
  );
}
