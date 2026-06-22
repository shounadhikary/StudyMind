import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getDocument } from "@/lib/documents/queries";
import { SummarySection } from "@/components/documents/summary-section";
import { DocumentToolbar } from "@/components/documents/document-toolbar";
import { ExtractedText } from "@/components/documents/extracted-text";
import { ExportMenu } from "@/components/export/export-menu";
import type { DocumentSummary } from "@/lib/documents/types";

export const metadata: Metadata = { title: "Document" };

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const doc = userId ? await getDocument(id, userId) : null;
  if (!doc) notFound();

  const summary =
    (doc.summaries[0]?.content as unknown as DocumentSummary | undefined) ??
    null;
  const created = new Date(doc.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 text-muted-foreground"
          render={<Link href="/documents" />}
        >
          <ArrowLeft className="size-4" />
          Documents
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
              {doc.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {created}
              </span>
              {doc.pageCount ? (
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  {doc.pageCount} pages
                </span>
              ) : null}
              <span className="uppercase">{doc.language}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ExportMenu
              kind="document"
              title={doc.title}
              summary={summary}
              rawText={doc.rawText ?? ""}
            />
            <DocumentToolbar id={doc.id} title={doc.title} />
          </div>
        </div>
      </div>

      <SummarySection documentId={doc.id} summary={summary} />

      <Separator />

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Extracted text</h2>
        {doc.rawText ? (
          <ExtractedText text={doc.rawText} />
        ) : (
          <p className="text-sm text-muted-foreground">No text extracted.</p>
        )}
      </section>
    </div>
  );
}
