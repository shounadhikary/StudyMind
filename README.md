# StudyMind

> AI-powered study companion that helps students learn faster and remember longer.

Students upload their study materials (PDFs, notes, slides) and StudyMind uses AI to
generate summaries, answer questions with citations (RAG), create quizzes and
flashcards, build mind maps, track progress, and manage study schedules.

This is a portfolio project demonstrating full-stack + AI engineering.

> **Status:** In active phased development. See [`StudyMind.md`](./StudyMind.md) for the
> full build specification and [Build status](#build-status) below.

## Tech stack

| Layer            | Choice                                            |
| ---------------- | ------------------------------------------------- |
| Framework        | Next.js (App Router) + TypeScript, `src/` dir     |
| Styling          | Tailwind CSS v4 + shadcn/ui                        |
| Icons            | lucide-react                                      |
| Animation        | Framer Motion                                     |
| Theme            | next-themes (light / dark / system)               |
| Auth             | Clerk (email/password + Google + GitHub)          |
| Database         | Supabase (PostgreSQL + pgvector)                  |
| File storage     | Supabase Storage                                  |
| AI — generation  | Google Gemini (summaries, quizzes, flashcards…)   |
| AI — chat        | Groq (Llama 3.3 70B) — fast streaming             |
| AI — embeddings  | Google Gemini embeddings (RAG vector store)       |
| Deployment       | Vercel                                            |

### Engineering highlights

- **Multi-provider AI architecture** (`src/lib/ai`) — a unified `generate` / `chat` /
  `embed` interface with swappable providers and automatic fallback on rate-limit/error.
- **From-scratch RAG pipeline** (`src/lib/rag`) — token-aware chunking, Gemini
  embeddings, pgvector retrieval, and answers with page-level citations. No LangChain.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See [`.env.example`](./.env.example). All AI/secret keys are used server-side only and
are never exposed to the client.

## Build status

The app is built incrementally, phase by phase:

- [x] **Phase 0** — Project setup, design system, theming
- [ ] Phase 1 — Auth (Clerk) + app shell (sidebar, top bar, footer, landing)
- [ ] Phase 2 — Documents + AI summaries
- [ ] Phase 3 — RAG + chat + citations
- [ ] Phase 4 — Quizzes + flashcards + spaced repetition
- [ ] Phase 5 — Mind maps
- [ ] Phase 6 — Productivity (planner, Pomodoro, goals, streaks, reminders)
- [ ] Phase 7 — Analytics dashboard
- [ ] Phase 8 — Export, share, leaderboard
- [ ] Phase 9 — Multi-doc chat, i18n, settings, profile, achievements, onboarding
- [ ] Phase 10 — Polish + deploy

## License

Personal portfolio project.
