import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { FileText } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { DocumentCard } from "@/components/documents/document-card";
import { listDocuments } from "@/lib/documents/queries";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const { userId } = await auth();
  const documents = userId ? await listDocuments(userId) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documents"
        description="Upload PDFs or paste notes, then generate AI study material."
        actions={<UploadDialog />}
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first PDF or paste some notes to get started. StudyMind extracts the text and turns it into summaries, quizzes, flashcards, and more."
          action={<UploadDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
