import * as yup from 'yup';
import type { TFunction } from 'i18next';
import type { AddonType, CatalogService, RateService, Retention } from '@/core/api';
import type { Money } from '@/core/money';
import { ratePriceError, type RatePriceBounds } from '@/domains/auth';
import { RUSH_HOURS_OPTION } from '../constants/rateCards';
import { allowedValues, type AddonDef } from '../utils/rateCardAddonForm';

export interface RateCardAddonFormValue {
  type: AddonType;
  enabled: boolean;
  /** Visible option key → picked value as a string (chips are string-keyed). */
  options: Record<string, string>;
  price: Money | null;
}

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
  /** One row per add-on the picked service offers, in its catalog order. */
  addons: RateCardAddonFormValue[];
}

export interface RateCardSchemaOptions {
  /** The picked catalog service; `null` before one is picked. */
  service: CatalogService | null;
  bounds: RatePriceBounds;
  /** The picked service's add-ons (`addonDefinitions`). */
  addons: readonly AddonDef[];
}

/** The card's delivery days, read from the root form inside an add-on row. */
const rootDeliveryDays = (from: readonly { value: unknown }[] | undefined): number | null => {
  const root = from?.[from.length - 1]?.value;
  return typeof root === 'object' && root !== null && 'deliveryDays' in root && typeof root.deliveryDays === 'number'
    ? root.deliveryDays
    : null;
};

/** Rebuilt whenever the picked service changes: its package/retention/limits drive the rules. */
export const createRateCardSchema = (
  t: TFunction,
  { service, bounds, addons }: RateCardSchemaOptions,
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
    addons: yup
      .array()
      .required()
      .of(
        yup.object({
          type: yup.mixed<AddonType>().required(),
          enabled: yup.boolean().required(),
          options: yup
            .mixed<Record<string, string>>()
            .required()
            .test('addon-options', function (value) {
              const row = this.parent as RateCardAddonFormValue;
              const def = addons.find(entry => entry.type === row.type);
              if (!row.enabled || !def) return true;
              const deliveryDays = rootDeliveryDays(this.from);
              for (const option of def.options) {
                const picked = value[option.key];
                if (picked === undefined) return this.createError({ message: t('validation.selectOne') });
                const allowed = deliveryDays === null ? option.values : allowedValues(option, deliveryDays);
                if (allowed.some(entry => entry.key === picked)) continue;
                return this.createError({
                  message:
                    option.key === RUSH_HOURS_OPTION
                      ? t('account.rates.editor.errors.rushTooSlow')
                      : t('validation.selectOne'),
                });
              }
              return true;
            }),
          price: yup
            .mixed<Money>()
            .nullable()
            .defined()
            .test('addon-price', function (value) {
              const row = this.parent as RateCardAddonFormValue;
              const def = addons.find(entry => entry.type === row.type);
              if (!row.enabled || !def) return true;
              const message = ratePriceError(t, value, def.bounds);
              return message ? this.createError({ message }) : true;
            }),
        }),
      ),
  });
};
