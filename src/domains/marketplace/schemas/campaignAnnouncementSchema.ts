import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { CAMPAIGN_ANNOUNCEMENT_LIMITS } from '../utils/campaignAnnouncement';
import { safeTrackingUrl } from '../utils/dealShipping';

export interface CampaignAnnouncementFormValues {
  body: string;
  link: string;
}

export const EMPTY_ANNOUNCEMENT: CampaignAnnouncementFormValues = { body: '', link: '' };

/** The editor: 3–1000 characters and an optional https link (the server re-checks both). */
export const createCampaignAnnouncementSchema = (t: TFunction): yup.ObjectSchema<CampaignAnnouncementFormValues> =>
  yup.object({
    body: yup
      .string()
      .defined()
      .trim()
      .required(t('validation.required'))
      .min(CAMPAIGN_ANNOUNCEMENT_LIMITS.bodyMin, t('validation.minLength', { count: CAMPAIGN_ANNOUNCEMENT_LIMITS.bodyMin }))
      .max(CAMPAIGN_ANNOUNCEMENT_LIMITS.bodyMax, t('validation.maxLength', { count: CAMPAIGN_ANNOUNCEMENT_LIMITS.bodyMax })),
    link: yup
      .string()
      .defined()
      .trim()
      .max(CAMPAIGN_ANNOUNCEMENT_LIMITS.linkMax, t('validation.maxLength', { count: CAMPAIGN_ANNOUNCEMENT_LIMITS.linkMax }))
      .test('https', t('marketplace.campaign.announcements.linkError'), value => !value || safeTrackingUrl(value) !== null),
  });
