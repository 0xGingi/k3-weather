export type RGB = [number, number, number];

type Stop = [number, RGB];

function lerpStops(stops: Stop[], v: number): RGB {
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [v0, c0] = stops[i - 1];
      const [v1, c1] = stops[i];
      const t = (v - v0) / (v1 - v0);
      return [
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
      ];
    }
  }
  return stops[stops.length - 1][1];
}

const TEMP_STOPS: Stop[] = [
  [-30, [59, 130, 246]],
  [-10, [34, 211, 238]],
  [0, [74, 222, 128]],
  [12, [250, 204, 21]],
  [24, [251, 146, 60]],
  [36, [239, 68, 68]],
  [45, [190, 18, 60]],
];

export function temperatureColor(t: number): RGB {
  return lerpStops(TEMP_STOPS, t);
}

/** Rain intensity: 0 → faint cyan, ≥5mm/h → deep blue. */
export function precipitationColor(mm: number): { color: RGB; alpha: number } {
  const t = Math.min(Math.max(mm / 5, 0), 1);
  return {
    color: lerpStops(
      [
        [0, [56, 189, 248]],
        [1, [29, 78, 216]],
      ],
      t,
    ),
    alpha: mm <= 0 ? 0.12 : 0.35 + 0.65 * t,
  };
}

export function cloudColor(pct: number): { color: RGB; alpha: number } {
  const t = Math.min(Math.max(pct / 100, 0), 1);
  return { color: [226, 232, 240], alpha: 0.08 + 0.85 * t };
}

const WIND_STOPS: Stop[] = [
  [0, [45, 212, 191]],
  [8, [163, 230, 53]],
  [15, [251, 191, 36]],
  [25, [244, 114, 182]],
];

export function windColor(ms: number): RGB {
  return lerpStops(WIND_STOPS, ms);
}
