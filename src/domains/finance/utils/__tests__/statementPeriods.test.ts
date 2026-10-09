import { ALL_TIME, resolvePeriodSpan, toStatementFilters } from '../statementPeriods';

describe('resolvePeriodSpan', () => {
  const now = new Date(2026, 9, 9, 15, 30);

  it('is null for all time', () => {
    expect(resolvePeriodSpan(ALL_TIME, now)).toBeNull();
  });

  it('resolves calendar presets ending today', () => {
    expect(resolvePeriodSpan({ kind: 'preset', preset: 'thisMonth' }, now)).toEqual({
      from: new Date(2026, 9, 1),
      to: new Date(2026, 9, 9),
    });
    expect(resolvePeriodSpan({ kind: 'preset', preset: 'last3Months' }, now)).toEqual({
      from: new Date(2026, 7, 1),
      to: new Date(2026, 9, 9),
    });
    expect(resolvePeriodSpan({ kind: 'preset', preset: 'thisYear' }, now)).toEqual({
      from: new Date(2026, 0, 1),
      to: new Date(2026, 9, 9),
    });
  });

  it('covers the whole previous month, across a year boundary too', () => {
    expect(resolvePeriodSpan({ kind: 'preset', preset: 'lastMonth' }, now)).toEqual({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    });
    expect(
      resolvePeriodSpan({ kind: 'preset', preset: 'lastMonth' }, new Date(2026, 0, 12)),
    ).toEqual({ from: new Date(2025, 11, 1), to: new Date(2025, 11, 31) });
    expect(
      resolvePeriodSpan({ kind: 'preset', preset: 'last3Months' }, new Date(2026, 1, 3)),
    ).toEqual({ from: new Date(2025, 11, 1), to: new Date(2026, 1, 3) });
  });

  it('drops the time of a custom range', () => {
    expect(
      resolvePeriodSpan(
        { kind: 'custom', from: new Date(2026, 8, 1, 18), to: new Date(2026, 8, 1, 9) },
        now,
      ),
    ).toEqual({ from: new Date(2026, 8, 1), to: new Date(2026, 8, 1) });
  });
});

describe('toStatementFilters', () => {
  const now = new Date(2026, 9, 9, 15, 30);

  it('leaves unset filters out so the unfiltered list shares the wallet tab cache', () => {
    expect(toStatementFilters(null, ALL_TIME, now)).toEqual({});
  });

  it('sends the type and local YYYY-MM-DD ends', () => {
    expect(toStatementFilters('top_up', { kind: 'preset', preset: 'lastMonth' }, now)).toEqual({
      type: 'top_up',
      from: '2026-09-01',
      to: '2026-09-30',
    });
    expect(
      toStatementFilters(
        null,
        { kind: 'custom', from: new Date(2026, 8, 1), to: new Date(2026, 9, 9) },
        now,
      ),
    ).toEqual({ from: '2026-09-01', to: '2026-10-09' });
  });
});
