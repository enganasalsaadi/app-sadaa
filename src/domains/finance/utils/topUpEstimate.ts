import type { Money } from '@/core/money';
import type { TopUpLimits } from '../types';

/** A decimal rate string as an exact fraction: `"14000.50"` → 1400050 / 100. */
interface RateFraction {
  numerator: bigint;
  denominator: bigint;
}

const RATE_PATTERN = /^(\d+)(?:\.(\d+))?$/;
const ZERO = BigInt(0);
const ONE = BigInt(1);
const CENTS_PER_USD = BigInt(100);

/** `null` for anything that isn't a positive plain decimal (never float-parsed, rule 06). */
export const parseRate = (rate: string): RateFraction | null => {
  const match = RATE_PATTERN.exec(rate.trim());
  if (!match) return null;
  const fraction = (match[2] ?? '').replace(/0+$/, '');
  const numerator = BigInt(`${match[1]}${fraction}`);
  if (numerator === ZERO) return null;
  return { numerator, denominator: BigInt(10) ** BigInt(fraction.length) };
};

const divide = (dividend: bigint, divisor: bigint, rounding: 'down' | 'up'): number => {
  const quotient = dividend / divisor;
  const exact = quotient * divisor === dividend;
  return Number(rounding === 'up' && !exact ? quotient + ONE : quotient);
};

/** SYP (whole pounds) → USD cents, floored: the handoff's `floor(amount_syp * 100 / rate)`. */
export const sypToUsdCents = (syp: number, rate: string): number | null => {
  const parsed = parseRate(rate);
  if (!parsed || !Number.isSafeInteger(syp) || syp < 0) return null;
  return divide(BigInt(syp) * CENTS_PER_USD * parsed.denominator, parsed.numerator, 'down');
};

/** USD cents → SYP at the rate; `up` for a lower limit, `down` for an upper one. */
export const usdCentsToSyp = (cents: number, rate: string, rounding: 'down' | 'up'): number | null => {
  const parsed = parseRate(rate);
  if (!parsed || !Number.isSafeInteger(cents) || cents < 0) return null;
  return divide(BigInt(cents) * parsed.numerator, CENTS_PER_USD * parsed.denominator, rounding);
};

/**
 * What the wallet gets for `amount`: the amount itself in USD, a client estimate for SYP
 * (labelled as one; the server's `amount_usd` is the truth). `null` without a usable rate.
 */
export const estimateCredit = (amount: Money, rate: string | null): Money | null => {
  if (amount.currency === 'USD') return amount;
  if (!rate) return null;
  const cents = sypToUsdCents(amount.amount, rate);
  return cents === null ? null : { amount: cents, currency: 'USD' };
};

/** The market's top-up range in USD cents (`GET /markets/{code}`); both bounds are needed to use it. */
export interface UsdTopUpRange {
  min: number;
  max: number;
}

/**
 * Limits when the channel doesn't send them: the market's USD range, SYP converted at the
 * rate so the whole range stays inside the USD one. `null` = no market range, or SYP without a rate.
 */
export const fallbackLimits = (
  currency: Money['currency'],
  rate: string | null,
  usdRange: UsdTopUpRange | null,
): TopUpLimits | null => {
  if (!usdRange) return null;
  const { min, max } = usdRange;
  if (currency === 'USD') {
    return { min: { amount: min, currency: 'USD' }, max: { amount: max, currency: 'USD' } };
  }
  if (!rate) return null;
  const sypMin = usdCentsToSyp(min, rate, 'up');
  const sypMax = usdCentsToSyp(max, rate, 'down');
  if (sypMin === null || sypMax === null) return null;
  return { min: { amount: sypMin, currency: 'SYP' }, max: { amount: sypMax, currency: 'SYP' } };
};
