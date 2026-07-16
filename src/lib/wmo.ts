export type WmoIcon =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm';

export interface WmoInfo {
  label: string;
  icon: WmoIcon;
}

/** WMO weather interpretation codes → label + icon key. */
export function wmo(code: number): WmoInfo {
  switch (code) {
    case 0:
      return { label: 'Clear sky', icon: 'sun' };
    case 1:
      return { label: 'Mainly clear', icon: 'cloud-sun' };
    case 2:
      return { label: 'Partly cloudy', icon: 'cloud-sun' };
    case 3:
      return { label: 'Overcast', icon: 'cloud' };
    case 45:
      return { label: 'Fog', icon: 'fog' };
    case 48:
      return { label: 'Rime fog', icon: 'fog' };
    case 51:
      return { label: 'Light drizzle', icon: 'drizzle' };
    case 53:
      return { label: 'Drizzle', icon: 'drizzle' };
    case 55:
      return { label: 'Dense drizzle', icon: 'drizzle' };
    case 56:
    case 57:
      return { label: 'Freezing drizzle', icon: 'drizzle' };
    case 61:
      return { label: 'Light rain', icon: 'rain' };
    case 63:
      return { label: 'Rain', icon: 'rain' };
    case 65:
      return { label: 'Heavy rain', icon: 'rain' };
    case 66:
    case 67:
      return { label: 'Freezing rain', icon: 'rain' };
    case 71:
      return { label: 'Light snow', icon: 'snow' };
    case 73:
      return { label: 'Snow', icon: 'snow' };
    case 75:
      return { label: 'Heavy snow', icon: 'snow' };
    case 77:
      return { label: 'Snow grains', icon: 'snow' };
    case 80:
      return { label: 'Light showers', icon: 'rain' };
    case 81:
      return { label: 'Showers', icon: 'rain' };
    case 82:
      return { label: 'Violent showers', icon: 'storm' };
    case 85:
    case 86:
      return { label: 'Snow showers', icon: 'snow' };
    case 95:
      return { label: 'Thunderstorm', icon: 'storm' };
    case 96:
    case 99:
      return { label: 'Storm w/ hail', icon: 'storm' };
    default:
      return { label: 'Unknown', icon: 'cloud' };
  }
}
