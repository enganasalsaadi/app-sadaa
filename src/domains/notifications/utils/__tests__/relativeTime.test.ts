import { toRelativeTime } from '../relativeTime';

const NOW = new Date(2026, 9, 4, 15, 0, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;

describe('toRelativeTime', () => {
  it('buckets by age', () => {
    expect(toRelativeTime(ago(20_000), NOW)).toEqual({ unit: 'now' });
    expect(toRelativeTime(ago(5 * MIN), NOW)).toEqual({ unit: 'minutes', count: 5 });
    expect(toRelativeTime(ago(3 * HOUR + 10 * MIN), NOW)).toEqual({ unit: 'hours', count: 3 });
    expect(toRelativeTime(ago(18 * HOUR), NOW)).toEqual({ unit: 'yesterday' });
    expect(toRelativeTime(ago(3 * 24 * HOUR), NOW)).toMatchObject({ unit: 'date' });
  });

  it('reads a future time (clock skew) as now and rejects garbage', () => {
    expect(toRelativeTime(ago(-5 * MIN), NOW)).toEqual({ unit: 'now' });
    expect(toRelativeTime('not a date', NOW)).toBeNull();
  });
});
