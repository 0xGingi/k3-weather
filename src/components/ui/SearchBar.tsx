import { useEffect, useRef, useState } from 'react';
import { searchPlaces, type GeoResult } from '../../api/geocode';
import { useStore } from '../../store';
import { PinIcon, SearchIcon } from './icons';

export function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const select = useStore((s) => s.select);
  const requestFlyTo = useStore((s) => s.requestFlyTo);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      searchPlaces(q.trim(), ctrl.signal)
        .then((r) => {
          setResults(r);
          setOpen(true);
        })
        .catch(() => {});
    }, 250);
    return () => {
      ctrl.abort();
      clearTimeout(id);
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  const pick = (r: GeoResult) => {
    const name = [r.name, r.country].filter(Boolean).join(', ');
    select({ lat: r.latitude, lon: r.longitude, name });
    requestFlyTo(r.latitude, r.longitude);
    setQ('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="search" ref={boxRef}>
      <SearchIcon size={15} className="search-icon" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="SEARCH CITY OR PLACE"
        spellCheck={false}
        aria-label="Search city or place"
      />
      {open && results.length > 0 && (
        <ul className="search-results">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => pick(r)}>
                <PinIcon size={13} />
                <span className="result-name">{r.name}</span>
                <span className="result-sub">
                  {[r.admin1, r.country].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
