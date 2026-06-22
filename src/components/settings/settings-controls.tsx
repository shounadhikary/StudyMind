"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { updatePreferences } from "@/lib/settings/actions";
import {
  LANGUAGES,
  PROVIDER_OPTIONS,
  type AppPreferences,
} from "@/lib/settings/types";

const selectClass =
  "flex h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  return (
    <Row label="Theme" description="How StudyMind looks on this device.">
      <div className="inline-flex rounded-lg border p-0.5">
        {THEME_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              theme === o.value
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <o.icon className="size-4" />
            {o.label}
          </button>
        ))}
      </div>
    </Row>
  );
}

export function PreferencesForm({
  preferences,
}: {
  preferences: AppPreferences;
}) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();

  function save(patch: Partial<AppPreferences>) {
    startTransition(async () => {
      const result = await updatePreferences(patch);
      if (result.ok) {
        toast.success("Saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function toggleNotifications(next: boolean) {
    if (
      next &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
    save({ notificationsEnabled: next });
  }

  return (
    <div>
      <Row label="Language" description="More languages coming soon.">
        <select
          className={selectClass}
          defaultValue={preferences.language}
          onChange={(e) => save({ language: e.target.value })}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value} disabled={!l.available}>
              {l.label}
              {l.available ? "" : " — coming soon"}
            </option>
          ))}
        </select>
      </Row>

      <Row
        label="Default AI provider"
        description="The router falls back automatically if a provider is unavailable."
      >
        <select
          className={selectClass}
          defaultValue={preferences.defaultProvider}
          onChange={(e) =>
            save({ defaultProvider: e.target.value as AppPreferences["defaultProvider"] })
          }
        >
          {PROVIDER_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Default quiz difficulty">
        <select
          className={selectClass}
          defaultValue={preferences.defaultDifficulty}
          onChange={(e) =>
            save({
              defaultDifficulty: e.target.value as AppPreferences["defaultDifficulty"],
            })
          }
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </Row>

      <Row
        label="Browser notifications"
        description="Reminders for due tasks and reviews."
      >
        <button
          type="button"
          role="switch"
          aria-checked={preferences.notificationsEnabled}
          onClick={() => toggleNotifications(!preferences.notificationsEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            preferences.notificationsEnabled ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "inline-block size-5 transform rounded-full bg-background shadow transition-transform",
              preferences.notificationsEnabled
                ? "translate-x-5"
                : "translate-x-0.5",
            )}
          />
        </button>
      </Row>
    </div>
  );
}
