import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { formatMoney } from '@/core/i18n';
import { parseAmountText, toAmountText } from '@/core/money';
import type { Money } from '@/core/money';
import { RATE_CURRENCY, RATE_MAX_USD_MINOR } from '../constants/influencerOnboarding';
import type { ServiceType } from '../store';

export interface RateRowFormValues {
  platform: string;
  service: ServiceType;
  enabled: boolean;
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

export const createInfluencerRatesSchema = (
  t: TFunction,
): yup.ObjectSchema<InfluencerRatesFormValues> =>
  yup.object({
    rates: yup
      .array(
        yup
          .object({
            platform: yup.string().required(),
            service: yup.mixed<ServiceType>().required(),
            enabled: yup.boolean().required(),
            price: yup
              .mixed<Money>()
              .nullable()
              .defined()
              .test('price-required', t('auth.influencerOnboarding.rates.errors.price'), function (value) {
                const { enabled } = this.parent as RateRowFormValues;
                return !enabled || (!!value && value.amount > 0);
              })
              .test(
                'price-max',
                t('auth.influencerOnboarding.rates.errors.tooHigh', {
                  max: formatMoney({ amount: RATE_MAX_USD_MINOR, currency: RATE_CURRENCY }),
                }),
                value => !value || value.amount <= RATE_MAX_USD_MINOR,
              ),
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
