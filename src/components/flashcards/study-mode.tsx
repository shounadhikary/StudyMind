"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reviewCard } from "@/lib/flashcards/actions";
import { RATINGS, type Rating } from "@/lib/sr/sm2";
import type { FlashcardView } from "@/lib/flashcards/types";

const RATING_STYLES: Record<Rating, string> = {
  again: "border-destructive/40 text-destructive hover:bg-destructive/10",
  hard: "border-chart-3/40 text-chart-3 hover:bg-chart-3/10",
  good: "border-primary/40 text-primary hover:bg-primary/10",
  easy: "border-chart-2/40 text-chart-2 hover:bg-chart-2/10",
};

export function StudyMode({
  documentId,
  cards,
}: {
  documentId: string;
  cards: FlashcardView[];
}) {
  const router = useRouter();
  const [queue, setQueue] = React.useState<FlashcardView[]>(cards);
  const [flipped, setFlipped] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(0);
  const [pending, setPending] = React.useState(false);

  const current = queue[0];
  const initialCount = cards.length;

  const rate = React.useCallback(
    (rating: Rating) => {
      if (!current || pending) return;
      setPending(true);
      reviewCard(current.id, rating)
        .then((result) => {
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          setReviewed((n) => n + 1);
          setFlipped(false);
          setQueue((prev) => {
            const [card, ...rest] = prev;
            // "Again" cards reappear at the end of this session.
            return rating === "again" ? [...rest, card] : rest;
          });
        })
        .finally(() => setPending(false));
    },
    [current, pending],
  );

  // Keyboard: Space/Enter flips; 1-4 rate when flipped.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        rate(RATINGS[Number(e.key) - 1].value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, rate]);

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
          <Check className="size-6" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-semibold">
          Session complete
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You reviewed {reviewed} card{reviewed === 1 ? "" : "s"}. Spaced
          repetition will resurface them when it&apos;s time.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" render={<Link href={`/flashcards?doc=${documentId}`} />}>
            Back to decks
          </Button>
          <Button onClick={() => router.refresh()}>
            <RotateCcw className="size-4" />
            Study again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{reviewed} reviewed</span>
        <span>{queue.length} left</span>
      </div>

      <div style={{ perspective: 1200 }} className="select-none">
        <motion.div
          key={current.id}
          onClick={() => setFlipped((f) => !f)}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-72 w-full cursor-pointer"
        >
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-sm"
          >
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Front
            </span>
            <p className="mt-3 text-lg font-medium text-pretty">{current.front}</p>
            <span className="absolute bottom-4 text-xs text-muted-foreground">
              Click or press Space to flip
            </span>
          </div>
          <div
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-sm"
          >
            <span className="text-xs font-medium tracking-wide text-primary uppercase">
              Back
            </span>
            <p className="mt-3 text-pretty">{current.back}</p>
          </div>
        </motion.div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r, i) => (
            <button
              key={r.value}
              type="button"
              disabled={pending}
              onClick={() => rate(r.value)}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                RATING_STYLES[r.value],
              )}
            >
              {r.label}
              <span className="ml-1 text-xs opacity-60">{i + 1}</span>
            </button>
          ))}
        </div>
      ) : (
        <Button className="w-full" onClick={() => setFlipped(true)}>
          Show answer
        </Button>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {initialCount} card{initialCount === 1 ? "" : "s"} in this session
      </p>
    </div>
  );
}
