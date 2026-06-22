import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  PreferencesForm,
  ThemeSetting,
} from "@/components/settings/settings-controls";
import { getPreferences } from "@/lib/settings/preferences";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const preferences = await getPreferences(userId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your appearance, study preferences, and account."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ThemeSetting />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Study preferences</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <PreferencesForm preferences={preferences} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Account</h2>
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full max-w-none shadow-none border rounded-xl",
            },
          }}
        />
      </section>
    </div>
  );
}
