"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { generateSummary } from "@/lib/documents/actions";
import type { DocumentSummary } from "@/lib/documents/types";

export function SummarySection({
  documentId,
  summary,
}: {
  documentId: string;
  summary: DocumentSummary | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateSummary(documentId);
      if (result.ok) {
        toast.success(summary ? "Summary regenerated" : "Summary ready");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (pending) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No summary yet"
        description="Generate a structured AI summary - a TL;DR, key points, and a section-by-section breakdown."
        action={
          <Button onClick={handleGenerate}>
            <Sparkles className="size-4" />
            Generate summary
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Summary</h2>
        <Button variant="ghost" size="sm" onClick={handleGenerate}>
          <RefreshCw className="size-3.5" />
          Regenerate
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6 py-6">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              TL;DR
            </h3>
            <p className="mt-2 text-pretty">{summary.tldr}</p>
          </div>

          {summary.keyPoints?.length ? (
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Key points
              </h3>
              <ul className="mt-2 space-y-1.5">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-pretty">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {summary.sections?.length ? (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Breakdown
              </h3>
              {summary.sections.map((section, i) => (
                <div key={i}>
                  <h4 className="font-medium">{section.heading}</h4>
                  <ul className="mt-1.5 space-y-1">
                    {section.points.map((point, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground text-pretty"
                      >
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
