import { useGetCreatorDealSummaryQuery } from '../api/creatorDealSummaryApi';

/**
 * Deals waiting on the creator, for the deals tab's count: the server's own `needsActionCount`
 * (rule 06, never recounted). Unlike the brand badge it subscribes itself, so the count shows
 * before Home mounts and every deal action or push (`CreatorDealSummary` tag) refreshes it.
 * 0 while loading, on a failed read, in the welcome state, and when `enabled` is false.
 */
export const useCreatorDealsBadge = (enabled: boolean): number => {
  const { data } = useGetCreatorDealSummaryQuery(undefined, { skip: !enabled });
  return data?.activeDeals?.needsActionCount ?? 0;
};
