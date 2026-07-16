import * as THREE from 'three';

const DEG = Math.PI / 180;

/** lat/lon (degrees) → position on a THREE.SphereGeometry-mapped sphere of `radius`. */
export function latLonToVec3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Inverse of latLonToVec3 — world position on the globe back to lat/lon degrees. */
export function vec3ToLatLon(p: THREE.Vector3): { lat: number; lon: number } {
  const r = p.length();
  const lat = 90 - Math.acos(THREE.MathUtils.clamp(p.y / r, -1, 1)) / DEG;
  const lon = Math.atan2(p.z, -p.x) / DEG - 180;
  return { lat, lon: ((lon + 540) % 360) - 180 };
}

/**
 * Sub-solar point (NOAA approximation): where the sun is directly overhead
 * right now. Used to light the day/night terminator in realtime.
 */
export function getSunPosition(date = new Date()): {
  lat: number;
  lon: number;
  direction: THREE.Vector3;
} {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcMinutes / 60 - 12) / 24);

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const solarTime = utcMinutes + eqTime;
  const lon = ((180 - solarTime / 4 + 540) % 360) - 180;
  const lat = decl / DEG;
  return { lat, lon, direction: latLonToVec3(lat, lon, 1) };
}

export function formatLatLon(lat: number, lon: number): string {
  const la = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lo = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
  return `${la} · ${lo}`;
}
