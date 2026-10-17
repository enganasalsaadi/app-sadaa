import type { BrandCampaignAction } from '../types/campaignHome';

/** Where a campaign's action leads on Brand Home (contract §6.1); an unknown action just opens the campaign. */
export type CampaignHomeTarget = 'wallet' | 'applicants' | 'campaign';

export const CAMPAIGN_HOME_TARGET = {
  fund_seats: 'wallet',
  reopen: 'campaign',
  seat_freed: 'campaign',
  fix_draft: 'campaign',
  review_applicants: 'applicants',
} as const satisfies Record<BrandCampaignAction, CampaignHomeTarget>;
