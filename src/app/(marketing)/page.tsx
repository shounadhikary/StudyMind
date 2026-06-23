import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FileText,
  MessagesSquare,
  ListChecks,
  Layers,
  Network,
  CalendarDays,
  Timer,
  TrendingUp,
  Upload,
  Wand2,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubIcon } from "@/components/shared/brand-icons";
import { StoreBadges } from "@/components/marketing/store-badges";

const FEATURES = [
  {
    icon: FileText,
    title: "Document Summary",
    description:
      "TL;DR, key points, and section-by-section breakdowns of any PDF or notes.",
  },
  {
    icon: MessagesSquare,
    title: "AI Chat with citations",
    description:
      "Ask questions and get answers grounded in your documents, with page-level citations.",
  },
  {
    icon: ListChecks,
    title: "Quiz Generator",
    description:
      "Auto-generate MCQ, true/false, and short-answer quizzes across three difficulty levels.",
  },
  {
    icon: Layers,
    title: "Flashcards + Spaced Repetition",
    description:
      "Anki-style SM-2 scheduling so you review right when you're about to forget.",
  },
  {
    icon: Network,
    title: "Mind Maps",
    description:
      "Turn a document into an interactive, pannable map of how concepts connect.",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description:
      "Plan tasks on a calendar, track what's due, and feed it into your progress.",
  },
  {
    icon: Timer,
    title: "Pomodoro + Focus",
    description:
      "Configurable focus sessions that log straight into your analytics.",
  },
  {
    icon: TrendingUp,
    title: "Progress & Insights",
    description:
      "Study-time trends, quiz accuracy, and automatic focus-area detection.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drop in a PDF or paste your notes - text is extracted server-side.",
  },
  {
    icon: Wand2,
    title: "Generate",
    description:
      "AI builds summaries, quizzes, flashcards, and mind maps from your material.",
  },
  {
    icon: GraduationCap,
    title: "Master",
    description:
      "Study with spaced repetition, chat for doubts, and watch your progress climb.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI-powered study companion
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Learn faster. Remember longer.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
          Upload your study materials and let StudyMind turn them into
          summaries, cited answers, quizzes, flashcards, and mind maps - then
          keep you on track with planning and progress insights.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/dashboard" />}>
            Get started free
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
              />
            }
          >
            <GitHubIcon className="size-4" />
            View source
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Powered by Gemini &amp; Groq
        </p>
        <StoreBadges className="mt-8 justify-center" />
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Everything you need to study smarter
            </h2>
            <p className="mt-4 text-muted-foreground text-pretty">
              One workspace for your documents and every AI study tool built
              around them.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/60 transition-colors hover:border-border"
              >
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <CardTitle className="mt-3 text-base">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-pretty">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              From PDF to mastery in three steps
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-xl border bg-card text-primary">
                  <step.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  <span className="text-muted-foreground">{index + 1}. </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t bg-card/30">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            Ready to turn your notes into knowledge?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-pretty">
            Start with your first document - it only takes a minute.
          </p>
          <div className="mt-8">
            <Button size="lg" render={<Link href="/dashboard" />}>
              Get started free
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
