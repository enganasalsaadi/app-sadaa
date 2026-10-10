import {
  applyFilterDraft,
  clearNarrowingFilters,
  countSheetFilters,
  hasGatedParams,
  hasNarrowingFilters,
  sanitizeDigits,
  stripGatedFilters,
  toFilterDraft,
  toSearchQuery,
} from '../exploreFilters';

describe('exploreFilters', () => {
  it('flags 🔒 params and price sorts only', () => {
    expect(hasGatedParams({ rush: true, sort: 'newest' })).toBe(false);
    expect(hasGatedParams({ withinBudget: false })).toBe(false);
    expect(hasGatedParams({ priceMin: 0 })).toBe(true);
    expect(hasGatedParams({ withinBudget: true })).toBe(true);
    expect(hasGatedParams({ sort: 'price_desc' })).toBe(true);
  });

  it('strips 🔒 params and price sorts, keeping the rest', () => {
    expect(
      stripGatedFilters({ q: 'food', priceMin: 10, priceMax: 50, withinBudget: true, sort: 'price_asc', rush: true }),
    ).toEqual({ q: 'food', rush: true });
    expect(stripGatedFilters({ sort: 'newest' })).toEqual({ sort: 'newest' });
  });

  it('counts sheet filters, ranges once, ignoring search / sort / category', () => {
    expect(countSheetFilters({ q: 'x', sort: 'newest', category: 'food' })).toBe(0);
    expect(
      countSheetFilters({ governorate: ['damascus'], niche: [], minFollowers: 1, maxFollowers: 9, rush: true }),
    ).toBe(3);
    expect(hasNarrowingFilters({ category: 'food' })).toBe(true);
    expect(hasNarrowingFilters({ q: 'x' })).toBe(false);
  });

  it('clears narrowing filters but keeps search and sort', () => {
    expect(clearNarrowingFilters({ q: 'x', sort: 'newest', category: 'food', rush: true })).toEqual({
      q: 'x',
      sort: 'newest',
    });
  });

  it('round-trips filters through the draft', () => {
    const filters = {
      q: 'x',
      category: 'food',
      sort: 'newest' as const,
      governorate: ['damascus'],
      minFollowers: 1000,
      maxDeliveryDays: 3,
      kycVerified: true,
      priceMax: 40,
    };
    expect(applyFilterDraft(filters, toFilterDraft(filters))).toEqual(filters);
  });

  it('parses draft numbers: Arabic digits, reversed ranges, delivery bounds, empties dropped', () => {
    const draft = {
      ...toFilterDraft({}),
      minFollowers: '٥٠٠٠',
      maxFollowers: '1000',
      maxDeliveryDays: '30',
      priceMin: 'abc',
      platform: [],
    };
    expect(applyFilterDraft({}, draft)).toEqual({
      minFollowers: 1000,
      maxFollowers: 5000,
      maxDeliveryDays: 14,
    });
  });

  it('keeps digits only', () => {
    expect(sanitizeDigits('1,2a٣۴')).toBe('1234');
  });

  it('sends search only within 2–60 chars', () => {
    expect(toSearchQuery(' a ')).toBeUndefined();
    expect(toSearchQuery(' مطاعم ')).toBe('مطاعم');
    expect(toSearchQuery('x'.repeat(70))).toHaveLength(60);
  });
});
