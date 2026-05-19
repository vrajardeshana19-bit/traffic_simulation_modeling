/**
 * CongestionOverlay - Visual overlay showing road congestion by vehicle density
 */

import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { RoadEdge } from '../engine/types';

interface CongestionLevel {
  level: 'low' | 'medium' | 'high';
  color: string;
  minVehicles: number;
  maxVehicles: number;
}

const CONGESTION_LEVELS: CongestionLevel[] = [
  {
    level: 'low',
    color: 'rgba(0, 255, 136, 0.3)',
    minVehicles: 0,
    maxVehicles: 2,
  },
  {
    level: 'medium',
    color: 'rgba(255, 215, 0, 0.3)',
    minVehicles: 3,
    maxVehicles: 5,
  },
  {
    level: 'high',
    color: 'rgba(255, 68, 68, 0.3)',
    minVehicles: 6,
    maxVehicles: Infinity,
  },
];

interface CongestionOverlayProps {
  isEnabled: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export const CongestionOverlay: React.FC<CongestionOverlayProps> = ({
  isEnabled,
  canvasWidth = 800,
  canvasHeight = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useSimulationStore((state) => state.engine);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getColorForDensity = (vehicleCount: number): string => {
    const level = CONGESTION_LEVELS.find(
      (l) => vehicleCount >= l.minVehicles && vehicleCount <= l.maxVehicles
    );
    return level?.color || 'rgba(255, 68, 68, 0.3)';
  };

  useEffect(() => {
    if (!isEnabled || !canvasRef.current || !engine) {
      return;
    }

    const updateOverlay = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get road network and vehicles
      const network = engine.getNetwork();
      const vehicles = engine.getVehicles();

      if (!network) return;

      // Count vehicles on each road edge
      const vehiclesPerEdge = new Map<string, number>();
      vehicles.forEach((vehicle) => {
        const edgeId = vehicle.currentEdgeId;
        vehiclesPerEdge.set(edgeId, (vehiclesPerEdge.get(edgeId) || 0) + 1);
      });

      // Draw road segments with congestion colors
      network.edges.forEach((edge: RoadEdge) => {
        const fromNode = network.nodes.find((n) => n.id === edge.from);
        const toNode = network.nodes.find((n) => n.id === edge.to);

        if (!fromNode || !toNode) return;

        const vehicleCount = vehiclesPerEdge.get(edge.id) || 0;
        const color = getColorForDensity(vehicleCount);

        // Draw line representing the road
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(4, edge.lanes * 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(fromNode.position.x, fromNode.position.y);
        ctx.lineTo(toNode.position.x, toNode.position.y);
        ctx.stroke();
      });
    };

    // Update overlay every 500ms
    updateIntervalRef.current = setInterval(updateOverlay, 500);

    // Initial draw
    updateOverlay();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isEnabled, engine, canvasWidth, canvasHeight]);

  if (!isEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default CongestionOverlay;
