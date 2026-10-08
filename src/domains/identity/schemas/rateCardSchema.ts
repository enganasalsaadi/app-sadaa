import * as yup from 'yup';
import type { TFunction } from 'i18next';
import type { CatalogService, RateService, Retention } from '@/core/api';
import type { Money } from '@/core/money';
import { isRushAllowed, ratePriceError, type RatePriceBounds } from '@/domains/auth';

export interface RateCardFormValues {
  /** Platform key, or `RATE_GROUP_IN_PERSON`; `null` until picked. */
  group: string | null;
  service: RateService | null;
  /** Catalog package value as a string (chips are string-keyed). */
  packageValue: string | null;
  price: Money | null;
  deliveryDays: number;
  revisions: number;
  retention: Retention | null;
  rushEnabled: boolean;
  rushHours: number | null;
  rushPrice: Money | null;
}

export interface RateCardSchemaOptions {
  /** The picked catalog service; `null` before one is picked. */
  service: CatalogService | null;
  bounds: RatePriceBounds;
  rushBounds: RatePriceBounds;
}

/** Rebuilt whenever the picked service changes: its package/retention/limits drive the rules. */
export const createRateCardSchema = (
  t: TFunction,
  { service, bounds, rushBounds }: RateCardSchemaOptions,
): yup.ObjectSchema<RateCardFormValues> => {
  const delivery = service?.criteria.delivery_days;
  return yup.object({
    group: yup.string().nullable().defined().test('group', t('validation.selectOne'), value => !!value),
    service: yup
      .mixed<RateService>()
      .nullable()
      .defined()
      .test('service', t('validation.selectOne'), value => !!value),
    packageValue: yup
      .string()
      .nullable()
      .defined()
      .test('package', t('validation.selectOne'), value => !service?.package || !!value),
    price: yup
      .mixed<Money>()
      .nullable()
      .defined()
      .test('price', function (value) {
        const message = ratePriceError(t, value, bounds);
        return message ? this.createError({ message }) : true;
      }),
    deliveryDays: yup
      .number()
      .required()
      .integer()
      .test(
        'delivery-range',
        t('account.rates.editor.errors.deliveryDays', { min: delivery?.min, max: delivery?.max }),
        value => !delivery || (value >= delivery.min && value <= delivery.max),
      ),
    revisions: yup.number().required(),
    retention: yup
      .mixed<Retention>()
      .nullable()
      .defined()
      .test('retention', t('validation.selectOne'), value => !service?.criteria.retention || !!value),
    rushEnabled: yup.boolean().required(),
    rushHours: yup
      .number()
      .nullable()
      .defined()
      .test('rush-hours', function (value) {
        const { rushEnabled, deliveryDays } = this.parent as RateCardFormValues;
        if (!rushEnabled) return true;
        if (value == null) return this.createError({ message: t('validation.selectOne') });
        return isRushAllowed(value, deliveryDays)
          ? true
          : this.createError({ message: t('account.rates.editor.errors.rushTooSlow') });
      }),
    rushPrice: yup
      .mixed<Money>()
      .nullable()
      .defined()
      .test('rush-price', function (value) {
        const { rushEnabled } = this.parent as RateCardFormValues;
        if (!rushEnabled) return true;
        const message = ratePriceError(t, value, rushBounds);
        return message ? this.createError({ message }) : true;
      }),
  });
};
