import { useGetCreatorDealSummaryQuery } from '../api/creatorDealSummaryApi';

/**
 * Unseen campaign invitations, for the opportunities tab's count: the server's own `new_invites`
 * (an invitation counts as seen once its campaign page is opened). Shares the deals summary read
 * with the deals badge, so it adds no request. 0 while loading, on a failed read, with campaigns
 * off, and when `enabled` is false.
 */
export const useCreatorInvitesBadge = (enabled: boolean): number => {
  const { data } = useGetCreatorDealSummaryQuery(undefined, { skip: !enabled });
  return data?.campaigns?.newInvites ?? 0;
};
