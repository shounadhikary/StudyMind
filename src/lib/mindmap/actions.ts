"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserId } from "@/lib/auth/require-user";
import { generateMindMap as generateMindMapTree } from "./generate";

export type GenerateMindMapResult =
  | { ok: true; mapId: string }
  | { ok: false; error: string };

export async function generateMindMap(
  documentId: string,
): Promise<GenerateMindMapResult> {
  const userId = await requireUserId();
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, title: true, rawText: true },
  });
  if (!doc?.rawText) {
    return { ok: false, error: "This document has no text to map." };
  }

  let tree;
  try {
    tree = await generateMindMapTree(doc.rawText, doc.title);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Mind map generation failed.",
    };
  }
  if (!tree.children || tree.children.length === 0) {
    return { ok: false, error: "Couldn't extract concepts. Please retry." };
  }

  const map = await prisma.mindMap.create({
    data: {
      documentId,
      userId,
      structure: tree as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/mind-maps");
  return { ok: true, mapId: map.id };
}

export async function deleteMindMap(id: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.mindMap.deleteMany({ where: { id, userId } });
  revalidatePath("/mind-maps");
}
