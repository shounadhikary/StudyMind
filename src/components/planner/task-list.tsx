"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { deleteTask, updateTaskStatus } from "@/lib/tasks/actions";
import { PRIORITY_LABELS, type TaskView } from "@/lib/tasks/types";

const PRIORITY_TONE: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-chart-3/15 text-chart-3",
  HIGH: "bg-destructive/15 text-destructive",
};

type Group = "Overdue" | "Today" | "Upcoming" | "Someday" | "Done";

function groupOf(task: TaskView): Group {
  if (task.status === "DONE") return "Done";
  if (!task.dueDate) return "Someday";
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  if (dueDay.getTime() < today.getTime()) return "Overdue";
  if (dueDay.getTime() === today.getTime()) return "Today";
  return "Upcoming";
}

const ORDER: Group[] = ["Overdue", "Today", "Upcoming", "Someday", "Done"];

export function TaskList({ tasks }: { tasks: TaskView[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const groups = ORDER.map((name) => ({
    name,
    items: tasks.filter((t) => groupOf(t) === name),
  })).filter((g) => g.items.length > 0);

  function toggle(task: TaskView) {
    setPendingId(task.id);
    updateTaskStatus(task.id, task.status === "DONE" ? "TODO" : "DONE")
      .then((r) => {
        if (!r.ok) toast.error(r.error);
        else router.refresh();
      })
      .finally(() => setPendingId(null));
  }

  function remove(id: string) {
    setPendingId(id);
    deleteTask(id)
      .then(() => router.refresh())
      .finally(() => setPendingId(null));
  }

  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
        No tasks yet. Add one to start planning your study time.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.name}>
          <h3
            className={cn(
              "text-xs font-semibold tracking-wide uppercase",
              group.name === "Overdue"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {group.name}
            <span className="ml-1.5 font-normal opacity-70">
              {group.items.length}
            </span>
          </h3>
          <ul className="mt-2 space-y-1.5">
            {group.items.map((task) => {
              const done = task.status === "DONE";
              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => toggle(task)}
                    disabled={pendingId === task.id}
                    aria-label={done ? "Mark as to do" : "Mark done"}
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      done
                        ? "border-chart-2 bg-chart-2 text-white"
                        : "hover:border-primary",
                    )}
                  >
                    {done ? <Check className="size-3" /> : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        done && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {task.subject ? <span>{task.subject}</span> : null}
                      {task.documentTitle ? (
                        <span className="flex items-center gap-1">
                          <FileText className="size-3" />
                          {task.documentTitle}
                        </span>
                      ) : null}
                      {task.dueDate ? (
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                      ) : null}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      PRIORITY_TONE[task.priority],
                    )}
                  >
                    {PRIORITY_LABELS[task.priority]}
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(task.id)}
                    disabled={pendingId === task.id}
                    aria-label="Delete task"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
