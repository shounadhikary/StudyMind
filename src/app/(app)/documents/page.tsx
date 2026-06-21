import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <FeaturePlaceholder
      title="Documents"
      description="Upload PDFs or paste notes, then generate AI study material."
      icon={FileText}
      phase="Phase 2"
      highlights={[
        "Drag & drop PDF upload, or paste raw text",
        "Server-side text extraction with pdf-parse",
        "Document list with status, page count, and dates",
        "One home for every derived artifact (summary, quiz, cards…)",
      ]}
    />
  );
}
