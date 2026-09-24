import i18next from 'i18next';
import { MINOR_UNIT_DIGITS, toMajorUnits } from '@/core/money';
import type { Money } from '@/core/money';
import { getValidLanguage } from './language';

// Rule 08: Western digits in every language — `-u-nu-latn` stops Arabic from using ١٢٣.
const toLocale = (lang: string): string =>
  `${getValidLanguage(lang)}-u-nu-latn`;

// Intl constructors are expensive; formatters are reused per locale + options.
const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

const numberFormat = (
  lang: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const locale = toLocale(lang);
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = numberFormats.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormats.set(key, formatter);
  }
  return formatter;
};

export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {},
  lang: string = i18next.language,
): string => numberFormat(lang, options).format(value);

export const formatMoney = (
  money: Money,
  lang: string = i18next.language,
): string => {
  const digits = MINOR_UNIT_DIGITS[money.currency];
  return numberFormat(lang, {
    style: 'currency',
    currency: money.currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(toMajorUnits(money));
};

export const formatDate = (
  date: Date | number,
  options: Intl.DateTimeFormatOptions = {},
  lang: string = i18next.language,
): string => {
  const locale = toLocale(lang);
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = dateFormats.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormats.set(key, formatter);
  }
  return formatter.format(date);
};
