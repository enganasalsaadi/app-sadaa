import { parseDecimalMoney, parseUsd, parseUsdOrNull } from '../decimalMoney';

describe('parseUsd', () => {
  it('converts the server string to cents by string math', () => {
    expect(parseUsd('150.00')).toEqual({ amount: 15000, currency: 'USD' });
    expect(parseUsd('0.29')).toEqual({ amount: 29, currency: 'USD' });
    expect(parseUsd('1234567.89')).toEqual({ amount: 123456789, currency: 'USD' });
    expect(parseUsd('0.00')).toEqual({ amount: 0, currency: 'USD' });
  });

  it('pads short fractions and whole amounts', () => {
    expect(parseUsd('12.5')).toEqual({ amount: 1250, currency: 'USD' });
    expect(parseUsd('40')).toEqual({ amount: 4000, currency: 'USD' });
  });

  it('keeps the sign without a negative zero', () => {
    expect(parseUsd('-12.30')).toEqual({ amount: -1230, currency: 'USD' });
    expect(Object.is(parseUsd('-0.00').amount, 0)).toBe(true);
  });

  it('throws on malformed or over-precise amounts', () => {
    for (const bad of ['', '.', '1.', '$150', '1,500.00', '150.005', 'abc', '1e3']) {
      expect(() => parseUsd(bad)).toThrow(TypeError);
    }
  });

  it('throws past the safe integer range', () => {
    expect(() => parseUsd('99999999999999999.00')).toThrow(RangeError);
  });
});

describe('parseDecimalMoney', () => {
  it('follows the currency minor digits', () => {
    expect(parseDecimalMoney('6500', 'SYP')).toEqual({ amount: 6500, currency: 'SYP' });
    expect(() => parseDecimalMoney('6500.5', 'SYP')).toThrow(TypeError);
  });
});

describe('parseUsdOrNull', () => {
  it('passes null through', () => {
    expect(parseUsdOrNull(null)).toBeNull();
    expect(parseUsdOrNull('7.50')).toEqual({ amount: 750, currency: 'USD' });
  });
});
