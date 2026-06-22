import Link from "next/link";
import { BookOpen, ShieldCheck, Sparkles, Brain, GraduationCap } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Secure & Private" },
  { icon: Sparkles, label: "AI-Powered (Gemini & Groq)" },
  { icon: Brain, label: "Smart Learning" },
  { icon: GraduationCap, label: "Built for students" },
];

const STORE_BADGES = ["Google Play", "App Store", "Microsoft Store"];

const LINK_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Features",
      links: [
        { label: "Document Summary", href: "/documents" },
        { label: "AI Chat", href: "/chat" },
        { label: "Quiz Generator", href: "/quiz" },
        { label: "Flashcards", href: "/flashcards" },
        { label: "Mind Maps", href: "/mind-maps" },
      ],
    },
    {
      heading: "Study Tools",
      links: [
        { label: "Spaced Repetition", href: "/flashcards" },
        { label: "Study Planner", href: "/planner" },
        { label: "Pomodoro", href: "/planner" },
        { label: "Progress Tracker", href: "/progress" },
        { label: "Export", href: "/documents" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Pricing", href: "/pricing" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
        { label: "All Features", href: "/#features" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/30">
      {/* Trust bar */}
      <div className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-5 text-sm text-muted-foreground">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand block */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4.5" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">
                StudyMind
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground text-pretty">
              AI-powered study companion that helps you learn faster and
              remember longer.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <GitHubIcon className="size-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LinkedInIcon className="size-4" />
              </a>
            </div>

            {/* App store badges - honestly marked Coming Soon */}
            <div className="flex flex-col gap-2 pt-2">
              {STORE_BADGES.map((store) => (
                <div
                  key={store}
                  className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                >
                  <span className="text-xs font-medium">{store}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINK_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold">{column.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-5 text-center text-sm text-muted-foreground">
          © 2026 StudyMind · Built with{" "}
          <span className="text-primary">♥</span> for learners.
        </div>
      </div>
    </footer>
  );
}
