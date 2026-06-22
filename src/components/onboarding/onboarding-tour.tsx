"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "studymind-onboarded";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to StudyMind",
    body: "Your AI study companion. Turn any document into summaries, cited answers, quizzes, flashcards, and mind maps.",
  },
  {
    icon: Upload,
    title: "Start with a document",
    body: "Upload a PDF or paste your notes - we extract the text automatically so the AI can work with it.",
  },
  {
    icon: GraduationCap,
    title: "Study smarter",
    body: "Generate quizzes and flashcards, chat with citations, plan your time, and watch your progress climb.",
  },
];

export function OnboardingTour() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    // One-time: open the tour for first-time visitors.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
  }, []);

  function finish(goToDocuments = false) {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    if (goToDocuments) router.push("/documents");
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) finish();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <current.icon className="size-6" />
          </span>
          <DialogTitle className="font-heading text-xl">
            {current.title}
          </DialogTitle>
          <DialogDescription className="text-pretty">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => finish()}>
              Skip
            </Button>
            {isLast ? (
              <Button size="sm" onClick={() => finish(true)}>
                Get started
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
