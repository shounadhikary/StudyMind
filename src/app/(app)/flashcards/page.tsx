import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Layers } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentPickerGrid } from "@/components/shared/document-picker";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { DeckGenerator } from "@/components/flashcards/deck-generator";
import { listDecks } from "@/lib/flashcards/queries";
import { listChatableDocuments } from "@/lib/chat/queries";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc } = await searchParams;
  const { userId } = await auth();
  if (!userId) return null;

  if (doc) {
    const document = await prisma.document.findFirst({
      where: { id: doc, userId },
      select: { id: true, title: true },
    });
    if (!document) {
      return (
        <EmptyState
          icon={Layers}
          title="Document not found"
          description="This document doesn't exist or isn't yours."
          action={<Button render={<Link href="/flashcards" />}>Back</Button>}
        />
      );
    }

    const decks = await listDecks(userId, doc);

    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
            render={<Link href="/flashcards" />}
          >
            <ArrowLeft className="size-4" />
            All documents
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {document.title}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <DeckGenerator documentId={doc} />

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Your decks
            </h2>
            {decks.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                No decks yet. Generate one to start studying.
              </Card>
            ) : (
              decks.map((d) => (
                <Link
                  key={d.id}
                  href={`/flashcards/${d.id}`}
                  className="group block"
                >
                  <Card className="flex items-center justify-between p-4 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{d.total} cards</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {d.due > 0 ? (
                      <Badge>{d.due} due</Badge>
                    ) : (
                      <Badge variant="secondary">Caught up</Badge>
                    )}
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const documents = await listChatableDocuments(userId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Flashcards"
        description="Pick a document, generate a deck, and study with spaced repetition."
        actions={documents.length > 0 ? <UploadDialog /> : undefined}
      />
      {documents.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No documents to study yet"
          description="Upload a PDF or paste notes first, then generate flashcards from it."
          action={<UploadDialog />}
        />
      ) : (
        <DocumentPickerGrid
          documents={documents.map((d) => ({
            id: d.id,
            title: d.title,
            subtitle: d.pageCount ? `${d.pageCount} pages` : undefined,
          }))}
          hrefPrefix="/flashcards?doc="
        />
      )}
    </div>
  );
}
