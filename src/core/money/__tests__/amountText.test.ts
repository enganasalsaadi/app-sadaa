import { parseAmountText, sanitizeAmountText, toAmountText } from '../amountText';

describe('sanitizeAmountText', () => {
  it('keeps digits and one decimal mark, capped at the minor digits', () => {
    expect(sanitizeAmountText('1,250.505', 'USD')).toBe('1250.50');
    expect(sanitizeAmountText('12.3.4', 'USD')).toBe('12.34');
    expect(sanitizeAmountText('$ 40', 'USD')).toBe('40');
    expect(sanitizeAmountText('.', 'USD')).toBe('.');
  });

  it('converts Arabic-Indic digits and the Arabic decimal mark', () => {
    expect(sanitizeAmountText('١٬٢٥٠٫٥', 'USD')).toBe('1250.5');
    expect(sanitizeAmountText('۱۲', 'SYP')).toBe('12');
  });
});

describe('parseAmountText', () => {
  it('returns integer minor units without float rounding', () => {
    expect(parseAmountText('1250.5', 'USD')).toEqual({ amount: 125050, currency: 'USD' });
    expect(parseAmountText('0.29', 'USD')).toEqual({ amount: 29, currency: 'USD' });
    expect(parseAmountText('.5', 'USD')).toEqual({ amount: 50, currency: 'USD' });
    expect(parseAmountText('40', 'SYP')).toEqual({ amount: 4000, currency: 'SYP' });
  });

  it('returns null for empty input', () => {
    expect(parseAmountText('', 'USD')).toBeNull();
    expect(parseAmountText('.', 'USD')).toBeNull();
    expect(parseAmountText('abc', 'USD')).toBeNull();
  });
});

describe('toAmountText', () => {
  it('is the inverse of parseAmountText', () => {
    expect(toAmountText({ amount: 125050, currency: 'USD' })).toBe('1250.50');
    expect(toAmountText({ amount: 5, currency: 'USD' })).toBe('0.05');
    expect(toAmountText({ amount: 0, currency: 'USD' })).toBe('0.00');
    expect(parseAmountText(toAmountText({ amount: 99901, currency: 'USD' }), 'USD')).toEqual({
      amount: 99901,
      currency: 'USD',
    });
  });
});
