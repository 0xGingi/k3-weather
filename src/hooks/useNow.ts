import { useEffect, useState } from 'react';

/** Ticking clock — re-renders every `interval` ms with the current time. */
export function useNow(interval = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}
