/**
 * SM-2 (Anki-style) spaced-repetition scheduling. Pure functions — no I/O.
 *
 * Each card tracks an ease factor, the current interval (days), how many times
 * it's been recalled in a row (repetitions), and lapse count. After a review the
 * user rates recall and we compute the next interval + due date.
 */

export type Rating = "again" | "hard" | "good" | "easy";

export interface SrState {
  ease: number;
  /** Current interval in days. */
  interval: number;
  repetitions: number;
  lapses: number;
}

export const INITIAL_SR_STATE: SrState = {
  ease: 2.5,
  interval: 0,
  repetitions: 0,
  lapses: 0,
};

const MS_PER_DAY = 86_400_000;
const MIN_EASE = 1.3;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const RATINGS: { value: Rating; label: string }[] = [
  { value: "again", label: "Again" },
  { value: "hard", label: "Hard" },
  { value: "good", label: "Good" },
  { value: "easy", label: "Easy" },
];

/**
 * Apply a review rating to a card's state, returning the new state and the next
 * due date. "Again" resets progress and is due immediately (same day).
 */
export function review(
  state: Partial<SrState> | null | undefined,
  rating: Rating,
  now: Date = new Date(),
): { state: SrState; dueDate: Date } {
  let { ease, interval, repetitions, lapses } = {
    ...INITIAL_SR_STATE,
    ...(state ?? {}),
  };

  if (rating === "again") {
    repetitions = 0;
    lapses += 1;
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 0; // due now → reappears this session
  } else {
    if (rating === "hard") ease = Math.max(MIN_EASE, ease - 0.15);
    else if (rating === "easy") ease = ease + 0.15;

    repetitions += 1;

    if (repetitions === 1) {
      interval = rating === "easy" ? 3 : 1;
    } else if (repetitions === 2) {
      interval = rating === "hard" ? 4 : 6;
    } else {
      const factor =
        rating === "hard" ? 1.2 : rating === "easy" ? ease * 1.3 : ease;
      interval = Math.round(interval * factor);
    }
    interval = Math.max(1, interval);
  }

  return {
    state: { ease: round2(ease), interval, repetitions, lapses },
    dueDate: new Date(now.getTime() + interval * MS_PER_DAY),
  };
}
