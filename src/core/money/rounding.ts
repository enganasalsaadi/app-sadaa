import { MINOR_UNIT_DIGITS } from './money';
import type { Money } from './money';

/** `down` never shows more than the amount (balances), `up` never less. Applied to the magnitude. */
export type MoneyRounding = 'nearest' | 'down' | 'up';

/** Divides a non-negative integer by `factor`, rounding with integer math (no float drift). */
export const roundMagnitude = (magnitude: number, factor: number, rounding: MoneyRounding): number => {
  const quotient = Math.floor(magnitude / factor);
  const remainder = magnitude - quotient * factor;
  if (remainder === 0 || rounding === 'down') return quotient;
  if (rounding === 'up') return quotient + 1;
  return remainder * 2 >= factor ? quotient + 1 : quotient;
};

/**
 * `money` as an unsigned integer count of `10^-fractionDigits` units: `{ 125049 USD }`
 * at 1 digit, `down` → `12504` (1,250.4). Padding (more digits than the currency has) is exact.
 */
export const toDigitUnits = (
  { amount, currency }: Money,
  fractionDigits: number,
  rounding: MoneyRounding,
): number => {
  const shift = MINOR_UNIT_DIGITS[currency] - fractionDigits;
  const magnitude = Math.abs(Math.trunc(amount));
  return shift > 0 ? roundMagnitude(magnitude, 10 ** shift, rounding) : magnitude * 10 ** -shift;
};
