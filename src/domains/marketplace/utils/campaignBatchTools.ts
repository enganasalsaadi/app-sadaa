import type { Campaign, CampaignStatus } from '../types/campaign';

/** Once recruiting has started and until the campaign is gone: a draft or a refused one has nobody to manage. */
const WITH_CREATORS: ReadonlySet<CampaignStatus> = new Set(['open', 'suspended', 'filled', 'closed', 'completed']);

export interface CampaignBatchTools {
  /** The launch room: only a campaign with a synchronized drop has one. */
  drop: boolean;
  /** The shipping manifest: only a campaign that sends a product (gift or returnable sample). */
  shipping: boolean;
  /** At least one tool applies; the card is not drawn otherwise. */
  any: boolean;
}

/** Which batch tools (contract §3.7–§3.8) the campaign page offers. */
export const campaignBatchTools = (
  campaign: Pick<Campaign, 'status' | 'dropAt' | 'shippingMode'>,
): CampaignBatchTools => {
  const key = campaign.status.key;
  const live = key !== null && WITH_CREATORS.has(key);
  const mode = campaign.shippingMode.key;
  const drop = live && campaign.dropAt !== null;
  // `none` is a service campaign; a mode this app doesn't know gets no tool (the server would refuse it).
  const shipping = live && (mode === 'gift' || mode === 'returnable');
  return { drop, shipping, any: drop || shipping };
};
