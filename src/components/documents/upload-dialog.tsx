"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createDocumentFromPdf,
  createDocumentFromText,
} from "@/lib/documents/actions";

export function UploadDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const [file, setFile] = React.useState<File | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setDragging(false);
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
  }

  function selectFile(picked: File) {
    if (picked.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }
    setFile(picked);
  }

  function submitPdf(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      toast.error("Choose a PDF first.");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    const title = new FormData(event.currentTarget).get("title");
    if (title) formData.set("title", String(title));

    startTransition(async () => {
      const result = await createDocumentFromPdf(formData);
      if (result.ok) {
        toast.success("Document added");
        setOpen(false);
        reset();
        router.push(`/documents/${result.documentId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function submitText(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createDocumentFromText(formData);
      if (result.ok) {
        toast.success("Note added");
        setOpen(false);
        router.push(`/documents/${result.documentId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button>
              <Upload className="size-4" />
              Upload document
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Add a document</DialogTitle>
          <DialogDescription>
            Upload a PDF or paste your notes. StudyMind extracts the text so you
            can generate summaries, quizzes, and more.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pdf">
          <TabsList className="w-full">
            <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
            <TabsTrigger value="text">Paste text</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf">
            <form onSubmit={submitPdf} className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  if (picked) selectFile(picked);
                }}
              />
              {file ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{file.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
                    dragging
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50 hover:bg-accent/40",
                  )}
                >
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Drag & drop a PDF, or click to browse
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Up to 25 MB · text-based PDFs
                  </span>
                </button>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="pdf-title">Title (optional)</Label>
                <Input
                  id="pdf-title"
                  name="title"
                  placeholder="Defaults to the file name"
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {pending ? "Processing…" : "Upload & extract"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="text">
            <form onSubmit={submitText} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="text-title">Title</Label>
                <Input
                  id="text-title"
                  name="title"
                  placeholder="e.g. Lecture 3 — Thermodynamics"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="text-body">Notes</Label>
                <Textarea
                  id="text-body"
                  name="text"
                  rows={8}
                  placeholder="Paste your notes or any study text here…"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {pending ? "Saving…" : "Add note"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
