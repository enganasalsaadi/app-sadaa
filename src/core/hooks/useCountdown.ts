import { useEffect, useState } from 'react';

const secondsLeft = (endsAt: number | null) =>
  endsAt === null ? 0 : Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

/**
 * Seconds remaining until `endsAt` (epoch ms). Derived from a timestamp rather
 * than a decrementing counter, so it survives remounts and app restarts and
 * never drifts. Re-renders once per second only while running.
 */
export const useCountdown = (endsAt: number | null): number => {
  const [remaining, setRemaining] = useState(() => secondsLeft(endsAt));

  useEffect(() => {
    setRemaining(secondsLeft(endsAt));
    if (secondsLeft(endsAt) === 0) return;
    const id = setInterval(() => {
      const next = secondsLeft(endsAt);
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
};
