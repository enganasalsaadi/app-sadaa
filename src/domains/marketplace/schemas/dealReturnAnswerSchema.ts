import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_RETURN_LIMITS } from '../constants/dealReturn';

/** The brand's problem report on a returned sample: what arrived, 5–1000 characters (photos ride apart). */
export interface DealReturnIssueFormValues {
  note: string;
}

/** The brand letting the sample go: the reason is optional. */
export interface DealReturnWaiveFormValues {
  note: string;
}

export const EMPTY_RETURN_ANSWER: DealReturnIssueFormValues = { note: '' };

export const createDealReturnIssueSchema = (t: TFunction): yup.ObjectSchema<DealReturnIssueFormValues> =>
  yup.object({
    note: yup
      .string()
      .defined()
      .trim()
      .required(t('validation.required'))
      .min(DEAL_RETURN_LIMITS.issueNoteMin, t('validation.minLength', { count: DEAL_RETURN_LIMITS.issueNoteMin }))
      .max(DEAL_RETURN_LIMITS.issueNoteMax, t('validation.maxLength', { count: DEAL_RETURN_LIMITS.issueNoteMax })),
  });

export const createDealReturnWaiveSchema = (t: TFunction): yup.ObjectSchema<DealReturnWaiveFormValues> =>
  yup.object({
    note: yup
      .string()
      .defined()
      .trim()
      .max(DEAL_RETURN_LIMITS.waiveNote, t('validation.maxLength', { count: DEAL_RETURN_LIMITS.waiveNote })),
  });
