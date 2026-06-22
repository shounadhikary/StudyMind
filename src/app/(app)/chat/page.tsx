import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, FileText, MessagesSquare } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { NewChatPicker } from "@/components/chat/new-chat-picker";
import {
  ChatInterface,
  type ChatMessageView,
} from "@/components/chat/chat-interface";
import {
  getChat,
  listChats,
  listChatableDocuments,
} from "@/lib/chat/queries";
import type { Citation } from "@/lib/rag/context";

export const metadata: Metadata = { title: "AI Chat" };

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const { chat: chatId } = await searchParams;
  const { userId } = await auth();
  if (!userId) return null;

  // An existing chat is open.
  if (chatId) {
    const data = await getChat(userId, chatId);
    if (!data) {
      return (
        <EmptyState
          icon={MessagesSquare}
          title="Chat not found"
          description="This chat doesn't exist or isn't yours."
          action={<Button render={<Link href="/chat" />}>Back to chat</Button>}
        />
      );
    }

    const initialMessages: ChatMessageView[] = data.chat.messages.map((m) => ({
      id: m.id,
      role: m.role === "ASSISTANT" ? "assistant" : "user",
      content: m.content,
      citations: (m.citations as unknown as Citation[] | null) ?? undefined,
    }));

    return (
      <div className="space-y-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 text-muted-foreground"
            render={<Link href="/chat" />}
          >
            <ArrowLeft className="size-4" />
            All chats
          </Button>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {data.chat.title}
          </h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {data.documents.map((d) => (
              <span
                key={d.id}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                <FileText className="size-3" />
                {d.title}
              </span>
            ))}
          </div>
        </div>

        <ChatInterface chatId={data.chat.id} initialMessages={initialMessages} />
      </div>
    );
  }

  // No chat open → start a new one or resume a recent one.
  const [documents, chats] = await Promise.all([
    listChatableDocuments(userId),
    listChats(userId),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Chat"
        description="Chat across one or more documents — answers come with citations."
        actions={documents.length > 0 ? <UploadDialog /> : undefined}
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No documents to chat with yet"
          description="Upload a PDF or paste notes first, then start a chat about it."
          action={<UploadDialog />}
        />
      ) : (
        <>
          <NewChatPicker
            documents={documents.map((d) => ({
              id: d.id,
              title: d.title,
              subtitle:
                d._count.chunks > 0
                  ? "Ready"
                  : "Will be prepared on start",
            }))}
          />

          {chats.length > 0 ? (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground">
                Recent chats
              </h2>
              <div className="mt-3 space-y-2">
                {chats.map((c) => (
                  <Link
                    key={c.id}
                    href={`/chat?chat=${c.id}`}
                    className="group block"
                  >
                    <Card className="flex items-center justify-between p-3.5 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MessagesSquare className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {c.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c._count.messages} message
                            {c._count.messages === 1 ? "" : "s"} ·{" "}
                            {c.documentIds.length} doc
                            {c.documentIds.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
