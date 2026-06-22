"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadText, slugify } from "@/lib/export/download";
import { exportPdf } from "@/lib/export/pdf";
import {
  flashcardsToCsv,
  flashcardsToPdfBlocks,
  notesToMarkdown,
  quizToMarkdown,
  quizToPdfBlocks,
  summaryToMarkdown,
  summaryToPdfBlocks,
} from "@/lib/export/format";
import type { DocumentSummary } from "@/lib/documents/types";
import type { QuizQuestion } from "@/lib/quiz/types";

type Card = { front: string; back: string };

type Props =
  | {
      kind: "document";
      title: string;
      summary: DocumentSummary | null;
      rawText: string;
    }
  | { kind: "quiz"; title: string; questions: QuizQuestion[] }
  | { kind: "deck"; title: string; cards: Card[] };

interface Item {
  label: string;
  run: () => void | Promise<void>;
}

function buildItems(props: Props): Item[] {
  const slug = slugify(props.title);

  if (props.kind === "document") {
    const items: Item[] = [];
    if (props.summary) {
      const summary = props.summary;
      items.push({
        label: "Summary (PDF)",
        run: () =>
          exportPdf(
            `${slug}-summary.pdf`,
            props.title,
            summaryToPdfBlocks(summary),
          ),
      });
      items.push({
        label: "Summary (Markdown)",
        run: () =>
          downloadText(
            `${slug}-summary.md`,
            summaryToMarkdown(props.title, summary),
            "text/markdown;charset=utf-8",
          ),
      });
    }
    items.push({
      label: "Notes (Markdown)",
      run: () =>
        downloadText(
          `${slug}-notes.md`,
          notesToMarkdown(props.title, props.rawText),
          "text/markdown;charset=utf-8",
        ),
    });
    return items;
  }

  if (props.kind === "quiz") {
    return [
      {
        label: "Quiz (PDF)",
        run: () =>
          exportPdf(`${slug}-quiz.pdf`, props.title, quizToPdfBlocks(props.questions)),
      },
      {
        label: "Quiz (Markdown)",
        run: () =>
          downloadText(
            `${slug}-quiz.md`,
            quizToMarkdown(props.title, props.questions),
            "text/markdown;charset=utf-8",
          ),
      },
    ];
  }

  return [
    {
      label: "Anki (CSV)",
      run: () =>
        downloadText(
          `${slug}-flashcards.csv`,
          flashcardsToCsv(props.cards),
          "text/csv;charset=utf-8",
        ),
    },
    {
      label: "Flashcards (PDF)",
      run: () =>
        exportPdf(
          `${slug}-flashcards.pdf`,
          props.title,
          flashcardsToPdfBlocks(props.cards),
        ),
    },
  ];
}

export function ExportMenu(props: Props) {
  const items = buildItems(props);
  if (items.length === 0) return null;

  async function handle(item: Item) {
    try {
      await item.run();
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem key={item.label} onClick={() => handle(item)}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
