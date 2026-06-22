"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { logFocusSession } from "@/lib/productivity/actions";

const PRESETS = [
  { label: "25 / 5", focus: 25, break: 5 },
  { label: "50 / 10", focus: 50, break: 10 },
];

function mmss(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function notify(title: string, body: string) {
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, { body });
    } catch {
      // ignore
    }
  }
}

export function Pomodoro() {
  const [presetIdx, setPresetIdx] = React.useState(0);
  const [mode, setMode] = React.useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = React.useState(PRESETS[0].focus * 60);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);
  const [subject, setSubject] = React.useState("");

  const preset = PRESETS[presetIdx];
  const focusSeconds = preset.focus * 60;
  const breakSeconds = preset.break * 60;
  const totalSeconds = mode === "focus" ? focusSeconds : breakSeconds;

  const secondsRef = React.useRef(secondsLeft);
  const modeRef = React.useRef(mode);
  const subjectRef = React.useRef(subject);

  // Keep "latest value" refs in sync (read inside the interval callback).
  React.useEffect(() => {
    secondsRef.current = secondsLeft;
    modeRef.current = mode;
    subjectRef.current = subject;
  });

  const complete = React.useCallback(() => {
    setRunning(false);
    if (modeRef.current === "focus") {
      setSessions((n) => n + 1);
      void logFocusSession({
        duration: focusSeconds,
        subject: subjectRef.current || null,
      });
      setMode("break");
      setSecondsLeft(breakSeconds);
      toast.success("Focus session complete — take a break!");
      notify("Focus session complete", "Time for a break.");
    } else {
      setMode("focus");
      setSecondsLeft(focusSeconds);
      toast("Break over — back to it.");
      notify("Break over", "Time to focus.");
    }
  }, [focusSeconds, breakSeconds]);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (secondsRef.current <= 1) {
        clearInterval(id);
        complete();
      } else {
        setSecondsLeft((s) => s - 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, complete]);

  function selectPreset(i: number) {
    setPresetIdx(i);
    setMode("focus");
    setRunning(false);
    setSecondsLeft(PRESETS[i].focus * 60);
  }

  function toggleRun() {
    if (
      !running &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
    setRunning((r) => !r);
  }

  function reset() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(focusSeconds);
  }

  const progress = 1 - secondsLeft / totalSeconds;

  return (
    <Card>
      <CardContent className="space-y-6 py-8">
        <div className="flex justify-center gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => selectPreset(i)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                presetIdx === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-accent",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="text-center">
          <span
            className={cn(
              "text-xs font-medium tracking-wide uppercase",
              mode === "focus" ? "text-primary" : "text-chart-2",
            )}
          >
            {mode === "focus" ? "Focus" : "Break"}
          </span>
          <p className="mt-1 font-heading text-6xl font-semibold tabular-nums">
            {mmss(secondsLeft)}
          </p>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              mode === "focus" ? "bg-primary" : "bg-chart-2",
            )}
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>

        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What are you focusing on? (optional)"
          className="text-center"
        />

        <div className="flex items-center justify-center gap-2">
          <Button onClick={toggleRun} size="lg" className="min-w-32">
            {running ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {running ? "Pause" : "Start"}
          </Button>
          <Button onClick={reset} variant="outline" size="lg">
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {sessions} focus session{sessions === 1 ? "" : "s"} this visit
        </p>
      </CardContent>
    </Card>
  );
}
