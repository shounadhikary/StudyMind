import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, ListChecks } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentPickerGrid } from "@/components/shared/document-picker";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { QuizGenerator } from "@/components/quiz/quiz-generator";
import { listQuizzes } from "@/lib/quiz/queries";
import { listChatableDocuments } from "@/lib/chat/queries";
import { getPreferences } from "@/lib/settings/preferences";
import { DIFFICULTY_LABELS } from "@/lib/quiz/types";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({
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
          icon={ListChecks}
          title="Document not found"
          description="This document doesn't exist or isn't yours."
          action={<Button render={<Link href="/quiz" />}>Back</Button>}
        />
      );
    }

    const [quizzes, prefs] = await Promise.all([
      listQuizzes(userId, doc),
      getPreferences(userId),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
            render={<Link href="/quiz" />}
          >
            <ArrowLeft className="size-4" />
            All documents
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {document.title}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <QuizGenerator
            documentId={doc}
            initialDifficulty={prefs.defaultDifficulty}
          />

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Your quizzes
            </h2>
            {quizzes.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                No quizzes yet. Generate one to get started.
              </Card>
            ) : (
              quizzes.map((q) => (
                <Link key={q.id} href={`/quiz/${q.id}`} className="group block">
                  <Card className="flex items-center justify-between p-4 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ListChecks className="size-4.5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {q.questionCount} questions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {q.attemptCount > 0
                            ? `${q.attemptCount} attempt${q.attemptCount > 1 ? "s" : ""}`
                            : "Not attempted"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.bestScore != null ? (
                        <span className="text-sm font-medium tabular-nums">
                          Best {q.bestScore}%
                        </span>
                      ) : null}
                      <Badge variant="secondary">
                        {DIFFICULTY_LABELS[q.difficulty]}
                      </Badge>
                    </div>
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
        title="Quiz"
        description="Pick a document, then generate and take quizzes."
        actions={documents.length > 0 ? <UploadDialog /> : undefined}
      />
      {documents.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No documents to quiz on yet"
          description="Upload a PDF or paste notes first, then generate a quiz from it."
          action={<UploadDialog />}
        />
      ) : (
        <DocumentPickerGrid
          documents={documents.map((d) => ({
            id: d.id,
            title: d.title,
            subtitle: d.pageCount ? `${d.pageCount} pages` : undefined,
          }))}
          hrefPrefix="/quiz?doc="
        />
      )}
    </div>
  );
}
