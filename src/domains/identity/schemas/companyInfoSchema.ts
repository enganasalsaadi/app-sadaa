import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { createSocialLinksSchema, type SocialLinksFormValues } from '@/domains/auth';

/** Same limit as brand registration. */
export const COMPANY_NAME_MAX_LENGTH = 100;

/** A brand's company details (contract §8.2). Phone is the account identity and never part of the form. */
export interface CompanyInfoFormValues {
  companyName: string;
  email: string;
  governorate: string;
  businessType: string;
  socialLinks: SocialLinksFormValues;
}

export const createCompanyInfoSchema = (
  t: TFunction,
): yup.ObjectSchema<CompanyInfoFormValues> =>
  yup.object({
    companyName: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .max(COMPANY_NAME_MAX_LENGTH, t('validation.maxLength', { count: COMPANY_NAME_MAX_LENGTH })),
    email: yup.string().trim().required(t('validation.required')).email(t('validation.invalidEmail')),
    governorate: yup.string().required(t('validation.selectOne')),
    businessType: yup.string().required(t('validation.selectOne')),
    socialLinks: createSocialLinksSchema(t),
  });
