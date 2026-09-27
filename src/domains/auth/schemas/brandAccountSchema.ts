import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { createPhoneFields } from './phoneFields';
import type { PhoneFormValues } from './phoneFields';
import { createNewPasswordFields } from './passwordFields';
import type { NewPasswordFormValues } from './passwordFields';

const COMPANY_NAME_MAX_LENGTH = 100;

export interface BrandAccountFormValues extends PhoneFormValues, NewPasswordFormValues {
  companyName: string;
  email: string;
}

export const createBrandAccountSchema = (
  t: TFunction,
): yup.ObjectSchema<BrandAccountFormValues> =>
  yup.object({
    companyName: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .max(
        COMPANY_NAME_MAX_LENGTH,
        t('validation.maxLength', { count: COMPANY_NAME_MAX_LENGTH }),
      ),
    ...createPhoneFields(t),
    email: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .email(t('validation.invalidEmail')),
    ...createNewPasswordFields(t),
  });
