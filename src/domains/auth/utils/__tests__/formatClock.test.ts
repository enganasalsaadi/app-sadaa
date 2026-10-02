import { formatClock } from '../formatClock';

describe('formatClock', () => {
  it('formats m:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(42)).toBe('0:42');
    expect(formatClock(1800)).toBe('30:00');
  });
});
