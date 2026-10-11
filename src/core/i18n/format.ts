import i18next from 'i18next';
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

// Hermes' Intl compact notation differs per platform (iOS prints 135,700, Android 135.7 ألف),
// so K / M / B are placed by hand: identical text in both languages on every device.
const COMPACT_UNITS = [
  { exponent: 9, suffix: 'B' },
  { exponent: 6, suffix: 'M' },
  { exponent: 3, suffix: 'K' },
] as const;

/** Social-style, rounds down (139,750 → 139.7K, never up to 1000K); null below 1,000. */
const compactNumber = (value: number, lang: string): string | null => {
  const magnitude = Math.abs(value);
  for (const { exponent, suffix } of COMPACT_UNITS) {
    const tenths = Math.floor(magnitude / 10 ** (exponent - 1));
    if (tenths >= 10) {
      const scaled = numberFormat(lang, { maximumFractionDigits: 1 }).format(tenths / 10);
      return `${value < 0 ? '-' : ''}${scaled}${suffix}`;
    }
  }
  return null;
};

export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {},
  lang: string = i18next.language,
): string => {
  if (options.notation !== 'compact') return numberFormat(lang, options).format(value);
  return (
    compactNumber(value, lang) ??
    numberFormat(lang, { ...options, notation: 'standard' }).format(value)
  );
};

const dateFormat = (
  lang: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const locale = toLocale(lang);
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = dateFormats.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormats.set(key, formatter);
  }
  return formatter;
};

/** Syrian users read Levantine month names (decided 2026-10-09), not ICU's يناير/فبراير. */
const LEVANTINE_MONTHS = [
  'كانون الثاني',
  'شباط',
  'آذار',
  'نيسان',
  'أيار',
  'حزيران',
  'تموز',
  'آب',
  'أيلول',
  'تشرين الأول',
  'تشرين الثاني',
  'كانون الأول',
] as const;

/**
 * Swaps ICU's month name for the Levantine one. Done with `format()` only (no
 * `formatToParts`, uneven on Hermes): the month index and the ICU name come
 * from month-only formatters in the same time zone.
 */
const withLevantineMonth = (
  formatted: string,
  date: Date | number,
  options: Intl.DateTimeFormatOptions,
  lang: string,
): string => {
  const month = options.month;
  if (month !== 'long' && month !== 'short') return formatted;
  const { timeZone } = options;
  const index = Number(dateFormat(lang, { month: 'numeric', timeZone }).format(date)) - 1;
  const levantine = LEVANTINE_MONTHS[index];
  if (!levantine) return formatted;
  const icuName = dateFormat(lang, { month, timeZone }).format(date);
  return formatted.replace(icuName, levantine);
};

export const formatDate = (
  date: Date | number,
  options: Intl.DateTimeFormatOptions = {},
  lang: string = i18next.language,
): string => {
  const formatted = dateFormat(lang, options).format(date);
  return getValidLanguage(lang) === 'ar'
    ? withLevantineMonth(formatted, date, options, lang)
    : formatted;
};
