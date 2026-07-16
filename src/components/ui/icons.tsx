import type { WmoIcon } from '../../lib/wmo';

interface IconProps {
  size?: number;
  className?: string;
}

function stroke(size = 16) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export const SearchIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const CloseIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const PinIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const ThermoIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M10 13.6V4a2 2 0 0 1 4 0v9.6a4.5 4.5 0 1 1-4 0z" />
  </svg>
);

export const DropletIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z" />
  </svg>
);

export const CloudIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 10.5 3.8 3.8 0 0 1 17.5 18z" />
  </svg>
);

export const WindIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M3 8h9a3 3 0 1 0-3-3M3 12h14a3 3 0 1 1-3 3M3 16h7" />
  </svg>
);

export const GridIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3.6 3 14.4 0 18-3-3.6-3-14.4 0-18z" />
  </svg>
);

export const DotsIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <circle cx="5" cy="5" r="1.1" fill="currentColor" />
    <circle cx="12" cy="5" r="1.1" fill="currentColor" />
    <circle cx="19" cy="5" r="1.1" fill="currentColor" />
    <circle cx="5" cy="12" r="1.1" fill="currentColor" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    <circle cx="19" cy="12" r="1.1" fill="currentColor" />
    <circle cx="5" cy="19" r="1.1" fill="currentColor" />
    <circle cx="12" cy="19" r="1.1" fill="currentColor" />
    <circle cx="19" cy="19" r="1.1" fill="currentColor" />
  </svg>
);

export const GaugeIcon = ({ size, className }: IconProps) => (
  <svg {...stroke(size)} className={className}>
    <path d="M5 19a9 9 0 1 1 14 0" />
    <path d="M12 15l4-5" />
    <circle cx="12" cy="15" r="1.4" />
  </svg>
);

/** Weather condition glyphs, keyed by WMO icon name. */
export const WeatherIcon = ({ icon, size = 24, className }: IconProps & { icon: WmoIcon }) => {
  const s = stroke(size);
  switch (icon) {
    case 'sun':
      return (
        <svg {...s} className={className}>
          <circle cx="12" cy="12" r="4.4" />
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19" />
        </svg>
      );
    case 'cloud-sun':
      return (
        <svg {...s} className={className}>
          <circle cx="8" cy="8" r="3" />
          <path d="M8 2v1.4M2 8h1.4M4 4l1 1" />
          <path d="M10.5 19a3.6 3.6 0 0 1-.3-7.2 4.8 4.8 0 0 1 9.1 1.2 3 3 0 0 1-.4 6z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...s} className={className}>
          <path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 10.5 3.8 3.8 0 0 1 17.5 18z" />
        </svg>
      );
    case 'fog':
      return (
        <svg {...s} className={className}>
          <path d="M7 14a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 6.5 3.8 3.8 0 0 1 17.5 14z" />
          <path d="M5 18h14M8 21h8" />
        </svg>
      );
    case 'drizzle':
      return (
        <svg {...s} className={className}>
          <path d="M7 14a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 6.5 3.8 3.8 0 0 1 17.5 14z" />
          <path d="M8 17.5v1.5M12 18.5v1.5M16 17.5v1.5" />
        </svg>
      );
    case 'rain':
      return (
        <svg {...s} className={className}>
          <path d="M7 14a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 6.5 3.8 3.8 0 0 1 17.5 14z" />
          <path d="m8.5 17-1 2.5M12.5 17l-1 2.5M16.5 17l-1 2.5" />
        </svg>
      );
    case 'snow':
      return (
        <svg {...s} className={className}>
          <path d="M7 14a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 6.5 3.8 3.8 0 0 1 17.5 14z" />
          <path d="M8 17.5v.1M12 19v.1M16 17.5v.1M10 18.2v.1M14 18.2v.1" />
        </svg>
      );
    case 'storm':
      return (
        <svg {...s} className={className}>
          <path d="M7 14a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 6.5 3.8 3.8 0 0 1 17.5 14z" />
          <path d="M12.5 14.5 10 19h3l-1.5 3.5" />
        </svg>
      );
  }
};
