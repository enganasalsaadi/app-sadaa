import * as yup from 'yup';
import type { TFunction } from 'i18next';

/** Contract §8.1 limits. */
export const FULL_NAME_MAX_LENGTH = 255;
export const AREA_MAX_LENGTH = 255;

/** Creator's own details. Phone is the account identity and never part of the form. */
export interface PersonalInfoFormValues {
  fullName: string;
  /** Optional; empty = no email. */
  email: string;
  governorate: string;
  /** Optional; empty = no area. */
  area: string;
}

export const createPersonalInfoSchema = (
  t: TFunction,
): yup.ObjectSchema<PersonalInfoFormValues> =>
  yup.object({
    fullName: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .max(FULL_NAME_MAX_LENGTH, t('validation.maxLength', { count: FULL_NAME_MAX_LENGTH })),
    email: yup.string().trim().default('').email(t('validation.invalidEmail')),
    governorate: yup.string().required(t('validation.selectOne')),
    area: yup
      .string()
      .trim()
      .default('')
      .max(AREA_MAX_LENGTH, t('validation.maxLength', { count: AREA_MAX_LENGTH })),
  });
