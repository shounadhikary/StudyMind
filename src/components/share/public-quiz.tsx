import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS, type Difficulty, type QuizQuestion } from "@/lib/quiz/types";

function isCorrect(option: string, answer: string) {
  return option.trim().toLowerCase() === answer.trim().toLowerCase();
}

export function PublicQuiz({
  title,
  difficulty,
  questions,
}: {
  title: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Shared quiz</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <Badge variant="secondary">{DIFFICULTY_LABELS[difficulty]}</Badge>
          <span className="text-sm text-muted-foreground">
            {questions.length} questions
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardContent className="space-y-3 py-5">
              <p className="font-medium text-pretty">
                {i + 1}. {q.question}
              </p>
              {q.options?.length ? (
                <div className="space-y-1.5">
                  {q.options.map((opt) => {
                    const correct = isCorrect(opt, q.answer);
                    return (
                      <div
                        key={opt}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                          correct
                            ? "border-chart-2/50 bg-chart-2/10"
                            : "border-border",
                        )}
                      >
                        {correct ? (
                          <Check className="size-4 text-chart-2" />
                        ) : (
                          <span className="size-4" />
                        )}
                        {opt}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm">
                  <span className="text-muted-foreground">Answer: </span>
                  <span className="font-medium text-chart-2">{q.answer}</span>
                </p>
              )}
              {q.explanation ? (
                <p className="text-sm text-muted-foreground text-pretty">
                  {q.explanation}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
