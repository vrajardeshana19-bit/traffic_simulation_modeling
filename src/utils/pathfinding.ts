/**
 * A* pathfinding algorithm for routing vehicles through the road network.
 */

import type { IRoadNetwork } from '../engine/types';
import { distance, manhattanDistance } from './math';

interface AStarNode {
  id: string;
  gCost: number; // cost from start
  hCost: number; // estimated cost to goal
  fCost: number; // g + h
  parent: AStarNode | null;
}

/**
 * Find shortest path from start to end intersection using A*
 * @param startId - starting intersection ID
 * @param endId - destination intersection ID
 * @param roadNetwork - road network to search
 * @returns array of intersection IDs representing the path (including start and end)
 */
export function findPath(
  startId: string,
  endId: string,
  roadNetwork: IRoadNetwork
): string[] {
  if (startId === endId) {
    return [startId];
  }

  const startIntersection = roadNetwork.getIntersection(startId);
  const endIntersection = roadNetwork.getIntersection(endId);

  if (!startIntersection || !endIntersection) {
    // Invalid intersections, return direct path
    return [startId, endId];
  }

  const openSet = new Map<string, AStarNode>();
  const closedSet = new Set<string>();

  const startNode: AStarNode = {
    id: startId,
    gCost: 0,
    hCost: manhattanDistance(startIntersection.position, endIntersection.position),
    fCost: 0,
    parent: null,
  };

  startNode.fCost = startNode.gCost + startNode.hCost;
  openSet.set(startId, startNode);

  while (openSet.size > 0) {
    // Find node with lowest f-cost
    let current: AStarNode | null = null;
    let lowestFCost = Infinity;

    for (const [, node] of openSet) {
      if (node.fCost < lowestFCost) {
        lowestFCost = node.fCost;
        current = node;
      }
    }

    if (!current) break;

    if (current.id === endId) {
      // Reconstruct path
      const path: string[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.unshift(node.id);
        node = node.parent;
      }
      return path;
    }

    openSet.delete(current.id);
    closedSet.add(current.id);

    // Check neighbors
    const neighbors = roadNetwork.getAdjacentIntersections(current.id);

    for (const neighborId of neighbors) {
      if (closedSet.has(neighborId)) continue;

      const neighborIntersection = roadNetwork.getIntersection(neighborId);
      if (!neighborIntersection) continue;

      const currentIntersection = roadNetwork.getIntersection(current.id);
      if (!currentIntersection) continue;

      const edgeCost = distance(
        currentIntersection.position,
        neighborIntersection.position
      );
      const tentativeGCost = current.gCost + edgeCost;

      const existingNode = openSet.get(neighborId);
      if (existingNode && tentativeGCost >= existingNode.gCost) {
        continue;
      }

      const hCost = manhattanDistance(
        neighborIntersection.position,
        endIntersection.position
      );

      const neighbor: AStarNode = {
        id: neighborId,
        gCost: tentativeGCost,
        hCost: hCost,
        fCost: tentativeGCost + hCost,
        parent: current,
      };

      openSet.set(neighborId, neighbor);
    }
  }

  // No path found, return direct connection (shouldn't happen in connected grid)
  return [startId, endId];
}

/**
 * Cache for recent pathfinding queries (simple memoization)
 */
class PathfindingCache {
  private cache = new Map<string, string[]>();
  private readonly maxEntries = 1000;

  /**
   * Generate cache key from start and end IDs
   */
  private getKey(startId: string, endId: string): string {
    return `${startId}->${endId}`;
  }

  /**
   * Get cached path if available
   */
  get(startId: string, endId: string): string[] | null {
    return this.cache.get(this.getKey(startId, endId)) || null;
  }

  /**
   * Store path in cache
   */
  set(startId: string, endId: string, path: string[]): void {
    if (this.cache.size >= this.maxEntries) {
      // Simple eviction: remove first entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(this.getKey(startId, endId), path);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export const pathfindingCache = new PathfindingCache();

/**
 * Find path with caching
 */
export function findPathCached(
  startId: string,
  endId: string,
  roadNetwork: IRoadNetwork
): string[] {
  // Check cache first
  const cached = pathfindingCache.get(startId, endId);
  if (cached) {
    return cached;
  }

  // Compute path
  const path = findPath(startId, endId, roadNetwork);

  // Store in cache
  pathfindingCache.set(startId, endId, path);

  return path;
}
