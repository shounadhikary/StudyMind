"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { submitQuizAttempt } from "@/lib/quiz/actions";
import type { QuizAnswers, QuizQuestion, QuizResult } from "@/lib/quiz/types";

export function QuizRunner({
  quizId,
  questions,
}: {
  quizId: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<QuizAnswers>({});
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  const total = questions.length;
  const current = questions[index];
  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function submit() {
    startTransition(async () => {
      const res = await submitQuizAttempt(quizId, answers);
      if (res.ok) {
        setResult(res.result);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function retake() {
    setAnswers({});
    setIndex(0);
    setResult(null);
  }

  if (result) {
    return <QuizResults questions={questions} result={result} onRetake={retake} />;
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5 py-6">
          <p className="font-medium text-pretty">{current.question}</p>

          {current.type === "short_answer" ? (
            <Input
              value={answers[current.id] ?? ""}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer…"
            />
          ) : (
            <div className="space-y-2">
              {(current.options ?? []).map((option) => {
                const selected = answers[current.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswer(option)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "hover:bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border",
                        selected && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {selected ? <Check className="size-3" /> : null}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        {index < total - 1 ? (
          <Button onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit quiz
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizResults({
  questions,
  result,
  onRetake,
}: {
  questions: QuizQuestion[];
  result: QuizResult;
  onRetake: () => void;
}) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const tone =
    result.score >= 80 ? "text-chart-2" : result.score >= 50 ? "text-chart-3" : "text-destructive";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-muted-foreground">Your score</p>
          <p className={cn("mt-1 font-heading text-5xl font-semibold tabular-nums", tone)}>
            {result.score}%
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.correctCount} of {result.total} correct
          </p>
          <Button variant="outline" className="mt-6" onClick={onRetake}>
            <RotateCcw className="size-4" />
            Retake quiz
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {result.results.map((r, i) => {
          const q = byId.get(r.id);
          return (
            <Card key={r.id}>
              <CardContent className="space-y-2 py-5">
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white",
                      r.correct ? "bg-chart-2" : "bg-destructive",
                    )}
                  >
                    {r.correct ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </span>
                  <p className="font-medium text-pretty">
                    {i + 1}. {q?.question}
                  </p>
                </div>
                <div className="space-y-1 pl-7 text-sm">
                  <p className={r.correct ? "text-muted-foreground" : "text-destructive"}>
                    Your answer: {r.userAnswer || "-"}
                  </p>
                  {!r.correct ? (
                    <p className="text-chart-2">Correct answer: {r.correctAnswer}</p>
                  ) : null}
                  {r.explanation ? (
                    <p className="text-muted-foreground text-pretty">
                      {r.explanation}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
