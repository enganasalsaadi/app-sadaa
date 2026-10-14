import * as yup from 'yup';
import type { TFunction } from 'i18next';
import type { AddonType } from '@/core/api';
import { DEAL_BRIEF_LIMITS, DEAL_OFFER_LIMITS } from '../constants/dealOffer';
import type { DealShippingMode } from '../types/deal';
import type { OfferFormValues, OfferLineValue } from '../utils/offerForm';

/** Fields each step checks before moving on (the server re-validates everything on save and send). */
export const OFFER_STEP_FIELDS = {
  services: ['lines', 'shippingMode'],
  brief: ['promoCode', 'trackingLink'],
} as const satisfies Record<string, readonly (keyof OfferFormValues)[]>;

/** Same rule as the server (`url:http,https`): a scheme, a host with a dot, no spaces. */
const TRACKING_LINK = /^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}$/i;

const briefList = () =>
  yup
    .array(yup.string().defined().max(DEAL_BRIEF_LIMITS.maxEntryLength))
    .max(DEAL_BRIEF_LIMITS.maxEntries)
    .defined();

export const createOfferSchema = (t: TFunction): yup.ObjectSchema<OfferFormValues> =>
  yup.object({
    lines: yup
      .array(
        yup
          .object({
            rateCardId: yup.string().defined(),
            quantity: yup.number().defined().min(1).max(DEAL_OFFER_LIMITS.maxQuantityPerLine),
            addons: yup.array(yup.mixed<AddonType>().defined()).defined(),
          })
          .defined() as yup.ObjectSchema<OfferLineValue>,
      )
      .defined()
      .min(1, t('marketplace.offer.services.pickError')),
    hasProduct: yup.boolean().defined(),
    shippingMode: yup
      .mixed<DealShippingMode>()
      .defined()
      .when('hasProduct', ([hasProduct], schema) =>
        hasProduct
          ? schema.test('shippingMode', t('marketplace.offer.shipping.pickError'), value => value !== 'none')
          : schema,
      ),
    requestedDeliveryDays: yup.number().nullable().defined().max(DEAL_OFFER_LIMITS.maxRequestedDeliveryDays),
    hashtags: briefList(),
    mentions: briefList(),
    talkingPoints: briefList(),
    donts: briefList(),
    promoCode: yup.string().defined().trim().max(DEAL_BRIEF_LIMITS.maxPromoCodeLength),
    trackingLink: yup
      .string()
      .defined()
      .trim()
      .max(DEAL_BRIEF_LIMITS.maxTrackingLinkLength)
      .test('trackingLink', t('marketplace.offer.brief.measure.linkError'), value => !value || TRACKING_LINK.test(value)),
  });
