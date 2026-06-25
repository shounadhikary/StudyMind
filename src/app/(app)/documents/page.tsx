import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { FileText } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentCard } from "@/components/documents/document-card";
import { listDocuments } from "@/lib/documents/queries";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Upload PDFs or paste notes, then generate AI study material."
        actions={<UploadDialog />}
      />
      <Suspense fallback={<DocumentsSkeleton />}>
        <DocumentList />
      </Suspense>
    </div>
  );
}

function DocumentsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}

async function DocumentList() {
  const { userId } = await auth();
  const documents = userId ? await listDocuments(userId) : [];

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Upload your first PDF or paste some notes to get started. StudyMind extracts the text and turns it into summaries, quizzes, flashcards, and more."
        action={<UploadDialog />}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} />
      ))}
    </div>
  );
}
