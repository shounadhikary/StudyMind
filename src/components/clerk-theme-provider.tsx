"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

/**
 * Wraps Clerk's provider so its prebuilt UI (sign-in/up, user button) follows
 * the app's light/dark theme and uses the StudyMind indigo accent.
 */
export function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        theme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: "#4f46e5",
          borderRadius: "0.625rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
