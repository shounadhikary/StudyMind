/** English UI strings. The shape here (`Messages`) is the contract every other
 *  locale must satisfy. */
export const en = {
  nav: {
    dashboard: "Dashboard",
    documents: "Documents",
    chat: "AI Chat",
    quiz: "Quiz",
    flashcards: "Flashcards",
    mindMaps: "Mind Maps",
    planner: "Planner",
    progress: "Progress",
    leaderboard: "Leaderboard",
    settings: "Settings",
    profile: "Profile",
  },
  actions: {
    upload: "Upload document",
    generate: "Generate",
    export: "Export",
    share: "Share",
    save: "Save",
    delete: "Delete",
    retry: "Retry",
    newChat: "New chat",
    newTask: "New task",
  },
  common: {
    loading: "Loading…",
    empty: "Nothing here yet",
    comingSoon: "Coming soon",
    sources: "Sources",
  },
} as const;

export type Messages = typeof en;
