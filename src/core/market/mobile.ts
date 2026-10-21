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

/** E.164 of a typed national number ("0944…", "944…") when it is a mobile of the market, else `null`. */
export const toMarketMobile = (national: string, rule: MobileRule | null): string | null => {
  if (!rule) {
    return null;
  }
  const e164 = parsePhoneNumberFromString(national, rule.countryCode)?.number;
  return e164 && matchesMobilePattern(e164, rule.mobilePattern) ? e164 : null;
};

/** The market's example number as a person types it ("0944 123 456"), for placeholders. */
export const nationalMobileExample = (rule: MobileRule | null): string | undefined =>
  rule ? parsePhoneNumberFromString(rule.mobileExample)?.formatNational() : undefined;
