"use client";

import * as React from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FlatGraph } from "@/lib/mindmap/types";

const NODE_WIDTH = 190;
const NODE_HEIGHT = 46;

interface MindNodeData {
  label: string;
  depth: number;
  hasChildren: boolean;
  collapsed: boolean;
  onToggle: (id: string) => void;
  [key: string]: unknown;
}

type MindNode = Node<MindNodeData, "mind">;

function MindNodeView({ id, data }: NodeProps<MindNode>) {
  const tone =
    data.depth === 0
      ? "bg-primary text-primary-foreground border-primary"
      : data.depth === 1
        ? "bg-card border-primary/40"
        : "bg-muted/60 border-border";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm",
        tone,
      )}
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <span className="line-clamp-2 flex-1 leading-tight">{data.label}</span>
      {data.hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle(id);
          }}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border text-current transition-colors",
            data.depth === 0
              ? "border-primary-foreground/40 hover:bg-primary-foreground/15"
              : "border-border hover:bg-accent",
          )}
          aria-label={data.collapsed ? "Expand" : "Collapse"}
        >
          {data.collapsed ? (
            <Plus className="size-3" />
          ) : (
            <Minus className="size-3" />
          )}
        </button>
      ) : null}
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}

const nodeTypes: NodeTypes = { mind: MindNodeView };

/** Compute visible nodes (hiding collapsed subtrees) and lay them out with dagre. */
function buildLayout(
  graph: FlatGraph,
  collapsed: Set<string>,
  onToggle: (id: string) => void,
): { nodes: MindNode[]; edges: Edge[] } {
  const childIds = new Set(graph.edges.map((e) => e.source));

  // A node is visible if its parent is visible and not collapsed.
  const visible = new Set<string>();
  for (const node of graph.nodes) {
    if (node.parentId === null) {
      visible.add(node.id);
    } else if (visible.has(node.parentId) && !collapsed.has(node.parentId)) {
      visible.add(node.id);
    }
  }

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 28, ranksep: 90 });

  const visibleNodes = graph.nodes.filter((n) => visible.has(n.id));
  const visibleEdges = graph.edges.filter(
    (e) => visible.has(e.source) && visible.has(e.target),
  );

  for (const n of visibleNodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of visibleEdges) {
    g.setEdge(e.source, e.target);
  }
  Dagre.layout(g);

  const nodes: MindNode[] = visibleNodes.map((n) => {
    const pos = g.node(n.id);
    return {
      id: n.id,
      type: "mind",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: {
        label: n.label,
        depth: n.depth,
        hasChildren: childIds.has(n.id),
        collapsed: collapsed.has(n.id),
        onToggle,
      },
    };
  });

  const edges: Edge[] = visibleEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}

export function MindMapCanvas({ graph }: { graph: FlatGraph }) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState<MindNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onToggle = React.useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  React.useEffect(() => {
    const layout = buildLayout(graph, collapsed, onToggle);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [graph, collapsed, onToggle, setNodes, setEdges]);

  return (
    <div className="h-[calc(100dvh-13rem)] w-full overflow-hidden rounded-xl border bg-card/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
      >
        <Background gap={20} className="text-border" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!bg-muted" />
      </ReactFlow>
    </div>
  );
}
