const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export type RelativeTime =
  | { unit: 'now' }
  | { unit: 'minutes' | 'hours'; count: number }
  | { unit: 'yesterday' }
  | { unit: 'date'; date: Date };

/** Inbox timestamp bucket; `null` for an unparsable date. Future times (clock skew) read as now. */
export const toRelativeTime = (iso: string, now: Date): RelativeTime | null => {
  const date = new Date(iso);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;

  const elapsed = now.getTime() - time;
  if (elapsed < MINUTE_MS) return { unit: 'now' };
  if (elapsed < HOUR_MS) return { unit: 'minutes', count: Math.floor(elapsed / MINUTE_MS) };

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (time >= startOfToday) return { unit: 'hours', count: Math.floor(elapsed / HOUR_MS) };
  if (time >= startOfToday - 24 * HOUR_MS) return { unit: 'yesterday' };
  return { unit: 'date', date };
};
