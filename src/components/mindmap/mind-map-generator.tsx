"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Network } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { generateMindMap } from "@/lib/mindmap/actions";

export function MindMapGenerator({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function generate() {
    startTransition(async () => {
      const result = await generateMindMap(documentId);
      if (result.ok) {
        toast.success("Mind map ready");
        router.push(`/mind-maps/${result.mapId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={generate} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Network className="size-4" />
      )}
      {pending ? "Generating…" : "Generate mind map"}
    </Button>
  );
}
