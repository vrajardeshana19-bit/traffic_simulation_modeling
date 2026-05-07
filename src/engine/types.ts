/**
 * Core type definitions for the traffic simulation engine.
 * PURE DEFINITIONS - NO INTERNAL IMPORTS
 */

export interface Point {
  x: number;
  y: number;
}

export interface Position extends Point {}

export interface Velocity {
  x: number;
  y: number;
}

export interface RoadNode {
  id: string;
  position: Point;
  connections: string[];
  isIntersection: boolean;
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  speedLimit: number;
  lanes: number;
  length: number;
}

export interface IRoadNetwork {
  nodes: RoadNode[];
  edges: RoadEdge[];
  getIntersection(id: string): RoadNode | undefined;
  getAdjacentIntersections(id: string): string[];
}

export interface IVehicle {
  id: string;
  position: Point;
  speed: number;
  maxSpeed: number;
  pathNodeIds: string[];
  currentEdgeId: string;
  state: 'moving' | 'waiting' | 'stopped';
  color: string;
  size: number;
  angle: number;
}

export interface ITrafficSignal {
  nodeId: string;
  phase: 'green' | 'yellow' | 'red';
  timer: number;
  greenDuration: number;
  redDuration: number;
}

export interface SimMetrics {
  avgWaitTime: number;
  throughput: number;
  activeVehicles: number;
  completedTrips: number;
  timestamp: number;
}

export interface ScenarioConfig {
  name: string;
  description?: string;
  vehicleCount: number;
  spawnRate: number;
  signalTiming: number;
  preset: 'normal' | 'rush_hour' | 'accident' | 'signal_optimized';
}
