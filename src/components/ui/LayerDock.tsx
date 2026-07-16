import { useStore, type LayerId } from '../../store';
import { CloudIcon, DotsIcon, DropletIcon, GridIcon, ThermoIcon, WindIcon } from './icons';

const LAYERS: { id: LayerId; label: string; Icon: typeof ThermoIcon }[] = [
  { id: 'temperature', label: 'TEMP', Icon: ThermoIcon },
  { id: 'precipitation', label: 'RAIN', Icon: DropletIcon },
  { id: 'cloud', label: 'CLOUD', Icon: CloudIcon },
  { id: 'wind', label: 'WIND', Icon: WindIcon },
];

export function LayerDock() {
  const layer = useStore((s) => s.layer);
  const setLayer = useStore((s) => s.setLayer);
  const graticuleOn = useStore((s) => s.graticuleOn);
  const dataOn = useStore((s) => s.dataOn);
  const toggleGraticule = useStore((s) => s.toggleGraticule);
  const toggleData = useStore((s) => s.toggleData);

  return (
    <nav className="dock" aria-label="Map layers">
      {LAYERS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`dock-btn ${layer === id && dataOn ? 'active' : ''}`}
          onClick={() => setLayer(id)}
        >
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
      <div className="dock-divider" />
      <button
        type="button"
        className={`dock-btn ${graticuleOn ? 'active' : ''}`}
        onClick={toggleGraticule}
        title="Lat/lon graticule"
      >
        <GridIcon size={15} />
        <span>GRID</span>
      </button>
      <button
        type="button"
        className={`dock-btn ${dataOn ? 'active' : ''}`}
        onClick={toggleData}
        title="Live data cells"
      >
        <DotsIcon size={15} />
        <span>CELLS</span>
      </button>
    </nav>
  );
}
