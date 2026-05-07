/**
 * Main canvas component rendering the traffic simulation
 */

import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import type { RoadNode, RoadEdge } from '../engine/types';
import { Vehicle } from '../engine/Vehicle';
import { TrafficSignal } from '../engine/TrafficSignal';

interface CanvasSize {
  width: number;
  height: number;
}

export const SimulationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [canvasSize, setCanvasSize] = React.useState<CanvasSize>({ width: 800, height: 800 });

  const engine = useSimulationStore((state) => state.engine);
  const isRunning = useSimulationStore((state) => state.isRunning);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridWidth = 3 * 160;
    const gridHeight = 3 * 160;
    const offsetX = (canvasSize.width - gridWidth) / 2;
    const offsetY = (canvasSize.height - gridHeight) / 2;

    const render = () => {
      const { nodes, edges } = engine.getNetwork();
      const vehicles = engine.getVehicles();
      const signals = engine.getSignals();
      const now = Date.now();
      const scale = 1.01 + Math.sin((now / 10000) * Math.PI * 2) * 0.01;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      drawCanvasBackground(ctx, canvas.width, canvas.height);
      drawDistrictZones(ctx, canvas.width, canvas.height);

      const congestionMap = calculateCongestion(vehicles);
      drawRoads(ctx, edges, nodes, offsetX, offsetY, congestionMap);
      drawRoadShoulders(ctx, edges, nodes, offsetX, offsetY);
      drawLaneMarkings(ctx, edges, nodes, offsetX, offsetY);
      drawIntersections(ctx, nodes, offsetX, offsetY);
      drawTrafficSignals(ctx, nodes, signals, offsetX, offsetY);
      drawVehicles(ctx, vehicles, offsetX, offsetY);

      ctx.restore();

      drawScanlines(ctx, canvas.width, canvas.height);
      drawLiveIndicator(ctx, canvas.width, isRunning);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [engine, isRunning, canvasSize]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full bg-slate-900"
      />
    </div>
  );
};

function calculateCongestion(vehicles: Vehicle[]): Map<string, number> {
  const congestionMap = new Map<string, number>();

  // Count vehicles per edge
  for (const vehicle of vehicles) {
    if (vehicle.currentEdgeId) {
      congestionMap.set(vehicle.currentEdgeId, (congestionMap.get(vehicle.currentEdgeId) || 0) + 1);
    }
  }

  return congestionMap;
}

function drawRoads(ctx: CanvasRenderingContext2D, edges: RoadEdge[], nodes: RoadNode[], offsetX: number, offsetY: number, congestionMap: Map<string, number>): void {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const drawn = new Set<string>();

  for (const edge of edges) {
    const key = `${edge.from}-${edge.to}`;
    if (drawn.has(key)) continue;
    drawn.add(key);

    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (!fromNode || !toNode) continue;

    const vehicleCount = congestionMap.get(edge.id) || 0;
    let congestionColor = 'rgba(0, 0, 0, 0)'; // No overlay

    if (vehicleCount >= 6) {
      congestionColor = 'rgba(255, 68, 68, 0.25)'; // Red for high congestion
    } else if (vehicleCount >= 3) {
      congestionColor = 'rgba(255, 215, 0, 0.2)'; // Yellow for medium congestion
    }

    // Draw road base
    ctx.strokeStyle = '#1e2538';
    ctx.lineWidth = 14;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(fromNode.position.x + offsetX, fromNode.position.y + offsetY);
    ctx.lineTo(toNode.position.x + offsetX, toNode.position.y + offsetY);
    ctx.stroke();

    // Draw inner highlight
    ctx.strokeStyle = '#2a3450';
    ctx.lineWidth = 10;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(fromNode.position.x + offsetX, fromNode.position.y + offsetY);
    ctx.lineTo(toNode.position.x + offsetX, toNode.position.y + offsetY);
    ctx.stroke();

    // Draw congestion overlay
    if (congestionColor !== 'rgba(0, 0, 0, 0)') {
      ctx.strokeStyle = congestionColor;
      ctx.lineWidth = 14;

      ctx.beginPath();
      ctx.moveTo(fromNode.position.x + offsetX, fromNode.position.y + offsetY);
      ctx.lineTo(toNode.position.x + offsetX, toNode.position.y + offsetY);
      ctx.stroke();
    }
  }
}

function drawRoadShoulders(ctx: CanvasRenderingContext2D, edges: RoadEdge[], nodes: RoadNode[], offsetX: number, offsetY: number): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const drawn = new Set<string>();

  for (const edge of edges) {
    const key = `${edge.from}-${edge.to}`;
    if (drawn.has(key)) continue;
    drawn.add(key);

    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) continue;

    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const offset = 8;

    ctx.strokeStyle = '#ffffff08';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromNode.position.x + offsetX + nx * offset, fromNode.position.y + offsetY + ny * offset);
    ctx.lineTo(toNode.position.x + offsetX + nx * offset, toNode.position.y + offsetY + ny * offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(fromNode.position.x + offsetX - nx * offset, fromNode.position.y + offsetY - ny * offset);
    ctx.lineTo(toNode.position.x + offsetX - nx * offset, toNode.position.y + offsetY - ny * offset);
    ctx.stroke();

    ctx.setLineDash([]);
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, color: string): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCanvasBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = '#080b14';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 0; x < width; x += 30) {
    for (let y = 0; y < height; y += 30) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.8);
  gradient.addColorStop(0, 'rgba(30,50,100,0.15)');
  gradient.addColorStop(1, 'rgba(8,11,20,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawDistrictZones(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const zones = [
    { x: width * 0.08, y: height * 0.12, w: width * 0.3, h: height * 0.28 },
    { x: width * 0.55, y: height * 0.14, w: width * 0.35, h: height * 0.22 },
    { x: width * 0.22, y: height * 0.56, w: width * 0.45, h: height * 0.32 },
  ];

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.fillStyle = 'rgba(79,142,247,0.04)';
  ctx.lineWidth = 1;

  for (const zone of zones) {
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  ctx.lineWidth = 1;

  for (let y = 0; y < height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLaneMarkings(ctx: CanvasRenderingContext2D, edges: RoadEdge[], nodes: RoadNode[], offsetX: number, offsetY: number): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const drawn = new Set<string>();

  for (const edge of edges) {
    const key = `${edge.from}-${edge.to}`;
    if (drawn.has(key)) continue;
    drawn.add(key);

    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);

    if (!fromNode || !toNode) continue;

    ctx.strokeStyle = '#ffffff15';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromNode.position.x + offsetX, fromNode.position.y + offsetY);
    ctx.lineTo(toNode.position.x + offsetX, toNode.position.y + offsetY);
    ctx.stroke();

    ctx.setLineDash([]);
  }
}

function drawIntersections(ctx: CanvasRenderingContext2D, nodes: RoadNode[], offsetX: number, offsetY: number): void {
  for (const node of nodes) {
    const x = node.position.x + offsetX;
    const y = node.position.y + offsetY;

    ctx.fillStyle = '#1e2538';
    ctx.strokeStyle = '#2a3450';
    ctx.lineWidth = 1;
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeRect(x - 12, y - 12, 24, 24);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 2, y - 20, 4, 10);
    ctx.fillRect(x - 2, y + 10, 4, 10);
    ctx.fillRect(x - 20, y - 2, 10, 4);
    ctx.fillRect(x + 10, y - 2, 10, 4);
  }
}

function drawTrafficSignals(
  ctx: CanvasRenderingContext2D,
  nodes: RoadNode[],
  signals: Map<string, TrafficSignal>,
  offsetX: number,
  offsetY: number
): void {
  const now = Date.now();
  const glow = 15 + Math.sin(now / 300) * 5;

  for (const node of nodes) {
    const signal = signals.get(node.id);
    if (!signal) continue;

    const phaseColors: Record<string, string> = {
      green: '#00ff88',
      yellow: '#ffd700',
      red: '#ff4444',
    };

    const color = phaseColors[signal.phase];
    const x = node.position.x + offsetX;
    const y = node.position.y + offsetY;

    ctx.shadowColor = `${color}88`;
    ctx.shadowBlur = glow;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function drawVehicles(ctx: CanvasRenderingContext2D, vehicles: Vehicle[], offsetX: number, offsetY: number): void {
  const palette = ['#4f8ef7', '#f74f4f', '#4ff7a0', '#f7c94f', '#c44ff7', '#f7744f'];

  const getVehicleColor = (id: string) => {
    const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  for (const vehicle of vehicles) {
    const x = vehicle.position.x + offsetX;
    const y = vehicle.position.y + offsetY;
    const bodyColor = getVehicleColor(vehicle.id);
    const trailLength = 10;
    const trailOffsetX = -Math.cos(vehicle.angle) * trailLength;
    const trailOffsetY = -Math.sin(vehicle.angle) * trailLength;

    // Faint trail from previous position
    ctx.save();
    ctx.translate(x + trailOffsetX, y + trailOffsetY);
    ctx.rotate(vehicle.angle);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    drawRoundedRect(ctx, -10, -5.5, 20, 11, 3, 'rgba(255,255,255,0.1)');
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(vehicle.angle);
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    drawRoundedRect(ctx, -10, -5.5, 20, 11, 3, bodyColor);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(4, -5.5, 6, 3.5);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, -3.5, 2, 0, Math.PI * 2);
    ctx.arc(8, 3.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff3f3f';
    ctx.beginPath();
    ctx.arc(-8, -3.5, 2, 0, Math.PI * 2);
    ctx.arc(-8, 3.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawLiveIndicator(
  ctx: CanvasRenderingContext2D,
  width: number,
  isRunning: boolean
): void {
  // Pulsing effect
  if (isRunning) {
    const now = Date.now();
    const pulse = Math.sin(now / 300) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
  } else {
    ctx.globalAlpha = 0.3;
  }

  // Red pulsing dot
  ctx.fillStyle = '#ff4444';
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.arc(width - 30, 20, 6, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('LIVE', width - 50, 25);

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export default SimulationCanvas;
