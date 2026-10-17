import { useCallback, useMemo } from 'react';
import { navigate } from '@/core/navigation';
import { useGetCreatorRestrictionsQuery } from '../api/restrictionsApi';
import { restrictionNotice, type RestrictionNotice, type RestrictionScope } from '../utils/restrictions';
import { useCampaignsEnabled } from './useCampaignsEnabled';
import { useClock } from './useClock';

const MINUTE_MS = 60_000;

export interface RestrictionsModel {
  /** What stands in the way of this scope, or `null`. The server's verdict decides; this only words it. */
  notice: RestrictionNotice | null;
  /** The ban's «why»: opens the strikes. The waybill: opens the deal that owes it. */
  openNotice: () => void;
}

/**
 * The creator's restrictions (PC9.1, contract §5.5) for one thing they're about to do: apply to a
 * public campaign, or accept a direct offer. Only a creator on a campaigns-enabled account asks the
 * server; nothing shows (and nothing is blocked) until it answers, the server re-checks every action.
 */
export const useRestrictions = (scope: RestrictionScope, enabled = true): RestrictionsModel => {
  const campaignsEnabled = useCampaignsEnabled('creator');
  const { data } = useGetCreatorRestrictionsQuery(undefined, { skip: !enabled || campaignsEnabled !== true });
  const now = useClock(MINUTE_MS);
  const notice = useMemo(() => restrictionNotice(data ?? null, scope, now), [data, now, scope]);

  const openNotice = useCallback(() => {
    if (notice?.kind === 'return_pending' && notice.dealId) {
      navigate('DealsTab', { screen: 'DealDetail', params: { id: notice.dealId }, initial: false });
    } else if (notice) {
      navigate('DealsTab', { screen: 'Strikes', initial: false });
    }
  }, [notice]);

  return { notice, openNotice };
};
