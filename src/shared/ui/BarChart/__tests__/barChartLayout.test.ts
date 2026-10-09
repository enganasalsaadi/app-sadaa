import { isLabelShown, toBarRatios } from '../barChartLayout';

describe('toBarRatios', () => {
  it('scales every bar against the tallest one', () => {
    expect(toBarRatios([50, 100, 25])).toEqual([0.5, 1, 0.25]);
  });

  it('keeps an all-zero or empty series flat', () => {
    expect(toBarRatios([0, 0, 0])).toEqual([0, 0, 0]);
    expect(toBarRatios([])).toEqual([]);
  });

  it('clamps negative values to zero', () => {
    expect(toBarRatios([-20, 40])).toEqual([0, 1]);
  });
});

describe('isLabelShown', () => {
  it('shows every label while they fit', () => {
    expect([0, 1, 2, 3, 4, 5].every(index => isLabelShown(index, 6, 5))).toBe(true);
  });

  it('shows every other label from the highlighted bar on longer series', () => {
    const shown = Array.from({ length: 12 }, (_, index) => isLabelShown(index, 12, 11));
    expect(shown).toEqual([false, true, false, true, false, true, false, true, false, true, false, true]);
  });
});
