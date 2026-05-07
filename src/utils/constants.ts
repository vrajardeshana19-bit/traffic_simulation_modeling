/**
 * Global constants for the traffic simulation.
 */

export const CONSTANTS = {
  // Road network
  GRID_SIZE: 4, // 4x4 grid of intersections
  INTERSECTION_SPACING: 200, // meters between intersections
  DEFAULT_LANE_COUNT: 2,
  DEFAULT_SPEED_LIMIT: 15, // m/s (~54 km/h)
  HIGHWAY_SPEED_LIMIT: 30, // m/s (~108 km/h)

  // Vehicle properties
  VEHICLE_WIDTH: 2, // meters
  VEHICLE_LENGTH: 5, // meters
  VEHICLE_MAX_SPEED: 20, // m/s
  VEHICLE_ACCELERATION: 3, // m/s²
  VEHICLE_DECELERATION: 5, // m/s²
  VEHICLE_MIN_FOLLOWING_DISTANCE: 2, // meters minimum spacing

  // Traffic signal timing (milliseconds)
  SIGNAL_GREEN_DURATION: 30000, // 30 seconds
  SIGNAL_YELLOW_DURATION: 3000, // 3 seconds
  SIGNAL_RED_DURATION: 30000, // 30 seconds

  // Simulation defaults
  DEFAULT_TICK_RATE: 30, // milliseconds per frame
  SPAWN_RATE_DEFAULT: 1.0, // vehicles per second
  TOTAL_VEHICLES_DEFAULT: 50,
  METRICS_HISTORY_SIZE: 120, // keep last 120 snapshots (~4 seconds at 30fps)

  // Rendering
  CANVAS_BACKGROUND_COLOR: '#ffffff',
  ROAD_COLOR: '#cccccc',
  ROAD_LINE_COLOR: '#ffffff',
  INTERSECTION_COLOR: '#666666',
  SIGNAL_LIGHT_RADIUS: 8, // pixels
  VEHICLE_COLOR_MOVING: '#00aa00', // green
  VEHICLE_COLOR_SLOW: '#ffaa00', // orange
  VEHICLE_COLOR_STOPPED: '#ff0000', // red
  CONGESTION_THRESHOLD_LIGHT: 0.3, // < 30% congestion
  CONGESTION_THRESHOLD_MEDIUM: 0.7, // 30-70% congestion

  // Scenario durations
  SCENARIO_DEFAULT_DURATION: 600000, // 10 minutes
};

export default CONSTANTS;
