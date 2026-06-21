StudyMind — Complete Build Specification (Master Prompt for Claude Code)


How to use this file: Place this file at the root of an empty project folder. Open Claude Code in that folder and say: "Read StudyMind_Master_Prompt.md and build this project completely, phase by phase. Start with Phase 0 and confirm with me before moving to each next phase." Build incrementally — do not attempt everything in one shot.




1. Project Overview

StudyMind is an AI-powered study companion web application. Students upload their study materials (PDFs, notes, slides), and the app uses AI to generate summaries, answer questions (with citations), create quizzes and flashcards, build mind maps, track progress, and manage study schedules.

Core philosophy:


Clean, academic, Notion-like UI (minimal, lots of whitespace, professional).
Light/Dark mode with toggle.
Sidebar-based navigation (Notion/Discord style).
Production-grade quality: proper loading states, empty states, error handling, responsive design.
Honest product: no fake claims (no fake certifications, no "download on App Store" unless real — use "Coming Soon" badges instead).


Target audience: Students (especially university/grad students). This is a portfolio project to demonstrate full-stack + AI engineering ability for German university Master's applications.


2. Tech Stack (use exactly this)

LayerChoiceNotesFrameworkNext.js 14+ (App Router)TypeScript, src/ directoryStylingTailwind CSSUI Componentsshadcn/uiInstall components as neededIconslucide-reactAnimationFramer MotionSubtle micro-interactions onlyThemenext-themesLight/dark toggleAuthClerkEmail/password + Google + GitHub OAuthDatabaseSupabase (PostgreSQL)With pgvector extension for RAGORMPrisma OR Supabase clientPrefer Prisma for type safetyFile storageSupabase StorageFor uploaded PDFsPDF parsingpdf-parse (Node)Extract text server-sideChartsRechartsFor analytics/progressAI — generationGoogle Gemini API (gemini-2.0-flash or current Flash)Summaries, quizzes, flashcards, mind mapsAI — chatGroq (Llama 3.3 70B)Fast real-time chat responsesAI — embeddingsGoogle Gemini embeddingsFor RAG vector storeDeploymentVercel

Multi-provider AI architecture: Build an abstraction layer (/src/lib/ai/) so providers are swappable, with automatic fallback (e.g., if Gemini rate-limits, fall back to Groq). This is a key engineering highlight — document it in the README.

Environment variables (.env.local):

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=


3. Design System

Vibe: Notion-meets-Linear. Clean, academic, calm, professional.


Typography: Inter for UI/body; a serif (e.g., Lora or Source Serif) for large headings to give an academic feel.
Color palette:

Neutral grays as the base (backgrounds, borders, text).
One accent color — use a calm indigo or emerald. Use it sparingly (active states, primary buttons, links).
Light mode: white/very-light-gray backgrounds, dark gray text.
Dark mode: near-black (#0a0a0a–#111) backgrounds, light gray text, subtle borders.



Spacing: Generous whitespace. Don't crowd.
Borders & shadows: Subtle 1px borders, very soft shadows. No heavy/loud shadows.
Corners: Consistent border-radius (e.g., rounded-lg).
Micro-interactions: Subtle hover states, smooth transitions (150–200ms), Framer Motion for things like flashcard flips and modal entrances. Never distracting.
States: Every data view must have: loading (skeleton), empty (friendly illustration + CTA), error (clear message + retry).
Responsive: Fully responsive. Sidebar collapses to a drawer on mobile.
Accessibility: Proper labels, keyboard navigation, focus rings, sufficient contrast.



4. App Layout

Authenticated app shell:


Left sidebar (collapsible):

Logo + app name at top.
Nav items (icon + label): Dashboard, Documents, AI Chat, Quiz, Flashcards, Mind Maps, Planner, Progress, Settings.
Bottom: user avatar/profile menu, theme toggle.



Main content area: page content with a top bar (breadcrumb/page title + contextual actions).
Footer (rich, like the reference — see Section 6).


Public pages: Landing page, sign-in, sign-up, forgot-password — these don't show the app sidebar.


5. Authentication (Clerk)

Implement fully:


Sign up / Sign in via: Email + Password, Google OAuth, GitHub OAuth.
Forgot Password flow (Clerk handles email + reset code/link).
Change Password (via Clerk <UserProfile />).
Apple sign-in: add the button in the UI visually but disabled/"coming soon" (Apple requires a paid $99/yr developer account — do not implement actual Apple OAuth).
Protect all /app/* routes — redirect unauthenticated users to sign-in.
Use Clerk middleware for route protection.
Sync Clerk user to a users row in Supabase on first login (via webhook or on-first-request upsert).



6. Rich Footer (model after reference, but honest)

Trust bar (top of footer): Secure & Private · AI-Powered (Gemini & Groq) · Smart Learning · Built for students.

App badges: Google Play / App Store / Microsoft Store — each with a "Coming Soon" label (do NOT claim they're available).

Link columns:


Features: Document Summary, AI Chat, Quiz Generator, Flashcards, Mind Maps
Study Tools: Spaced Repetition, Study Planner, Pomodoro, Progress Tracker, Export
Company: About, Pricing, Privacy Policy, Terms of Use, All Features


Brand block: Logo + tagline + short description ("AI-powered study companion that helps you learn faster and remember longer") + social icons (GitHub, LinkedIn).

Bottom bar: © 2026 StudyMind · Built with ♥ for learners.

Important honesty rule: Do NOT include fake certifications (no "ISO 27001" unless true). Only state what is real.


7. Complete Feature List (build ALL of these)

7.1 Core AI Features

1. Document Management


Upload PDFs (drag & drop + file picker), also allow pasting raw text.
Store file in Supabase Storage; extract text via pdf-parse.
List all documents (cards/table) with title, upload date, page count, status.
View a single document: show extracted text, metadata, and all derived artifacts (summary, quizzes, flashcards, etc.).
Delete / rename documents.


2. AI Summary


Generate a structured summary of a document (TL;DR + key points + section-wise breakdown).
Use Gemini Flash (large context handles full documents).
Allow regenerate; save summaries to DB.


3. AI Chat (RAG-based Doubt Solver)


Chat interface scoped to a document (or multiple documents — see #15).
Build RAG from scratch (do not use LangChain): chunk text → embed with Gemini embeddings → store in Supabase pgvector → on query, embed question, retrieve top-k chunks, re-rank, build context, send to Groq (Llama 3.3 70B) for fast answer.
Stream responses.
Citations (#12): every answer shows which chunks/pages it used. Display source snippets with page numbers. This is a trust feature — make it prominent.
Persist chat history per document.


4. Quiz Generator


Generate quizzes (MCQ, true/false, short-answer) from a document using Gemini structured output (enforce JSON schema).
Difficulty levels (#14): Easy / Medium / Hard selector.
Take the quiz interactively: one question at a time or all at once, with progress.
Auto-grade; show score, correct answers, explanations.
Save quiz attempts to DB for analytics.


5. Flashcards + Spaced Repetition


Generate flashcards (front/back) from a document via Gemini.
Study mode: flip animation (Framer Motion), swipe/keyboard navigation.
Spaced Repetition (#2): implement an SM-2 (Anki-style) algorithm. After each card, user rates recall (Again/Hard/Good/Easy); schedule next review accordingly. Show "due today" cards. Persist review state.


6. Mind Map Generator (#1)


From a document, use Gemini to produce a hierarchical concept structure (JSON: nodes + edges / parent-child).
Render an interactive, pannable/zoomable mind map. Use React Flow (reactflow) for node-graph rendering, or d3 if preferred.
Allow expand/collapse of branches. Export as image (optional).


7.2 Productivity Features

7. Study Planner + Calendar (#9)


Create study tasks (title, subject, linked document, due date, priority, status).
Calendar view (month/week) + list view. Drag to reschedule (nice-to-have).
Mark tasks complete; tasks feed into progress analytics.


8. Pomodoro Timer + Focus Tracking (#7)


Configurable Pomodoro (e.g., 25/5, 50/10). Start/pause/reset, session count.
Log completed focus sessions (duration, linked subject/document) → feeds analytics.


9. Goals + Streaks (#8)


Daily/weekly study goals (e.g., minutes studied, cards reviewed, quizzes taken).
Streak counter (consecutive days meeting goal). Visual streak display (calendar heatmap).


10. Reminders (#10)


In-app reminders for due reviews, planned tasks, and goals.
Browser notifications (Notification API) where permitted. (No need for email/push infra.)


7.3 Analytics

11. Progress Dashboard (#16, #17)


Overview cards: total study time, quizzes taken, average accuracy, cards reviewed, current streak.
Charts (Recharts): study time over time, quiz accuracy trend, cards reviewed per day, subject-wise breakdown.
Weakness detection (#16): identify topics/subjects with low quiz accuracy and surface them ("Focus areas").


7.4 Sharing & Export

12. Export (#15)


Export summaries, quizzes, and flashcards to PDF.
Export flashcards to Anki-compatible format (CSV/.apkg-style CSV that Anki can import).
Export notes to Markdown.


13. Share (#19)


Generate a shareable read-only link for a quiz or flashcard set.
Public view page (no auth required) for shared sets.


14. Leaderboard (#18)


Optional opt-in leaderboard ranking users by study points (XP from quizzes, reviews, streaks).
Clearly label this as social/optional; respect privacy (opt-in only).


7.5 Multi-document & Language

15. Multi-document Chat (#11)


Allow selecting multiple documents as the chat context; RAG retrieves across all selected docs.
Citations indicate which document + page each source came from.


16. Multi-language Support (#13)


UI supports English (and structure it so Bengali/German can be added via i18n — use next-intl or similar).
AI features work regardless of the document's language (English/Bengali/German).


7.6 Account & Onboarding

17. Settings (#20)


Theme (light/dark/system), language, default AI provider preference, default quiz difficulty, notification preferences.
Account management (via Clerk <UserProfile />): change password, connected accounts, delete account.


18. Profile (#21)


User profile: avatar, name, study stats summary, earned achievement badges.
Achievements/badges: e.g., "7-day streak", "100 cards reviewed", "First quiz", "10 documents". Award and display them.


19. Onboarding Tour (#22)


First-time guided tour highlighting key features (use a library like react-joyride or a custom overlay).
A friendly empty-state dashboard for brand-new users with a clear "Upload your first document" CTA.



8. Database Schema (Supabase / Prisma)

Design tables (adjust as needed):


users — id (Clerk id), email, name, avatar_url, created_at, preferences (jsonb).
documents — id, user_id, title, file_url, raw_text, page_count, language, created_at.
document_chunks — id, document_id, chunk_index, content, embedding (vector), page_number.
summaries — id, document_id, content (jsonb), created_at.
chats — id, user_id, document_ids (array), title, created_at.
chat_messages — id, chat_id, role, content, citations (jsonb), created_at.
quizzes — id, document_id, user_id, difficulty, questions (jsonb), created_at.
quiz_attempts — id, quiz_id, user_id, answers (jsonb), score, taken_at.
flashcard_decks — id, document_id, user_id, title, created_at.
flashcards — id, deck_id, front, back, sr_state (jsonb: ease, interval, due_date, repetitions).
mind_maps — id, document_id, user_id, structure (jsonb), created_at.
tasks — id, user_id, title, subject, document_id, due_date, priority, status.
focus_sessions — id, user_id, duration, subject, document_id, completed_at.
goals — id, user_id, type, target, period, created_at.
streaks — id, user_id, current_streak, longest_streak, last_active_date.
achievements — id, user_id, badge_key, earned_at.
shares — id, resource_type, resource_id, public_token, created_at.


Enable pgvector for document_chunks.embedding. Add appropriate indexes (especially a vector index for similarity search).


9. AI Implementation Details


Abstraction layer (/src/lib/ai/): a unified interface generate(), chat(), embed() with provider implementations (gemini.ts, groq.ts) and a router.ts that picks a provider and falls back on rate-limit/error.
Structured outputs: for quizzes/flashcards/mind maps, instruct the model to return ONLY valid JSON matching a defined schema; parse safely with try/catch; retry on parse failure.
RAG pipeline (/src/lib/rag/): chunk.ts (token-aware chunking with overlap), embed.ts, retrieve.ts (vector similarity + optional keyword re-rank), context.ts (assemble context within token budget).
Rate limiting & cost: keep requests within free-tier limits; add simple in-app rate-limit guards and clear error messages when limits are hit.
Never expose API keys client-side — all AI calls go through Next.js server routes / server actions.



10. Build Order (Phases — confirm before each)

Phase 0 — Setup


create-next-app (TS, Tailwind, App Router, src/, ESLint).
Install shadcn/ui, lucide-react, framer-motion, next-themes.
Set up folder structure, design tokens, theme provider, light/dark toggle.


Phase 1 — Auth + Shell


Clerk integration (email/pwd + Google + GitHub, forgot/change password).
Route protection middleware.
Sidebar layout, top bar, rich footer, landing page.
Supabase project + Prisma schema + migrations + user sync.


Phase 2 — Documents + Summary


Upload, storage, PDF parsing, document list & detail views.
AI summary generation (Gemini) + AI abstraction layer.


Phase 3 — RAG + Chat + Citations


Chunking, embeddings, pgvector storage, retrieval.
Chat UI with streaming (Groq), citations display.


Phase 4 — Quiz + Flashcards + Spaced Repetition


Quiz generation (difficulty levels), taking, grading, attempts.
Flashcard generation, study mode with flip animation, SM-2 spaced repetition.


Phase 5 — Mind Maps


Concept extraction + interactive React Flow rendering.


Phase 6 — Productivity (Planner, Pomodoro, Goals, Streaks, Reminders)


Tasks + calendar, Pomodoro timer + session logging, goals + streak heatmap, in-app/browser reminders.


Phase 7 — Analytics


Progress dashboard, charts, weakness detection.


Phase 8 — Export, Share, Leaderboard


PDF/Anki/Markdown export, shareable links + public views, opt-in leaderboard.


Phase 9 — Multi-doc chat, i18n, Settings, Profile, Achievements, Onboarding


Multi-document RAG, i18n scaffolding, settings, profile + badges, onboarding tour.


Phase 10 — Polish + Deploy


Loading/empty/error states everywhere, responsive pass, accessibility pass.
README (architecture diagram, screenshots, feature list, roadmap), deploy to Vercel.



11. Quality Bar (apply throughout)


TypeScript everywhere; no any unless unavoidable.
Clean component structure; reusable UI primitives.
Server-side for all secrets/AI calls.
Every list/data view: loading skeleton, empty state, error + retry.
Fully responsive; sidebar → drawer on mobile.
Consistent design tokens; no hardcoded magic colors.
Meaningful commit messages (so the GitHub history looks professional).
A thorough README — this is what the admissions committee reads first.



12. README must include


One-line pitch + screenshots/GIF demo.
Feature list (with which are complete vs. roadmap).
Architecture overview (diagram): Next.js ↔ server routes ↔ AI router (Gemini/Groq) ↔ Supabase/pgvector.
The multi-provider fallback design (highlight this).
The from-scratch RAG pipeline (highlight this).
Tech stack, setup instructions, env vars.
Live demo link.



End of specification. Build thoroughly. Do not skip features. Confirm with the user at the end of each phase before continuing.