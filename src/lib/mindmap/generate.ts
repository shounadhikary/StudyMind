import "server-only";

import { generateJSON } from "@/lib/ai";
import type { MindMapBranch, MindMapTree } from "./types";

const MAX_INPUT_CHARS = 50_000;
const MAX_DEPTH = 3;
const MAX_BRANCHES = 8;

function sanitize(branches: unknown, depth = 1): MindMapBranch[] {
  if (!Array.isArray(branches) || depth > MAX_DEPTH) return [];
  return branches
    .filter((b): b is { label?: unknown; children?: unknown } => !!b)
    .map((b) => ({
      label: String((b as { label?: unknown }).label ?? "").trim().slice(0, 80),
      children: sanitize((b as { children?: unknown }).children, depth + 1),
    }))
    .filter((b) => b.label.length > 0)
    .map((b) => ({
      label: b.label,
      children: b.children.length > 0 ? b.children : undefined,
    }))
    .slice(0, MAX_BRANCHES);
}

export async function generateMindMap(
  text: string,
  fallbackTitle: string,
): Promise<MindMapTree> {
  const source = text.slice(0, MAX_INPUT_CHARS);

  const prompt = `Build a hierarchical mind map of the key concepts in the material below.

Return ONLY a JSON object of this shape:
{
  "title": "the central concept",
  "children": [
    { "label": "a main branch", "children": [ { "label": "a sub-concept" } ] }
  ]
}

Guidelines:
- 3-6 main branches; each with 2-5 sub-nodes; at most 3 levels deep.
- Labels are concise (1-5 words).
- Capture how concepts relate. Base everything strictly on the material.

Material:
"""
${source}
"""`;

  const data = await generateJSON<MindMapTree>(prompt, {
    system: "You organize knowledge into clear, hierarchical mind maps.",
    temperature: 0.4,
  });

  return {
    title: String(data?.title || fallbackTitle || "Mind map").slice(0, 80),
    children: sanitize(data?.children),
  };
}
