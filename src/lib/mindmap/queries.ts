import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { MindMapTree } from "./types";

/** Mind maps for a document, with derived title + branch count. */
export async function listMindMaps(userId: string, documentId: string) {
  const maps = await prisma.mindMap.findMany({
    where: { userId, documentId },
    orderBy: { createdAt: "desc" },
    select: { id: true, structure: true, createdAt: true },
  });

  return maps.map((m) => {
    const tree = m.structure as unknown as MindMapTree | null;
    return {
      id: m.id,
      title: tree?.title ?? "Mind map",
      branchCount: Array.isArray(tree?.children) ? tree.children.length : 0,
      createdAt: m.createdAt,
    };
  });
}

export type MindMapListItem = Awaited<ReturnType<typeof listMindMaps>>[number];

/** A single mind map (scoped to owner) with its document. */
export function getMindMap(id: string, userId: string) {
  return prisma.mindMap.findFirst({
    where: { id, userId },
    include: { document: { select: { id: true, title: true } } },
  });
}
