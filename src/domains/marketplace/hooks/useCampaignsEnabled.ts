import { useAppSelector } from '@/core/store';
import { useGetCampaignsInfiniteQuery } from '../api/brandCampaignsApi';
import { brandHomeApi } from '../api/brandHomeApi';
import { creatorDealSummaryApi } from '../api/creatorDealSummaryApi';
import { selectCampaignsServerDisabled } from '../store/campaignFlagSelectors';
import type { DealRole } from '../types/deal';
import { resolveCampaignsEnabled } from '../utils/campaignFlag';

const selectBrandHome = brandHomeApi.endpoints.getBrandHome.select();
const selectCreatorSummary =
  creatorDealSummaryApi.endpoints.getCreatorDealSummary.select();

/**
 * Whether to show any Public Campaigns entry point: read from the cached Home (brand) or deals
 * summary (creator), which every session already loads, so it never adds a request. `null` until
 * that answer arrives; show nothing then.
 *
 * A brand's Home also says `null` for «flag on, no active campaign yet» (contract §6.1), which
 * would hide the only way to create the first one. So a brand whose Home says off asks the list
 * once: it answers 200 when the flag is on, or `404 feature_disabled` (recorded in the store).
 */
export const useCampaignsEnabled = (role: DealRole): boolean | null => {
  const serverDisabled = useAppSelector(selectCampaignsServerDisabled);
  const homeEnabled = useAppSelector(state =>
    role === 'brand'
      ? selectBrandHome(state).data?.campaignsEnabled
      : selectCreatorSummary(state).data?.campaignsEnabled,
  );
  const probing = role === 'brand' && !serverDisabled && homeEnabled === false;
  const probe = useGetCampaignsInfiniteQuery({}, { skip: !probing });
  return resolveCampaignsEnabled(
    serverDisabled,
    probing ? (probe.isSuccess ? true : undefined) : homeEnabled,
  );
};
