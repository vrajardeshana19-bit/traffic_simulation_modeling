/**
 * Control bar with simulation controls
 */

import React from 'react';
import { useSimulationStore } from '../store/simulationStore';

interface ControlBarProps {
  congestionViewEnabled?: boolean;
  onToggleCongestionView?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ 
  congestionViewEnabled = false, 
  onToggleCongestionView 
}) => {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const speed = useSimulationStore((state) => state.speed);
  const config = useSimulationStore((state) => state.config);
  const metrics = useSimulationStore((state) => state.metrics);

  const startSim = useSimulationStore((state) => state.startSim);
  const pauseSim = useSimulationStore((state) => state.pauseSim);
  const resetSim = useSimulationStore((state) => state.resetSim);
  const setSpeed = useSimulationStore((state) => state.setSpeed);

  const currentMetrics = metrics.length ? metrics[metrics.length - 1] : null;
  const progress = currentMetrics ? Math.min(1, currentMetrics.activeVehicles / Math.max(1, config.vehicleCount)) : 0;

  return (
    <div style={{ background: '#080b14', borderTop: '1px solid #1a2035', overflow: 'hidden' }}>
      <div style={{ height: '2px', width: `${progress * 100}%`, background: '#4f8ef7', transition: 'width 0.2s ease' }} />
      <div style={{ height: '50px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
        <button
          onClick={() => {
            if (!isRunning) {
              startSim();
            } else {
              pauseSim();
            }
          }}
          style={{
            width: '90px',
            height: '36px',
            borderRadius: '6px',
            border: 'none',
            background: isRunning ? '#ffd700' : '#00ff88',
            color: '#000',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isRunning) {
              (e.currentTarget as HTMLButtonElement).style.background = '#00cc6a';
            }
          }}
          onMouseLeave={(e) => {
            if (!isRunning) {
              (e.currentTarget as HTMLButtonElement).style.background = '#00ff88';
            }
          }}
        >
          {isRunning ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
        </button>

        <button
          onClick={resetSim}
          style={{
            width: '90px',
            height: '36px',
            borderRadius: '6px',
            border: '1px solid #1a2035',
            background: 'transparent',
            color: '#6b7280',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>

        <button
          onClick={onToggleCongestionView}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '6px',
            border: `1px solid ${congestionViewEnabled ? '#4f8ef7' : '#1a2035'}`,
            background: 'transparent',
            color: congestionViewEnabled ? '#ffffff' : '#6b7280',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s',
          }}
        >
          Congestion View
        </button>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
          {([1, 2, 5, 10] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                minWidth: '42px',
                height: '36px',
                borderRadius: '6px',
                border: 'none',
                background: speed === s ? '#4f8ef7' : '#0d1526',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
};

export default ControlBar;
