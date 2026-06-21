import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Planner" };

export default function PlannerPage() {
  return (
    <FeaturePlaceholder
      title="Planner"
      description="Plan study tasks on a calendar and track what's due."
      icon={CalendarDays}
      phase="Phase 6"
      highlights={[
        "Tasks with subject, due date, priority, and status",
        "Month / week calendar and list views",
        "Pomodoro focus timer with session logging",
        "Goals, streaks, and in-app reminders",
      ]}
    />
  );
}
