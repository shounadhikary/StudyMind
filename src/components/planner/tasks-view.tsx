"use client";

import * as React from "react";
import { CalendarDays, List } from "lucide-react";

import { cn } from "@/lib/utils";
import { TaskDialog } from "@/components/planner/task-dialog";
import { TaskList } from "@/components/planner/task-list";
import { TaskCalendar } from "@/components/planner/task-calendar";
import type { TaskView } from "@/lib/tasks/types";

export function TasksView({
  tasks,
  documents,
}: {
  tasks: TaskView[];
  documents: { id: string; title: string }[];
}) {
  const [view, setView] = React.useState<"list" | "calendar">("list");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border p-0.5">
          {([
            { key: "list", label: "List", icon: List },
            { key: "calendar", label: "Calendar", icon: CalendarDays },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setView(opt.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === opt.key
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <opt.icon className="size-4" />
              {opt.label}
            </button>
          ))}
        </div>
        <TaskDialog documents={documents} />
      </div>

      {view === "list" ? (
        <TaskList tasks={tasks} />
      ) : (
        <TaskCalendar tasks={tasks} />
      )}
    </div>
  );
}
