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

/** A user's chats, newest first. */
export function listChats(userId: string) {
  return prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      documentIds: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export type ChatListItem = Awaited<ReturnType<typeof listChats>>[number];

/** A single chat (scoped to owner) with messages + the documents it covers. */
export async function getChat(userId: string, chatId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!chat) return null;

  const documents = await prisma.document.findMany({
    where: { id: { in: chat.documentIds }, userId },
    select: { id: true, title: true },
  });

  return { chat, documents };
}
