import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { formatMoney } from '@/core/i18n';
import type { CurrencyCode, Money } from '@/core/money';
import type { MarketAmountLimit } from '@/core/market';

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
  /** The market's USD withdrawal range (gross cents); `null` or a `null` bound = no limit on that side. */
  limits: MarketAmountLimit | null;
  lang: string;
}

/** The market's range applies to the gross dollars taken from the wallet: other currencies are left to the quote. */
const LIMIT_CURRENCY: CurrencyCode = 'USD';

/** Rebuilt when the balance changes. The quote is the real check; this one answers at once. */
export const createWithdrawSchema = (
  t: TFunction,
  { available, limits, lang }: WithdrawSchemaOptions,
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
        if (limits?.min != null && value.amount < limits.min) {
          return this.createError({
            message: t('finance.withdraw.amount.errors.min', {
              amount: formatMoney({ amount: limits.min, currency: LIMIT_CURRENCY }, lang),
            }),
          });
        }
        if (limits?.max != null && value.amount > limits.max) {
          return this.createError({
            message: t('finance.withdraw.amount.errors.max', {
              amount: formatMoney({ amount: limits.max, currency: LIMIT_CURRENCY }, lang),
            }),
          });
        }
        return true;
      }),
  });
