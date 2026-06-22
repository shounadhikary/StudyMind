"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateDeck } from "@/lib/flashcards/actions";

const COUNTS = [10, 15, 20];

export function DeckGenerator({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [count, setCount] = React.useState(10);
  const [pending, startTransition] = React.useTransition();

  function generate() {
    startTransition(async () => {
      const result = await generateDeck(documentId, count);
      if (result.ok) {
        toast.success("Deck ready");
        router.push(`/flashcards/${result.deckId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generate a new deck</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Cards</p>
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
          {pending ? "Generating…" : "Generate deck"}
        </Button>
      </CardContent>
    </Card>
  );
}
