/**
 * Vehicle agent in traffic simulation
 * NO CIRCULAR IMPORTS - only imports from ./types
 */

import type { IVehicle, Point, RoadEdge } from './types';

const VEHICLE_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6bcf7f',
  '#ff8b94', '#a29bfe', '#74b9ff', '#81ecec', '#fab1a0',
];

export class Vehicle implements IVehicle {
  id: string;
  position: Point;
  speed: number;
  maxSpeed: number;
  pathNodeIds: string[];
  currentEdgeId: string;
  state: 'moving' | 'waiting' | 'stopped';
  color: string;
  size: number; // 16x10 pixels
  angle: number; // radians, direction of travel

  private currentPathIndex: number = 0;
  private distanceAlongEdge: number = 0;
  private createdAt: number;
  private completedAt: number | null = null;
  private waitStartTime: number | null = null;

  constructor(
    id: string,
    startPosition: Point,
    pathNodeIds: string[],
    maxSpeed: number = 80
  ) {
    this.id = id;
    this.position = { ...startPosition };
    this.speed = 0;
    this.maxSpeed = maxSpeed;
    this.pathNodeIds = pathNodeIds;
    this.currentEdgeId = '';
    this.state = 'moving';
    this.color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];
    this.size = 16;
    this.angle = 0;
    this.createdAt = Date.now();
  }

  /**
   * Update vehicle position along its path
   * Called each frame with deltaTime in milliseconds
   */
  update(
    deltaTime: number,
    edges: Map<string, RoadEdge>,
    allNodes: Map<string, any>
  ): void {
    if (this.isCompleted() || this.pathNodeIds.length < 2) return;

    const timeSecs = deltaTime / 1000;
    const distanceToMove = this.speed * timeSecs;

    // Get current and next nodes in path
    const currentNodeId = this.pathNodeIds[this.currentPathIndex];
    const nextNodeId = this.pathNodeIds[this.currentPathIndex + 1];

    if (!nextNodeId) {
      // Reached destination
      this.completedAt = Date.now();
      this.speed = 0;
      this.state = 'stopped';
      return;
    }

    // Find edge connecting current to next node
    let edge = edges.get(this.currentEdgeId);
    if (!edge || edge.from !== currentNodeId || edge.to !== nextNodeId) {
      // Search for correct edge
      for (const e of edges.values()) {
        if (e.from === currentNodeId && e.to === nextNodeId) {
          edge = e;
          this.currentEdgeId = e.id;
          this.distanceAlongEdge = 0;
          break;
        }
      }
    }

    if (!edge) return;

    // Move along edge
    this.distanceAlongEdge += distanceToMove;

    const currentNode = allNodes.get(currentNodeId);
    const nextNode = allNodes.get(nextNodeId);

    if (currentNode && nextNode) {
      const edgeLength = edge.length;

      if (this.distanceAlongEdge >= edgeLength) {
        // Move to next node
        this.currentPathIndex++;
        this.distanceAlongEdge = 0;
        this.position = { ...nextNode.position };

        if (this.currentPathIndex < this.pathNodeIds.length - 1) {
          // Update angle to next segment
          const upcomingNext = this.pathNodeIds[this.currentPathIndex + 1];
          const upcomingNode = allNodes.get(upcomingNext);
          if (upcomingNode) {
            this.angle = Math.atan2(
              upcomingNode.position.y - this.position.y,
              upcomingNode.position.x - this.position.x
            );
          }
        }
      } else {
        // Interpolate position along edge
        const progress = this.distanceAlongEdge / edgeLength;
        this.position.x = currentNode.position.x + (nextNode.position.x - currentNode.position.x) * progress;
        this.position.y = currentNode.position.y + (nextNode.position.y - currentNode.position.y) * progress;

        // Update angle
        this.angle = Math.atan2(
          nextNode.position.y - currentNode.position.y,
          nextNode.position.x - currentNode.position.x
        );
      }
    }
  }

  /**
   * Accelerate or decelerate towards target speed
   */
  setTargetSpeed(targetSpeed: number, acceleration: number = 50): void {
    if (this.speed < targetSpeed) {
      this.speed = Math.min(targetSpeed, this.speed + acceleration * 0.016); // ~16ms frame time
    } else if (this.speed > targetSpeed) {
      this.speed = Math.max(targetSpeed, this.speed - acceleration * 0.016);
    }
  }

  /**
   * Check if vehicle has completed its path
   */
  isCompleted(): boolean {
    return this.completedAt !== null;
  }

  /**
   * Get wait time in seconds
   */
  getWaitTime(): number {
    if (!this.waitStartTime) return 0;
    return (Date.now() - this.waitStartTime) / 1000;
  }

  /**
   * Start waiting (at red light, etc.)
   */
  startWaiting(): void {
    if (this.state !== 'waiting') {
      this.waitStartTime = Date.now();
      this.state = 'waiting';
    }
  }

  /**
   * Resume from waiting
   */
  resumeMoving(): void {
    this.waitStartTime = null;
    this.state = 'moving';
  }

  /**
   * Get travel time if completed
   */
  getTravelTime(): number | null {
    if (!this.completedAt) return null;
    return (this.completedAt - this.createdAt) / 1000;
  }
}
