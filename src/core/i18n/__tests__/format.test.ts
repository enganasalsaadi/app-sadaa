import { formatDate, formatNumber } from '../format';

const ARABIC_INDIC = /[٠-٩۰-۹]/;

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

  it('uses Levantine month names in Arabic', () => {
    const utc = (month: number) => new Date(Date.UTC(2026, month, 15));
    const long = { month: 'long', timeZone: 'UTC' } as const;
    expect(formatDate(utc(0), long, 'ar')).toBe('كانون الثاني');
    expect(formatDate(utc(1), { month: 'short', timeZone: 'UTC' }, 'ar')).toBe('شباط');
    expect(formatDate(utc(9), long, 'ar')).toBe('تشرين الأول');
    expect(formatDate(utc(11), long, 'ar')).toBe('كانون الأول');
    const full = formatDate(
      utc(8),
      { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
      'ar',
    );
    expect(full).toContain('أيلول');
    expect(full).not.toContain('سبتمبر');
  });

  it('keeps English and numeric months untouched', () => {
    expect(formatDate(new Date(Date.UTC(2026, 0, 15)), { month: 'long', timeZone: 'UTC' }, 'en')).toBe(
      'January',
    );
    expect(formatDate(new Date(Date.UTC(2026, 0, 15)), { month: 'numeric', timeZone: 'UTC' }, 'ar')).toBe(
      '1',
    );
  });
});
