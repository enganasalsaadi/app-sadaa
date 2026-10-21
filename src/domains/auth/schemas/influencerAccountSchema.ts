import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { createPhoneFields } from './phoneFields';
import type { PhoneFormValues } from './phoneFields';
import { createNewPasswordFields } from './passwordFields';
import type { NewPasswordFormValues } from './passwordFields';

const FULL_NAME_MAX_LENGTH = 255;

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
    // Which numbers are accepted is the server's call (market by calling code): `phone_market_unsupported`.
    phone: phoneFields.phone,
    governorate: yup.string().required(t('validation.selectOne')),
    email: yup.string().trim().default('').email(t('validation.invalidEmail')),
    ...createNewPasswordFields(t),
  });
};
