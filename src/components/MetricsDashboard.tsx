/**
 * MetricsDashboard - Live analytics dashboard with metric cards and charts
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSimulationStore } from '../store/simulationStore';

interface MetricCardProps {
  label: string;
  value: string | number;
  accent: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, accent }) => (
  <div
    style={{
      background: '#0d1526',
      border: '1px solid #1a2035',
      borderRadius: '6px',
      padding: '16px',
      textAlign: 'center',
      borderBottom: `3px solid ${accent}`,
    }}
  >
    <div
      style={{
        fontSize: '10px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        textTransform: 'uppercase',
        color: '#6b7280',
        marginBottom: '8px',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: '20px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        color: '#ffffff',
        fontWeight: 'bold',
      }}
    >
      {value}
    </div>
  </div>
);

export const MetricsDashboard: React.FC = () => {
  const metrics = useSimulationStore((state) => state.metrics);

  // Get last 60 entries for charts
  const recentMetrics = useMemo(() => {
    if (metrics.length === 0) return [];
    return metrics.slice(-60).map((metric, index) => ({
      time: index,
      avgWaitTime: parseFloat(metric.avgWaitTime.toFixed(1)),
      completedTrips: metric.completedTrips,
      activeVehicles: metric.activeVehicles,
    }));
  }, [metrics]);

  // Get current stats
  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const avgWait = currentMetrics?.avgWaitTime ?? 0;
  const completedTrips = currentMetrics?.completedTrips ?? 0;
  const activeVehicles = currentMetrics?.activeVehicles ?? 0;
  const throughput = currentMetrics?.throughput ?? 0;

  return (
    <div
      style={{
        padding: '16px',
        borderTop: '1px solid #1a2035',
      }}
    >
      {/* 2x2 Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <MetricCard
          label="Avg Wait Time"
          value={`${avgWait.toFixed(1)}s`}
          accent="#ffd700"
        />
        <MetricCard
          label="Completed Trips"
          value={completedTrips}
          accent="#00ff88"
        />
        <MetricCard
          label="Active Vehicles"
          value={activeVehicles}
          accent="#4f8ef7"
        />
        <MetricCard
          label="Throughput"
          value={`${throughput.toFixed(0)}/min`}
          accent="#9d4edd"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Average Wait Time Chart */}
        <div style={{ background: '#0d1526', border: '1px solid #1a2035', borderRadius: '6px', padding: '8px' }}>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: '8px',
              paddingLeft: '8px',
            }}
          >
            Avg Wait Time (60s)
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={recentMetrics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d1526',
                  border: '1px solid #1a2035',
                  borderRadius: '4px',
                  color: '#ffffff',
                }}
              />
              <Line
                type="monotone"
                dataKey="avgWaitTime"
                stroke="#ffd700"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Completed Trips Chart */}
        <div style={{ background: '#0d1526', border: '1px solid #1a2035', borderRadius: '6px', padding: '8px' }}>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: '8px',
              paddingLeft: '8px',
            }}
          >
            Completed Trips (60s)
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={recentMetrics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d1526',
                  border: '1px solid #1a2035',
                  borderRadius: '4px',
                  color: '#ffffff',
                }}
              />
              <Line
                type="monotone"
                dataKey="completedTrips"
                stroke="#00ff88"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Vehicles Chart */}
        <div style={{ background: '#0d1526', border: '1px solid #1a2035', borderRadius: '6px', padding: '8px' }}>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              textTransform: 'uppercase',
              color: '#6b7280',
              marginBottom: '8px',
              paddingLeft: '8px',
            }}
          >
            Active Vehicles (60s)
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={recentMetrics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '10px' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d1526',
                  border: '1px solid #1a2035',
                  borderRadius: '4px',
                  color: '#ffffff',
                }}
              />
              <Line
                type="monotone"
                dataKey="activeVehicles"
                stroke="#4f8ef7"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
