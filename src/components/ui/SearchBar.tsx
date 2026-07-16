import { useEffect, useRef, useState } from 'react';
import { searchPlaces, type GeoResult } from '../../api/geocode';
import { useStore } from '../../store';
import { PinIcon, SearchIcon } from './icons';

export function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = useStore((s) => s.select);
  const requestFlyTo = useStore((s) => s.requestFlyTo);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    setSearching(true);
    setOpen(true);
    const id = setTimeout(() => {
      searchPlaces(query, ctrl.signal)
        .then((r) => {
          setResults(r);
          setSearching(false);
          setActiveIdx(r.length > 0 ? 0 : -1);
        })
        .catch(() => setSearching(false));
    }, 300);
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

  useEffect(() => {
    itemRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const pick = (r: GeoResult) => {
    const name = [r.name, r.country].filter(Boolean).join(', ');
    select({ lat: r.latitude, lon: r.longitude, name });
    requestFlyTo(r.latitude, r.longitude);
    setQ('');
    setResults([]);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[activeIdx] ?? results[0];
      if (open && r) pick(r);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search" ref={boxRef}>
      <SearchIcon size={15} className="search-icon" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="SEARCH CITY, ZIP OR PLACE"
        spellCheck={false}
        aria-label="Search city, zip or place"
        role="combobox"
        aria-expanded={open}
        aria-controls="search-results"
        aria-activedescendant={activeIdx >= 0 ? `search-opt-${activeIdx}` : undefined}
      />
      {open && q.trim().length >= 2 && (
        <ul className="search-results" id="search-results" role="listbox">
          {searching && <li className="search-note micro">SEARCHING…</li>}
          {!searching && results.length === 0 && (
            <li className="search-note micro">NO MATCHES FOUND</li>
          )}
          {results.map((r, i) => (
            <li key={r.id} role="option" id={`search-opt-${i}`} aria-selected={i === activeIdx}>
              <button
                type="button"
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={i === activeIdx ? 'active' : ''}
                onClick={() => pick(r)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <PinIcon size={13} />
                <span className="result-name">{r.name}</span>
                <span className="result-sub">
                  {r.sub ?? [r.admin1, r.country].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
