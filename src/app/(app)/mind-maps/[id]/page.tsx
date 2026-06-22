import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MindMapCanvas } from "@/components/mindmap/mind-map-canvas";
import { getMindMap } from "@/lib/mindmap/queries";
import { flattenMindMap } from "@/lib/mindmap/flatten";
import type { MindMapTree } from "@/lib/mindmap/types";

export const metadata: Metadata = { title: "Mind Map" };

export default async function MindMapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const map = userId ? await getMindMap(id, userId) : null;
  if (!map) notFound();

  const tree = map.structure as unknown as MindMapTree;
  const graph = flattenMindMap(tree);

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 text-muted-foreground"
          render={<Link href={`/mind-maps?doc=${map.document.id}`} />}
        >
          <ArrowLeft className="size-4" />
          {map.document.title}
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {tree.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to pan, scroll to zoom, and use the +/- buttons to expand or
          collapse branches.
        </p>
      </div>

      <MindMapCanvas graph={graph} />
    </div>
  );
}
