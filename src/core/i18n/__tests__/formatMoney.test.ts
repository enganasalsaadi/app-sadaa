import { formatMoney, formatMoneyParts } from '../formatMoney';
import type { FormatMoneyOptions } from '../formatMoney';
import type { Money } from '@/core/money';

const ARABIC_INDIC = /[٠-٩۰-۹]/;
const BIDI_MARKS = /[‎‏]/g;

const usd = (amount: number): Money => ({ amount, currency: 'USD' });
const syp = (amount: number): Money => ({ amount, currency: 'SYP' });
const en = (money: Money, options?: FormatMoneyOptions) => formatMoney(money, 'en', options);
// Bidi marks are invisible; assertions compare what the reader sees.
const ar = (money: Money, options?: FormatMoneyOptions) =>
  formatMoney(money, 'ar', options).replace(BIDI_MARKS, '');

describe('formatMoney: standard', () => {
  it('formats USD cents', () => {
    expect(en(usd(125000))).toBe('$1,250.00');
    expect(en(usd(5))).toBe('$0.05');
    expect(ar(usd(125040))).toBe('1,250.40 $');
  });

  it('formats SYP as whole pounds with a fixed symbol', () => {
    expect(en(syp(6402500))).toBe('SYP 6,402,500');
    expect(ar(syp(6402500))).toBe('6,402,500 ل.س');
  });

  it('never emits Arabic-Indic digits', () => {
    expect(formatMoney(usd(125050), 'ar')).not.toMatch(ARABIC_INDIC);
    expect(formatMoney(syp(6500000), 'ar', { notation: 'compact' })).not.toMatch(ARABIC_INDIC);
  });

  it('signs ledger lines with exceptZero', () => {
    expect(en(usd(5000), { signDisplay: 'exceptZero' })).toBe('+$50.00');
    expect(en(usd(-5000), { signDisplay: 'exceptZero' })).toBe('-$50.00');
    expect(en(usd(0), { signDisplay: 'exceptZero' })).toBe('$0.00');
    expect(ar(usd(-20000))).toBe('-200.00 $');
  });

  it('keeps the Arabic sign glued to the digits', () => {
    expect(formatMoney(usd(-20000), 'ar')).toBe('‏‎-200.00 $');
  });
});

describe('formatMoney: precision and rounding', () => {
  it('pads to the requested digits', () => {
    expect(en(usd(100000), { precision: 1 })).toBe('$1,000.0');
    expect(ar(syp(1000), { precision: 1 })).toBe('1,000.0 ل.س');
  });

  it('rounds whole amounts by the chosen rule', () => {
    expect(en(usd(125099), { precision: 0, rounding: 'down' })).toBe('$1,250');
    expect(en(usd(125050), { precision: 0 })).toBe('$1,251');
    expect(en(usd(125001), { precision: 0, rounding: 'up' })).toBe('$1,251');
  });

  it('drops the sign of an amount that rounds to zero', () => {
    expect(en(usd(-40), { precision: 0 })).toBe('$0');
  });
});

describe('formatMoney: compact', () => {
  it('uses K / M / B in both languages, rounding down by default', () => {
    expect(en(usd(125040), { notation: 'compact' })).toBe('$1.2K');
    expect(en(usd(129999), { notation: 'compact' })).toBe('$1.2K');
    expect(ar(usd(125040), { notation: 'compact' })).toBe('1.2K $');
    expect(ar(syp(6500000), { notation: 'compact' })).toBe('6.5M ل.س');
    expect(en(syp(2000000000), { notation: 'compact' })).toBe('SYP 2B');
  });

  it('moves up a unit instead of printing 1000K', () => {
    expect(en(usd(99999999), { notation: 'compact', rounding: 'nearest' })).toBe('$1M');
    expect(en(usd(99999999), { notation: 'compact' })).toBe('$999.9K');
  });

  it('falls back to standard below 1,000', () => {
    expect(en(usd(85040), { notation: 'compact' })).toBe('$850.40');
  });
});

describe('formatMoney: currency display', () => {
  it('prints the code or nothing', () => {
    expect(en(usd(125040), { currencyDisplay: 'code' })).toBe('USD 1,250.40');
    expect(ar(usd(125040), { currencyDisplay: 'code' })).toBe('1,250.40 USD');
    expect(en(usd(125040), { currencyDisplay: 'none' })).toBe('1,250.40');
    expect(ar(usd(125040), { currencyDisplay: 'none' })).toBe('1,250.40');
  });
});

describe('formatMoneyParts', () => {
  it('splits the fraction out for smaller rendering', () => {
    expect(formatMoneyParts(usd(125040), 'en')).toEqual({ head: '$1,250', fraction: '.40', tail: '' });
    const parts = formatMoneyParts(usd(125040), 'ar');
    expect(parts.fraction).toBe('.40');
    expect(parts.tail).toBe(' $');
  });
});
