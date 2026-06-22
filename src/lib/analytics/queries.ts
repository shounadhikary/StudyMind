import "server-only";

import { format, startOfDay, subDays } from "date-fns";

import { prisma } from "@/lib/db/prisma";

export interface OverviewStats {
  studyMinutes: number;
  quizzesTaken: number;
  averageAccuracy: number | null;
  cardsReviewed: number;
  currentStreak: number;
}

export async function getOverviewStats(userId: string): Promise<OverviewStats> {
  const [focus, quizAgg, cardsReviewed, streak] = await Promise.all([
    prisma.focusSession.aggregate({
      where: { userId },
      _sum: { duration: true },
    }),
    prisma.quizAttempt.aggregate({
      where: { userId },
      _avg: { score: true },
      _count: { _all: true },
    }),
    prisma.flashcardReview.count({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
  ]);

  return {
    studyMinutes: Math.round((focus._sum.duration ?? 0) / 60),
    quizzesTaken: quizAgg._count._all,
    averageAccuracy:
      quizAgg._avg.score != null ? Math.round(quizAgg._avg.score) : null,
    cardsReviewed,
    currentStreak: streak?.currentStreak ?? 0,
  };
}

export interface DaySeriesPoint {
  date: string; // "MMM d"
  value: number;
}

function emptySeries(days: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    map.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
  }
  return map;
}

function toSeries(map: Map<string, number>): DaySeriesPoint[] {
  return [...map.entries()].map(([key, value]) => ({
    date: format(new Date(key), "MMM d"),
    value,
  }));
}

/** Study minutes per day for the last `days` days. */
export async function getStudyTimeSeries(
  userId: string,
  days = 14,
): Promise<DaySeriesPoint[]> {
  const since = startOfDay(subDays(new Date(), days - 1));
  const sessions = await prisma.focusSession.findMany({
    where: { userId, completedAt: { gte: since } },
    select: { duration: true, completedAt: true },
  });
  const map = emptySeries(days);
  for (const s of sessions) {
    const key = format(s.completedAt, "yyyy-MM-dd");
    if (map.has(key)) map.set(key, map.get(key)! + s.duration / 60);
  }
  for (const [k, v] of map) map.set(k, Math.round(v));
  return toSeries(map);
}

/** Flashcards reviewed per day for the last `days` days. */
export async function getCardsReviewedSeries(
  userId: string,
  days = 14,
): Promise<DaySeriesPoint[]> {
  const since = startOfDay(subDays(new Date(), days - 1));
  const reviews = await prisma.flashcardReview.findMany({
    where: { userId, reviewedAt: { gte: since } },
    select: { reviewedAt: true },
  });
  const map = emptySeries(days);
  for (const r of reviews) {
    const key = format(r.reviewedAt, "yyyy-MM-dd");
    if (map.has(key)) map.set(key, map.get(key)! + 1);
  }
  return toSeries(map);
}

export interface AccuracyPoint {
  label: string;
  score: number;
}

/** Quiz accuracy over recent attempts (oldest → newest). */
export async function getQuizAccuracyTrend(
  userId: string,
  take = 12,
): Promise<AccuracyPoint[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { takenAt: "desc" },
    take,
    select: { score: true, takenAt: true },
  });
  return attempts
    .reverse()
    .map((a, i) => ({ label: `#${i + 1}`, score: Math.round(a.score) }));
}

export interface SubjectSlice {
  subject: string;
  minutes: number;
}

/** Study minutes grouped by subject (top 6). */
export async function getSubjectBreakdown(
  userId: string,
): Promise<SubjectSlice[]> {
  const grouped = await prisma.focusSession.groupBy({
    by: ["subject"],
    where: { userId },
    _sum: { duration: true },
  });
  return grouped
    .map((g) => ({
      subject: g.subject?.trim() || "Unlabeled",
      minutes: Math.round((g._sum.duration ?? 0) / 60),
    }))
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6);
}

export interface WeakArea {
  documentId: string;
  title: string;
  averageScore: number;
  attempts: number;
}

/** Average quiz score per document, lowest first (the "focus areas"). */
export async function getWeakAreas(userId: string): Promise<WeakArea[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    select: {
      score: true,
      quiz: {
        select: { documentId: true, document: { select: { title: true } } },
      },
    },
  });

  const byDoc = new Map<
    string,
    { title: string; total: number; count: number }
  >();
  for (const a of attempts) {
    const id = a.quiz.documentId;
    const entry = byDoc.get(id) ?? {
      title: a.quiz.document.title,
      total: 0,
      count: 0,
    };
    entry.total += a.score;
    entry.count += 1;
    byDoc.set(id, entry);
  }

  return [...byDoc.entries()]
    .map(([documentId, e]) => ({
      documentId,
      title: e.title,
      averageScore: Math.round(e.total / e.count),
      attempts: e.count,
    }))
    .sort((a, b) => a.averageScore - b.averageScore);
}
