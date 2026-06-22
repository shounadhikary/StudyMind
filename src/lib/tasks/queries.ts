import "server-only";

import { prisma } from "@/lib/db/prisma";

/** All tasks for a user, with the linked document title (if any). */
export function listTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      subject: true,
      dueDate: true,
      priority: true,
      status: true,
      documentId: true,
      document: { select: { title: true } },
    },
  });
}

export type TaskItem = Awaited<ReturnType<typeof listTasks>>[number];

/** Documents a task can be linked to. */
export function listLinkableDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
}
