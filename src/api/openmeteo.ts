const API = 'https://api.open-meteo.com/v1/forecast';

export interface GridPoint {
  lat: number;
  lon: number;
  temperature: number;
  precipitation: number;
  cloudCover: number;
  windSpeed: number;
  weatherCode: number;
}

interface GridApiEntry {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    precipitation: number;
    cloud_cover: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

/**
 * Live global snapshot on a 15° lat/lon grid (264 points) in a single request.
 * Powers the gridmap overlay on the globe.
 */
export async function fetchGrid(): Promise<{ points: GridPoint[]; fetchedAt: number }> {
  const lats: number[] = [];
  const lons: number[] = [];
  for (let lat = -75; lat <= 75; lat += 15) lats.push(lat);
  for (let lon = -180; lon < 180; lon += 15) lons.push(lon);

  const latParam: string[] = [];
  const lonParam: string[] = [];
  for (const lat of lats) {
    for (const lon of lons) {
      latParam.push(String(lat));
      lonParam.push(String(lon));
    }
  }

  const url =
    `${API}?latitude=${latParam.join(',')}&longitude=${lonParam.join(',')}` +
    `&current=temperature_2m,precipitation,cloud_cover,weather_code,wind_speed_10m` +
    `&wind_speed_unit=ms&timezone=UTC`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`grid fetch failed (${res.status})`);
  const data = (await res.json()) as GridApiEntry[];
  const entries = Array.isArray(data) ? data : [data];

  const points = entries.map((e) => ({
    lat: Math.round(e.latitude),
    lon: Math.round(e.longitude),
    temperature: e.current.temperature_2m,
    precipitation: e.current.precipitation,
    cloudCover: e.current.cloud_cover,
    windSpeed: e.current.wind_speed_10m,
    weatherCode: e.current.weather_code,
  }));
  return { points, fetchedAt: Date.now() };
}

export interface LocationForecast {
  timezone: string;
  utcOffset: number;
  current: {
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    weatherCode: number;
    cloudCover: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    isDay: boolean;
  };
  hourly: {
    time: string[];
    temperature: number[];
    precipitationProbability: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
    precipitationSum: number[];
    precipitationProbabilityMax: number[];
    sunrise: string[];
    sunset: string[];
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchLocation(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<LocationForecast> {
  const url =
    `${API}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,precipitation_probability,precipitation` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max` +
    `&wind_speed_unit=ms&timezone=auto&forecast_days=8`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`forecast fetch failed (${res.status})`);
  const d = (await res.json()) as any;

  return {
    timezone: d.timezone,
    utcOffset: d.utc_offset_seconds,
    current: {
      time: d.current.time,
      temperature: d.current.temperature_2m,
      feelsLike: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      precipitation: d.current.precipitation,
      weatherCode: d.current.weather_code,
      cloudCover: d.current.cloud_cover,
      pressure: d.current.pressure_msl,
      windSpeed: d.current.wind_speed_10m,
      windDirection: d.current.wind_direction_10m,
      isDay: d.current.is_day === 1,
    },
    hourly: {
      time: d.hourly.time,
      temperature: d.hourly.temperature_2m,
      precipitationProbability: d.hourly.precipitation_probability ?? [],
      precipitation: d.hourly.precipitation,
    },
    daily: {
      time: d.daily.time,
      weatherCode: d.daily.weather_code,
      tempMax: d.daily.temperature_2m_max,
      tempMin: d.daily.temperature_2m_min,
      precipitationSum: d.daily.precipitation_sum,
      precipitationProbabilityMax: d.daily.precipitation_probability_max ?? [],
      sunrise: d.daily.sunrise,
      sunset: d.daily.sunset,
    },
  };
}
