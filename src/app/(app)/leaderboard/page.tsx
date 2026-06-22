import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LeaderboardOptIn } from "@/components/leaderboard/opt-in-card";
import { getLeaderboard, getMyLeaderboardPref } from "@/lib/leaderboard/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Leaderboard" };

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [pref, entries] = await Promise.all([
    getMyLeaderboardPref(userId),
    getLeaderboard(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leaderboard"
        description="Opt-in study rankings - XP from quizzes, reviews, and streaks."
      />

      <LeaderboardOptIn optedIn={pref.optedIn} name={pref.name} />

      {entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No one's on the leaderboard yet"
          description="Be the first to join - opt in above and start earning XP."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const isMe = entry.userId === userId;
            return (
              <Card
                key={entry.userId}
                className={cn(isMe && "border-primary/50 bg-primary/5")}
              >
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="w-8 text-center text-lg font-semibold tabular-nums">
                    {i < 3 ? MEDAL[i] : <span className="text-muted-foreground">{i + 1}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {entry.name}
                      {isMe ? (
                        <span className="ml-2 text-xs text-primary">You</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.quizzes} quizzes · {entry.reviews} reviews ·{" "}
                      {entry.streak}-day streak
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{entry.xp}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
