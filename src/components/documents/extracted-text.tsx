"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExtractedText({ text }: { text: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = text.length > 1200;

  return (
    <div>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card",
          !expanded && isLong && "max-h-72",
        )}
      >
        <pre className="px-4 py-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-card-foreground/90">
          {text}
        </pre>
        {!expanded && isLong ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
        ) : null}
      </div>
      {isLong ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "Show less" : "Show full text"}
        </Button>
      ) : null}
    </div>
  );
}
