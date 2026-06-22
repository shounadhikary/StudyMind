# i18n (`src/lib/i18n`)

Scaffolding for multi-language UI. English ships today; the structure is ready
for Bengali and German.

## How it works

- `locales/en.ts` defines the message dictionary and exports the `Messages`
  type - the contract every locale must satisfy.
- `index.ts` exposes `Locale`, `DEFAULT_LOCALE`, `AVAILABLE_LOCALES`, and
  `getMessages(locale)`.
- A user's language preference is stored in their settings (`language`).

## Adding a locale (e.g. German)

1. Create `locales/de.ts` exporting a `de` object that satisfies `Messages`
   (TypeScript will flag any missing keys).
2. Register it in `index.ts` (`dictionaries.de = de`) and add `"de"` to
   `AVAILABLE_LOCALES`.
3. Mark it `available: true` in `LANGUAGES` (`src/lib/settings/types.ts`).

UI components can then read strings via `getMessages(locale)` instead of inline
literals. AI features (summaries, chat, quizzes, flashcards) are
language-agnostic and already work with documents in any language.
