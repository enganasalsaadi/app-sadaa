import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { INFLUENCER_MAX_NICHES } from '@/domains/auth';

export interface NichesFormValues {
  niches: string[];
}

/** Contract §8.1: 1–3 values from `/lookups` `niches`. */
export const createNichesSchema = (t: TFunction): yup.ObjectSchema<NichesFormValues> =>
  yup.object({
    niches: yup
      .array(yup.string().required())
      .min(1, t('account.niches.errors.min'))
      .max(INFLUENCER_MAX_NICHES, t('account.niches.errors.max', { count: INFLUENCER_MAX_NICHES }))
      .required(),
  });
