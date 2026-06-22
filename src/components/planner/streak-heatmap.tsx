import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HeatmapDay } from "@/lib/productivity/queries";

function intensity(minutes: number): string {
  if (minutes <= 0) return "bg-muted";
  if (minutes < 15) return "bg-primary/25";
  if (minutes < 30) return "bg-primary/45";
  if (minutes < 60) return "bg-primary/70";
  return "bg-primary";
}

export function StreakHeatmap({
  days,
  currentStreak,
  longestStreak,
}: {
  days: HeatmapDay[];
  currentStreak: number;
  longestStreak: number;
}) {
  // Chunk into weeks (columns of 7).
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Flame className="size-4.5" />
          </span>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">longest</p>
        </div>
      </div>

      <div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.minutes} min`}
                  className={cn("size-3 rounded-[3px]", intensity(day.minutes))}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          <span className="size-3 rounded-[3px] bg-muted" />
          <span className="size-3 rounded-[3px] bg-primary/25" />
          <span className="size-3 rounded-[3px] bg-primary/45" />
          <span className="size-3 rounded-[3px] bg-primary/70" />
          <span className="size-3 rounded-[3px] bg-primary" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
