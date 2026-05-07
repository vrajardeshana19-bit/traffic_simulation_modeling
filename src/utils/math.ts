/**
 * Math utility functions for vector operations and geometry.
 */

import type { Position, Velocity } from '../engine/types';

/**
 * Calculate Euclidean distance between two positions
 */
export function distance(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster, no sqrt)
 */
export function distanceSquared(p1: Position, p2: Position): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate Manhattan distance (used for grid heuristic in A*)
 */
export function manhattanDistance(p1: Position, p2: Position): number {
  return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
}

/**
 * Calculate angle from p1 to p2 in radians
 */
export function angle(p1: Position, p2: Position): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Get velocity components from speed and angle
 */
export function velocityFromSpeedAndAngle(speed: number, angleRad: number): Velocity {
  return {
    x: speed * Math.cos(angleRad),
    y: speed * Math.sin(angleRad),
  };
}

/**
 * Calculate speed from velocity vector
 */
export function speedFromVelocity(vel: Velocity): number {
  return Math.sqrt(vel.x * vel.x + vel.y * vel.y);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Normalize angle to [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Calculate acceleration needed to reach target speed in given time
 */
export function calculateAcceleration(
  currentSpeed: number,
  targetSpeed: number,
  timeToTarget: number
): number {
  if (timeToTarget <= 0) return 0;
  return (targetSpeed - currentSpeed) / timeToTarget;
}

/**
 * Calculate stopping distance given speed and deceleration
 */
export function stoppingDistance(speed: number, deceleration: number): number {
  if (deceleration <= 0) return 0;
  return (speed * speed) / (2 * deceleration);
}
