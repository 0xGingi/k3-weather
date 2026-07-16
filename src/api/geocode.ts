export interface GeoResult {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  /** Preformatted context line; takes precedence over admin1/country in the dropdown. */
  sub?: string;
}

/** US-style numeric zips, plus UK/Canada-style alphanumeric postcodes. */
const POSTAL_RE = /^(\d[\d -]{2,9}|[a-z]{1,2}\d[a-z\d]?\s?\d[a-z]{2})$/i;

function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

/**
 * Autocomplete: Open-Meteo geocoding for cities/places; Nominatim (OSM) for
 * postal codes and as a fallback when the primary geocoder has no answer.
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const q = query.trim();
  if (q.length >= 3 && POSTAL_RE.test(q)) {
    return searchNominatim(q, signal);
  }
  try {
    const places = await searchOpenMeteo(q, signal);
    if (places.length > 0) return places;
  } catch (e) {
    if (isAbort(e)) throw e;
  }
  return searchNominatim(q, signal);
}

async function searchOpenMeteo(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=6&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`geocode failed (${res.status})`);
  const d = (await res.json()) as { results?: GeoResult[] };
  return d.results ?? [];
}

interface NominatimItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    state?: string;
    county?: string;
    country?: string;
  };
}

async function searchNominatim(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query,
  )}&format=jsonv2&limit=6&addressdetails=1&accept-language=en`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`nominatim failed (${res.status})`);
  const items = (await res.json()) as NominatimItem[];
  return items.map((it) => {
    const segs = it.display_name.split(',').map((s) => s.trim());
    return {
      id: `n${it.place_id}`,
      name: segs[0],
      sub: segs.slice(1, 3).join(' · '),
      latitude: Number(it.lat),
      longitude: Number(it.lon),
      admin1: it.address?.state ?? it.address?.county,
      country: it.address?.country,
    };
  });
}

/**
 * Free key-less reverse geocoder — gives a human name for globe clicks.
 * Returns null when there's nothing meaningful (e.g. open ocean).
 */
export async function reverseLookup(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(
      4,
    )}&longitude=${lon.toFixed(4)}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    const place = d.city || d.locality;
    if (place && d.countryName) return `${place}, ${d.countryName}`;
    if (d.principalSubdivision && d.countryName)
      return `${d.principalSubdivision}, ${d.countryName}`;
    if (d.countryName) return d.countryName;
    return null;
  } catch {
    return null;
  }
}
