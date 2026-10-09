import * as yup from 'yup';
import type { TFunction } from 'i18next';
import type { CountryCode } from 'libphonenumber-js';
import { PAYOUT_FIELD_LIMITS, type PayoutField } from '../constants/payoutMethods';
import type { PaymentChannel } from '../types';
import {
  isValidAccountCode,
  isValidAccountNumber,
  isValidIban,
  payoutFields,
  toSyrianMobile,
} from '../utils/payoutMethodForm';

/** Every channel's fields in one shape; the schema checks only the picked channel's (handoff §7). */
export interface PayoutMethodFormValues {
  holderName: string;
  countryCode: CountryCode;
  /** National digits as typed; sent as E.164. */
  phone: string;
  /** Lookup value from `/lookups` governorates. */
  governorate: string;
  city: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  /** Sham Cash only. */
  accountCode: string;
  label: string;
  makeDefault: boolean;
}

const { holderName, bankName, city, label } = PAYOUT_FIELD_LIMITS;

export const createPayoutMethodSchema = (
  t: TFunction,
  channel: PaymentChannel,
): yup.ObjectSchema<PayoutMethodFormValues> => {
  const used = new Set<PayoutField>(payoutFields(channel));
  // Fields of other channels stay in the form values but are never checked or sent.
  const only = (field: PayoutField, rule: yup.StringSchema<string>) =>
    used.has(field) ? rule : yup.string().defined();

  return yup.object({
    holderName: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .min(holderName.min, t('validation.minLength', { count: holderName.min }))
      .max(holderName.max, t('validation.maxLength', { count: holderName.max })),
    countryCode: yup.mixed<CountryCode>().required(),
    phone: only(
      'phone',
      yup
        .string()
        .required(t('validation.required'))
        .test('syrian-mobile', t('finance.payouts.form.errors.phone'), function (value) {
          const { countryCode } = this.parent as Pick<PayoutMethodFormValues, 'countryCode'>;
          return !!value && toSyrianMobile(value, countryCode) !== null;
        }),
    ),
    governorate: only('governorate', yup.string().required(t('validation.selectOne'))),
    city: only('city', yup.string().trim().max(city.max, t('validation.maxLength', { count: city.max })).defined()),
    bankName: only(
      'bankName',
      yup
        .string()
        .trim()
        .required(t('validation.required'))
        .min(bankName.min, t('validation.minLength', { count: bankName.min }))
        .max(bankName.max, t('validation.maxLength', { count: bankName.max })),
    ),
    accountNumber: only(
      'accountNumber',
      yup
        .string()
        .required(t('validation.required'))
        .test('account-number', t('finance.payouts.form.errors.accountNumber'), value => isValidAccountNumber(value)),
    ),
    iban: only(
      'iban',
      yup
        .string()
        .defined()
        .test('iban', t('finance.payouts.form.errors.iban'), value => !value.trim() || isValidIban(value)),
    ),
    accountCode: only(
      'accountCode',
      yup
        .string()
        .required(t('validation.required'))
        .test('account-code', t('finance.payouts.form.errors.accountCode'), value => isValidAccountCode(value)),
    ),
    label: yup.string().trim().max(label.max, t('validation.maxLength', { count: label.max })).defined(),
    makeDefault: yup.boolean().required(),
  });
};
