import type { Metadata } from "next";
import { Inter, Lora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudyMind — AI-powered study companion",
    template: "%s · StudyMind",
  },
  description:
    "StudyMind helps students learn faster and remember longer with AI summaries, RAG-based chat with citations, quizzes, flashcards, mind maps, and study planning.",
  applicationName: "StudyMind",
  authors: [{ name: "StudyMind" }],
  keywords: [
    "AI study companion",
    "flashcards",
    "spaced repetition",
    "quiz generator",
    "RAG",
    "mind maps",
    "study planner",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
