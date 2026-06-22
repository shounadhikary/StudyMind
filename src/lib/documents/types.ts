/** Shared document types - safe to import from client and server. */

export interface DocumentSummary {
  /** 2-3 sentence high-level overview. */
  tldr: string;
  /** 5-8 concise takeaways. */
  keyPoints: string[];
  /** Section-by-section breakdown. */
  sections: { heading: string; points: string[] }[];
}
