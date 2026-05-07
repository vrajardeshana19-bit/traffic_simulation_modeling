/**
 * ScenarioPanel - Configure scenario parameters (spawn rate, vehicle count, etc.)
 */

import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { SCENARIO_PRESETS } from '../scenarios/presets';
import type { ScenarioConfig } from '../engine/types';

type PresetCard = {
  id: string;
  label: string;
  accent: string;
  config: ScenarioConfig;
};

type SliderKey = 'vehicleCount' | 'spawnRate' | 'signalTiming';

const PRESET_CARDS: PresetCard[] = [
  {
    id: 'normal',
    label: 'NORMAL',
    accent: '#00ff88',
    config: {
      name: 'Normal Traffic',
      description: 'Balanced traffic flow with standard signals and a steady pace.',
      vehicleCount: 50,
      spawnRate: 5,
      signalTiming: 15,
      preset: 'normal',
    },
  },
  {
    id: 'rush_hour',
    label: 'RUSH HOUR',
    accent: '#ff4444',
    config: SCENARIO_PRESETS.find((preset) => preset.preset === 'rush_hour')!,
  },
  {
    id: 'accident',
    label: 'ACCIDENT',
    accent: '#ffd700',
    config: SCENARIO_PRESETS.find((preset) => preset.preset === 'accident')!,
  },
  {
    id: 'optimized',
    label: 'OPTIMIZED',
    accent: '#4f8ef7',
    config: SCENARIO_PRESETS.find((preset) => preset.preset === 'signal_optimized')!,
  },
];

export const ScenarioPanel: React.FC = () => {
  const config = useSimulationStore((state) => state.config);
  const updateConfig = useSimulationStore((state) => state.updateConfig);
  const resetSim = useSimulationStore((state) => state.resetSim);
  const startSim = useSimulationStore((state) => state.startSim);
  const [selectedPreset, setSelectedPreset] = useState<string>('Custom');

  useEffect(() => {
    if (!config) return;

    const foundPreset = PRESET_CARDS.find((card) =>
      card.config.vehicleCount === config.vehicleCount &&
      card.config.spawnRate === config.spawnRate &&
      card.config.signalTiming === config.signalTiming
    );

    setSelectedPreset(foundPreset ? foundPreset.id : 'Custom');
  }, [config]);

  const handlePresetClick = (id: string) => {
    setSelectedPreset(id);
    const preset = PRESET_CARDS.find((card) => card.id === id);
    if (preset) {
      updateConfig(preset.config);
    }
  };

  const handleSliderChange = (key: SliderKey, value: number) => {
    updateConfig({ [key]: value });
    setSelectedPreset('Custom');
  };

  const handleApplyAndRestart = () => {
    resetSim();
    setTimeout(() => startSim(), 300);
  };

  return (
    <div style={{ padding: '20px', background: '#080b14', borderBottom: '1px solid #1a2035', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <span style={{ color: '#4f8ef7', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Presets</span>
        <div style={{ flex: 1, height: '1px', background: '#1a2035' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 140px)', gap: '12px', justifyContent: 'center' }}>
        {PRESET_CARDS.map((card) => {
          const isActive = selectedPreset === card.id;
          return (
            <button
              key={card.id}
              onClick={() => handlePresetClick(card.id)}
              style={{
                width: '140px',
                minHeight: '100px',
                padding: '16px',
                borderRadius: '16px',
                background: isActive ? '#111827' : '#0d1526',
                border: `1px solid ${isActive ? card.accent : '#1a2035'}`,
                color: '#ffffff',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{card.label}</span>
                {isActive && <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: card.accent }} />}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.4' }}>{card.config.description}</p>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ color: '#4f8ef7', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Custom Settings</span>
        <div style={{ flex: 1, height: '1px', background: '#1a2035' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {([
          { label: 'Vehicle Count', key: 'vehicleCount', min: 5, max: 100, step: 5, suffix: '' },
          { label: 'Spawn Rate', key: 'spawnRate', min: 1, max: 15, step: 1, suffix: ' /sec' },
          { label: 'Signal Timing', key: 'signalTiming', min: 10, max: 60, step: 5, suffix: 's' },
        ] as const).map(({ label, key, min, max, step, suffix }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ flex: 1, fontSize: '11px', color: '#6b7280', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={config ? config[key] : 0}
              onChange={(e) => handleSliderChange(key, parseInt(e.target.value, 10))}
              style={{ flex: 2, accentColor: '#4f8ef7', appearance: 'none', height: '3px', background: '#1a2035' }}
            />
            <span style={{ minWidth: '48px', textAlign: 'right', fontSize: '13px', color: '#ffffff', fontWeight: 500, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
              {config ? config[key] : 0}{suffix}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleApplyAndRestart}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '16px',
          background: '#4f8ef7',
          color: '#080b14',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Apply & Restart
      </button>
    </div>
  );
};

export default ScenarioPanel;
