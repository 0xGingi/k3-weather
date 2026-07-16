import { useStore, type LayerId } from '../../store';
import { tempIn } from '../../lib/units';

const LEGENDS: Record<LayerId, { title: string; unit: string; min: string; max: string; gradient: string }> = {
  temperature: {
    title: 'TEMPERATURE',
    unit: '°C',
    min: '-30',
    max: '+45',
    gradient: 'linear-gradient(90deg,#3b82f6,#22d3ee,#4ade80,#facc15,#fb923c,#ef4444,#be123c)',
  },
  precipitation: {
    title: 'PRECIPITATION · 1H',
    unit: 'mm',
    min: '0',
    max: '5+',
    gradient: 'linear-gradient(90deg,rgba(56,189,248,.12),#38bdf8,#1d4ed8)',
  },
  cloud: {
    title: 'CLOUD COVER',
    unit: '%',
    min: '0',
    max: '100',
    gradient: 'linear-gradient(90deg,rgba(226,232,240,.08),#e2e8f0)',
  },
  wind: {
    title: 'WIND SPEED',
    unit: 'm/s',
    min: '0',
    max: '25+',
    gradient: 'linear-gradient(90deg,#2dd4bf,#a3e635,#fbbf24,#f472b6)',
  },
};

export function Legend() {
  const layer = useStore((s) => s.layer);
  const dataOn = useStore((s) => s.dataOn);
  const units = useStore((s) => s.units);
  if (!dataOn) return null;
  const l = LEGENDS[layer];

  // Temperature scale is defined in °C; convert the labels for display.
  const isTemp = layer === 'temperature';
  const min = isTemp ? String(Math.round(tempIn(-30, units))) : l.min;
  const max = isTemp ? `+${Math.round(tempIn(45, units))}` : l.max;
  const unit = isTemp ? `°${units}` : l.unit;

  return (
    <div className="legend bracket">
      <span className="micro">{l.title}</span>
      <div className="legend-bar" style={{ background: l.gradient }} />
      <div className="legend-scale">
        <span className="mono">{min}</span>
        <span className="mono dim">{unit}</span>
        <span className="mono">{max}</span>
      </div>
    </div>
  );
}
