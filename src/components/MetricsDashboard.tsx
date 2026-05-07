/**
 * MetricsDashboard - Display live metrics charts using Recharts
 */

import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const metricCards = [
  { label: 'Avg Wait', color: '#ffd700', key: 'avgWaitTime', suffix: 's' },
  { label: 'Completed Trips', color: '#00ff88', key: 'completedTrips', suffix: '' },
  { label: 'Active Vehicles', color: '#4f8ef7', key: 'activeVehicles', suffix: '' },
  { label: 'Throughput', color: '#c44ff7', key: 'throughput', suffix: '/min' },
];

export const MetricsDashboard: React.FC = () => {
  const metrics = useSimulationStore((state) => state.metrics);

  const currentMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const throughputPerMin = React.useMemo(() => {
    if (!currentMetrics || metrics.length < 2) return 0;
    const minutes = Math.max(1, (currentMetrics.timestamp - metrics[0].timestamp) / 60000);
    return Math.round((currentMetrics.completedTrips ?? 0) / minutes);
  }, [currentMetrics, metrics]);

  const values = {
    avgWaitTime: currentMetrics?.avgWaitTime.toFixed(1) ?? '0.0',
    completedTrips: currentMetrics?.completedTrips ?? 0,
    activeVehicles: currentMetrics?.activeVehicles ?? 0,
    throughput: throughputPerMin,
  } as Record<string, string | number>;

  const chartData = metrics.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avgWaitTime: Number(entry.avgWaitTime.toFixed(1)),
    completedTrips: entry.completedTrips,
    activeVehicles: entry.activeVehicles,
  }));

  const chartConfigs = [
    { label: 'Average Wait Time', key: 'avgWaitTime', color: '#ffd700', suffix: 's' },
    { label: 'Completed Trips', key: 'completedTrips', color: '#00ff88', suffix: '' },
    { label: 'Active Vehicles', key: 'activeVehicles', color: '#4f8ef7', suffix: '' },
  ];

  return (
    <div style={{ padding: '20px', background: '#080b14', borderBottom: '1px solid #1a2035' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ color: '#4f8ef7', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Metrics</span>
        <div style={{ flex: 1, height: '1px', background: '#1a2035' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {metricCards.map((card) => (
          <div key={card.key} style={{ background: '#0d1526', border: '1px solid #1a2035', borderRadius: '12px', padding: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: '4px', height: '4px', background: card.color, display: 'inline-block' }} />
              <span style={{ color: '#6b7280', fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', textTransform: 'uppercase' }}>{card.label}</span>
            </div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, textAlign: 'right' }}>
              {values[card.key]}{card.suffix}
            </div>
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '3px', background: card.color, opacity: 0.25, borderRadius: '0 0 12px 12px' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '12px' }}>
        {chartConfigs.map((chart) => (
          <div key={chart.key} style={{ background: '#0d1526', border: '1px solid #1a2035', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700 }}>{chart.label}</span>
              <span style={{ color: chart.color, fontSize: '12px', fontWeight: 700 }}>{chart.suffix}</span>
            </div>
            {metrics.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: '#6b7280', fontSize: '12px' }}>
                Start simulation to see data
              </div>
            ) : (
              <div style={{ width: '100%', height: '120px' }}>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`${chart.key}Gradient`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chart.color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1a2035" vertical={false} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} minTickGap={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} width={32} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1a2035', color: '#ffffff' }} cursor={{ stroke: '#4f8ef7', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} fill={`url(#${chart.key}Gradient)`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsDashboard;
