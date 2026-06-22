import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { retrieve } from "@/lib/rag/retrieve";
import { assembleContext } from "@/lib/rag/context";
import { chatStream, type AIChatMessage } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_HISTORY = 10;
const TOP_K = 6;

function buildSystemPrompt(context: string): string {
  return `You are StudyMind's study assistant. Answer the student's question using ONLY the numbered sources below.

Rules:
- Cite sources inline as [1], [2], etc., right after the statement they support.
- If the answer is not in the sources, say you couldn't find it in this document and suggest what to look for instead. Do not invent facts.
- Be clear and concise. Use short paragraphs or bullet points.

Sources:
${context || "(no relevant sources were found for this question)"}`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: { documentId?: unknown; message?: unknown; chatId?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const documentId = typeof body.documentId === "string" ? body.documentId : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const chatIdInput = typeof body.chatId === "string" ? body.chatId : undefined;
  if (!documentId || !message) {
    return new Response("Missing documentId or message", { status: 400 });
  }

  // Verify the document belongs to the user.
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, title: true },
  });
  if (!document) return new Response("Document not found", { status: 404 });

  // Resolve or create the chat thread for this document.
  let chat = chatIdInput
    ? await prisma.chat.findFirst({ where: { id: chatIdInput, userId } })
    : await prisma.chat.findFirst({
        where: { userId, documentIds: { has: documentId } },
        orderBy: { createdAt: "desc" },
      });
  if (!chat) {
    chat = await prisma.chat.create({
      data: { userId, documentIds: [documentId], title: document.title },
    });
  }
  const chatId = chat.id;

  // Persist the user's message.
  await prisma.chatMessage.create({
    data: { chatId, role: "USER", content: message },
  });

  // Retrieve relevant chunks and assemble context + citations.
  const chunks = await retrieve(message, [documentId], { topK: TOP_K });
  const { context, citations } = assembleContext(chunks);

  // Conversation = system prompt + recent history (which includes this message).
  const history = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY,
  });
  history.reverse();

  const messages: AIChatMessage[] = [
    { role: "system", content: buildSystemPrompt(context) },
    ...history.map(
      (m): AIChatMessage => ({
        role: m.role === "ASSISTANT" ? "assistant" : "user",
        content: m.content,
      }),
    ),
  ];

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const token of chatStream(messages, { temperature: 0.3 })) {
          full += token;
          controller.enqueue(encoder.encode(token));
        }
      } catch (error) {
        console.error("[chat] stream failed:", error);
        if (!full) {
          controller.enqueue(
            encoder.encode(
              "Sorry — I couldn't generate a response right now. Please try again.",
            ),
          );
        }
      } finally {
        controller.close();
        try {
          await prisma.chatMessage.create({
            data: {
              chatId,
              role: "ASSISTANT",
              content: full || "(no response)",
              citations: citations as unknown as Prisma.InputJsonValue,
            },
          });
        } catch (error) {
          console.error("[chat] failed to persist assistant message:", error);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "x-chat-id": chatId,
      "x-citations": Buffer.from(JSON.stringify(citations)).toString("base64"),
    },
  });
}
