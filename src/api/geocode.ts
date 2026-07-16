export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=6&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`geocode failed (${res.status})`);
  const d = (await res.json()) as { results?: GeoResult[] };
  return d.results ?? [];
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
