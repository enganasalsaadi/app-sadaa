import { isCurrencyCode, toMajorUnits } from '../money';

describe('toMajorUnits', () => {
  it('divides by the ISO minor-unit exponent', () => {
    expect(toMajorUnits({ amount: 125050, currency: 'USD' })).toBe(1250.5);
    expect(toMajorUnits({ amount: 6500, currency: 'SYP' })).toBe(6500);
  });
});

describe('isCurrencyCode', () => {
  it('accepts only supported codes', () => {
    expect(isCurrencyCode('USD')).toBe(true);
    expect(isCurrencyCode('SAR')).toBe(false);
    expect(isCurrencyCode(42)).toBe(false);
  });
});
