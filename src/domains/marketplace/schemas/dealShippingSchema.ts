import * as yup from 'yup';
import type { TFunction } from 'i18next';
import {
  DEAL_COURIER_PRESETS,
  DEAL_ISSUE_REASON_DEF,
  DEAL_SHIPPING_LIMITS,
  type DealCourierChoice,
} from '../constants/dealShipping';
import { DEAL_SHIPPING_ISSUE_REASON, type DealShippingIssueReason } from '../types/deal';
import { safeTrackingUrl, toSyrianMobile } from '../utils/dealShipping';

const COURIER_CHOICES: readonly DealCourierChoice[] = [...DEAL_COURIER_PRESETS, 'other'];

const maxLength = (t: TFunction, count: number) => t('validation.maxLength', { count });
const minLength = (t: TFunction, count: number) => t('validation.minLength', { count });

/** The brand's waybill: a preset courier or a typed one, the tracking number, an optional https link. */
export interface DealShipFormValues {
  courier: DealCourierChoice | null;
  /** Only read when `courier` is `other`. */
  courierName: string;
  trackingNo: string;
  trackingUrl: string;
}

export const createDealShipSchema = (t: TFunction): yup.ObjectSchema<DealShipFormValues> =>
  yup.object({
    courier: yup
      .mixed<DealCourierChoice>()
      .oneOf([...COURIER_CHOICES], t('validation.selectOne'))
      .nullable()
      .defined()
      .test('courier', t('validation.selectOne'), value => value !== null),
    courierName: yup
      .string()
      .defined()
      .trim()
      .max(DEAL_SHIPPING_LIMITS.courier, maxLength(t, DEAL_SHIPPING_LIMITS.courier))
      .when('courier', ([courier], schema) =>
        courier === 'other' ? schema.required(t('validation.required')) : schema,
      ),
    trackingNo: yup
      .string()
      .defined()
      .trim()
      .required(t('validation.required'))
      .max(DEAL_SHIPPING_LIMITS.trackingNo, maxLength(t, DEAL_SHIPPING_LIMITS.trackingNo)),
    trackingUrl: yup
      .string()
      .defined()
      .trim()
      .max(DEAL_SHIPPING_LIMITS.trackingUrl, maxLength(t, DEAL_SHIPPING_LIMITS.trackingUrl))
      .test(
        'https',
        t('marketplace.deals.shipping.ship.urlError'),
        value => !value || safeTrackingUrl(value) !== null,
      ),
  });

/** The creator's report: why, and a note (required for «other»). Photos are checked by the hook. */
export interface DealIssueFormValues {
  reason: DealShippingIssueReason | null;
  note: string;
}

export const createDealIssueSchema = (t: TFunction): yup.ObjectSchema<DealIssueFormValues> =>
  yup.object({
    reason: yup
      .mixed<DealShippingIssueReason>()
      .oneOf([...DEAL_SHIPPING_ISSUE_REASON], t('marketplace.deals.shipping.issue.pickError'))
      .nullable()
      .defined()
      .test('reason', t('marketplace.deals.shipping.issue.pickError'), value => value !== null),
    note: yup
      .string()
      .defined()
      .trim()
      .max(DEAL_SHIPPING_LIMITS.issueNote, maxLength(t, DEAL_SHIPPING_LIMITS.issueNote))
      .when('reason', ([reason], schema) =>
        reason === 'other' ? schema.required(t('marketplace.deals.shipping.issue.noteError')) : schema,
      ),
  });

/** Whether the server requires photos for this reason. */
export const issueNeedsPhotos = (reason: DealShippingIssueReason | null): boolean =>
  reason !== null && DEAL_ISSUE_REASON_DEF[reason].photos;

/** Where the product goes (B5.1). `phone` holds the national digits the field shows. */
export interface DealAddressFormValues {
  recipientName: string;
  phone: string;
  governorateId: string;
  city: string;
  area: string;
  addressLine: string;
  landmark: string;
  notes: string;
}

const ranged = (t: TFunction, { min, max }: { min: number; max: number }) =>
  yup
    .string()
    .defined()
    .trim()
    .required(t('validation.required'))
    .min(min, minLength(t, min))
    .max(max, maxLength(t, max));

export const createDealAddressSchema = (t: TFunction): yup.ObjectSchema<DealAddressFormValues> => {
  const limits = DEAL_SHIPPING_LIMITS.address;
  return yup.object({
    recipientName: ranged(t, limits.recipientName),
    phone: yup
      .string()
      .defined()
      .required(t('validation.required'))
      .test('syrian-mobile', t('marketplace.deals.shipping.address.phoneError'), value =>
        Boolean(value && toSyrianMobile(value)),
      ),
    governorateId: yup.string().defined().required(t('validation.selectOne')),
    city: ranged(t, limits.city),
    area: ranged(t, limits.area),
    addressLine: ranged(t, limits.addressLine),
    landmark: yup.string().defined().trim().max(limits.landmark, maxLength(t, limits.landmark)),
    notes: yup.string().defined().trim().max(limits.notes, maxLength(t, limits.notes)),
  });
};
