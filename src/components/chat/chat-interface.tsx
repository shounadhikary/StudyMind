"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { reindexDocument } from "@/lib/documents/actions";
import { cn } from "@/lib/utils";
import type { Citation } from "@/lib/rag/context";

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

function decodeCitations(header: string | null): Citation[] {
  if (!header) return [];
  try {
    const bytes = Uint8Array.from(atob(header), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Citation[];
  } catch {
    return [];
  }
}

export function ChatInterface({
  documentId,
  indexed,
  initialChatId,
  initialMessages,
}: {
  documentId: string;
  indexed: boolean;
  initialChatId: string | null;
  initialMessages: ChatMessageView[];
}) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatMessageView[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [preparing, setPreparing] = React.useState(false);
  const chatIdRef = React.useRef<string | null>(initialChatId);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const question = input.trim();
    if (!question || streaming) return;
    setInput("");

    const userMsg: ChatMessageView = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
    };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          chatId: chatIdRef.current,
          message: question,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(await res.text().catch(() => "Request failed"));
      }
      chatIdRef.current = res.headers.get("x-chat-id") ?? chatIdRef.current;
      const citations = decodeCitations(res.headers.get("x-citations"));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
        );
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: acc, citations } : m,
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
    }
  }

  function prepareDocument() {
    setPreparing(true);
    reindexDocument(documentId)
      .then((result) => {
        if (result.ok) {
          toast.success("Document is ready to chat");
          router.refresh();
        } else {
          toast.error(result.error);
        }
      })
      .finally(() => setPreparing(false));
  }

  if (!indexed) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Prepare this document for chat"
        description="We need to index this document (chunk + embed its text) before you can ask questions about it."
        action={
          <Button onClick={prepareDocument} disabled={preparing}>
            {preparing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {preparing ? "Preparing…" : "Prepare for chat"}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col rounded-xl border bg-card">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <p className="mt-4 font-heading text-lg font-semibold">
              Ask anything about this document
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
              Answers are grounded in the document text, with citations to the
              exact sources.
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question… (Enter to send, Shift+Enter for a new line)"
            rows={1}
            className="max-h-40 min-h-10 resize-none"
            disabled={streaming}
          />
          <Button
            size="icon"
            onClick={send}
            disabled={streaming || !input.trim()}
            aria-label="Send"
          >
            {streaming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessageView }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap text-pretty",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          {message.content || (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {!isUser && message.citations && message.citations.length > 0 ? (
          <Citations citations={message.citations} />
        ) : null}
      </div>
    </div>
  );
}

function Citations({ citations }: { citations: Citation[] }) {
  return (
    <div className="space-y-1.5 pl-1">
      <p className="text-xs font-medium text-muted-foreground">Sources</p>
      <div className="flex flex-col gap-1.5">
        {citations.map((c) => (
          <div
            key={c.ref}
            className="rounded-lg border bg-background px-3 py-2 text-xs"
          >
            <span className="font-medium text-primary">[{c.ref}]</span>{" "}
            {c.pageNumber != null ? (
              <span className="text-muted-foreground">page {c.pageNumber}</span>
            ) : null}
            <p className="mt-1 text-muted-foreground text-pretty">{c.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
