"use client";

import * as React from "react";
import { toast } from "sonner";

/**
 * Lightweight reminders: once per session, surface overdue / due-today tasks as
 * an in-app toast and (if the user has granted permission) a browser
 * notification. Counts are computed server-side and passed in.
 */
export function Reminders({
  overdue,
  today,
}: {
  overdue: number;
  today: number;
}) {
  React.useEffect(() => {
    if (overdue === 0 && today === 0) return;
    if (sessionStorage.getItem("studymind-reminded") === "1") return;
    sessionStorage.setItem("studymind-reminded", "1");

    const parts: string[] = [];
    if (overdue > 0) parts.push(`${overdue} overdue`);
    if (today > 0) parts.push(`${today} due today`);
    const message = `You have ${parts.join(" and ")} task${
      overdue + today === 1 ? "" : "s"
    }.`;

    toast.info("Study reminder", { description: message });

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("StudyMind reminder", { body: message });
      } catch {
        // ignore
      }
    }
  }, [overdue, today]);

  return null;
}
