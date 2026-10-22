import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

/** What a market says about its mobile numbers (`GET /markets/{code}`). */
export interface MobileRule {
  countryCode: CountryCode;
  /** PCRE over the E.164 number. */
  mobilePattern: string;
  /** A valid number of the market, E.164: the placeholder to show. */
  mobileExample: string;
}

const compile = (pattern: string): RegExp | null => {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
};

/** A pattern this JS engine can't read is not a verdict: the server decides then. */
export const matchesMobilePattern = (e164: string, pattern: string): boolean =>
  compile(pattern)?.test(e164) ?? true;

/** People type the local way: a national number must open with the trunk 0 ("0944…"), never "944…". */
export const hasTrunkZero = (national: string): boolean => national.startsWith('0');

/** E.164 of a typed national number ("0944…") when it is a mobile of the market, else `null`. */
export const toMarketMobile = (national: string, rule: MobileRule | null): string | null => {
  if (!rule || !hasTrunkZero(national)) {
    return null;
  }
  const e164 = parsePhoneNumberFromString(national, rule.countryCode)?.number;
  return e164 && matchesMobilePattern(e164, rule.mobilePattern) ? e164 : null;
};

/** A stored E.164 number as a person types it, trunk 0 included ("0944123456"), for phone fields. */
export const toNationalDigits = (e164: string | null | undefined): string =>
  (e164 && parsePhoneNumberFromString(e164)?.formatNational().replace(/\D/g, '')) || '';

/** The market's example number as a person types it ("0944 123 456"), for placeholders. */
export const nationalMobileExample = (rule: MobileRule | null): string | undefined =>
  rule ? parsePhoneNumberFromString(rule.mobileExample)?.formatNational() : undefined;
