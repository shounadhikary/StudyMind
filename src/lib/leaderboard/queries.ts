import "server-only";

import { prisma } from "@/lib/db/prisma";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  quizzes: number;
  reviews: number;
  streak: number;
}

export async function getMyLeaderboardPref(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true, name: true },
  });
  const prefs = (user?.preferences as Record<string, unknown> | null) ?? {};
  return {
    optedIn: prefs.leaderboardOptIn === true,
    name:
      typeof prefs.leaderboardName === "string"
        ? prefs.leaderboardName
        : (user?.name ?? ""),
  };
}

/** XP = quiz score sum / 10  +  cards reviewed  +  current streak × 20. */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    where: { preferences: { path: ["leaderboardOptIn"], equals: true } },
    select: { id: true, name: true, preferences: true },
  });
  if (users.length === 0) return [];

  const ids = users.map((u) => u.id);
  const [quizGroups, reviewGroups, streaks] = await Promise.all([
    prisma.quizAttempt.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _sum: { score: true },
      _count: { _all: true },
    }),
    prisma.flashcardReview.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _count: { _all: true },
    }),
    prisma.streak.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, currentStreak: true },
    }),
  ]);

  const quizMap = new Map(
    quizGroups.map((g) => [
      g.userId,
      { sum: g._sum.score ?? 0, count: g._count._all },
    ]),
  );
  const reviewMap = new Map(reviewGroups.map((g) => [g.userId, g._count._all]));
  const streakMap = new Map(streaks.map((s) => [s.userId, s.currentStreak]));

  return users
    .map((u) => {
      const q = quizMap.get(u.id) ?? { sum: 0, count: 0 };
      const reviews = reviewMap.get(u.id) ?? 0;
      const streak = streakMap.get(u.id) ?? 0;
      const xp = Math.round(q.sum / 10) + reviews + streak * 20;
      const prefs = (u.preferences as Record<string, unknown> | null) ?? {};
      const name =
        typeof prefs.leaderboardName === "string" && prefs.leaderboardName
          ? prefs.leaderboardName
          : (u.name ?? "Student");
      return { userId: u.id, name, xp, quizzes: q.count, reviews, streak };
    })
    .sort((a, b) => b.xp - a.xp);
}
