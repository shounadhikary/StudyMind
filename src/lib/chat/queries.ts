import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Documents available to chat with (with index status), newest first. */
export function listChatableDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      pageCount: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
  });
}

export type ChatableDocument = Awaited<
  ReturnType<typeof listChatableDocuments>
>[number];

/** The document being chatted with plus its latest chat thread + messages. */
export async function getDocumentChat(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: {
      id: true,
      title: true,
      _count: { select: { chunks: true } },
    },
  });
  if (!document) return null;

  const chat = await prisma.chat.findFirst({
    where: { userId, documentIds: { has: documentId } },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return { document, chat };
}
