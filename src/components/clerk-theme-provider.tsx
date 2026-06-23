"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/components/theme-provider";

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
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        theme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "#4f46e5",
          borderRadius: "0.625rem",
        },
        // Apple & GitHub ship black monochrome logos that disappear on the
        // dark card - force them white. (Google is multicolor, leave it.)
        elements: isDark
          ? {
              socialButtonsProviderIcon__apple: "brightness-0 invert",
              socialButtonsProviderIcon__github: "brightness-0 invert",
            }
          : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
