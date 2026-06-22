import {
  LayoutDashboard,
  FileText,
  MessagesSquare,
  ListChecks,
  Layers,
  Network,
  CalendarDays,
  TrendingUp,
  Trophy,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Short description used for empty/placeholder states and tooltips. */
  description: string;
};

/** Primary application navigation (authenticated app shell). */
export const APP_NAV: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your study overview, streaks, and what to do next.",
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    description: "Upload PDFs or paste notes, then generate AI study material.",
  },
  {
    title: "AI Chat",
    href: "/chat",
    icon: MessagesSquare,
    description: "Ask questions about your documents and get cited answers.",
  },
  {
    title: "Quiz",
    href: "/quiz",
    icon: ListChecks,
    description: "Generate and take quizzes, then review your results.",
  },
  {
    title: "Flashcards",
    href: "/flashcards",
    icon: Layers,
    description: "Study flashcards with spaced repetition that adapts to you.",
  },
  {
    title: "Mind Maps",
    href: "/mind-maps",
    icon: Network,
    description: "Visualize how concepts in a document connect together.",
  },
  {
    title: "Planner",
    href: "/planner",
    icon: CalendarDays,
    description: "Plan study tasks on a calendar and track what's due.",
  },
  {
    title: "Progress",
    href: "/progress",
    icon: TrendingUp,
    description: "See study time, accuracy trends, and focus areas.",
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
    description: "Opt-in study rankings — XP from quizzes, reviews, and streaks.",
  },
];

/** Secondary navigation, pinned to the bottom of the sidebar. */
export const APP_NAV_SECONDARY: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Theme, language, AI preferences, and your account.",
  },
];

/** Lookup the nav item whose route matches a pathname (longest prefix wins). */
export function findActiveNav(pathname: string): NavItem | undefined {
  return [...APP_NAV, ...APP_NAV_SECONDARY]
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}
