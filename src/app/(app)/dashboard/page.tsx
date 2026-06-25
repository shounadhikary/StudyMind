import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { format, subDays, formatDistanceToNow } from "date-fns";
import {
  Upload,
  FileText,
  MessagesSquare,
  ListChecks,
  Layers,
  Network,
  CalendarDays,
  Timer,
  TrendingUp,
  ArrowRight,
  Brain,
  Flame,
  Check,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { StudyTimeChart } from "@/components/analytics/charts";
import { listDocuments } from "@/lib/documents/queries";
import { listTasks } from "@/lib/tasks/queries";
import {
  getOverviewStats,
  getStudyTimeSeries,
} from "@/lib/analytics/queries";

export const metadata: Metadata = { title: "Dashboard" };

const FEATURES = [
  {
    icon: FileText,
    title: "Document Summary",
    description: "TL;DR, key points, and section-by-section breakdowns.",
    href: "/documents",
  },
  {
    icon: MessagesSquare,
    title: "AI Chat with citations",
    description: "Ask questions and get answers grounded in your documents.",
    href: "/chat",
  },
  {
    icon: ListChecks,
    title: "Quiz Generator",
    description: "Auto-generate MCQ, true/false, and short-answer quizzes.",
    href: "/quiz",
  },
  {
    icon: Layers,
    title: "Flashcards + Spaced Repetition",
    description:
      "Anki-style SM-2 scheduling so you review right when you're about to forget.",
    href: "/flashcards",
  },
  {
    icon: Network,
    title: "Mind Maps",
    description:
      "Turn a document into an interactive, pannable map of how concepts connect.",
    href: "/mind-maps",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description:
      "Plan tasks on a calendar, track what's due, and feed it into your progress.",
    href: "/planner",
  },
  {
    icon: Timer,
    title: "Pomodoro + Focus",
    description:
      "Configurable focus sessions that log straight into your analytics.",
    href: "/planner",
  },
  {
    icon: TrendingUp,
    title: "Progress & Insights",
    description:
      "Study-time trends, quiz accuracy, and automatic focus-area detection.",
    href: "/progress",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [documents, tasks, overview, series] = await Promise.all([
    listDocuments(userId),
    listTasks(userId),
    getOverviewStats(userId),
    getStudyTimeSeries(userId, 7),
  ]);

  const recentDocs = documents.slice(0, 3);
  const tasksDone = tasks.filter((t) => t.status === "DONE").length;
  const weekMinutes = series.reduce((sum, p) => sum + p.value, 0);
  const studyHours = Math.round((weekMinutes / 60) * 10) / 10;

  // Last 7 days, oldest -> newest, with weekday labels + activity flag.
  const today = new Date();
  const week = series.map((point, i) => {
    const date = subDays(today, series.length - 1 - i);
    return {
      letter: format(date, "EEEEE"),
      label: format(date, "EEE"),
      value: point.value,
      active: point.value > 0,
    };
  });
  const chartData = week.map((d) => ({ date: d.label, value: d.value }));

  return (
    <div className="space-y-8">
      <OnboardingTour />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-500/15 via-card/70 to-card/50 p-8 shadow-sm sm:p-10">
        <div className="relative z-10 max-w-xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Study{" "}
            <span className="text-emerald-500 dark:text-emerald-400">
              smarter
            </span>
            , not harder.
          </h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            One workspace for your documents and every AI study tool built
            around them.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              render={<Link href="/documents" />}
            >
              <Upload className="size-4" />
              Upload Document
            </Button>
            <p className="text-xs text-muted-foreground">
              Supports{" "}
              <span className="font-medium text-foreground">PDF</span> &amp;
              pasted notes
            </p>
          </div>
        </div>

        {/* Decorative cluster (desktop only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 items-center justify-center lg:flex"
        >
          <div className="absolute size-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex size-28 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-500 shadow-lg dark:text-emerald-400">
            <Brain className="size-12" />
          </div>
          <span className="absolute top-10 right-10 flex size-11 items-center justify-center rounded-2xl border bg-card text-emerald-500 shadow-md dark:text-emerald-400">
            <MessagesSquare className="size-5" />
          </span>
          <span className="absolute right-8 bottom-12 flex size-11 items-center justify-center rounded-2xl border bg-card text-emerald-500 shadow-md dark:text-emerald-400">
            <ListChecks className="size-5" />
          </span>
        </div>
      </section>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Link key={feature.title} href={feature.href} className="group">
            <Card className="relative h-full pb-10 bg-card/40 transition-colors hover:border-emerald-500/50">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <feature.icon className="size-5" />
                </span>
                <CardTitle className="mt-4 text-base text-pretty">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-pretty">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <ArrowRight className="absolute right-4 bottom-4 size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Data row */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1.3fr]">
        {/* Recent documents */}
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/documents" />}>
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {recentDocs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No documents yet.{" "}
                <Link
                  href="/documents"
                  className="text-emerald-500 hover:underline dark:text-emerald-400"
                >
                  Upload one
                </Link>
                .
              </p>
            ) : (
              recentDocs.map((doc) => {
                const isPdf =
                  doc.pageCount != null ||
                  !!doc.fileUrl?.toLowerCase().endsWith(".pdf");
                const meta = [
                  isPdf ? "PDF" : "Note",
                  doc.pageCount ? `${doc.pageCount} pages` : null,
                  formatDistanceToNow(doc.createdAt, { addSuffix: true }),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {meta}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Study streak */}
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">Study Streak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <Flame className="size-9 text-orange-500" />
              <div>
                <p className="font-heading text-2xl font-semibold tabular-nums">
                  {overview.currentStreak}{" "}
                  {overview.currentStreak === 1 ? "day" : "days"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview.currentStreak > 0 ? "Keep it up!" : "Start today"}
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              {week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {d.letter}
                  </span>
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full",
                      d.active
                        ? "bg-emerald-600 text-white"
                        : "border text-muted-foreground",
                    )}
                  >
                    {d.active ? <Check className="size-3.5" /> : null}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* This week */}
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-heading text-2xl font-semibold tabular-nums">
                  {studyHours}
                </p>
                <p className="text-xs text-muted-foreground">Study Hours</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold tabular-nums">
                  {overview.averageAccuracy != null
                    ? `${overview.averageAccuracy}%`
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground">Quiz Accuracy</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold tabular-nums">
                  {tasksDone}
                </p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
            <StudyTimeChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
