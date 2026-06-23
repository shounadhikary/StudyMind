import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { retrieve } from "@/lib/rag/retrieve";
import { assembleContext } from "@/lib/rag/context";
import { chatStream, type AIChatMessage } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_HISTORY = 10;
const TOP_K = 8;

function buildSystemPrompt(context: string): string {
  return `You are StudyMind's study assistant, helping a student understand their own documents. Answer the question using the numbered sources below.

Guidelines:
- Ground every claim in the sources and cite them inline as [1], [2], etc., right after the statement they support.
- Answer directly and helpfully. Synthesize across sources and connect related information. If the exact wording isn't present but relevant material is, give the best answer you can from it (briefly noting any assumption) rather than refusing.
- Interpret the student's intent generously - questions may be short or have typos.
- Only if the sources contain nothing relevant at all, say you couldn't find it in this document and suggest what to look for instead. Never invent facts that aren't supported.
- Be clear, well-structured, and reasonably thorough. Use short paragraphs or bullet points.

Sources:
${context || "(no relevant sources were found for this question)"}`;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  let body: { chatId?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const chatId = typeof body.chatId === "string" ? body.chatId : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!chatId || !message) {
    return new Response("Missing chatId or message", { status: 400 });
  }

  // Verify the chat belongs to the user.
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    select: { id: true, documentIds: true },
  });
  if (!chat) return new Response("Chat not found", { status: 404 });

  // Persist the user's message and bump the chat's updatedAt.
  await prisma.chatMessage.create({
    data: { chatId, role: "USER", content: message },
  });
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  // Retrieve relevant chunks across all of the chat's documents.
  const chunks = await retrieve(message, chat.documentIds, { topK: TOP_K });
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
              "Sorry - I couldn't generate a response right now. Please try again.",
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
