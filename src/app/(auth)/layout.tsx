import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { BrandIcon } from "@/components/shared/brand-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <BrandIcon />
          <span className="font-heading text-lg font-semibold tracking-tight">
            StudyMind
          </span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  );
}
