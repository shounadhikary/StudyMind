import "server-only";

import { differenceInCalendarDays, startOfDay } from "date-fns";

import { prisma } from "@/lib/db/prisma";

/**
 * Record study activity for today and update the user's streak.
 * Same-day activity is a no-op; consecutive days increment; gaps reset to 1.
 */
export async function recordActivity(
  userId: string,
  now: Date = new Date(),
): Promise<void> {
  const today = startOfDay(now);
  const streak = await prisma.streak.findUnique({ where: { userId } });

  if (!streak) {
    await prisma.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    });
    return;
  }

  let current = 1;
  if (streak.lastActiveDate) {
    const diff = differenceInCalendarDays(today, startOfDay(streak.lastActiveDate));
    if (diff === 0) return; // already counted today
    current = diff === 1 ? streak.currentStreak + 1 : 1;
  }

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: current,
      longestStreak: Math.max(streak.longestStreak, current),
      lastActiveDate: today,
    },
  });
}
