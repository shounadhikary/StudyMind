import Link from "next/link";
import { FileText } from "lucide-react";

import { Card } from "@/components/ui/card";

export interface PickerDoc {
  id: string;
  title: string;
  subtitle?: string;
}

/**
 * Grid of selectable documents. `hrefPrefix` is joined with each id, e.g.
 * "/quiz?doc=" -> "/quiz?doc=<id>".
 */
export function DocumentPickerGrid({
  documents,
  hrefPrefix,
}: {
  documents: PickerDoc[];
  hrefPrefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Link key={doc.id} href={`${hrefPrefix}${doc.id}`} className="group">
          <Card className="flex h-full items-start gap-3 p-5 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium leading-tight">
                {doc.title}
              </h3>
              {doc.subtitle ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {doc.subtitle}
                </p>
              ) : null}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
