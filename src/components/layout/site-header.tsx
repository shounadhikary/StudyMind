import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuth } from "@/components/layout/header-auth";
import { BrandIcon } from "@/components/shared/brand-mark";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm dark:bg-[#014B4C]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <BrandIcon />
          <span className="font-heading text-lg font-semibold tracking-tight">
            StudyMind
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
