import { formatMoney } from '@/core/i18n';
import type { CurrencyCode } from '@/core/money';
import { MINOR_UNIT_DIGITS, parseAmountText } from '@/core/money';

/**
 * Both sides of a rate line ("1 $" and "14,000 ل.س") from the server's decimal string,
 * never through float math; `null` when the string doesn't parse.
 */
export const formatExchangeRateSides = (
  rate: string,
  base: CurrencyCode,
  quote: CurrencyCode,
  lang: string,
): { base: string; quote: string } | null => {
  const quoteAmount = parseAmountText(rate, quote);
  if (!quoteAmount) return null;
  return {
    // One whole unit of the base, from its minor units.
    base: formatMoney({ amount: 10 ** MINOR_UNIT_DIGITS[base], currency: base }, lang, { precision: 0 }),
    quote: formatMoney(quoteAmount, lang),
  };
};
