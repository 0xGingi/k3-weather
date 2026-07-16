import { create } from 'zustand';
import type { GridPoint } from './api/openmeteo';

export type LayerId = 'temperature' | 'precipitation' | 'cloud' | 'wind';

export interface SelectedLocation {
  lat: number;
  lon: number;
  name: string | null;
}

interface AppState {
  selected: SelectedLocation | null;
  select: (s: SelectedLocation | null) => void;

  layer: LayerId;
  setLayer: (l: LayerId) => void;

  graticuleOn: boolean;
  dataOn: boolean;
  toggleGraticule: () => void;
  toggleData: () => void;

  grid: GridPoint[] | null;
  gridFetchedAt: number | null;
  setGrid: (g: GridPoint[], t: number) => void;
  gridError: string | null;
  setGridError: (e: string | null) => void;

  /** Camera fly-to request; nonce forces re-trigger for repeat clicks. */
  flyTo: { lat: number; lon: number; nonce: number } | null;
  requestFlyTo: (lat: number, lon: number) => void;
}

export const useStore = create<AppState>((set) => ({
  selected: null,
  select: (s) => set({ selected: s }),

  layer: 'temperature',
  setLayer: (l) => set({ layer: l }),

  graticuleOn: true,
  dataOn: true,
  toggleGraticule: () => set((st) => ({ graticuleOn: !st.graticuleOn })),
  toggleData: () => set((st) => ({ dataOn: !st.dataOn })),

  grid: null,
  gridFetchedAt: null,
  setGrid: (g, t) => set({ grid: g, gridFetchedAt: t }),
  gridError: null,
  setGridError: (e) => set({ gridError: e }),

  flyTo: null,
  requestFlyTo: (lat, lon) => set((st) => ({ flyTo: { lat, lon, nonce: (st.flyTo?.nonce ?? 0) + 1 } })),
}));
