import type { Metadata } from "next";
import { Network } from "lucide-react";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";

export const metadata: Metadata = { title: "Mind Maps" };

export default function MindMapsPage() {
  return (
    <FeaturePlaceholder
      title="Mind Maps"
      description="Visualize how concepts in a document connect together."
      icon={Network}
      phase="Phase 5"
      highlights={[
        "AI-extracted hierarchical concept structure",
        "Interactive, pannable & zoomable canvas",
        "Expand / collapse branches",
        "Export the map as an image",
      ]}
    />
  );
}
