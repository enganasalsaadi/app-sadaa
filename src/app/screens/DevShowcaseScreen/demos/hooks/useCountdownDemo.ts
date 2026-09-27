import { useState } from 'react';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Deadlines fixed at mount, like server timestamps. */
export const useCountdownDemo = () => {
  const [deadlines] = useState(() => {
    const now = Date.now();
    return {
      days: now + 3 * DAY + 4 * HOUR,
      hours: now + 5 * HOUR + 12 * MINUTE,
      minutes: now + 9 * MINUTE,
      expired: now - MINUTE,
    };
  });
  return deadlines;
};
