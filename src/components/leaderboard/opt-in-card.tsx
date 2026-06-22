"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setLeaderboardOptIn } from "@/lib/leaderboard/actions";

export function LeaderboardOptIn({
  optedIn,
  name,
}: {
  optedIn: boolean;
  name: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState(name);
  const [pending, startTransition] = React.useTransition();

  function save(optIn: boolean) {
    startTransition(async () => {
      const result = await setLeaderboardOptIn(optIn, displayName);
      if (result.ok) {
        toast.success(
          optIn ? "You're on the leaderboard" : "Removed from leaderboard",
        );
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className={optedIn ? "" : "border-primary/40"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="size-4 text-primary" />
          {optedIn ? "You're on the leaderboard" : "Join the leaderboard"}
        </CardTitle>
        <CardDescription>
          Opt-in only. Earn XP from quizzes, flashcard reviews, and streaks. Your
          activity stays private unless you join, and you can leave anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="lb-name">Display name</Label>
          <Input
            id="lb-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you'll appear"
            maxLength={40}
          />
        </div>
        <div className="flex gap-2">
          {optedIn ? (
            <Button
              variant="outline"
              onClick={() => save(false)}
              disabled={pending}
            >
              Leave
            </Button>
          ) : null}
          <Button onClick={() => save(true)} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {optedIn ? "Update" : "Join"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
