import { useAppSelector } from '@/core/store';
import { brandHomeApi } from '../api/brandHomeApi';
import { creatorDealSummaryApi } from '../api/creatorDealSummaryApi';
import { selectCampaignsServerDisabled } from '../store/campaignFlagSelectors';
import type { DealRole } from '../types/deal';
import { resolveCampaignsEnabled } from '../utils/campaignFlag';

const selectBrandHome = brandHomeApi.endpoints.getBrandHome.select();
const selectCreatorSummary = creatorDealSummaryApi.endpoints.getCreatorDealSummary.select();

/**
 * Whether to show any Public Campaigns entry point: read from the cached Home (brand) or deals
 * summary (creator), which every session already loads, so it never adds a request. `null` until
 * that answer arrives; show nothing then.
 */
export const useCampaignsEnabled = (role: DealRole): boolean | null => {
  const serverDisabled = useAppSelector(selectCampaignsServerDisabled);
  const homeEnabled = useAppSelector(state =>
    role === 'brand'
      ? selectBrandHome(state).data?.campaignsEnabled
      : selectCreatorSummary(state).data?.campaignsEnabled,
  );
  return resolveCampaignsEnabled(serverDisabled, homeEnabled);
};
