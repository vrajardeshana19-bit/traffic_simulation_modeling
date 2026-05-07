/**
 * Main canvas component rendering the traffic simulation
 */

import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { Vehicle } from '../engine/Vehicle';

export const SimulationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const engine = useSimulationStore((state) => state.engine);
  const isRunning = useSimulationStore((state) => state.isRunning);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvas.width = Math.round(entry.contentRect.width);
        canvas.height = Math.round(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SPACING = 130;
    const GRID = 3 * SPACING;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const offsetX = (w - GRID) / 2-30;
      const offsetY = (h - GRID) / 2-15;

      const { nodes, edges } = engine.getNetwork();
      const vehicles = engine.getVehicles();
      const signals = engine.getSignals();

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#080b14';
      ctx.fillRect(0, 0, w, h);

      // Dot grid
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      for (let x = 0; x < w; x += 30) {
        for (let y = 0; y < h; y += 30) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Radial gradient
      const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.6);
      gradient.addColorStop(0, 'rgba(30,50,100,0.12)');
      gradient.addColorStop(1, 'rgba(8,11,20,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const congestionMap = calculateCongestion(vehicles);
      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      // Draw roads
      const drawn = new Set<string>();
      for (const edge of edges) {
        const key = [edge.from, edge.to].sort().join('-');
        if (drawn.has(key)) continue;
        drawn.add(key);

        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) continue;

        const fx = from.position.x + offsetX;
        const fy = from.position.y + offsetY;
        const tx = to.position.x + offsetX;
        const ty = to.position.y + offsetY;

        // Road base
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#1e2538';
        ctx.lineWidth = 14;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Inner highlight
        ctx.strokeStyle = '#2a3450';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Lane markings
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Congestion overlay
        const count = congestionMap.get(edge.id) || 0;
        if (count >= 6) {
          ctx.strokeStyle = 'rgba(255,68,68,0.25)';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        } else if (count >= 3) {
          ctx.strokeStyle = 'rgba(255,215,0,0.2)';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }

      // Draw intersections
      for (const node of nodes) {
        const x = node.position.x + offsetX;
        const y = node.position.y + offsetY;

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e2538';
        ctx.strokeStyle = '#2a3450';
        ctx.lineWidth = 1;
        ctx.fillRect(x - 12, y - 12, 24, 24);
        ctx.strokeRect(x - 12, y - 12, 24, 24);

        // Crosswalk marks
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x - 2, y - 20, 4, 8);
        ctx.fillRect(x - 2, y + 12, 4, 8);
        ctx.fillRect(x - 20, y - 2, 8, 4);
        ctx.fillRect(x + 12, y - 2, 8, 4);
      }

      // Draw traffic signals
      const now = Date.now();
      const glow = 15 + Math.sin(now / 300) * 5;
      for (const node of nodes) {
        const signal = signals.get(node.id);
        if (!signal) continue;

        const colors: Record<string, string> = {
          green: '#00ff88',
          yellow: '#ffd700',
          red: '#ff4444',
        };

        const color = colors[signal.phase] || '#00ff88';
        const x = node.position.x + offsetX;
        const y = node.position.y + offsetY;

        ctx.shadowColor = color + '99';
        ctx.shadowBlur = glow;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw vehicles
      const palette = ['#4f8ef7', '#f74f4f', '#4ff7a0', '#f7c94f', '#c44ff7', '#f7744f'];
      for (const vehicle of vehicles) {
        const x = vehicle.position.x + offsetX;
        const y = vehicle.position.y + offsetY;
        const hash = Array.from(vehicle.id).reduce((s, c) => s + c.charCodeAt(0), 0);
        const color = palette[hash % palette.length];

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vehicle.angle);

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        // Body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-10, -5.5, 20, 11, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Windshield
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(3, -5, 6, 3.5);

        // Headlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(9, -3.5, 1.5, 0, Math.PI * 2);
        ctx.arc(9, 3.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Taillights
        ctx.fillStyle = '#ff3f3f';
        ctx.beginPath();
        ctx.arc(-9, -3.5, 1.5, 0, Math.PI * 2);
        ctx.arc(-9, 3.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Scanlines
      ctx.strokeStyle = 'rgba(0,0,0,0.025)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // LIVE indicator
      const pulse = isRunning ? Math.sin(now / 300) * 0.3 + 0.7 : 0.3;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(w - 30, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [engine, isRunning]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

function calculateCongestion(vehicles: Vehicle[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of vehicles) {
    if (v.currentEdgeId) map.set(v.currentEdgeId, (map.get(v.currentEdgeId) || 0) + 1);
  }
  return map;
}

export default SimulationCanvas;