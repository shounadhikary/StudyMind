import Link from "next/link";
import {
  FileText,
  Layers,
  ListChecks,
  MessagesSquare,
  Network,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { DocumentListItem } from "@/lib/documents/queries";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentCard({ doc }: { doc: DocumentListItem }) {
  const badges = [
    { count: doc._count.summaries, icon: Sparkles, label: "Summary" },
    { count: doc._count.quizzes, icon: ListChecks, label: "Quiz" },
    { count: doc._count.flashcardDecks, icon: Layers, label: "Cards" },
    { count: doc._count.mindMaps, icon: Network, label: "Map" },
  ].filter((b) => b.count > 0);

  return (
    <Link href={`/documents/${doc.id}`} className="group">
      <Card className="h-full p-5 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium leading-tight">{doc.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(doc.createdAt)}
              {doc.pageCount ? ` · ${doc.pageCount} pages` : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {doc._count.chunks > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <MessagesSquare className="size-3" />
              Chat-ready
            </span>
          ) : null}
          {badges.length > 0 ? (
            badges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                <b.icon className="size-3" />
                {b.count > 1 ? `${b.count} ${b.label}` : b.label}
              </span>
            ))
          ) : doc._count.chunks === 0 ? (
            <span className="text-[11px] text-muted-foreground">
              No study material yet
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
