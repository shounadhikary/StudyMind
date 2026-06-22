import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StudyMode } from "@/components/flashcards/study-mode";
import { ExportMenu } from "@/components/export/export-menu";
import { ShareButton } from "@/components/share/share-button";
import { getDeck } from "@/lib/flashcards/queries";

export const metadata: Metadata = { title: "Study" };

export default async function DeckStudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const { userId } = await auth();
  const data = userId ? await getDeck(deckId, userId) : null;
  if (!data) notFound();

  const sessionCards = data.dueCards.length > 0 ? data.dueCards : data.allCards;
  const allCaughtUp = data.dueCards.length === 0 && data.total > 0;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 text-muted-foreground"
          render={<Link href={`/flashcards?doc=${data.deck.documentId}`} />}
        >
          <ArrowLeft className="size-4" />
          Decks
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {data.deck.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {allCaughtUp
                ? `All caught up — reviewing all ${data.total} cards`
                : `${data.dueCards.length} due · ${data.total} total`}
            </p>
          </div>
          {data.total > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <ExportMenu
                kind="deck"
                title={data.deck.title}
                cards={data.allCards}
              />
              <ShareButton
                resourceType="FLASHCARD_DECK"
                resourceId={data.deck.id}
              />
            </div>
          ) : null}
        </div>
      </div>

      {data.total === 0 ? (
        <EmptyState
          icon={Layers}
          title="This deck is empty"
          description="Something went wrong generating cards. Try creating a new deck."
        />
      ) : (
        <StudyMode documentId={data.deck.documentId} cards={sessionCards} />
      )}
    </div>
  );
}
