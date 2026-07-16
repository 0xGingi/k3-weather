import { useStore, type LayerId, type Units } from '../../store';
import { rainUnit, speedUnit, tempIn } from '../../lib/units';

interface LegendDef {
  title: string;
  unit: string;
  min: string;
  max: string;
  gradient: string;
}

/** Scale bounds are defined metric; labels are converted for display. */
function legendFor(layer: LayerId, units: Units): LegendDef {
  switch (layer) {
    case 'temperature':
      return {
        title: 'TEMPERATURE',
        unit: `°${units}`,
        min: String(Math.round(tempIn(-30, units))),
        max: `+${Math.round(tempIn(45, units))}`,
        gradient:
          'linear-gradient(90deg,#3b82f6,#22d3ee,#4ade80,#facc15,#fb923c,#ef4444,#be123c)',
      };
    case 'precipitation':
      return {
        title: 'PRECIPITATION · 1H',
        unit: rainUnit(units),
        min: '0',
        max: units === 'F' ? '0.2+' : '5+',
        gradient: 'linear-gradient(90deg,rgba(56,189,248,.12),#38bdf8,#1d4ed8)',
      };
    case 'cloud':
      return {
        title: 'CLOUD COVER',
        unit: '%',
        min: '0',
        max: '100',
        gradient: 'linear-gradient(90deg,rgba(226,232,240,.08),#e2e8f0)',
      };
    case 'wind':
      return {
        title: 'WIND SPEED',
        unit: speedUnit(units),
        min: '0',
        max: units === 'F' ? '55+' : '25+',
        gradient: 'linear-gradient(90deg,#2dd4bf,#a3e635,#fbbf24,#f472b6)',
      };
  }
}

export function Legend() {
  const layer = useStore((s) => s.layer);
  const dataOn = useStore((s) => s.dataOn);
  const units = useStore((s) => s.units);
  if (!dataOn) return null;
  const l = legendFor(layer, units);

  return (
    <div className="legend bracket">
      <span className="micro">{l.title}</span>
      <div className="legend-bar" style={{ background: l.gradient }} />
      <div className="legend-scale">
        <span className="mono">{l.min}</span>
        <span className="mono dim">{l.unit}</span>
        <span className="mono">{l.max}</span>
      </div>
    </div>
  );
}
