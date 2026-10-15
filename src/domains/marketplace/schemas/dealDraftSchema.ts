import * as yup from 'yup';
import type { ParseKeys, TFunction } from 'i18next';
import { DEAL_DRAFT_LIMITS } from '../constants/dealDrafts';

const requiredText = (t: TFunction, max: number, requiredKey: ParseKeys) =>
  yup
    .string()
    .defined()
    .trim()
    .required(t(requiredKey))
    .max(max, t('validation.maxLength', { count: max }));

/** Creator handing in a round: the caption as it will be posted (files are checked by the upload set). */
export interface DealDraftFormValues {
  caption: string;
}

export const createDealDraftSchema = (t: TFunction): yup.ObjectSchema<DealDraftFormValues> =>
  yup.object({
    caption: requiredText(t, DEAL_DRAFT_LIMITS.caption, 'marketplace.deals.drafts.upload.captionError'),
  });

/** Brand asking for changes: what must change overall (pins add the exact moments). */
export interface DealRevisionFormValues {
  note: string;
}

export const createDealRevisionSchema = (t: TFunction): yup.ObjectSchema<DealRevisionFormValues> =>
  yup.object({
    note: requiredText(t, DEAL_DRAFT_LIMITS.revisionNote, 'marketplace.deals.drafts.review.noteError'),
  });

/** One pinned note on a file or a video moment. */
export interface DealPinFormValues {
  note: string;
}

export const createDealPinSchema = (t: TFunction): yup.ObjectSchema<DealPinFormValues> =>
  yup.object({
    note: requiredText(t, DEAL_DRAFT_LIMITS.pinNote, 'marketplace.deals.drafts.review.pinError'),
  });
