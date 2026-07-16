import { GlobeScene } from './components/globe/GlobeScene';
import { TopBar } from './components/ui/TopBar';
import { WeatherPanel } from './components/ui/WeatherPanel';
import { LayerDock } from './components/ui/LayerDock';
import { Legend } from './components/ui/Legend';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { Hint } from './components/ui/Hint';
import { useGrid } from './hooks/useGrid';
import { useStore } from './store';

export default function App() {
  useGrid();
  const gridError = useStore((s) => s.gridError);

  return (
    <div className="app">
      <GlobeScene />
      <div className="vignette" />
      <TopBar />
      <WeatherPanel />
      <LayerDock />
      <Legend />
      <Hint />
      <LoadingOverlay />
      {gridError && <div className="toast micro">{gridError}</div>}
    </div>
  );
}
