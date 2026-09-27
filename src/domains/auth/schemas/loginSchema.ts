import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { createPhoneFields } from './phoneFields';
import type { PhoneFormValues } from './phoneFields';

export interface LoginFormValues extends PhoneFormValues {
  password: string;
}

// No length rule on the password: the server decides whether it matches, and
// older accounts may predate the current minimum.
export const createLoginSchema = (t: TFunction): yup.ObjectSchema<LoginFormValues> =>
  yup.object({
    ...createPhoneFields(t),
    password: yup.string().required(t('validation.required')),
  });

export const createPhoneSchema = (t: TFunction): yup.ObjectSchema<PhoneFormValues> =>
  yup.object(createPhoneFields(t));
