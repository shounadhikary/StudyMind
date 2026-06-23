"use client";

import * as React from "react";

/**
 * Lightweight theme provider (replaces next-themes).
 *
 * next-themes renders its no-flash <script> inside a client component, which
 * React 19 / Next 16 flags ("scripts inside React components are never executed
 * on the client"). Here the runtime logic lives in this client provider and the
 * no-flash script is emitted by the *server* layout (see app/layout.tsx), so no
 * script is ever rendered in the client React tree.
 *
 * API mirrors next-themes' `useTheme` so consumers are unchanged.
 */

export type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "theme";
const THEMES: Theme[] = ["light", "dark", "system"];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Resolved;
  systemTheme: Resolved;
  themes: Theme[];
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

function getSystemTheme(): Resolved {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStored(storageKey: string): Theme | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : null;
  } catch {
    return null;
  }
}

function applyClass(resolved: Resolved) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
  /** Accepted for API compatibility; this provider always uses the class strategy with system support. */
  attribute?: string | string[];
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    typeof window === "undefined"
      ? defaultTheme
      : (readStored(storageKey) ?? defaultTheme),
  );
  const [systemTheme, setSystemTheme] = React.useState<Resolved>(() =>
    typeof window === "undefined" ? "light" : getSystemTheme(),
  );

  // Track the OS preference so "system" stays in sync.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mq.matches ? "dark" : "light");
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Keep multiple tabs in sync.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) setThemeState(readStored(storageKey) ?? defaultTheme);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, defaultTheme]);

  const resolvedTheme: Resolved = theme === "system" ? systemTheme : theme;

  // Apply the class whenever the resolved theme changes.
  React.useEffect(() => {
    if (!disableTransitionOnChange) {
      applyClass(resolvedTheme);
      return;
    }
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important}",
      ),
    );
    document.head.appendChild(style);
    applyClass(resolvedTheme);
    // Force a reflow so the no-transition style takes effect, then remove it.
    window.getComputedStyle(document.body);
    setTimeout(() => document.head.removeChild(style), 1);
  }, [resolvedTheme, disableTransitionOnChange]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // ignore (private mode, etc.)
      }
    },
    [storageKey],
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedTheme, systemTheme, themes: THEMES }),
    [theme, setTheme, resolvedTheme, systemTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return (
    React.useContext(ThemeContext) ?? {
      theme: "system",
      setTheme: () => {},
      resolvedTheme: "light",
      systemTheme: "light",
      themes: THEMES,
    }
  );
}
