import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using StudyMind.",
};

const SECTIONS = [
  {
    heading: "Using StudyMind",
    body: "StudyMind is provided as-is to help you study. You're responsible for the materials you upload and for using the app in line with your institution's academic-integrity rules.",
  },
  {
    heading: "Your content",
    body: "You keep ownership of the documents you upload. You grant the app permission to process them to generate your study material (summaries, quizzes, flashcards, and so on).",
  },
  {
    heading: "AI-generated material",
    body: "Summaries, answers, quizzes, and other AI output can be imperfect. Treat them as a study aid, not an authoritative source — always verify against your original material.",
  },
  {
    heading: "Availability",
    body: "This is a portfolio project under active development. Features may change, and the service is offered without warranty.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Plain-language terms for a portfolio project.
      </p>
      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-lg font-semibold">
              {section.heading}
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
