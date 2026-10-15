import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { DEAL_LIVE_PLATFORM_LABEL, DEAL_LIVE_URL_REASON_COPY, DEAL_PUBLISH_LIMITS } from '../constants/dealPublish';
import { checkLiveUrl, isLivePlatform } from '../utils/dealPublish';

/** Creator publishing: the live link (proofs are checked by the upload set). */
export interface DealPublishFormValues {
  url: string;
}

/**
 * The link is required unless the item has no platform (an in-store visit). The test names are the
 * server's reason codes, so the field shows one diagnosis whoever found the problem.
 */
export const createDealPublishSchema = (
  t: TFunction,
  itemPlatform: string | null,
): yup.ObjectSchema<DealPublishFormValues> => {
  const url = yup
    .string()
    .defined()
    .trim()
    .max(DEAL_PUBLISH_LIMITS.url, t('validation.maxLength', { count: DEAL_PUBLISH_LIMITS.url }));
  const platform = isLivePlatform(itemPlatform) ? t(DEAL_LIVE_PLATFORM_LABEL[itemPlatform]) : '';
  return yup.object({
    url: (itemPlatform ? url.required(t('marketplace.deals.publish.link.required')) : url)
      .test('invalid', t(DEAL_LIVE_URL_REASON_COPY.invalid.title), value =>
        !value || checkLiveUrl(value, itemPlatform) !== 'invalid',
      )
      .test('platform_mismatch', t(DEAL_LIVE_URL_REASON_COPY.platform_mismatch.title, { platform }), value =>
        !value || checkLiveUrl(value, itemPlatform) !== 'platform_mismatch',
      ),
  });
};

/** Brand asking for a fix: what's wrong with the post (required, sent to the creator). */
export interface DealFixFormValues {
  note: string;
}

export const createDealFixSchema = (t: TFunction): yup.ObjectSchema<DealFixFormValues> =>
  yup.object({
    note: yup
      .string()
      .defined()
      .trim()
      .required(t('marketplace.deals.publish.fix.required'))
      .max(DEAL_PUBLISH_LIMITS.fixNote, t('validation.maxLength', { count: DEAL_PUBLISH_LIMITS.fixNote })),
  });
