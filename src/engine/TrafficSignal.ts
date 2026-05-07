/**
 * Traffic signal at an intersection
 * NO CIRCULAR IMPORTS - only imports from ./types
 */

import type { ITrafficSignal } from './types';

export class TrafficSignal implements ITrafficSignal {
  nodeId: string;
  phase: 'green' | 'yellow' | 'red';
  timer: number;
  greenDuration: number;
  redDuration: number;

  private yellowDuration: number = 3;

  constructor(
    nodeId: string,
    greenDuration: number = 15,
    redDuration: number = 15
  ) {
    this.nodeId = nodeId;
    this.phase = 'green';
    this.timer = 0;
    this.greenDuration = greenDuration;
    this.redDuration = redDuration;
  }

  /**
   * Update signal timer and cycle phases
   * Call this each frame with deltaTime in seconds
   */
  update(deltaTime: number): void {
    this.timer += deltaTime;

    const totalCycle = this.greenDuration + this.yellowDuration + this.redDuration;
    const normalizedTime = this.timer % totalCycle;

    if (normalizedTime < this.greenDuration) {
      this.phase = 'green';
    } else if (normalizedTime < this.greenDuration + this.yellowDuration) {
      this.phase = 'yellow';
    } else {
      this.phase = 'red';
    }
  }

  /**
   * Reset signal
   */
  reset(): void {
    this.phase = 'green';
    this.timer = 0;
  }

  /**
   * Get phase as a number (0 = green, 1 = yellow, 2 = red)
   */
  getPhaseNumber(): number {
    return this.phase === 'green' ? 0 : this.phase === 'yellow' ? 1 : 2;
  }
}
