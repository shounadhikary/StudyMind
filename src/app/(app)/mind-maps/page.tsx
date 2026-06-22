import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Network } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentPickerGrid } from "@/components/shared/document-picker";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { MindMapGenerator } from "@/components/mindmap/mind-map-generator";
import { listMindMaps } from "@/lib/mindmap/queries";
import { listChatableDocuments } from "@/lib/chat/queries";

export const metadata: Metadata = { title: "Mind Maps" };

export default async function MindMapsPage({
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
          icon={Network}
          title="Document not found"
          description="This document doesn't exist or isn't yours."
          action={<Button render={<Link href="/mind-maps" />}>Back</Button>}
        />
      );
    }

    const maps = await listMindMaps(userId, doc);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2 text-muted-foreground"
              render={<Link href="/mind-maps" />}
            >
              <ArrowLeft className="size-4" />
              All documents
            </Button>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {document.title}
            </h1>
          </div>
          <MindMapGenerator documentId={doc} />
        </div>

        {maps.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No mind maps yet. Generate one to visualize this document&apos;s
            concepts.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {maps.map((m) => (
              <Link
                key={m.id}
                href={`/mind-maps/${m.id}`}
                className="group block"
              >
                <Card className="flex h-full items-start gap-3 p-5 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Network className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium leading-tight">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.branchCount} branches ·{" "}
                      {new Date(m.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const documents = await listChatableDocuments(userId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mind Maps"
        description="Pick a document and turn its concepts into an interactive map."
        actions={documents.length > 0 ? <UploadDialog /> : undefined}
      />
      {documents.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No documents to map yet"
          description="Upload a PDF or paste notes first, then generate a mind map from it."
          action={<UploadDialog />}
        />
      ) : (
        <DocumentPickerGrid
          documents={documents.map((d) => ({
            id: d.id,
            title: d.title,
            subtitle: d.pageCount ? `${d.pageCount} pages` : undefined,
          }))}
          hrefPrefix="/mind-maps?doc="
        />
      )}
    </div>
  );
}
