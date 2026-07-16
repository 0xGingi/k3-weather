import { useProgress } from '@react-three/drei';
import { useStore } from '../../store';

export function LoadingOverlay() {
  const { active, progress } = useProgress();
  const grid = useStore((s) => s.grid);

  if (!active && grid) return null;

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
