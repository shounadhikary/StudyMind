import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { Clock, FileText, Flame, Layers, ListChecks } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { evaluateAndAward } from "@/lib/achievements/service";
import { getOverviewStats } from "@/lib/analytics/queries";

export const metadata: Metadata = { title: "Profile" };

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return null;

  const [{ stats, badges }, overview] = await Promise.all([
    evaluateAndAward(user.id),
    getOverviewStats(user.id),
  ]);

  const name = user.fullName ?? user.username ?? "Student";
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    (name.match(/\b\w/g) ?? []).slice(0, 2).join("").toUpperCase() || "U";
  const earnedCount = badges.filter((b) => b.earned).length;

  const statCards = [
    { label: "Study time", value: formatMinutes(overview.studyMinutes), icon: Clock },
    { label: "Documents", value: `${stats.documents}`, icon: FileText },
    { label: "Quizzes", value: `${stats.quizzes}`, icon: ListChecks },
    { label: "Cards reviewed", value: `${stats.cardsReviewed}`, icon: Layers },
    { label: "Day streak", value: `${overview.currentStreak}`, icon: Flame },
  ];

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={name} /> : null}
          <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {name}
          </h1>
          {email ? <p className="text-sm text-muted-foreground">{email}</p> : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Achievements</h2>
          <span className="text-sm text-muted-foreground">
            {earnedCount} of {badges.length} earned
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <Card
              key={b.key}
              className={cn(!b.earned && "opacity-55 grayscale")}
            >
              <CardContent className="flex items-center gap-3 py-4">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    b.earned
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <b.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
