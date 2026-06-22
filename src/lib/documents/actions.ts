"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { syncUser } from "@/lib/auth/sync-user";
import { extractPdf } from "./pdf";
import { uploadPdf, deleteFile } from "./storage";
import { summarizeText } from "./summary";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export type ActionResult =
  | { ok: true; documentId: string }
  | { ok: false; error: string };

/** Authenticate and guarantee the user row exists (FK target for documents). */
async function requireUser(): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await syncUser(user);
  return user.id;
}

export async function createDocumentFromText(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUser();
  const title = String(formData.get("title") ?? "").trim() || "Untitled note";
  const text = String(formData.get("text") ?? "").trim();
  if (text.length < 20) {
    return { ok: false, error: "Please paste at least a few sentences of text." };
  }

  const doc = await prisma.document.create({
    data: { userId, title, rawText: text },
  });
  revalidatePath("/documents");
  return { ok: true, documentId: doc.id };
}

export async function createDocumentFromPdf(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Only PDF files are supported." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: "That PDF is larger than 25 MB." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  let extracted;
  try {
    extracted = await extractPdf(bytes);
  } catch {
    return {
      ok: false,
      error: "Couldn't read that PDF — it may be corrupted.",
    };
  }
  if (!extracted.fullText) {
    return {
      ok: false,
      error:
        "No selectable text found. Scanned/image-only PDFs aren't supported yet.",
    };
  }

  const titleInput = String(formData.get("title") ?? "").trim();
  const title =
    titleInput || file.name.replace(/\.pdf$/i, "") || "Untitled document";

  const doc = await prisma.document.create({
    data: {
      userId,
      title,
      rawText: extracted.fullText,
      pageCount: extracted.pageCount,
    },
  });

  // Persist the original file (non-fatal if storage fails — text is saved).
  try {
    const path = await uploadPdf(userId, doc.id, bytes);
    await prisma.document.update({ where: { id: doc.id }, data: { fileUrl: path } });
  } catch (error) {
    console.error("[documents] PDF storage upload failed:", error);
  }

  revalidatePath("/documents");
  return { ok: true, documentId: doc.id };
}

export async function renameDocument(
  id: string,
  title: string,
): Promise<ActionResult> {
  const userId = await requireUser();
  const trimmed = title.trim();
  if (!trimmed) return { ok: false, error: "Title can't be empty." };

  const result = await prisma.document.updateMany({
    where: { id, userId },
    data: { title: trimmed },
  });
  if (result.count === 0) return { ok: false, error: "Document not found." };

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  return { ok: true, documentId: id };
}

export async function deleteDocument(id: string): Promise<void> {
  const userId = await requireUser();
  const doc = await prisma.document.findFirst({
    where: { id, userId },
    select: { id: true, fileUrl: true },
  });
  if (!doc) throw new Error("Document not found");

  if (doc.fileUrl) {
    try {
      await deleteFile(doc.fileUrl);
    } catch {
      // best-effort
    }
  }
  await prisma.document.delete({ where: { id: doc.id } });
  revalidatePath("/documents");
  redirect("/documents");
}

export async function generateSummary(
  documentId: string,
): Promise<ActionResult> {
  const userId = await requireUser();
  const doc = await prisma.document.findFirst({
    where: { id: documentId, userId },
    select: { id: true, rawText: true },
  });
  if (!doc?.rawText) {
    return { ok: false, error: "This document has no text to summarize." };
  }

  let summary;
  try {
    summary = await summarizeText(doc.rawText);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Summary generation failed. Please try again.",
    };
  }

  await prisma.summary.create({
    data: {
      documentId: doc.id,
      content: summary as unknown as Prisma.InputJsonObject,
    },
  });
  revalidatePath(`/documents/${documentId}`);
  return { ok: true, documentId };
}
