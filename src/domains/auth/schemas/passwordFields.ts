import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const PASSWORD_MIN_LENGTH = 8;

export interface NewPasswordFormValues {
  password: string;
  passwordConfirmation: string;
}

/** A new password + its confirmation (sign-up, reset). */
export const createNewPasswordFields = (t: TFunction) => ({
  password: yup
    .string()
    .required(t('validation.required'))
    .min(PASSWORD_MIN_LENGTH, t('validation.minLength', { count: PASSWORD_MIN_LENGTH })),
  passwordConfirmation: yup
    .string()
    .required(t('validation.required'))
    .oneOf([yup.ref('password')], t('validation.passwordMismatch')),
});

export const createNewPasswordSchema = (
  t: TFunction,
): yup.ObjectSchema<NewPasswordFormValues> => yup.object(createNewPasswordFields(t));
