/** Shared flashcard types — safe to import from client and server. */

export interface GeneratedCard {
  front: string;
  back: string;
}

export interface FlashcardView {
  id: string;
  front: string;
  back: string;
}
