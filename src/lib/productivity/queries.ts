import "server-only";

import { startOfDay, subDays, format } from "date-fns";

import { prisma } from "@/lib/db/prisma";

export function getStreak(userId: string) {
  return prisma.streak.findUnique({ where: { userId } });
}

export function getDailyGoal(userId: string) {
  return prisma.goal.findFirst({
    where: { userId, type: "STUDY_MINUTES", period: "DAILY" },
    orderBy: { createdAt: "desc" },
  });
}

/** Minutes of focus logged today. */
export async function getTodayFocusMinutes(userId: string): Promise<number> {
  const agg = await prisma.focusSession.aggregate({
    where: { userId, completedAt: { gte: startOfDay(new Date()) } },
    _sum: { duration: true },
  });
  return Math.round((agg._sum.duration ?? 0) / 60);
}

export function getRecentFocusSessions(userId: string, take = 5) {
  return prisma.focusSession.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take,
    select: {
      id: true,
      duration: true,
      subject: true,
      completedAt: true,
      document: { select: { title: true } },
    },
  });
}

export interface HeatmapDay {
  date: string; // yyyy-MM-dd
  minutes: number;
}

/** Per-day focus minutes for the last `days` days (for the streak heatmap). */
export async function getFocusHeatmap(
  userId: string,
  days = 84,
): Promise<HeatmapDay[]> {
  const since = startOfDay(subDays(new Date(), days - 1));
  const sessions = await prisma.focusSession.findMany({
    where: { userId, completedAt: { gte: since } },
    select: { duration: true, completedAt: true },
  });

  const byDay = new Map<string, number>();
  for (const s of sessions) {
    const key = format(s.completedAt, "yyyy-MM-dd");
    byDay.set(key, (byDay.get(key) ?? 0) + s.duration);
  }

  const result: HeatmapDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    result.push({ date: key, minutes: Math.round((byDay.get(key) ?? 0) / 60) });
  }
  return result;
}
