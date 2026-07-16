interface Props {
  /** ISO local hour strings, aligned with prob/mm arrays. */
  times: string[];
  /** Precipitation probability 0–100 per hour. */
  prob: number[];
  /** Precipitation amount per hour, mm. */
  mm: number[];
}

const W = 296;
const H = 96;
const PAD_L = 6;
const PAD_R = 6;
const BASE = H - 18;
const TOP = 10;

/** Next-24h raincast: bars = mm, step line = probability. */
export function RaincastChart({ times, prob, mm }: Props) {
  const n = Math.min(times.length, 24);
  if (n === 0) return null;

  const step = (W - PAD_L - PAD_R) / n;
  const maxMm = Math.max(2, ...mm.slice(0, n));
  const usable = BASE - TOP;

  const bars = [];
  for (let i = 0; i < n; i++) {
    const h = Math.max(0, Math.min(mm[i] / maxMm, 1)) * usable;
    const p = Math.min(Math.max(prob[i] ?? 0, 0), 100) / 100;
    bars.push(
      <rect
        key={i}
        x={PAD_L + i * step + step * 0.18}
        y={BASE - h}
        width={step * 0.64}
        height={Math.max(h, mm[i] > 0 ? 2 : 0)}
        rx={1}
        fill="#38bdf8"
        opacity={0.25 + 0.75 * p}
      />,
    );
  }

  const linePoints = Array.from({ length: n }, (_, i) => {
    const p = Math.min(Math.max(prob[i] ?? 0, 0), 100) / 100;
    const x = PAD_L + i * step + step / 2;
    const y = BASE - p * usable;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const hourLabel = (iso: string, i: number) =>
    i === 0 ? 'NOW' : iso.slice(11, 16);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="raincast-chart" role="img" aria-label="24 hour precipitation forecast">
      <line x1={PAD_L} y1={BASE} x2={W - PAD_R} y2={BASE} stroke="rgba(125,211,252,.25)" strokeWidth="1" />
      {bars}
      <path d={linePoints} fill="none" stroke="#5df2d6" strokeWidth="1.4" strokeLinejoin="round" />
      {[0, 6, 12, 18].map((i) => (
        <text
          key={i}
          x={PAD_L + i * step + step / 2}
          y={H - 5}
          textAnchor="middle"
          className="chart-label"
        >
          {hourLabel(times[i], i)}
        </text>
      ))}
      <text x={W - PAD_R} y={TOP + 2} textAnchor="end" className="chart-label accent">
        {Math.max(...prob.slice(0, n))}% P
      </text>
    </svg>
  );
}
