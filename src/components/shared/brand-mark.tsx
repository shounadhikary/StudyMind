import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The StudyMind logo mark - the circular cap-and-brain badge.
 * Defaults to a sidebar/header size (size-8); pass `className` to resize.
 */
export function BrandIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/studymind-icon.png"
      alt="StudyMind"
      width={64}
      height={64}
      priority
      className={cn("size-8 shrink-0", className)}
    />
  );
}
