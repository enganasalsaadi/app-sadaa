import * as yup from 'yup';
import type { TFunction } from 'i18next';

export const PHONE_OTP_LENGTH = 4;

export interface OtpFormValues {
  code: string;
}

export const createOtpSchema = (
  t: TFunction,
  length: number = PHONE_OTP_LENGTH,
): yup.ObjectSchema<OtpFormValues> =>
  yup.object({
    code: yup
      .string()
      .required(t('validation.required'))
      .matches(
        new RegExp(`^\\d{${length}}$`),
        t('validation.invalidOtpCode', { count: length }),
      ),
  });
