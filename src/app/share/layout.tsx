import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandIcon } from "@/components/shared/brand-mark";

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandIcon />
            <span className="font-heading text-lg font-semibold tracking-tight">
              StudyMind
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button size="sm" render={<Link href="/sign-up" />}>
              Try StudyMind
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {children}
      </main>
      <footer className="border-t px-6 py-5 text-center text-sm text-muted-foreground">
        Shared with StudyMind · © 2026
      </footer>
    </div>
  );
}
