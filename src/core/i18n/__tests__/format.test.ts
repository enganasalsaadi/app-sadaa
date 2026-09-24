import { formatDate, formatMoney, formatNumber } from '../format';

const ARABIC_INDIC = /[٠-٩۰-۹]/;

describe('formatMoney', () => {
  it('formats USD minor units in English', () => {
    expect(formatMoney({ amount: 125000, currency: 'USD' }, 'en')).toBe(
      '$1,250.00',
    );
  });

  it('uses Western digits in Arabic', () => {
    const out = formatMoney({ amount: 125050, currency: 'USD' }, 'ar');
    expect(out).toContain('1,250.50');
    expect(out).toContain('$');
    expect(out).not.toMatch(ARABIC_INDIC);
  });

  it('keeps exact cents for small amounts', () => {
    expect(formatMoney({ amount: 5, currency: 'USD' }, 'en')).toBe('$0.05');
  });
});

describe('formatNumber', () => {
  it('groups thousands with Western digits in both languages', () => {
    expect(formatNumber(1250, {}, 'en')).toBe('1,250');
    expect(formatNumber(1250, {}, 'ar')).toBe('1,250');
  });
});

describe('formatDate', () => {
  it('never emits Arabic-Indic digits', () => {
    const out = formatDate(
      new Date(Date.UTC(2026, 8, 24)),
      { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' },
      'ar',
    );
    expect(out).toContain('2026');
    expect(out).not.toMatch(ARABIC_INDIC);
  });
});
