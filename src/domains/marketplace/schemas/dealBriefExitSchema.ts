import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';

export interface DealBriefExitFormValues {
  note: string;
}

export const EMPTY_BRIEF_EXIT: DealBriefExitFormValues = { note: '' };

/** The clean exit asks for nothing: an optional note, as long as the server takes. */
export const createDealBriefExitSchema = (t: TFunction): yup.ObjectSchema<DealBriefExitFormValues> =>
  yup.object({
    note: yup
      .string()
      .defined()
      .trim()
      .max(
        DEAL_RESPOND_LIMITS.maxNoteLength,
        t('validation.maxLength', { count: DEAL_RESPOND_LIMITS.maxNoteLength }),
      ),
  });
