import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, FileText, MessagesSquare } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UploadDialog } from "@/components/documents/upload-dialog";
import {
  ChatInterface,
  type ChatMessageView,
} from "@/components/chat/chat-interface";
import {
  getDocumentChat,
  listChatableDocuments,
} from "@/lib/chat/queries";
import type { Citation } from "@/lib/rag/context";

export const metadata: Metadata = { title: "AI Chat" };

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string }>;
}) {
  const { doc } = await searchParams;
  const { userId } = await auth();
  if (!userId) return null;

  // A specific document is selected → show the chat thread.
  if (doc) {
    const data = await getDocumentChat(userId, doc);
    if (!data) {
      return (
        <EmptyState
          icon={MessagesSquare}
          title="Document not found"
          description="This document doesn't exist or isn't yours."
          action={
            <Button render={<Link href="/chat" />}>Back to chat</Button>
          }
        />
      );
    }

    const initialMessages: ChatMessageView[] = (data.chat?.messages ?? []).map(
      (m) => ({
        id: m.id,
        role: m.role === "ASSISTANT" ? "assistant" : "user",
        content: m.content,
        citations:
          (m.citations as unknown as Citation[] | null) ?? undefined,
      }),
    );

    return (
      <div className="space-y-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
            render={<Link href="/chat" />}
          >
            <ArrowLeft className="size-4" />
            All documents
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {data.document.title}
          </h1>
        </div>

        <ChatInterface
          documentId={data.document.id}
          indexed={data.document._count.chunks > 0}
          initialChatId={data.chat?.id ?? null}
          initialMessages={initialMessages}
        />
      </div>
    );
  }

  // No document selected → pick one.
  const documents = await listChatableDocuments(userId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Chat"
        description="Pick a document to ask questions about — answers come with citations."
        actions={documents.length > 0 ? <UploadDialog /> : undefined}
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No documents to chat with yet"
          description="Upload a PDF or paste notes first, then come back to ask questions about it."
          action={<UploadDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((d) => (
            <Link key={d.id} href={`/chat?doc=${d.id}`} className="group">
              <Card className="flex h-full items-start gap-3 p-5 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium leading-tight">
                    {d.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d._count.chunks > 0
                      ? "Ready to chat"
                      : "Will be prepared on open"}
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
