import { useEffect } from 'react';
import { fetchGrid } from '../api/openmeteo';
import { useStore } from '../store';

const REFRESH_MS = 10 * 60_000;

/** Keeps the global gridmap snapshot fresh — fetch on mount, refresh every 10 min. */
export function useGrid() {
  const setGrid = useStore((s) => s.setGrid);
  const setGridError = useStore((s) => s.setGridError);

  useEffect(() => {
    let stopped = false;

    const load = async () => {
      try {
        const { points, fetchedAt } = await fetchGrid();
        if (stopped) return;
        setGrid(points, fetchedAt);
        setGridError(null);
      } catch {
        if (!stopped) setGridError('LIVE GRID UPLINK FAILED — RETRYING');
      }
    };

    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [setGrid, setGridError]);
}
