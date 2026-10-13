import { MINOR_UNIT_DIGITS } from './money';
import type { CurrencyCode, Money } from './money';

// The API sends some amounts as fixed-point strings (deals: `"150.00"`). Parsed by string math so
// `"0.29"` is exactly 29 cents; a float round-trip is never involved.
const DECIMAL_AMOUNT = /^(-?)(\d+)(?:\.(\d+))?$/;

/**
 * Server decimal string → integer minor units. Throws on a malformed value or one with more
 * fraction digits than the currency has: showing a wrong amount is worse than failing the read.
 * The message carries no amount (rule 07).
 */
export const parseDecimalMoney = (text: string, currency: CurrencyCode): Money => {
  const digits = MINOR_UNIT_DIGITS[currency];
  const match = DECIMAL_AMOUNT.exec(text.trim());
  const fraction = match?.[3] ?? '';
  if (!match || fraction.length > digits) {
    throw new TypeError(`Malformed ${currency} amount from the server`);
  }
  const magnitude = Number.parseInt(`${match[2] ?? ''}${fraction.padEnd(digits, '0')}`, 10);
  if (!Number.isSafeInteger(magnitude)) {
    throw new RangeError(`${currency} amount out of range`);
  }
  return { amount: match[1] === '-' && magnitude !== 0 ? -magnitude : magnitude, currency };
};

/** `"150.00"` → `{ amount: 15000, currency: 'USD' }`. */
export const parseUsd = (text: string): Money => parseDecimalMoney(text, 'USD');

/** For fields where the server sends `null` on purpose (no fee, no refund yet). */
export const parseUsdOrNull = (text: string | null): Money | null =>
  text === null ? null : parseUsd(text);
