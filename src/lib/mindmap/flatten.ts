import type {
  FlatEdge,
  FlatGraph,
  FlatNode,
  MindMapBranch,
  MindMapTree,
} from "./types";

/**
 * Flatten a mind map tree into nodes + edges with stable ids and depth.
 * Pure - used both to render and (in tests) to validate structure.
 */
export function flattenMindMap(tree: MindMapTree): FlatGraph {
  const nodes: FlatNode[] = [];
  const edges: FlatEdge[] = [];
  let counter = 0;

  const rootId = "n0";
  nodes.push({ id: rootId, label: tree.title, depth: 0, parentId: null });

  function walk(branches: MindMapBranch[], parentId: string, depth: number) {
    for (const branch of branches) {
      const id = `n${++counter}`;
      nodes.push({ id, label: branch.label, depth, parentId });
      edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id });
      if (branch.children && branch.children.length > 0) {
        walk(branch.children, id, depth + 1);
      }
    }
  }

  walk(tree.children ?? [], rootId, 1);
  return { nodes, edges };
}
