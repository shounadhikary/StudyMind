"use client";

import * as React from "react";
import { Check, Copy, Loader2, Share2 } from "lucide-react";
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
import { createShareLink, type ShareKind } from "@/lib/share/actions";

export function ShareButton({
  resourceType,
  resourceId,
}: {
  resourceType: ShareKind;
  resourceId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [copied, setCopied] = React.useState(false);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && !url) {
      startTransition(async () => {
        const result = await createShareLink(resourceType, resourceId);
        if (result.ok) {
          setUrl(`${window.location.origin}/share/${result.token}`);
        } else {
          toast.error(result.error);
          setOpen(false);
        }
      });
    }
  }

  function copy() {
    if (!url) return;
    void navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Share2 className="size-4" />
            Share
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Share (read-only)</DialogTitle>
          <DialogDescription>
            Anyone with this link can view it - no account needed.
          </DialogDescription>
        </DialogHeader>
        {pending || !url ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
            <Button onClick={copy} size="icon" variant="outline" aria-label="Copy link">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
