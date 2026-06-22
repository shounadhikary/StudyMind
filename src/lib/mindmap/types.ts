/** Shared mind map types - safe to import from client and server. */

export interface MindMapBranch {
  label: string;
  children?: MindMapBranch[];
}

export interface MindMapTree {
  title: string;
  children: MindMapBranch[];
}

export interface FlatNode {
  id: string;
  label: string;
  depth: number;
  parentId: string | null;
}

export interface FlatEdge {
  id: string;
  source: string;
  target: string;
}

export interface FlatGraph {
  nodes: FlatNode[];
  edges: FlatEdge[];
}
