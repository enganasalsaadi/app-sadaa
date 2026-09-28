import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { createPhoneFields } from './phoneFields';
import type { PhoneFormValues } from './phoneFields';
import { createNewPasswordFields } from './passwordFields';
import type { NewPasswordFormValues } from './passwordFields';

const FULL_NAME_MAX_LENGTH = 255;
/** Server rule for creator accounts: Syrian mobile only. */
const SYRIAN_MOBILE = /^\+9639\d{8}$/;

export interface InfluencerAccountFormValues extends PhoneFormValues, NewPasswordFormValues {
  fullName: string;
  governorate: string;
  /** Optional on the server; empty string = not sent. */
  email: string;
}

export const createInfluencerAccountSchema = (
  t: TFunction,
): yup.ObjectSchema<InfluencerAccountFormValues> => {
  const phoneFields = createPhoneFields(t);
  return yup.object({
    fullName: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .max(FULL_NAME_MAX_LENGTH, t('validation.maxLength', { count: FULL_NAME_MAX_LENGTH })),
    countryCode: phoneFields.countryCode,
    phone: phoneFields.phone.test(
      'syrian-mobile',
      t('auth.influencerOnboarding.account.phoneSyriaOnly'),
      function (value) {
        const { countryCode } = this.parent as PhoneFormValues;
        const parsed = value ? parsePhoneNumberFromString(value, countryCode) : undefined;
        // Invalid numbers are reported by the base rule; this only rejects valid non-Syrian ones.
        return !parsed?.isValid() || SYRIAN_MOBILE.test(parsed.format('E.164'));
      },
    ),
    governorate: yup.string().required(t('validation.selectOne')),
    email: yup.string().trim().default('').email(t('validation.invalidEmail')),
    ...createNewPasswordFields(t),
  });
};
