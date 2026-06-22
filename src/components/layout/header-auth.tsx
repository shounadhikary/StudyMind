"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Auth-aware controls for the public header. Uses Clerk's `useUser` to branch
 * on sign-in state (client-only), so the server header stays a thin shell.
 */
export function HeaderAuth() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (isSignedIn) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          render={<Link href="/dashboard" />}
        >
          Dashboard
        </Button>
        <UserButton />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
        render={<Link href="/sign-in" />}
      >
        Sign in
      </Button>
      <Button size="sm" render={<Link href="/sign-up" />}>
        Get started
      </Button>
    </>
  );
}
