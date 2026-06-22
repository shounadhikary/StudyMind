"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateQuiz } from "@/lib/quiz/actions";
import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/quiz/types";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const COUNTS = [5, 10, 15];

export function QuizGenerator({
  documentId,
  initialDifficulty = "MEDIUM",
}: {
  documentId: string;
  initialDifficulty?: Difficulty;
}) {
  const router = useRouter();
  const [difficulty, setDifficulty] =
    React.useState<Difficulty>(initialDifficulty);
  const [count, setCount] = React.useState(5);
  const [pending, startTransition] = React.useTransition();

  function generate() {
    startTransition(async () => {
      const result = await generateQuiz(documentId, difficulty, count);
      if (result.ok) {
        toast.success("Quiz ready");
        router.push(`/quiz/${result.quizId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generate a new quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  difficulty === d
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-accent",
                )}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Questions</p>
          <div className="flex gap-2">
            {COUNTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCount(c)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  count === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-accent",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generate} disabled={pending} className="w-full">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {pending ? "Generating…" : "Generate quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}
