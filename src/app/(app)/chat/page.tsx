import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "AI Chat" };

export default function ChatPage() {
  return (
    <FeaturePlaceholder
      title="AI Chat"
      description="Ask questions about your documents and get cited answers."
      icon={MessagesSquare}
      phase="Phase 3"
      highlights={[
        "From-scratch RAG: chunk → embed → pgvector retrieval",
        "Fast streaming answers via Groq (Llama 3.3 70B)",
        "Page-level citations you can actually trust",
        "Chat scoped to one or many documents at once",
      ]}
    />
  );
}
