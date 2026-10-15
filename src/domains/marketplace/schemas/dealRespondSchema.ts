import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import { DEAL_DECLINE_REASON } from '../types/deal';
import type { DealDeclineReason } from '../types/deal';
import type { DealExtensionRange } from '../utils/dealRespond';

/** Creator turning an offer down: a reason; `other` needs a few words (server `required_if`). */
export interface DealDeclineFormValues {
  reason: DealDeclineReason | null;
  note: string;
}

export const createDealDeclineSchema = (
  t: TFunction,
): yup.ObjectSchema<DealDeclineFormValues> =>
  yup.object({
    reason: yup
      .mixed<DealDeclineReason>()
      .oneOf(
        [...DEAL_DECLINE_REASON],
        t('marketplace.deals.respond.decline.pickError'),
      )
      .nullable()
      .defined()
      .test(
        'reason',
        t('marketplace.deals.respond.decline.pickError'),
        value => value !== null,
      ),
    note: yup
      .string()
      .defined()
      .trim()
      .max(
        DEAL_RESPOND_LIMITS.maxNoteLength,
        t('validation.maxLength', { count: DEAL_RESPOND_LIMITS.maxNoteLength }),
      )
      .when('reason', ([reason], schema) =>
        reason === 'other'
          ? schema.required(t('marketplace.deals.respond.decline.noteError'))
          : schema,
      ),
  });

/** Creator asking for more time: the new total in days and why. */
export interface DealExtensionFormValues {
  days: number;
  reason: string;
}

export const createDealExtensionSchema = (
  t: TFunction,
  range: DealExtensionRange,
): yup.ObjectSchema<DealExtensionFormValues> =>
  yup.object({
    days: yup.number().defined().integer().min(range.min).max(range.max),
    reason: yup
      .string()
      .defined()
      .trim()
      .required(t('marketplace.deals.respond.extension.reasonError'))
      .min(
        DEAL_RESPOND_LIMITS.minExtensionReasonLength,
        t('validation.minLength', {
          count: DEAL_RESPOND_LIMITS.minExtensionReasonLength,
        }),
      )
      .max(
        DEAL_RESPOND_LIMITS.maxNoteLength,
        t('validation.maxLength', { count: DEAL_RESPOND_LIMITS.maxNoteLength }),
      ),
  });

/** Brand pulling an offer back or turning an extension down: an optional reason. */
export interface DealReasonFormValues {
  reason: string;
}

export const createDealReasonSchema = (
  t: TFunction,
): yup.ObjectSchema<DealReasonFormValues> =>
  yup.object({
    reason: yup
      .string()
      .defined()
      .trim()
      .max(
        DEAL_RESPOND_LIMITS.maxNoteLength,
        t('validation.maxLength', { count: DEAL_RESPOND_LIMITS.maxNoteLength }),
      ),
  });
