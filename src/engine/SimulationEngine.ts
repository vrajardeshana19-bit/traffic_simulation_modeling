/**
 * Main simulation engine orchestrating all simulation logic
 * NO CIRCULAR IMPORTS - only imports from types and other engine files
 */

import type { RoadNode, RoadEdge, ScenarioConfig, SimMetrics } from './types';
import { Vehicle } from './Vehicle';
import { TrafficSignal } from './TrafficSignal';
import { createDefaultNetwork, findPath } from './RoadNetwork';

type MetricsCallback = (metrics: SimMetrics) => void;

export class SimulationEngine {
  private nodes: RoadNode[] = [];
  private edges: RoadEdge[] = [];
  private signals: Map<string, TrafficSignal> = new Map();
  private vehicles: Vehicle[] = [];
  private completedVehicles: Vehicle[] = [];

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private speedMultiplier: number = 1;
  private lastFrameTime: number = 0;
  private metricsCallbacks: MetricsCallback[] = [];

  private spawnTimer: number = 0;
  private config: ScenarioConfig;

  private vehicleSpawnCounter: number = 0;
  private totalWaitTime: number = 0;
  private waitCount: number = 0;
  private completedTrips: number = 0;

  constructor(config: ScenarioConfig) {
    this.config = config;

    // Create network
    const network = createDefaultNetwork();
    this.nodes = network.nodes;
    this.edges = network.edges;

    // Create traffic signals at each node
    for (const node of this.nodes) {
      const signal = new TrafficSignal(node.id, config.signalTiming, config.signalTiming);
      this.signals.set(node.id, signal);
    }
  }

  /**
   * Start the simulation
   */
  start(): void {
    console.log('SimulationEngine: Starting simulation');
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = Date.now();
    this.tick();
  }

  /**
   * Pause the simulation
   */
  pause(): void {
    this.isPaused = !this.isPaused;
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.vehicles = [];
    this.completedVehicles = [];
    this.spawnTimer = 0;
    this.vehicleSpawnCounter = 0;
    this.totalWaitTime = 0;
    this.waitCount = 0;
    this.completedTrips = 0;

    // Reset all signals
    for (const signal of this.signals.values()) {
      signal.reset();
    }
  }

  /**
   * Set speed multiplier (1x, 2x, 5x, 10x)
   */
  setSpeedMultiplier(multiplier: 1 | 2 | 5 | 10): void {
    this.speedMultiplier = multiplier;
  }

  /**
   * Register callback for metrics updates
   */
  onMetricsUpdate(callback: MetricsCallback): void {
    this.metricsCallbacks.push(callback);
  }

  /**
   * Main simulation loop
   */
  private tick(): void {
    if (!this.isRunning) return;

    const now = Date.now();
    const deltaTimeMs = Math.max(1, now - this.lastFrameTime);
    this.lastFrameTime = now;

    if (!this.isPaused) {
      const deltaTime = deltaTimeMs / 1000; // Convert to seconds
      const adjustedDelta = deltaTime * this.speedMultiplier;

      // Spawn new vehicles
      this.spawnVehicles(adjustedDelta);

      // Update signals
      this.updateSignals(adjustedDelta);

      // Update vehicles
      this.updateVehicles(adjustedDelta);

      // Collect metrics every second
      if (now % 1000 < deltaTimeMs) {
        this.emitMetrics();
      }
    }

    requestAnimationFrame(() => this.tick());
  }

  /**
   * Spawn vehicles based on spawn rate
   */
  private spawnVehicles(deltaTime: number): void {
    if (this.vehicles.length >= this.config.vehicleCount) return;

    this.spawnTimer += deltaTime;
    const spawnInterval = 1 / this.config.spawnRate; // Seconds between spawns

    while (this.spawnTimer >= spawnInterval && this.vehicles.length < this.config.vehicleCount) {
      this.spawnTimer -= spawnInterval;

      // Pick random start and end nodes
      const startNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      const endNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];

      if (startNode.id !== endNode.id) {
        const path = findPath(startNode.id, endNode.id, this.nodes);

        const vehicle = new Vehicle(
          `vehicle_${this.vehicleSpawnCounter++}`,
          startNode.position,
          path,
          70 + Math.random() * 40
        );

        this.vehicles.push(vehicle);
        console.log(`SimulationEngine: Spawned vehicle ${vehicle.id} from ${startNode.id} to ${endNode.id}`);
      }
    }
  }

  /**
   * Update all traffic signals
   */
  private updateSignals(deltaTime: number): void {
    for (const signal of this.signals.values()) {
      signal.update(deltaTime);
    }
  }

  /**
   * Update all vehicles
   */
  private updateVehicles(deltaTime: number): void {
    const nodeLookup = new Map(this.nodes.map(n => [n.id, n]));
    const edgesLookup = new Map(this.edges.map(e => [e.id, e]));

    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const vehicle = this.vehicles[i];

      // Update position
      vehicle.update(deltaTime, edgesLookup, nodeLookup);

      // Simple speed control based on signal
      if (vehicle.pathNodeIds.length > vehicle.pathNodeIds.indexOf(vehicle.pathNodeIds[0]) + 1) {
        const nextNodeId = vehicle.pathNodeIds[vehicle.pathNodeIds.indexOf(vehicle.pathNodeIds[0]) + 1];
        const signal = this.signals.get(nextNodeId);

        if (signal && signal.phase !== 'green') {
          vehicle.setTargetSpeed(0, 100);
          vehicle.startWaiting();
        } else {
          if (vehicle.state === 'waiting') {
            const waitDuration = vehicle.getWaitTime();
            this.totalWaitTime += waitDuration;
            this.waitCount++;
            vehicle.resumeMoving();
          }
          vehicle.setTargetSpeed(vehicle.maxSpeed, 50);
        }
      } else {
        vehicle.setTargetSpeed(vehicle.maxSpeed, 50);
      }

      // Check if completed
      if (vehicle.isCompleted()) {
        this.completedTrips++;
        console.log('Trip completed');
        this.completedVehicles.push(vehicle);
        this.vehicles.splice(i, 1);
      }
    }
  }

  /**
   * Collect and emit metrics
   */
  private emitMetrics(): void {
    const avgWaitTime = this.waitCount > 0 ? this.totalWaitTime / this.waitCount : 0;

    const metrics: SimMetrics = {
      avgWaitTime,
      throughput: this.completedVehicles.length,
      activeVehicles: this.vehicles.length,
      completedTrips: this.completedTrips,
      timestamp: Date.now(),
    };

    this.metricsCallbacks.forEach(cb => cb(metrics));
  }

  /**
   * Get current vehicles for rendering
   */
  getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  /**
   * Get network nodes and edges
   */
  getNetwork(): { nodes: RoadNode[]; edges: RoadEdge[] } {
    return { nodes: this.nodes, edges: this.edges };
  }

  /**
   * Get traffic signals
   */
  getSignals(): Map<string, TrafficSignal> {
    return this.signals;
  }

  /**
   * Get simulation state
   */
  getState(): {
    isRunning: boolean;
    isPaused: boolean;
    speedMultiplier: number;
    activeVehicles: number;
    completedVehicles: number;
  } {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      speedMultiplier: this.speedMultiplier,
      activeVehicles: this.vehicles.length,
      completedVehicles: this.completedVehicles.length,
    };
  }
}
