/**
 * Preset scenario configurations for traffic simulation.
 */

import type { ScenarioConfig } from '../engine/types';

/**
 * Rush Hour scenario - high vehicle density with standard traffic signals
 */
export const RUSH_HOUR_SCENARIO: ScenarioConfig = {
  name: 'Rush Hour',
  description: 'High-density traffic with 2 vehicles/second spawn rate. Standard signal timing.',
  vehicleCount: 200,
  spawnRate: 2.0,
  signalTiming: 15,
  preset: 'rush_hour',
};

/**
 * Accident scenario - one lane blocked, reducing capacity on a key road
 */
export const ACCIDENT_SCENARIO: ScenarioConfig = {
  name: 'Accident',
  description: 'Medium traffic with one lane blocked at road center. Observe congestion buildup.',
  vehicleCount: 150,
  spawnRate: 1.5,
  signalTiming: 15,
  preset: 'accident',
};

/**
 * Signal Optimization scenario - aggressive green phases on primary corridors
 */
export const SIGNAL_OPTIMIZATION_SCENARIO: ScenarioConfig = {
  name: 'Signal Optimization',
  description: 'Lower traffic density with optimized signal timing for smooth flow.',
  vehicleCount: 100,
  spawnRate: 1.0,
  signalTiming: 15,
  preset: 'signal_optimized',
};

/**
 * Custom test scenario for development
 */
export const TEST_SCENARIO: ScenarioConfig = {
  name: 'Test',
  description: 'Low-traffic test scenario for development and debugging.',
  vehicleCount: 20,
  spawnRate: 0.5,
  signalTiming: 15,
  preset: 'normal',
};

/**
 * All available scenarios
 */
export const SCENARIO_PRESETS = [
  RUSH_HOUR_SCENARIO,
  ACCIDENT_SCENARIO,
  SIGNAL_OPTIMIZATION_SCENARIO,
  TEST_SCENARIO,
];

/**
 * Get scenario by name
 */
export function getScenarioByName(name: string): ScenarioConfig | undefined {
  return SCENARIO_PRESETS.find((s) => s.name === name);
}

/**
 * Export scenario to JSON string
 */
export function scenarioToJSON(scenario: ScenarioConfig): string {
  return JSON.stringify(scenario, null, 2);
}

/**
 * Import scenario from JSON string
 */
export function scenarioFromJSON(json: string): ScenarioConfig | null {
  try {
    return JSON.parse(json) as ScenarioConfig;
  } catch {
    return null;
  }
}

/**
 * Generate shareable URL for scenario (using query string encoding)
 */
export function generateShareableURL(scenario: ScenarioConfig): string {
  const json = scenarioToJSON(scenario);
  const encoded = encodeURIComponent(json);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?scenario=${encoded}`;
}

/**
 * Parse scenario from URL query parameters
 */
export function parseScenarioFromURL(): ScenarioConfig | null {
  const params = new URLSearchParams(window.location.search);
  const scenarioJson = params.get('scenario');

  if (!scenarioJson) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(scenarioJson);
    return scenarioFromJSON(decoded);
  } catch {
    return null;
  }
}
