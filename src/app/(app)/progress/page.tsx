import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import {
  Clock,
  Flame,
  Layers,
  ListChecks,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AccuracyChart,
  CardsChart,
  StudyTimeChart,
  SubjectChart,
} from "@/components/analytics/charts";
import {
  getCardsReviewedSeries,
  getOverviewStats,
  getQuizAccuracyTrend,
  getStudyTimeSeries,
  getSubjectBreakdown,
  getWeakAreas,
} from "@/lib/analytics/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Progress" };

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default async function ProgressPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [overview, studyTime, cards, accuracy, subjects, weak] =
    await Promise.all([
      getOverviewStats(userId),
      getStudyTimeSeries(userId),
      getCardsReviewedSeries(userId),
      getQuizAccuracyTrend(userId),
      getSubjectBreakdown(userId),
      getWeakAreas(userId),
    ]);

  const hasData =
    overview.studyMinutes > 0 ||
    overview.quizzesTaken > 0 ||
    overview.cardsReviewed > 0;

  const stats = [
    { label: "Study time", value: formatMinutes(overview.studyMinutes), icon: Clock },
    { label: "Quizzes taken", value: `${overview.quizzesTaken}`, icon: ListChecks },
    {
      label: "Avg accuracy",
      value: overview.averageAccuracy != null ? `${overview.averageAccuracy}%` : "—",
      icon: Target,
    },
    { label: "Cards reviewed", value: `${overview.cardsReviewed}`, icon: Layers },
    { label: "Day streak", value: `${overview.currentStreak}`, icon: Flame },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Progress"
        description="Your study time, accuracy trends, and focus areas."
      />

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No activity yet"
          description="Run a Pomodoro session, take a quiz, or review some flashcards — your stats and charts will appear here."
        />
      ) : (
        <>
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription>{s.label}</CardDescription>
                    <s.icon className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl tabular-nums">
                    {s.value}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Study time</CardTitle>
                <CardDescription>Minutes per day, last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                <StudyTimeChart data={studyTime} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quiz accuracy</CardTitle>
                <CardDescription>Recent attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {accuracy.length > 0 ? (
                  <AccuracyChart data={accuracy} />
                ) : (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    Take a quiz to see your accuracy trend.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cards reviewed</CardTitle>
                <CardDescription>Per day, last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                <CardsChart data={cards} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Study by subject</CardTitle>
                <CardDescription>Focus time breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {subjects.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <SubjectChart data={subjects} />
                    </div>
                    <ul className="space-y-1.5 text-sm">
                      {subjects.map((s, i) => (
                        <li key={s.subject} className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              background: [
                                "var(--color-chart-1)",
                                "var(--color-chart-2)",
                                "var(--color-chart-3)",
                                "var(--color-chart-4)",
                                "var(--color-chart-5)",
                                "var(--color-muted-foreground)",
                              ][i % 6],
                            }}
                          />
                          <span className="text-muted-foreground">
                            {s.subject}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    Add a subject to your focus sessions to see a breakdown.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Focus areas (weakness detection) */}
          {weak.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="size-4 text-chart-3" />
                  Focus areas
                </CardTitle>
                <CardDescription>
                  Documents with your lowest quiz accuracy — worth another look.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {weak.map((w) => (
                    <li
                      key={w.documentId}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{w.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {w.attempts} attempt{w.attempts === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          w.averageScore < 50
                            ? "text-destructive"
                            : w.averageScore < 70
                              ? "text-chart-3"
                              : "text-chart-2",
                        )}
                      >
                        {w.averageScore}%
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
