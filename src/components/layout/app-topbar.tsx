"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { findActiveNav } from "@/lib/navigation";

export function AppTopbar() {
  const pathname = usePathname();
  const active = findActiveNav(pathname);
  const title = active?.title ?? "StudyMind";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm dark:bg-[#014B4C]">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4"
      />
      <span className="font-heading text-sm font-semibold tracking-tight">
        {title}
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
      </div>
    </header>
  );
}
