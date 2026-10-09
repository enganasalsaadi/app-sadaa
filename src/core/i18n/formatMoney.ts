import i18next from 'i18next';
import { MINOR_UNIT_DIGITS, roundMagnitude, toDigitUnits } from '@/core/money';
import type { CurrencyCode, Money, MoneyRounding } from '@/core/money';
import type { SupportedLanguage } from '@/core/config';
import { formatNumber } from './format';
import { getValidLanguage } from './language';

/** `compact` (1.2K, 6.5M) is for stat tiles, chips and KPI strips only; ledgers, receipts and quotes stay exact. */
export type MoneyNotation = 'standard' | 'compact';
/** Fraction digits: `currency` = the currency's own (USD 2, SYP 0); `1` → `1,000.0`. */
export type MoneyPrecision = 'currency' | 0 | 1 | 2;
export type MoneyCurrencyDisplay = 'symbol' | 'code' | 'none';

export interface FormatMoneyOptions {
  /** `exceptZero` → `+$50.00` for earnings, `-$50.00` for charges. Default `auto`. */
  signDisplay?: 'auto' | 'exceptZero';
  notation?: MoneyNotation;
  /** Standard notation only; compact always shows up to 1 digit. Default `currency`. */
  precision?: MoneyPrecision;
  /** Default `nearest`, `down` in compact notation (social-style: 1,299 → 1.2K). */
  rounding?: MoneyRounding;
  currencyDisplay?: MoneyCurrencyDisplay;
}

/** `head + fraction + tail` is the formatted amount; `fraction` (`.40`) is split out for smaller rendering. */
export interface MoneyParts {
  head: string;
  fraction: string;
  tail: string;
}

// Placed by hand, not by Intl: narrowSymbol prints `£` for SYP, and Hermes' compact notation differs per platform.
const SYMBOLS: Record<CurrencyCode, Record<SupportedLanguage, string>> = {
  USD: { ar: '$', en: '$' },
  SYP: { ar: 'ل.س', en: 'SYP' },
};

const COMPACT_UNITS = [
  { exponent: 9, suffix: 'B' },
  { exponent: 6, suffix: 'M' },
  { exponent: 3, suffix: 'K' },
] as const;

// Arabic follows ICU: RLM keeps the amount-then-currency order in any container,
// LRM keeps the sign glued to the left of the Western digits.
const RLM = '‏';
const LRM = '‎';

type Magnitude = { integer: string; fraction: string; suffix: string; isZero: boolean };

const compactMagnitude = (
  money: Money,
  rounding: MoneyRounding,
  lang: SupportedLanguage,
): Magnitude | null => {
  const magnitude = Math.abs(Math.trunc(money.amount));
  const digits = MINOR_UNIT_DIGITS[money.currency];
  // Largest unit first, so a value rounding up to 1000.0K is shown as 1M instead.
  for (const { exponent, suffix } of COMPACT_UNITS) {
    const tenths = roundMagnitude(magnitude, 10 ** (exponent + digits - 1), rounding);
    if (tenths >= 10) {
      const integer = formatNumber(tenths / 10, { maximumFractionDigits: 1 }, lang);
      return { integer, fraction: '', suffix, isZero: false };
    }
  }
  return null;
};

const standardMagnitude = (
  money: Money,
  precision: MoneyPrecision,
  rounding: MoneyRounding,
  lang: SupportedLanguage,
): Magnitude => {
  const digits = precision === 'currency' ? MINOR_UNIT_DIGITS[money.currency] : precision;
  const units = toDigitUnits(money, digits, rounding);
  const scale = 10 ** digits;
  const fractionUnits = units % scale;
  return {
    integer: formatNumber((units - fractionUnits) / scale, { maximumFractionDigits: 0 }, lang),
    fraction: digits > 0 ? `.${String(fractionUnits).padStart(digits, '0')}` : '',
    suffix: '',
    isZero: units === 0,
  };
};

export const formatMoneyParts = (
  money: Money,
  lang: string = i18next.language,
  {
    signDisplay = 'auto',
    notation = 'standard',
    precision = 'currency',
    rounding,
    currencyDisplay = 'symbol',
  }: FormatMoneyOptions = {},
): MoneyParts => {
  const language = getValidLanguage(lang);
  const magnitude =
    (notation === 'compact' && compactMagnitude(money, rounding ?? 'down', language)) ||
    standardMagnitude(money, precision, rounding ?? 'nearest', language);

  // An amount that rounds to zero carries no sign (-0.004 → $0.00).
  const sign = magnitude.isZero
    ? ''
    : money.amount < 0
      ? '-'
      : signDisplay === 'exceptZero'
        ? '+'
        : '';
  const currency =
    currencyDisplay === 'none'
      ? ''
      : currencyDisplay === 'code'
        ? money.currency
        : SYMBOLS[money.currency][language];

  if (language === 'ar') {
    return {
      head: `${RLM}${sign ? LRM + sign : ''}${magnitude.integer}`,
      fraction: magnitude.fraction,
      tail: `${magnitude.suffix}${currency ? ` ${currency}` : ''}`,
    };
  }

  // English: `$1,250.40`, but a letter code gets a space (`SYP 6,402,500`, `USD 1,250.40`).
  const prefix = currency === '$' ? currency : currency ? `${currency} ` : '';
  return {
    head: `${sign}${prefix}${magnitude.integer}`,
    fraction: magnitude.fraction,
    tail: magnitude.suffix,
  };
};

export const formatMoney = (
  money: Money,
  lang: string = i18next.language,
  options: FormatMoneyOptions = {},
): string => {
  const { head, fraction, tail } = formatMoneyParts(money, lang, options);
  return `${head}${fraction}${tail}`;
};
