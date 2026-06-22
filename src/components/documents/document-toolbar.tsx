"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDocument, renameDocument } from "@/lib/documents/actions";

export function DocumentToolbar({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = String(new FormData(event.currentTarget).get("title") ?? "");
    startTransition(async () => {
      const result = await renameDocument(id, next);
      if (result.ok) {
        toast.success("Renamed");
        setRenameOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      await deleteDocument(id); // redirects to /documents on success
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Document actions" />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Rename document</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitRename} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rename-title">Title</Label>
              <Input
                id="rename-title"
                name="title"
                defaultValue={title}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the document and everything generated from
              it - summaries, quizzes, flashcards, and chat history. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
