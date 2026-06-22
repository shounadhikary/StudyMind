"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StreakHeatmap } from "@/components/planner/streak-heatmap";
import { setStudyGoal } from "@/lib/productivity/actions";
import type { HeatmapDay } from "@/lib/productivity/queries";

export function GoalsPanel({
  initialTarget,
  todayMinutes,
  currentStreak,
  longestStreak,
  heatmap,
}: {
  initialTarget: number | null;
  todayMinutes: number;
  currentStreak: number;
  longestStreak: number;
  heatmap: HeatmapDay[];
}) {
  const router = useRouter();
  const [target, setTarget] = React.useState(initialTarget ?? 60);
  const [pending, startTransition] = React.useTransition();

  const pct =
    target > 0 ? Math.min(100, Math.round((todayMinutes / target) * 100)) : 0;

  function save() {
    startTransition(async () => {
      const result = await setStudyGoal(target);
      if (result.ok) {
        toast.success("Goal updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" />
            Daily study goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="text-sm font-medium tabular-nums">
                {todayMinutes} / {initialTarget ?? target} min
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="goal-target" className="text-sm font-medium">
                Target (minutes / day)
              </label>
              <Input
                id="goal-target"
                type="number"
                min={5}
                max={600}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </div>
            <Button onClick={save} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <StreakHeatmap
            days={heatmap}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
        </CardContent>
      </Card>
    </div>
  );
}
