import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_DISPUTE_LIMITS } from '../constants/dealDispute';
import { isEvidenceLink } from '../utils/dealDispute';

export interface DealDisputeOpenValues {
  reason: string | null;
  statement: string;
}

export const EMPTY_DISPUTE_OPEN: DealDisputeOpenValues = { reason: null, statement: '' };

/** Opening a dispute (M9): one of the side's preset reasons and a statement of 20–2000 characters. */
export const createDealDisputeOpenSchema = (
  t: TFunction,
  reasons: readonly string[],
): yup.ObjectSchema<DealDisputeOpenValues> =>
  yup.object({
    reason: yup
      .mixed<string>()
      .oneOf([...reasons], t('marketplace.deals.changes.reasonError'))
      .nullable()
      .defined()
      .test('reason', t('marketplace.deals.changes.reasonError'), value => value !== null),
    statement: yup
      .string()
      .defined()
      .trim()
      .required(t('marketplace.deals.dispute.open.statementRequired'))
      .min(DEAL_DISPUTE_LIMITS.minStatement, t('validation.minLength', { count: DEAL_DISPUTE_LIMITS.minStatement }))
      .max(DEAL_DISPUTE_LIMITS.maxStatement, t('validation.maxLength', { count: DEAL_DISPUTE_LIMITS.maxStatement })),
  });

/** An evidence entry: the note (the server requires it) and the link being typed before it joins the list. */
export interface DealEvidenceValues {
  note: string;
  link: string;
}

export const EMPTY_EVIDENCE: DealEvidenceValues = { note: '', link: '' };

export const createDealEvidenceSchema = (t: TFunction): yup.ObjectSchema<DealEvidenceValues> =>
  yup.object({
    note: yup
      .string()
      .defined()
      .trim()
      .required(t('marketplace.deals.dispute.evidence.noteRequired'))
      .max(DEAL_DISPUTE_LIMITS.maxNote, t('validation.maxLength', { count: DEAL_DISPUTE_LIMITS.maxNote })),
    link: yup
      .string()
      .defined()
      .trim()
      .test('link', t('validation.invalidUrl'), value => !value || isEvidenceLink(value)),
  });
