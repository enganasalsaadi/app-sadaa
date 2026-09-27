const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The two largest units left; seconds only in the last hour. */
export type CountdownParts =
  | { kind: 'days'; days: number; hours: number }
  | { kind: 'hours'; hours: number; minutes: number }
  | { kind: 'minutes'; minutes: number; seconds: number }
  | { kind: 'expired' };

export const splitCountdown = (secondsLeft: number): CountdownParts => {
  const total = Math.max(0, Math.floor(secondsLeft));
  if (total === 0) return { kind: 'expired' };
  if (total >= DAY) {
    return { kind: 'days', days: Math.floor(total / DAY), hours: Math.floor((total % DAY) / HOUR) };
  }
  if (total >= HOUR) {
    return { kind: 'hours', hours: Math.floor(total / HOUR), minutes: Math.floor((total % HOUR) / MINUTE) };
  }
  return { kind: 'minutes', minutes: Math.floor(total / MINUTE), seconds: total % MINUTE };
};
