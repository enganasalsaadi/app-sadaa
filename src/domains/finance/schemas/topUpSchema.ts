import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { formatMoney } from '@/core/i18n';
import type { CurrencyCode, Money } from '@/core/money';
import type { PickedFile } from '@/shared/ui';
import { TOP_UP_REFERENCE_MAX_LENGTH } from '../constants/topUp';
import type { TopUpChannel, TopUpLimits } from '../types';

/** The whole wizard is one form, kept by the navigator; each step validates its own fields. */
export interface TopUpFormValues {
  channel: TopUpChannel | null;
  currency: CurrencyCode;
  amount: Money | null;
  transferReference: string;
  receipt: PickedFile | null;
}

/** Fields each step checks before moving on. */
export const TOP_UP_STEP_FIELDS = {
  channel: ['channel'],
  amount: ['currency', 'amount'],
  transfer: ['transferReference', 'receipt'],
} as const satisfies Record<string, readonly (keyof TopUpFormValues)[]>;

export interface TopUpSchemaOptions {
  /** Range of the picked channel in the picked currency; `null` while unknown (server re-checks). */
  limits: TopUpLimits | null;
  lang: string;
}

/** Rebuilt when the channel or currency changes: the limits follow them. */
export const createTopUpSchema = (
  t: TFunction,
  { limits, lang }: TopUpSchemaOptions,
): yup.ObjectSchema<TopUpFormValues> =>
  yup.object({
    channel: yup
      .mixed<TopUpChannel>()
      .nullable()
      .defined()
      .test('channel', t('finance.topUp.channel.required'), value => !!value),
    currency: yup.mixed<CurrencyCode>().defined(),
    amount: yup
      .mixed<Money>()
      .nullable()
      .defined()
      .test('amount', function (value) {
        if (!value || value.amount <= 0) {
          return this.createError({ message: t('finance.topUp.amount.errors.required') });
        }
        if (!limits || limits.min.currency !== value.currency) return true;
        if (value.amount < limits.min.amount) {
          return this.createError({
            message: t('finance.topUp.amount.errors.min', { amount: formatMoney(limits.min, lang) }),
          });
        }
        if (value.amount > limits.max.amount) {
          return this.createError({
            message: t('finance.topUp.amount.errors.max', { amount: formatMoney(limits.max, lang) }),
          });
        }
        return true;
      }),
    transferReference: yup
      .string()
      .defined()
      .trim()
      .required(t('finance.topUp.transfer.referenceRequired'))
      .max(TOP_UP_REFERENCE_MAX_LENGTH, t('validation.maxLength', { count: TOP_UP_REFERENCE_MAX_LENGTH })),
    receipt: yup
      .mixed<PickedFile>()
      .nullable()
      .defined()
      .test('receipt', t('finance.topUp.transfer.receiptRequired'), value => !!value),
  });
