import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import type { DealReasonValues } from '../utils/dealCancel';

/** The form behind every reason sheet; the schema keeps `reason` to the sheet's own codes. */
export type DealReasonFormValues = DealReasonValues<string>;

export const EMPTY_REASON: DealReasonFormValues = { reason: null, note: '' };

/**
 * A reason tile + an optional note: the brand cancelling, the creator withdrawing, the creator
 * declining an upsell (M8). The reason is one of the server's codes; the note is free text.
 */
export const createDealReasonNoteSchema = (
  t: TFunction,
  reasons: readonly string[],
): yup.ObjectSchema<DealReasonFormValues> =>
  yup.object({
    reason: yup
      .mixed<string>()
      .oneOf([...reasons], t('marketplace.deals.changes.reasonError'))
      .nullable()
      .defined()
      .test('reason', t('marketplace.deals.changes.reasonError'), value => value !== null),
    note: yup
      .string()
      .defined()
      .trim()
      .max(
        DEAL_RESPOND_LIMITS.maxNoteLength,
        t('validation.maxLength', { count: DEAL_RESPOND_LIMITS.maxNoteLength }),
      ),
  });
