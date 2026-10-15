import { useEffect, useState } from 'react';

/** Wall clock that ticks every `intervalMs`: one shared tick for a whole list of deadlines. */
export const useClock = (intervalMs: number): number => {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
