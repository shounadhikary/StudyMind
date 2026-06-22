import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  ListChecks,
  Layers,
  MessagesSquare,
  Clock,
  Target,
  Flame,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

export const metadata: Metadata = { title: "Dashboard" };

const STATS = [
  { label: "Study time", value: "0h", icon: Clock },
  { label: "Quiz accuracy", value: "-", icon: Target },
  { label: "Cards reviewed", value: "0", icon: Layers },
  { label: "Day streak", value: "0", icon: Flame },
];

const QUICK_ACTIONS = [
  {
    title: "Upload a document",
    description: "Add a PDF or paste notes to get started.",
    href: "/documents",
    icon: Upload,
  },
  {
    title: "Generate a quiz",
    description: "Test yourself on any document.",
    href: "/quiz",
    icon: ListChecks,
  },
  {
    title: "Review flashcards",
    description: "Study with spaced repetition.",
    href: "/flashcards",
    icon: Layers,
  },
  {
    title: "Ask the AI",
    description: "Get cited answers from your notes.",
    href: "/chat",
    icon: MessagesSquare,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <OnboardingTour />
      <PageHeader
        title="Welcome to StudyMind"
        description="Here's your study overview. Upload a document to bring it to life."
        actions={
          <Button render={<Link href="/documents" />}>
            <Upload className="size-4" />
            Upload document
          </Button>
        }
      />

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Onboarding / empty state */}
      <Card className="border-dashed bg-card/50">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-heading text-lg font-semibold">
              Upload your first document
            </h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground text-pretty">
              Drop in a PDF or paste your notes and StudyMind will generate
              summaries, quizzes, flashcards, and more - all in one place.
            </p>
          </div>
          <Button render={<Link href="/documents" />}>
            Get started
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} href={action.href} className="group">
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/40">
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="size-5" />
                  </span>
                  <CardTitle className="mt-3 flex items-center gap-1 text-base">
                    {action.title}
                    <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
