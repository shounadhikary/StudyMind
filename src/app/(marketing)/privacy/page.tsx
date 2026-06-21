import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How StudyMind handles your data.",
};

const SECTIONS = [
  {
    heading: "What we store",
    body: "When you sign in, we store your account details (name, email, avatar) and the study materials you upload — documents, generated summaries, quizzes, flashcards, and your study activity. This is what powers your personalized study experience.",
  },
  {
    heading: "How your documents are used",
    body: "Your uploaded documents are processed to extract text, create embeddings for search, and generate study material. This processing happens through AI providers (Google Gemini and Groq). Your content is used to serve your requests — it is not sold.",
  },
  {
    heading: "Third-party services",
    body: "We rely on Clerk for authentication, Supabase for database and file storage, and Google Gemini and Groq for AI features. Each processes data only as needed to provide their part of the service.",
  },
  {
    heading: "Your control",
    body: "You can delete your documents and your account at any time. Deleting a document removes its derived study material; deleting your account removes your data.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This is a portfolio project. The policy below describes how the app is
        designed to handle data.
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
