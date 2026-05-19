/**
 * ScenarioCompare - Panel to compare two scenario snapshots
 */

import React, { useState, useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';

interface ScenarioSnapshot {
  avgWaitTime: number;
  throughput: number;
  activeVehicles: number;
  completedTrips: number;
}

interface ComparisonResult {
  metric: string;
  scenarioA: number;
  scenarioB: number;
  difference: number;
  percentDifference: number;
  isBetter: boolean;
}

export const ScenarioCompare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scenarioA, setScenarioA] = useState<ScenarioSnapshot | null>(null);
  const [scenarioB, setScenarioB] = useState<ScenarioSnapshot | null>(null);
  const metrics = useSimulationStore((state) => state.metrics);

  // Calculate last 10 second averages
  const getLastTenSecondAverage = (): ScenarioSnapshot | null => {
    if (metrics.length === 0) return null;

    const currentTime = metrics[metrics.length - 1].timestamp;
    const tenSecondsAgo = currentTime - 10000;

    const relevantMetrics = metrics.filter((m) => m.timestamp >= tenSecondsAgo);

    if (relevantMetrics.length === 0) return null;

    const avgWaitTime =
      relevantMetrics.reduce((sum, m) => sum + m.avgWaitTime, 0) /
      relevantMetrics.length;
    const completedTrips =
      relevantMetrics[relevantMetrics.length - 1].completedTrips -
      (relevantMetrics[0].completedTrips || 0);
    const avgActiveVehicles =
      relevantMetrics.reduce((sum, m) => sum + m.activeVehicles, 0) /
      relevantMetrics.length;
    const throughput =
      relevantMetrics.reduce((sum, m) => sum + m.throughput, 0) /
      relevantMetrics.length;

    return {
      avgWaitTime,
      throughput,
      activeVehicles: Math.round(avgActiveVehicles),
      completedTrips,
    };
  };

  // Calculate comparison results
  const comparisons = useMemo((): ComparisonResult[] => {
    if (!scenarioA || !scenarioB) return [];

    return [
      {
        metric: 'Avg Wait Time',
        scenarioA: scenarioA.avgWaitTime,
        scenarioB: scenarioB.avgWaitTime,
        difference: scenarioA.avgWaitTime - scenarioB.avgWaitTime,
        percentDifference:
          ((scenarioA.avgWaitTime - scenarioB.avgWaitTime) /
            scenarioB.avgWaitTime) *
          100,
        isBetter: scenarioB.avgWaitTime < scenarioA.avgWaitTime, // Lower is better
      },
      {
        metric: 'Throughput',
        scenarioA: scenarioA.throughput,
        scenarioB: scenarioB.throughput,
        difference: scenarioA.throughput - scenarioB.throughput,
        percentDifference:
          ((scenarioA.throughput - scenarioB.throughput) / scenarioB.throughput) *
          100,
        isBetter: scenarioB.throughput > scenarioA.throughput, // Higher is better
      },
      {
        metric: 'Active Vehicles',
        scenarioA: scenarioA.activeVehicles,
        scenarioB: scenarioB.activeVehicles,
        difference: scenarioA.activeVehicles - scenarioB.activeVehicles,
        percentDifference:
          ((scenarioA.activeVehicles - scenarioB.activeVehicles) /
            scenarioB.activeVehicles) *
          100,
        isBetter:
          Math.abs(scenarioB.activeVehicles - 50) <
          Math.abs(scenarioA.activeVehicles - 50),
      },
      {
        metric: 'Completed Trips',
        scenarioA: scenarioA.completedTrips,
        scenarioB: scenarioB.completedTrips,
        difference: scenarioA.completedTrips - scenarioB.completedTrips,
        percentDifference:
          ((scenarioA.completedTrips - scenarioB.completedTrips) /
            scenarioB.completedTrips) *
          100,
        isBetter: scenarioB.completedTrips > scenarioA.completedTrips, // Higher is better
      },
    ];
  }, [scenarioA, scenarioB]);

  const handleRecordA = () => {
    const snapshot = getLastTenSecondAverage();
    if (snapshot) {
      setScenarioA(snapshot);
    }
  };

  const handleRecordB = () => {
    const snapshot = getLastTenSecondAverage();
    if (snapshot) {
      setScenarioB(snapshot);
    }
  };

  const ComparisonMetric: React.FC<{ comparison: ComparisonResult }> = ({
    comparison,
  }) => {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          padding: '12px',
          borderBottom: '1px solid #1a2035',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {comparison.metric}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '14px',
              color: '#ffffff',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: 'bold',
            }}
          >
            {typeof comparison.scenarioA === 'number'
              ? comparison.metric.includes('Avg')
                ? comparison.scenarioA.toFixed(1)
                : comparison.scenarioA.toFixed(0)
              : comparison.scenarioA}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '14px',
              color: '#ffffff',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: 'bold',
            }}
          >
            {typeof comparison.scenarioB === 'number'
              ? comparison.metric.includes('Avg')
                ? comparison.scenarioB.toFixed(1)
                : comparison.scenarioB.toFixed(0)
              : comparison.scenarioB}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        background: '#080b14',
        borderTop: '1px solid #1a2035',
      }}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: 'transparent',
          border: 'none',
          borderBottom: isOpen ? '1px solid #1a2035' : 'none',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Compare Scenarios</span>
        <span style={{ color: '#4f8ef7', fontSize: '16px' }}>
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '24px', background: '#0d1526' }}>
          {/* Control Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <button
              onClick={handleRecordA}
              style={{
                padding: '12px 16px',
                background: scenarioA ? '#4f8ef7' : '#1a2035',
                border: '1px solid #1a2035',
                borderRadius: '6px',
                color: scenarioA ? '#ffffff' : '#6b7280',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {scenarioA ? '✓ Record A' : 'Record A'}
            </button>
            <button
              onClick={handleRecordB}
              style={{
                padding: '12px 16px',
                background: scenarioB ? '#4f8ef7' : '#1a2035',
                border: '1px solid #1a2035',
                borderRadius: '6px',
                color: scenarioB ? '#ffffff' : '#6b7280',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {scenarioB ? '✓ Record B' : 'Record B'}
            </button>
          </div>

          {/* Comparison Display */}
          {scenarioA && scenarioB ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  padding: '12px',
                  borderBottom: '2px solid #1a2035',
                }}
              >
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 'bold' }}>
                  METRIC
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#4f8ef7',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  SCENARIO A
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#4f8ef7',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  SCENARIO B
                </div>
              </div>

              {/* Metrics */}
              {comparisons.map((comparison) => (
                <ComparisonMetric
                  key={comparison.metric}
                  comparison={comparison}
                />
              ))}

              {/* Difference Display */}
              <div
                style={{
                  background: '#080b14',
                  border: '1px solid #1a2035',
                  borderRadius: '6px',
                  padding: '16px',
                  marginTop: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '12px',
                  }}
                >
                  Performance Difference (A vs B)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                  }}
                >
                  {comparisons.map((comparison) => {
                    const isGood = comparison.isBetter;
                    const color = isGood ? '#00ff88' : '#ff4444';
                    const arrow = isGood ? '↑' : '↓';

                    return (
                      <div
                        key={comparison.metric}
                        style={{
                          background: '#0d1526',
                          border: '1px solid #1a2035',
                          borderRadius: '4px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          }}
                        >
                          {comparison.metric}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ color, fontSize: '20px', fontWeight: 'bold' }}>
                            {Math.abs(comparison.percentDifference).toFixed(1)}%
                          </span>
                          <span style={{ color, fontSize: '16px' }}>{arrow}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              {scenarioA === null && scenarioB === null
                ? 'Record both scenarios to compare'
                : `Record ${scenarioA ? 'Scenario B' : 'Scenario A'} to compare`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenarioCompare;
