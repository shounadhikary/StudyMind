"use client";

import * as React from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
        An unexpected error occurred. You can try again, and if it keeps
        happening, refresh the page.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground/70">
          Ref: {error.digest}
        </p>
      ) : null}
      <Button className="mt-6" onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
