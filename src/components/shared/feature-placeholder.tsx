import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Which build phase delivers this feature (shown honestly as "coming soon"). */
  phase?: string;
  /** Bullet points describing what the feature will do. */
  highlights?: string[];
};

/**
 * Honest placeholder for a route whose feature ships in a later phase.
 * Keeps the app shell fully navigable without faking functionality.
 */
export function FeaturePlaceholder({
  title,
  description,
  icon,
  phase,
  highlights,
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={title}
        description={description}
        actions={
          phase ? <Badge variant="secondary">Coming in {phase}</Badge> : null
        }
      />
      <EmptyState
        icon={icon}
        title="This feature is on the way"
        description="The app shell and design system are ready. This page gets its full functionality in an upcoming build phase."
      >
        {highlights && highlights.length > 0 ? (
          <ul className="mt-6 grid max-w-md gap-2 text-left text-sm text-muted-foreground">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </EmptyState>
    </div>
  );
}
