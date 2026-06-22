"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { indexDocument } from "@/lib/rag/index-document";

export type CreateChatResult =
  | { ok: true; chatId: string }
  | { ok: false; error: string };

/** Start a chat over one or more documents (multi-document RAG). */
export async function createChat(
  documentIds: string[],
): Promise<CreateChatResult> {
  const userId = await requireUserId();
  const ids = [...new Set(documentIds.filter(Boolean))];
  if (ids.length === 0) {
    return { ok: false, error: "Select at least one document." };
  }

  const docs = await prisma.document.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true, title: true, rawText: true, _count: { select: { chunks: true } } },
  });
  if (docs.length === 0) return { ok: false, error: "Documents not found." };

  // Best-effort: index any selected document that isn't chat-ready yet.
  for (const doc of docs) {
    if (doc._count.chunks === 0 && doc.rawText) {
      try {
        await indexDocument(doc.id, { rawText: doc.rawText });
      } catch (error) {
        console.error("[chat] indexing failed for", doc.id, error);
      }
    }
  }

  const title =
    docs.length === 1
      ? docs[0].title
      : `${docs[0].title} +${docs.length - 1}`;

  const chat = await prisma.chat.create({
    data: { userId, documentIds: docs.map((d) => d.id), title },
  });

  revalidatePath("/chat");
  return { ok: true, chatId: chat.id };
}

export async function deleteChat(chatId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.chat.deleteMany({ where: { id: chatId, userId } });
  revalidatePath("/chat");
}
