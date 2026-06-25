import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { Clock, FileText } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { TasksView } from "@/components/planner/tasks-view";
import { Pomodoro } from "@/components/planner/pomodoro";
import { GoalsPanel } from "@/components/planner/goals-panel";
import { Reminders } from "@/components/planner/reminders";
import { listLinkableDocuments, listTasks } from "@/lib/tasks/queries";
import {
  getDailyGoal,
  getFocusHeatmap,
  getRecentFocusSessions,
  getStreak,
  getTodayFocusMinutes,
} from "@/lib/productivity/queries";
import type { TaskView } from "@/lib/tasks/types";

export const metadata: Metadata = { title: "Planner" };

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Planner"
        description="Plan study tasks, focus with Pomodoro, and track your goals."
      />
      <Suspense fallback={<PlannerSkeleton />}>
        <PlannerBody />
      </Suspense>
    </div>
  );
}

function PlannerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64 rounded-lg" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

async function PlannerBody() {
  const { userId } = await auth();
  if (!userId) return null;

  const [tasksRaw, documents, streak, goal, todayMinutes, recent, heatmap] =
    await Promise.all([
      listTasks(userId),
      listLinkableDocuments(userId),
      getStreak(userId),
      getDailyGoal(userId),
      getTodayFocusMinutes(userId),
      getRecentFocusSessions(userId, 6),
      getFocusHeatmap(userId),
    ]);

  const tasks: TaskView[] = tasksRaw.map((t) => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    priority: t.priority,
    status: t.status,
    documentTitle: t.document?.title ?? null,
  }));

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(startToday);
  endToday.setDate(endToday.getDate() + 1);
  let overdue = 0;
  let dueToday = 0;
  for (const t of tasks) {
    if (t.status === "DONE" || !t.dueDate) continue;
    const d = new Date(t.dueDate);
    if (d < startToday) overdue++;
    else if (d < endToday) dueToday++;
  }

  return (
    <>
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TasksView tasks={tasks} documents={documents} />
        </TabsContent>

        <TabsContent value="focus" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Pomodoro />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No focus sessions yet. Start the timer to log one.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {recent.map((s) => (
                      <li key={s.id} className="flex items-center gap-3 text-sm">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Clock className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {Math.round(s.duration / 60)} min
                            {s.subject ? ` · ${s.subject}` : ""}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            {s.document?.title ? (
                              <>
                                <FileText className="size-3" />
                                {s.document.title} ·{" "}
                              </>
                            ) : null}
                            {format(s.completedAt, "MMM d, h:mm a")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <GoalsPanel
            initialTarget={goal?.target ?? null}
            todayMinutes={todayMinutes}
            currentStreak={streak?.currentStreak ?? 0}
            longestStreak={streak?.longestStreak ?? 0}
            heatmap={heatmap}
          />
        </TabsContent>
      </Tabs>

      <Reminders overdue={overdue} today={dueToday} />
    </>
  );
}
