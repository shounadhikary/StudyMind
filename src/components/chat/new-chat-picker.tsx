"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Loader2, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createChat } from "@/lib/chat/actions";

export interface PickerDocument {
  id: string;
  title: string;
  subtitle?: string;
}

export function NewChatPicker({ documents }: { documents: PickerDocument[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pending, startTransition] = React.useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function start() {
    startTransition(async () => {
      const result = await createChat([...selected]);
      if (result.ok) router.push(`/chat?chat=${result.chatId}`);
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New chat</CardTitle>
        <CardDescription>
          Select one or more documents to chat across.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const isSelected = selected.has(doc.id);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggle(doc.id)}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                    isSelected && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isSelected ? <Check className="size-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{doc.title}</span>
                  </span>
                  {doc.subtitle ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {doc.subtitle}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        <Button onClick={start} disabled={selected.size === 0 || pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MessagesSquare className="size-4" />
          )}
          Start chat{selected.size > 0 ? ` (${selected.size})` : ""}
        </Button>
      </CardContent>
    </Card>
  );
}
