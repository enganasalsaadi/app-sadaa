import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { formatMoney } from '@/core/i18n';
import type { CurrencyCode, Money } from '@/core/money';
import { WITHDRAW_LIMITS } from '../constants/withdraw';

/** The whole wizard is one form, kept by the navigator. */
export interface WithdrawFormValues {
  payoutMethodId: string | null;
  /** What the creator receives in (the method decides which are possible). */
  currency: CurrencyCode;
  /** Taken from the balance, always in the wallet currency. */
  amount: Money | null;
}

/** Fields the amount step checks before moving on. */
export const WITHDRAW_STEP_FIELDS = {
  amount: ['payoutMethodId', 'currency', 'amount'],
} as const satisfies Record<string, readonly (keyof WithdrawFormValues)[]>;

export interface WithdrawSchemaOptions {
  /** Withdrawable balance; `null` while unknown (the quote checks it anyway). */
  available: Money | null;
  lang: string;
}

/** Default min and daily cap are dollars (handoff §8): other currencies are left to the quote. */
const LIMIT_CURRENCY: CurrencyCode = 'USD';

/** Rebuilt when the balance changes. The quote is the real check; this one answers at once. */
export const createWithdrawSchema = (
  t: TFunction,
  { available, lang }: WithdrawSchemaOptions,
): yup.ObjectSchema<WithdrawFormValues> =>
  yup.object({
    payoutMethodId: yup
      .string()
      .nullable()
      .defined()
      .test('payoutMethodId', t('finance.withdraw.amount.errors.method'), value => !!value),
    currency: yup.mixed<CurrencyCode>().defined(),
    amount: yup
      .mixed<Money>()
      .nullable()
      .defined()
      .test('amount', function (value) {
        if (!value || value.amount <= 0) {
          return this.createError({ message: t('finance.withdraw.amount.errors.required') });
        }
        if (available && available.currency === value.currency && value.amount > available.amount) {
          return this.createError({
            message: t('finance.withdraw.amount.errors.overBalance', { amount: formatMoney(available, lang) }),
          });
        }
        if (value.currency !== LIMIT_CURRENCY) return true;
        if (value.amount < WITHDRAW_LIMITS.min) {
          return this.createError({
            message: t('finance.withdraw.amount.errors.min', {
              amount: formatMoney({ amount: WITHDRAW_LIMITS.min, currency: LIMIT_CURRENCY }, lang),
            }),
          });
        }
        if (value.amount > WITHDRAW_LIMITS.dailyMax) {
          return this.createError({
            message: t('finance.withdraw.amount.errors.max', {
              amount: formatMoney({ amount: WITHDRAW_LIMITS.dailyMax, currency: LIMIT_CURRENCY }, lang),
            }),
          });
        }
        return true;
      }),
  });
