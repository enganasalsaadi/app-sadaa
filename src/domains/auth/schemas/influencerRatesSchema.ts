import * as yup from 'yup';
import type { TFunction } from 'i18next';
import type { RateService } from '@/core/api';
import { formatMoney } from '@/core/i18n';
import { parseAmountText, toAmountText } from '@/core/money';
import type { Money } from '@/core/money';
import {
  RATE_CURRENCY,
  RATE_MAX_USD_MINOR,
  RATE_MIN_USD_MINOR,
} from '../constants/influencerOnboarding';

/** Inclusive price range in minor units. */
export interface RatePriceBounds {
  min: number;
  max: number;
}

export const DEFAULT_RATE_PRICE_BOUNDS: RatePriceBounds = {
  min: RATE_MIN_USD_MINOR,
  max: RATE_MAX_USD_MINOR,
};

export interface RateRowFormValues {
  /** `null` for platform-free services (on-site visit). */
  platform: string | null;
  service: RateService;
  /** The catalog has a package for this service: one must be picked. */
  hasPackage: boolean;
  enabled: boolean;
  /** Catalog package value as a string (chips are string-keyed). */
  packageValue: string | null;
  price: Money | null;
}

export interface InfluencerRatesFormValues {
  rates: RateRowFormValues[];
}

/** Minor units → the dollar number the API takes (`5050` → `50.5`), via string math. */
export const toPriceUsd = (price: Money): number => Number(toAmountText(price));

/** API dollars → minor units for prefill; `null` for anything unparsable. */
export const fromPriceUsd = (priceUsd: number): Money | null =>
  Number.isFinite(priceUsd) && priceUsd >= 0
    ? parseAmountText(priceUsd.toFixed(2), RATE_CURRENCY)
    : null;

/** Catalog `{ min_usd, max_usd }` → minor-unit bounds. */
export const toRatePriceBounds = (bounds: { min_usd: number; max_usd: number }): RatePriceBounds => ({
  min: fromPriceUsd(bounds.min_usd)?.amount ?? RATE_MIN_USD_MINOR,
  max: fromPriceUsd(bounds.max_usd)?.amount ?? RATE_MAX_USD_MINOR,
});

const boundText = (amount: number): string => formatMoney({ amount, currency: RATE_CURRENCY });

/**
 * The validation message for an entered price, or `null` when it is fine.
 * Shared by onboarding and the in-app editor (base price and add-on fee).
 */
export const ratePriceError = (
  t: TFunction,
  price: Money | null,
  bounds: RatePriceBounds,
): string | null => {
  if (!price) return t('auth.influencerOnboarding.rates.errors.price');
  if (price.amount < bounds.min) {
    return t('auth.influencerOnboarding.rates.errors.tooLow', { min: boundText(bounds.min) });
  }
  if (price.amount > bounds.max) {
    return t('auth.influencerOnboarding.rates.errors.tooHigh', { max: boundText(bounds.max) });
  }
  return null;
};

export const createInfluencerRatesSchema = (
  t: TFunction,
  bounds: RatePriceBounds = DEFAULT_RATE_PRICE_BOUNDS,
): yup.ObjectSchema<InfluencerRatesFormValues> =>
  yup.object({
    rates: yup
      .array(
        yup
          .object({
            platform: yup.string().nullable().defined(),
            service: yup.mixed<RateService>().required(),
            hasPackage: yup.boolean().required(),
            enabled: yup.boolean().required(),
            packageValue: yup
              .string()
              .nullable()
              .defined()
              .test('package-required', t('validation.selectOne'), function (value) {
                const { enabled, hasPackage } = this.parent as RateRowFormValues;
                return !enabled || !hasPackage || !!value;
              }),
            price: yup
              .mixed<Money>()
              .nullable()
              .defined()
              .test('price-range', function (value) {
                const { enabled } = this.parent as RateRowFormValues;
                if (!enabled) return true;
                const message = ratePriceError(t, value, bounds);
                return message ? this.createError({ message }) : true;
              }),
          })
          .required(),
      )
      .test(
        'at-least-one',
        t('auth.influencerOnboarding.rates.errors.minOne'),
        rows => !!rows?.some(row => row.enabled),
      )
      .required(),
  });
