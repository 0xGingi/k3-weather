import { useProgress } from '@react-three/drei';
import { useStore } from '../../store';

export function LoadingOverlay() {
  const { active, progress } = useProgress();
  const grid = useStore((s) => s.grid);
  const gridError = useStore((s) => s.gridError);

  // Don't trap the user behind the loader if the grid uplink failed —
  // the globe stays usable while the error toast + retries handle it.
  if (!active && (grid || gridError)) return null;

  return (
    <div className="loader">
      <div className="loader-box">
        <div className="loader-ring" />
        <span className="micro blink">ACQUIRING EARTH DATA</span>
        <span className="mono accent">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
