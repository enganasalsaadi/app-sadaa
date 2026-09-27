import { MINOR_UNIT_DIGITS } from './money';
import type { CurrencyCode, Money } from './money';

// Arabic keyboards type Arabic-Indic digits and `٫` as the decimal mark.
const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;
const DECIMAL_MARKS = /[.٫]/;
const GROUPING_MARKS = /[,٬\s]/g;

const toWesternDigits = (text: string): string =>
  text.replace(/[٠-٩۰-۹]/g, char => {
    const code = char.charCodeAt(0);
    const zero = code >= EXTENDED_ARABIC_INDIC_ZERO ? EXTENDED_ARABIC_INDIC_ZERO : ARABIC_INDIC_ZERO;
    return String(code - zero);
  });

/**
 * Cleans what the user typed into an amount field: Western digits, one `.`,
 * at most the currency's minor digits. Grouping marks and anything else are dropped.
 */
export const sanitizeAmountText = (text: string, currency: CurrencyCode): string => {
  const digitsOnly = toWesternDigits(text).replace(GROUPING_MARKS, '');
  const [whole = '', ...rest] = digitsOnly.split(DECIMAL_MARKS);
  const integer = whole.replace(/\D/g, '');
  if (rest.length === 0) return integer;
  const fraction = rest.join('').replace(/\D/g, '').slice(0, MINOR_UNIT_DIGITS[currency]);
  return MINOR_UNIT_DIGITS[currency] === 0 ? integer : `${integer}.${fraction}`;
};

/** Sanitized amount text → integer minor units, by string math (no float rounding). `null` when empty. */
export const parseAmountText = (text: string, currency: CurrencyCode): Money | null => {
  const clean = sanitizeAmountText(text, currency);
  if (clean === '' || clean === '.') return null;
  const digits = MINOR_UNIT_DIGITS[currency];
  const [integer = '', fraction = ''] = clean.split('.');
  const minor = `${integer || '0'}${fraction.padEnd(digits, '0')}`;
  return { amount: Number.parseInt(minor, 10), currency };
};

/** Money → editable text (`125050` USD → `1250.50`); inverse of `parseAmountText`. */
export const toAmountText = ({ amount, currency }: Money): string => {
  const digits = MINOR_UNIT_DIGITS[currency];
  const raw = String(Math.abs(Math.trunc(amount)));
  if (digits === 0) return raw;
  const padded = raw.padStart(digits + 1, '0');
  return `${padded.slice(0, -digits)}.${padded.slice(-digits)}`;
};
