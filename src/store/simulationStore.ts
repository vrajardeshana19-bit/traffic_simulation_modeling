/**
 * Global simulation state using Zustand
 */

import { create } from 'zustand';
import type { ScenarioConfig, SimMetrics } from '../engine/types';
import { SimulationEngine } from '../engine/SimulationEngine';

interface SimulationStoreState {
  // Configuration
  config: ScenarioConfig;

  // State
  isRunning: boolean;
  isPaused: boolean;
  speed: 1 | 2 | 5 | 10;

  // Data
  metrics: SimMetrics[];

  // Engine instance
  engine: SimulationEngine | null;

  // Actions
  startSim: () => void;
  pauseSim: () => void;
  resetSim: () => void;
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
  updateConfig: (newConfig: Partial<ScenarioConfig>) => void;
  addMetrics: (metrics: SimMetrics) => void;
}

const DEFAULT_CONFIG: ScenarioConfig = {
  name: 'Normal Traffic',
  vehicleCount: 50,
  spawnRate: 5,
  signalTiming: 15,
  preset: 'normal',
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  // Initial state
  config: DEFAULT_CONFIG,
  isRunning: false,
  isPaused: false,
  speed: 1,
  metrics: [],
  engine: null,

  // Actions
  startSim: () => {
    console.log('Store: startSim called');
    const { engine, config } = get();

    if (!engine) {
      console.log('Store: Creating new engine with config:', config);
      const newEngine = new SimulationEngine(config);

      // Register metrics callback
      newEngine.onMetricsUpdate((metrics) => {
        get().addMetrics(metrics);
      });

      set({ engine: newEngine });
      newEngine.start();
    } else {
      console.log('Store: Starting existing engine');
      engine.start();
    }

    set({ isRunning: true, isPaused: false });
    console.log('Store: Simulation started');
  },

  pauseSim: () => {
    const { engine } = get();
    if (engine) {
      engine.pause();
      const currentPaused = get().isPaused;
      set({ isPaused: !currentPaused });
    }
  },

  resetSim: () => {
    const { engine } = get();
    if (engine) {
      engine.reset();
    }
    set({ isRunning: false, isPaused: false, metrics: [] });
  },

  setSpeed: (speed: 1 | 2 | 5 | 10) => {
    const { engine } = get();
    if (engine) {
      engine.setSpeedMultiplier(speed);
    }
    set({ speed });
  },

  updateConfig: (newConfig: Partial<ScenarioConfig>) => {
    set((state) => ({
      config: { ...state.config, ...newConfig },
    }));
  },

  addMetrics: (metrics: SimMetrics) => {
    set((state) => {
      const updated = [...state.metrics, metrics];
      // Keep last 100 metrics
      if (updated.length > 100) {
        updated.shift();
      }
      return { metrics: updated };
    });
  },
}));
