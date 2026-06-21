import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <FeaturePlaceholder
      title="Settings"
      description="Theme, language, AI preferences, and your account."
      icon={Settings}
      phase="Phase 9"
      highlights={[
        "Theme (light / dark / system) and language",
        "Default AI provider and quiz difficulty",
        "Notification preferences",
        "Account management, connected accounts, and password via Clerk",
      ]}
    />
  );
}
