import { useEffect, useState } from 'react';
import { fetchLocation, type LocationForecast } from '../../api/openmeteo';
import { formatLatLon } from '../../lib/geo';
import { tempIn } from '../../lib/units';
import { wmo } from '../../lib/wmo';
import { useStore } from '../../store';
import { useNow } from '../../hooks/useNow';
import { CloseIcon, PinIcon, WeatherIcon } from './icons';
import { RaincastChart } from './RaincastChart';

type PanelState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: LocationForecast };

function localTime(now: Date, utcOffset: number): string {
  const t = new Date(now.getTime() + utcOffset * 1000);
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mm = String(t.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function windCardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function WeatherPanel() {
  const selected = useStore((s) => s.selected);
  const select = useStore((s) => s.select);
  const [state, setState] = useState<PanelState | null>(null);
  const now = useNow(30_000);

  const lat = selected?.lat;
  const lon = selected?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      setState(null);
      return;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetchLocation(lat, lon, ctrl.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
  }, [lat, lon]);

  if (!selected) return null;

  return (
    <aside className="panel bracket">
      <header className="panel-header">
        <div className="panel-title">
          <PinIcon size={14} />
          <div>
            <h2>{selected.name ?? formatLatLon(selected.lat, selected.lon)}</h2>
            <span className="micro">
              {state?.status === 'ready'
                ? `${state.data.timezone.replace('_', ' ')} · LOCAL ${localTime(now, state.data.utcOffset)}`
                : formatLatLon(selected.lat, selected.lon)}
            </span>
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={() => select(null)} aria-label="Close panel">
          <CloseIcon size={14} />
        </button>
      </header>

      {state?.status === 'loading' && <div className="panel-status micro">ACQUIRING STATION DATA…</div>}
      {state?.status === 'error' && (
        <div className="panel-status micro warn">UPLINK FAILED — CHECK CONNECTION</div>
      )}

      {state?.status === 'ready' && <PanelBody data={state.data} />}
    </aside>
  );
}

function PanelBody({ data }: { data: LocationForecast }) {
  const units = useStore((s) => s.units);
  const c = data.current;
  const info = wmo(c.weatherCode);

  // Next 24h from the current hour
  const currentHour = c.time.slice(0, 13);
  let start = data.hourly.time.findIndex((t) => t.slice(0, 13) >= currentHour);
  if (start < 0) start = 0;
  const times = data.hourly.time.slice(start, start + 24);
  const prob = data.hourly.precipitationProbability.slice(start, start + 24);
  const mm = data.hourly.precipitation.slice(start, start + 24);

  const totalMm = mm.reduce((a, b) => a + b, 0);
  const nextRainIdx = prob.findIndex((p, i) => p >= 40 || mm[i] >= 0.1);
  const raincastSummary =
    totalMm < 0.1 && nextRainIdx === -1
      ? 'NO RAIN EXPECTED IN THE NEXT 24H'
      : nextRainIdx <= 0
        ? `RAINING NOW · ${totalMm.toFixed(1)} MM IN 24H`
        : `NEXT RAIN IN ~${nextRainIdx}H · ${totalMm.toFixed(1)} MM IN 24H`;

  const weekMin = Math.min(...data.daily.tempMin.slice(0, 7));
  const weekMax = Math.max(...data.daily.tempMax.slice(0, 7));

  return (
    <div className="panel-body">
      <section className="now-block">
        <div className="now-main">
          <span className="now-temp">{Math.round(tempIn(c.temperature, units))}°</span>
          <div className="now-cond">
            <WeatherIcon icon={info.icon} size={30} />
            <span>{info.label}</span>
            <span className="micro">{c.isDay ? 'DAYTIME' : 'NIGHT'}</span>
          </div>
        </div>
        <div className="stats-grid">
          <Stat label="FEELS LIKE" value={`${Math.round(tempIn(c.feelsLike, units))}°${units}`} />
          <Stat label="HUMIDITY" value={`${c.humidity}%`} />
          <Stat label="WIND" value={`${c.windSpeed.toFixed(1)} m/s ${windCardinal(c.windDirection)}`} />
          <Stat label="PRESSURE" value={`${Math.round(c.pressure)} hPa`} />
          <Stat label="CLOUD" value={`${c.cloudCover}%`} />
          <Stat label="PRECIP 1H" value={`${c.precipitation.toFixed(1)} mm`} />
        </div>
      </section>

      <section className="raincast">
        <div className="section-head">
          <span className="micro">RAINCAST · NEXT 24H</span>
          <span className="micro accent">{raincastSummary}</span>
        </div>
        <RaincastChart times={times} prob={prob} mm={mm} />
      </section>

      <section className="daily">
        <span className="micro">7-DAY OUTLOOK</span>
        <ul>
          {data.daily.time.slice(0, 7).map((d, i) => {
            const day =
              i === 0
                ? 'TODAY'
                : new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const di = wmo(data.daily.weatherCode[i]);
            const tmin = data.daily.tempMin[i];
            const tmax = data.daily.tempMax[i];
            const left = ((tmin - weekMin) / Math.max(weekMax - weekMin, 1)) * 100;
            const width = ((tmax - tmin) / Math.max(weekMax - weekMin, 1)) * 100;
            const pProb = data.daily.precipitationProbabilityMax[i] ?? 0;
            return (
              <li key={d}>
                <span className="day mono">{day}</span>
                <WeatherIcon icon={di.icon} size={16} />
                <span className="day-pop mono" title="Precipitation probability">
                  {pProb > 0 ? `${pProb}%` : ''}
                </span>
                <span className="range">
                  <span className="range-fill" style={{ left: `${left}%`, width: `${width}%` }} />
                </span>
                <span className="temps mono">
                  {Math.round(tempIn(tmin, units))}° / {Math.round(tempIn(tmax, units))}°
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="micro">{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}
