import type { Units } from '../store';

/** Weather data is always fetched in °C; convert only for display. */
export function tempIn(celsius: number, units: Units): number {
  return units === 'F' ? (celsius * 9) / 5 + 32 : celsius;
}
