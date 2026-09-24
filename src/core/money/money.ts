// Rule 06: money is an integer in minor units + ISO 4217 code. Never floats, never server-formatted strings.

export const CURRENCY_CODES = ['USD', 'SYP'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type Money = { amount: number; currency: CurrencyCode };

/** ISO 4217 minor-unit exponent per currency. */
export const MINOR_UNIT_DIGITS: Record<CurrencyCode, number> = {
  USD: 2,
  SYP: 2,
};

export const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  typeof value === 'string' &&
  (CURRENCY_CODES as readonly string[]).includes(value);

/** Display-only conversion; never feed the result back into money math. */
export const toMajorUnits = ({ amount, currency }: Money): number =>
  amount / 10 ** MINOR_UNIT_DIGITS[currency];
