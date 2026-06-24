import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  FileText,
  MessagesSquare,
  ListChecks,
  Layers,
  Network,
  CalendarDays,
  Timer,
  TrendingUp,
  ArrowRight,
  Brain,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

export const metadata: Metadata = { title: "Dashboard" };

const FEATURES = [
  {
    icon: FileText,
    title: "Document Summary",
    description: "TL;DR, key points, and section-by-section breakdowns.",
    href: "/documents",
  },
  {
    icon: MessagesSquare,
    title: "AI Chat with citations",
    description: "Ask questions and get answers grounded in your documents.",
    href: "/chat",
  },
  {
    icon: ListChecks,
    title: "Quiz Generator",
    description: "Auto-generate MCQ, true/false, and short-answer quizzes.",
    href: "/quiz",
  },
  {
    icon: Layers,
    title: "Flashcards + Spaced Repetition",
    description: "Anki-style SM-2 scheduling so you review right when you're about to forget.",
    href: "/flashcards",
  },
  {
    icon: Network,
    title: "Mind Maps",
    description: "Turn a document into an interactive, pannable map of how concepts connect.",
    href: "/mind-maps",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description: "Plan tasks on a calendar, track what's due, and feed it into your progress.",
    href: "/planner",
  },
  {
    icon: Timer,
    title: "Pomodoro + Focus",
    description: "Configurable focus sessions that log straight into your analytics.",
    href: "/planner",
  },
  {
    icon: TrendingUp,
    title: "Progress & Insights",
    description: "Study-time trends, quiz accuracy, and automatic focus-area detection.",
    href: "/progress",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <OnboardingTour />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/20 via-card to-card p-8 shadow-sm sm:p-10">
        <div className="relative z-10 max-w-xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Study <span className="text-primary">smarter</span>, not harder.
          </h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            One workspace for your documents and every AI study tool built
            around them.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button size="lg" render={<Link href="/documents" />}>
              <Upload className="size-4" />
              Upload Document
            </Button>
            <p className="text-xs text-muted-foreground">
              Supports{" "}
              <span className="font-medium text-foreground">PDF</span> &amp;
              pasted notes
            </p>
          </div>
        </div>

        {/* Decorative cluster (desktop only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 items-center justify-center lg:flex"
        >
          <div className="absolute size-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex size-28 items-center justify-center rounded-3xl border border-primary/30 bg-primary/15 text-primary shadow-lg">
            <Brain className="size-12" />
          </div>
          <span className="absolute right-10 top-10 flex size-11 items-center justify-center rounded-2xl border bg-card text-primary shadow-md">
            <MessagesSquare className="size-5" />
          </span>
          <span className="absolute bottom-12 right-8 flex size-11 items-center justify-center rounded-2xl border bg-card text-primary shadow-md">
            <ListChecks className="size-5" />
          </span>
          <span className="absolute left-2 top-1/2 flex size-11 items-center justify-center rounded-2xl border bg-card text-primary shadow-md">
            <FileText className="size-5" />
          </span>
        </div>
      </section>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Link key={feature.title} href={feature.href} className="group">
            <Card className="relative h-full pb-10 transition-colors hover:border-primary/50">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <feature.icon className="size-5" />
                </span>
                <CardTitle className="mt-4 text-base text-pretty">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-pretty">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <ArrowRight className="absolute right-4 bottom-4 size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
