/**
 * Road network with 4x4 grid layout
 * NO CIRCULAR IMPORTS - only imports from ./types
 */

import type { Point, RoadNode, RoadEdge } from './types';

const NODE_SPACING = 160; // pixels
const GRID_SIZE = 4; // 4x4 grid = 16 nodes
const SPEED_LIMIT = 100; // pixels per second

/**
 * Create a default 4x4 grid network
 * Returns all nodes and edges
 */
export function createDefaultNetwork(): {
  nodes: RoadNode[];
  edges: RoadEdge[];
} {
  const nodes: RoadNode[] = [];
  const nodeMap = new Map<string, RoadNode>();

  // Create 4x4 grid of nodes
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const id = `node_${row}_${col}`;
      const position: Point = {
        x: col * NODE_SPACING,
        y: row * NODE_SPACING,
      };

      const node: RoadNode = {
        id,
        position,
        connections: [],
        isIntersection: true,
      };

      nodes.push(node);
      nodeMap.set(id, node);
    }
  }

  // Create edges connecting adjacent nodes (horizontal and vertical only)
  const edges: RoadEdge[] = [];
  let edgeId = 0;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const currentId = `node_${row}_${col}`;
      const currentNode = nodeMap.get(currentId)!;

      // Connect to right neighbor
      if (col < GRID_SIZE - 1) {
        const rightId = `node_${row}_${col + 1}`;
        const rightNode = nodeMap.get(rightId)!;

        const distance = Math.hypot(
          rightNode.position.x - currentNode.position.x,
          rightNode.position.y - currentNode.position.y
        );

        edges.push({
          id: `edge_${edgeId++}`,
          from: currentId,
          to: rightId,
          speedLimit: SPEED_LIMIT,
          lanes: 2,
          length: distance,
        });

        edges.push({
          id: `edge_${edgeId++}`,
          from: rightId,
          to: currentId,
          speedLimit: SPEED_LIMIT,
          lanes: 2,
          length: distance,
        });

        currentNode.connections.push(rightId);
        rightNode.connections.push(currentId);
      }

      // Connect to bottom neighbor
      if (row < GRID_SIZE - 1) {
        const bottomId = `node_${row + 1}_${col}`;
        const bottomNode = nodeMap.get(bottomId)!;

        const distance = Math.hypot(
          bottomNode.position.x - currentNode.position.x,
          bottomNode.position.y - currentNode.position.y
        );

        edges.push({
          id: `edge_${edgeId++}`,
          from: currentId,
          to: bottomId,
          speedLimit: SPEED_LIMIT,
          lanes: 2,
          length: distance,
        });

        edges.push({
          id: `edge_${edgeId++}`,
          from: bottomId,
          to: currentId,
          speedLimit: SPEED_LIMIT,
          lanes: 2,
          length: distance,
        });

        currentNode.connections.push(bottomId);
        bottomNode.connections.push(currentId);
      }
    }
  }

  return { nodes, edges };
}

/**
 * Find a random edge (not node) to spawn a vehicle
 */
export function getRandomEdge(edges: RoadEdge[]): RoadEdge {
  return edges[Math.floor(Math.random() * edges.length)];
}

/**
 * Find shortest path between two nodes using BFS
 */
export function findPath(
  fromNodeId: string,
  toNodeId: string,
  nodes: RoadNode[]
): string[] {
  if (fromNodeId === toNodeId) return [fromNodeId];

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; path: string[] }> = [
    { nodeId: fromNodeId, path: [fromNodeId] }
  ];

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;

    if (nodeId === toNodeId) {
      return path;
    }

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    for (const neighborId of node.connections) {
      if (!visited.has(neighborId)) {
        queue.push({
          nodeId: neighborId,
          path: [...path, neighborId],
        });
      }
    }
  }

  return [fromNodeId]; // Fallback if no path found
}
