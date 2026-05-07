import React, { useState, useEffect, useMemo } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlBar } from './components/ControlBar';
import { ScenarioPanel } from './components/ScenarioPanel';
import { MetricsDashboard } from './components/MetricsDashboard';

export const App: React.FC = () => {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const config = useSimulationStore((state) => state.config);
  const engine = useSimulationStore((state) => state.engine);
  const metrics = useSimulationStore((state) => state.metrics);
  const updateConfig = useSimulationStore((state) => state.updateConfig);
  const startSim = useSimulationStore((state) => state.startSim);
  const [copied, setCopied] = useState(false);

  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const activeVehicles = engine ? engine.getVehicles().length : currentMetrics?.activeVehicles ?? 0;
  const avgWait = currentMetrics?.avgWaitTime ?? 0;
  const throughputPerMin = useMemo(() => {
    if (metrics.length < 2) return 0;
    const recentMetrics = metrics.slice(-60); // last 60 entries
    const tripsCompleted = recentMetrics.length > 1
      ? recentMetrics[recentMetrics.length - 1].completedTrips - recentMetrics[0].completedTrips
      : 0;
    const timeMinutes = recentMetrics.length > 1
      ? (recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp) / 60000
      : 1;
    return Math.round(tripsCompleted / Math.max(0.016, timeMinutes));
  }, [metrics]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scenario = params.get('scenario');
    if (scenario) {
      try {
        const decodedConfig = JSON.parse(atob(scenario));
        updateConfig(decodedConfig);
      } catch (e) {
        console.error('Invalid scenario URL');
      }
    }
  }, [updateConfig]);

  useEffect(() => {
    if (!engine) {
      startSim();
    }
  }, [engine, startSim]);

  const handleShare = async () => {
    try {
      const encoded = btoa(JSON.stringify(config));
      const url = window.location.origin + '?scenario=' + encoded;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#080b14',
    }}>
      <header style={{
        height: '56px',
        background: '#080b14',
        borderBottom: '1px solid #1a2035',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#4f8ef7', fontWeight: 800, letterSpacing: '3px', fontSize: '15px' }}>TRAFFIC</span>
          <span style={{ color: '#ffffff', fontWeight: 800, letterSpacing: '3px', fontSize: '15px' }}>SIM</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', background: '#0d1526', border: '1px solid #1a2035', borderRadius: '999px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', color: '#ffffff' }}>
              <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Vehicles</span>
              <span>{activeVehicles}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', background: '#0d1526', border: '1px solid #1a2035', borderRadius: '999px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', color: '#ffffff' }}>
              <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Throughput</span>
              <span>{throughputPerMin}/min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 14px', background: '#0d1526', border: '1px solid #1a2035', borderRadius: '999px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', color: '#ffffff' }}>
              <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Avg Wait</span>
              <span>{avgWait.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleShare}
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid #1a2035',
              borderRadius: '6px',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
            {copied ? 'Copied!' : 'Share'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '999px',
                background: isRunning ? '#ff4444' : '#6b7280',
                boxShadow: isRunning ? '0 0 10px rgba(255,68,68,0.8)' : '0 0 8px rgba(107,114,128,0.5)',
                animation: isRunning ? 'pulseDot 1.2s infinite alternate' : 'none',
              }}
            />
            <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700 }}>{isRunning ? 'LIVE' : 'PAUSED'}</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
          <SimulationCanvas />
        </div>

        <div style={{ width: '320px', overflowY: 'auto', background: '#080b14', borderLeft: '1px solid #1a2035', flexShrink: 0, minHeight: 0 }}>
          <ScenarioPanel />
          <MetricsDashboard />
        </div>
      </div>

      <ControlBar />

      <style>{`
        @keyframes pulseDot {
          from { box-shadow: 0 0 8px rgba(255,68,68,0.7); }
          to { box-shadow: 0 0 18px rgba(255,68,68,0.9); }
        }
      `}</style>
    </div>
  );
};

export default App;
