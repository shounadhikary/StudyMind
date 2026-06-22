import { Card, CardContent } from "@/components/ui/card";
import type { FlashcardView } from "@/lib/flashcards/types";

export function PublicDeck({
  title,
  cards,
}: {
  title: string;
  cards: FlashcardView[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Shared flashcards</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <span className="text-sm text-muted-foreground">
            {cards.length} cards
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {cards.map((c) => (
          <Card key={c.id}>
            <CardContent className="grid gap-2 py-4 sm:grid-cols-[1fr_1.5fr]">
              <p className="font-medium text-pretty">{c.front}</p>
              <p className="text-muted-foreground text-pretty sm:border-l sm:pl-4">
                {c.back}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
