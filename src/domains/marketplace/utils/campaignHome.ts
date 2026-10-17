import { CAMPAIGN_HOME_TARGET, type CampaignHomeTarget } from '../constants/campaignHome';
import type { BrandActiveCampaign } from '../types/campaignHome';
import { campaignTimeLeft, type CampaignTimeLeft } from './campaignList';

export const campaignHomeTarget = ({ action }: Pick<BrandActiveCampaign, 'action'>): CampaignHomeTarget =>
  action?.key ? CAMPAIGN_HOME_TARGET[action.key] : 'campaign';

export interface CampaignSeatSplit {
  /** Seats held by a creator who is paid for. */
  filled: number;
  /** Seats chosen but waiting for the brand's money. */
  awaiting: number;
  empty: number;
}

/** The seat strip's three kinds; `occupied` counts the awaiting-payment seats too. */
export const campaignSeatSplit = ({
  seats,
  awaitingPaymentCount,
}: Pick<BrandActiveCampaign, 'seats' | 'awaitingPaymentCount'>): CampaignSeatSplit => {
  const occupied = Math.min(Math.max(seats.occupied, 0), seats.total);
  const awaiting = Math.min(Math.max(awaitingPaymentCount, 0), occupied);
  return { filled: occupied - awaiting, awaiting, empty: seats.total - occupied };
};

/** Time to the synchronized drop, `null` once it has passed or none is set. */
export const campaignDropLeft = (
  { dropAt }: Pick<BrandActiveCampaign, 'dropAt'>,
  now: number,
): CampaignTimeLeft | null => campaignTimeLeft(dropAt, now);
