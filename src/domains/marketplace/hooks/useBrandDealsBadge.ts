import { useAppSelector } from '@/core/store';
import { brandHomeApi } from '../api/brandHomeApi';

const selectBrandHome = brandHomeApi.endpoints.getBrandHome.select();

/**
 * Deals waiting on the brand, for the deals tab's count: the server's own number from the
 * cached Brand Home (rule 06), so it moves whenever Home refetches (pull, focus, a deal push).
 * 0 before Home loads and for creators.
 */
export const useBrandDealsBadge = (): number =>
  useAppSelector(state => selectBrandHome(state).data?.activeDeals?.needsActionCount ?? 0);
