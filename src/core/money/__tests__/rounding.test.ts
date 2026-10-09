import { roundMagnitude, toDigitUnits } from '../rounding';

describe('roundMagnitude', () => {
  it('rounds with integer math', () => {
    expect(roundMagnitude(125049, 100, 'nearest')).toBe(1250);
    expect(roundMagnitude(125050, 100, 'nearest')).toBe(1251);
    expect(roundMagnitude(125099, 100, 'down')).toBe(1250);
    expect(roundMagnitude(125001, 100, 'up')).toBe(1251);
    expect(roundMagnitude(125000, 100, 'up')).toBe(1250);
  });
});

describe('toDigitUnits', () => {
  it('drops USD cents with the chosen rounding', () => {
    expect(toDigitUnits({ amount: 125099, currency: 'USD' }, 0, 'down')).toBe(1250);
    expect(toDigitUnits({ amount: 125050, currency: 'USD' }, 0, 'nearest')).toBe(1251);
    expect(toDigitUnits({ amount: 125041, currency: 'USD' }, 1, 'up')).toBe(12505);
  });

  it('rounds the magnitude, so down never overstates a negative amount', () => {
    expect(toDigitUnits({ amount: -125099, currency: 'USD' }, 0, 'down')).toBe(1250);
  });

  it('pads exactly when asking for more digits than the currency has', () => {
    expect(toDigitUnits({ amount: 1000, currency: 'SYP' }, 1, 'nearest')).toBe(10000);
    expect(toDigitUnits({ amount: 1000, currency: 'SYP' }, 2, 'nearest')).toBe(100000);
  });
});
