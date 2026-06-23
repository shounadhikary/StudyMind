import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { syncUser } from "@/lib/auth/sync-user";

// All app routes require auth (and read headers via Clerk), so they're dynamic.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Route protection lives in proxy.ts. Once a database is configured, keep the
  // Supabase users row in sync on first request (best-effort; never blocks UI).
  if (process.env.DATABASE_URL) {
    try {
      const user = await currentUser();
      if (user) await syncUser(user);
    } catch (error) {
      console.error("[user-sync] failed:", error);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <AppTopbar />
        <div className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
          <footer className="border-t">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
              <span>© 2026 StudyMind · Built with ♥ for learners.</span>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
