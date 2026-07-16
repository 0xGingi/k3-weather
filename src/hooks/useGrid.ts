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
    let retryId: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      try {
        const { points, fetchedAt } = await fetchGrid();
        if (stopped) return;
        setGrid(points, fetchedAt);
        setGridError(null);
      } catch {
        if (stopped) return;
        setGridError('LIVE GRID UPLINK FAILED — RETRYING');
        // Quick retry until the uplink recovers; the slow interval only
        // governs steady-state refreshes.
        retryId = setTimeout(() => void load(), 45_000);
      }
    };

    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      stopped = true;
      if (retryId) clearTimeout(retryId);
      clearInterval(id);
    };
  }, [setGrid, setGridError]);
}
