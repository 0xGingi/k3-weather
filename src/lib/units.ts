import type { Units } from '../store';

/**
 * Weather data is always fetched metric (°C, m/s, mm); convert only for
 * display. 'F' means full imperial: °F, mph, inches.
 */
export function tempIn(celsius: number, units: Units): number {
  return units === 'F' ? (celsius * 9) / 5 + 32 : celsius;
}

export function speedIn(ms: number, units: Units): number {
  return units === 'F' ? ms * 2.23694 : ms;
}

export function rainIn(mm: number, units: Units): number {
  return units === 'F' ? mm / 25.4 : mm;
}

export function speedUnit(units: Units): string {
  return units === 'F' ? 'mph' : 'm/s';
}

export function rainUnit(units: Units): string {
  return units === 'F' ? 'in' : 'mm';
}

/** Inches are small — keep two decimals there, one for mm. */
export function fmtRain(mm: number, units: Units): string {
  return units === 'F' ? rainIn(mm, units).toFixed(2) : mm.toFixed(1);
}

export function fmtSpeed(ms: number, units: Units): string {
  return speedIn(ms, units).toFixed(1);
}
