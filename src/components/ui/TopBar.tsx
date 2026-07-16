import { useStore } from '../../store';
import { useNow } from '../../hooks/useNow';
import { SearchBar } from './SearchBar';

function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <circle cx="15" cy="15" r="11.5" stroke="#5df2d6" strokeWidth="1.3" />
      <path d="M3.5 15h23M15 3.5c4.2 4.6 4.2 18.4 0 23-4.2-4.6-4.2-18.4 0-23z" stroke="#5df2d6" strokeWidth="1" />
      <circle cx="15" cy="15" r="2.2" fill="#5df2d6" />
    </svg>
  );
}

export function TopBar() {
  const now = useNow(1000);
  const gridFetchedAt = useStore((s) => s.gridFetchedAt);
  const units = useStore((s) => s.units);
  const setUnits = useStore((s) => s.setUnits);

  const utc = now.toUTCString().slice(17, 25);
  const ageMin = gridFetchedAt ? Math.floor((now.getTime() - gridFetchedAt) / 60000) : null;
  const gridStatus = ageMin === null ? 'SYNC…' : ageMin < 1 ? 'LIVE' : `${ageMin}M AGO`;

  return (
    <header className="topbar">
      <div className="brand">
        <LogoMark />
        <div className="brand-text">
          <h1>K3 WEATHER</h1>
          <span className="micro">LIVE EARTH SYSTEMS</span>
        </div>
      </div>
      <SearchBar />
      <div className="topbar-right">
        <div className="unit-toggle" role="group" aria-label="Temperature units">
          <button
            type="button"
            className={units === 'F' ? 'active' : ''}
            onClick={() => setUnits('F')}
          >
            °F
          </button>
          <button
            type="button"
            className={units === 'C' ? 'active' : ''}
            onClick={() => setUnits('C')}
          >
            °C
          </button>
        </div>
        <div className="readout">
          <span className="micro">UTC</span>
          <span className="mono accent">{utc}</span>
        </div>
        <div className="readout">
          <span className="micro">GRID</span>
          <span className="mono accent">{gridStatus}</span>
        </div>
      </div>
    </header>
  );
}
