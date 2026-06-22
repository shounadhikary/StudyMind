"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/require-user";
import { PRIORITIES, STATUSES, type TaskPriority, type TaskStatus } from "./types";

export type TaskActionResult = { ok: true } | { ok: false; error: string };

function parsePriority(value: unknown): TaskPriority {
  return PRIORITIES.includes(value as TaskPriority)
    ? (value as TaskPriority)
    : "MEDIUM";
}
function parseStatus(value: unknown): TaskStatus {
  return STATUSES.includes(value as TaskStatus)
    ? (value as TaskStatus)
    : "TODO";
}
function parseDueDate(value: FormDataEntryValue | null): Date | null {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createTask(
  formData: FormData,
): Promise<TaskActionResult> {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };

  const documentId = String(formData.get("documentId") ?? "").trim() || null;

  await prisma.task.create({
    data: {
      userId,
      title,
      subject: String(formData.get("subject") ?? "").trim() || null,
      dueDate: parseDueDate(formData.get("dueDate")),
      priority: parsePriority(formData.get("priority")),
      status: parseStatus(formData.get("status")),
      documentId: documentId && documentId !== "none" ? documentId : null,
    },
  });
  revalidatePath("/planner");
  return { ok: true };
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<TaskActionResult> {
  const userId = await requireUserId();
  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: { status: parseStatus(status) },
  });
  if (result.count === 0) return { ok: false, error: "Task not found." };
  revalidatePath("/planner");
  return { ok: true };
}

export async function rescheduleTask(
  id: string,
  dueDate: string | null,
): Promise<TaskActionResult> {
  const userId = await requireUserId();
  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: { dueDate: dueDate ? parseDueDate(dueDate) : null },
  });
  if (result.count === 0) return { ok: false, error: "Task not found." };
  revalidatePath("/planner");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.task.deleteMany({ where: { id, userId } });
  revalidatePath("/planner");
}
