import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_RATING_LIMITS } from '../constants/dealRating';

/** The rating's one typed field; the scores are taps held by the sheet, checked before sending. */
export interface DealRatingFormValues {
  comment: string;
}

export const createDealRatingSchema = (
  t: TFunction,
): yup.ObjectSchema<DealRatingFormValues> =>
  yup.object({
    comment: yup
      .string()
      .defined()
      .max(
        DEAL_RATING_LIMITS.maxCommentLength,
        t('validation.maxLength', {
          count: DEAL_RATING_LIMITS.maxCommentLength,
        }),
      ),
  });
