/** Shared task types - safe to import from client and server. */

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
export const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

/** Client-facing task shape (dueDate as ISO string for safe serialization). */
export interface TaskView {
  id: string;
  title: string;
  subject: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  documentTitle: string | null;
}
