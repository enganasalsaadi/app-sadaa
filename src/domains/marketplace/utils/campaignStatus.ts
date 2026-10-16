import {
  APPLICATION_STATUS_META,
  CAMPAIGN_STATUS_META,
  UNKNOWN_APPLICATION_STATUS_META,
  UNKNOWN_CAMPAIGN_STATUS_META,
} from '../constants/campaignStatus';
import type { ApplicationStatusMeta, CampaignStatusMeta } from '../constants/campaignStatus';
import type { ApplicationStatus, CampaignStatus } from '../types';

/** `null` = a status the app doesn't know (mappers turn raw values into `null` at the API edge). */
export const getCampaignStatusMeta = (status: CampaignStatus | null): CampaignStatusMeta =>
  status === null ? UNKNOWN_CAMPAIGN_STATUS_META : CAMPAIGN_STATUS_META[status];

export const getApplicationStatusMeta = (status: ApplicationStatus | null): ApplicationStatusMeta =>
  status === null ? UNKNOWN_APPLICATION_STATUS_META : APPLICATION_STATUS_META[status];
