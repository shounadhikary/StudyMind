import "server-only";

import type { LucideIcon } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { ACHIEVEMENTS, type AchievementStats } from "./definitions";

export interface BadgeView {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  earned: boolean;
  earnedAt: Date | null;
}

async function getStats(userId: string): Promise<AchievementStats> {
  const [documents, quizzes, cardsReviewed, summaries, mindMaps, streak, best] =
    await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.flashcardReview.count({ where: { userId } }),
      prisma.summary.count({ where: { document: { userId } } }),
      prisma.mindMap.count({ where: { userId } }),
      prisma.streak.findUnique({
        where: { userId },
        select: { longestStreak: true },
      }),
      prisma.quizAttempt.aggregate({ where: { userId }, _max: { score: true } }),
    ]);

  return {
    documents,
    quizzes,
    cardsReviewed,
    summaries,
    mindMaps,
    longestStreak: streak?.longestStreak ?? 0,
    bestQuizScore: best._max.score ?? 0,
  };
}

/** Compute stats, award any newly-earned badges, and return all badges + stats. */
export async function evaluateAndAward(
  userId: string,
): Promise<{ stats: AchievementStats; badges: BadgeView[] }> {
  const stats = await getStats(userId);

  const existing = await prisma.achievement.findMany({
    where: { userId },
    select: { badgeKey: true, earnedAt: true },
  });
  const earnedAtByKey = new Map(existing.map((e) => [e.badgeKey, e.earnedAt]));

  const newlyEarned = ACHIEVEMENTS.filter(
    (a) => a.earned(stats) && !earnedAtByKey.has(a.key),
  ).map((a) => a.key);

  if (newlyEarned.length > 0) {
    await prisma.achievement.createMany({
      data: newlyEarned.map((badgeKey) => ({ userId, badgeKey })),
      skipDuplicates: true,
    });
    const now = new Date();
    for (const key of newlyEarned) earnedAtByKey.set(key, now);
  }

  const badges: BadgeView[] = ACHIEVEMENTS.map((a) => ({
    key: a.key,
    label: a.label,
    description: a.description,
    icon: a.icon,
    earned: earnedAtByKey.has(a.key),
    earnedAt: earnedAtByKey.get(a.key) ?? null,
  }));

  return { stats, badges };
}
