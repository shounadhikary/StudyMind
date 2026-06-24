import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "StudyMind is an AI-powered study companion built to help students learn faster and remember longer.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        About StudyMind
      </h1>
      <div className="mt-8 space-y-6 text-muted-foreground text-pretty text-justify">
        <p>
          StudyMind is an AI-powered study companion. Students upload their
          study materials - PDFs, notes, slides - and the app turns them into
          summaries, cited answers, quizzes, flashcards, and mind maps, then
          helps them stay on track with planning and progress insights.
        </p>
        <p>
          The goal is simple: spend less time organizing material and more time
          actually learning it. Every AI feature is grounded in your own
          documents, and answers come with citations so you can trust them.
        </p>
        <p>
          This project is built as a full-stack engineering portfolio piece. Two
          ideas sit at its core: a{" "}
          <span className="font-medium text-foreground">
            multi-provider AI architecture
          </span>{" "}
          that swaps between Google Gemini and Groq with automatic fallback, and
          a{" "}
          <span className="font-medium text-foreground">
            from-scratch RAG pipeline
          </span>{" "}
          (no frameworks) that powers document chat with real citations.
        </p>
        <p>
          It is honest software: no fake certifications, and no claims about
          things that don&apos;t exist yet. Features still in progress are
          clearly marked.
        </p>
      </div>
    </div>
  );
}
