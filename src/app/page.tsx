import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubIcon } from "@/components/shared/brand-icons";

const SWATCHES = [
  { name: "Background", className: "bg-background border" },
  { name: "Card", className: "bg-card border" },
  { name: "Primary", className: "bg-primary" },
  { name: "Secondary", className: "bg-secondary border" },
  { name: "Muted", className: "bg-muted border" },
  { name: "Accent", className: "bg-accent border" },
  { name: "Border", className: "bg-border" },
  { name: "Destructive", className: "bg-destructive" },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            StudyMind
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Phase 0 · Project scaffold
        </span>

        <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          The AI study companion that helps you learn faster and remember
          longer.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
          This is the foundation build. The design system is wired up: Inter for
          UI, Lora for headings, a calm indigo accent, and a working light / dark
          theme. Feature pages arrive in the next phases.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg">
            Get started
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline">
            <GitHubIcon className="size-4" />
            View source
          </Button>
        </div>

        <section className="mt-16">
          <h2 className="text-sm font-medium text-muted-foreground">
            Design tokens
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SWATCHES.map((swatch) => (
              <div key={swatch.name} className="space-y-2">
                <div
                  className={`h-14 w-full rounded-lg ${swatch.className}`}
                  aria-hidden
                />
                <p className="text-xs text-muted-foreground">{swatch.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border bg-card p-6">
          <h2 className="font-heading text-xl font-semibold">Typography</h2>
          <p className="mt-3 text-base text-card-foreground/90">
            Body copy uses{" "}
            <span className="font-medium text-foreground">Inter</span> at a
            comfortable reading size with generous line height. Large headings
            use the{" "}
            <span className="font-heading font-medium text-foreground">
              Lora
            </span>{" "}
            serif for an academic feel. Inline code renders in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              Geist Mono
            </code>
            .
          </p>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © 2026 StudyMind · Built with{" "}
        <span className="text-primary">♥</span> for learners.
      </footer>
    </div>
  );
}
