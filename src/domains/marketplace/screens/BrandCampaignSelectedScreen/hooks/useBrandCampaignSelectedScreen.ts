import { useCallback, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import { useGetCampaignApplicantQuery, useGetCampaignApplicantsInfiniteQuery } from '../../../api/brandCampaignsApi';
import { useGetDealQuery } from '../../../api/dealsApi';
import { DEFAULT_APPLICANT_FILTERS, seatFaceOf, toApplicantsArgs } from '../../../utils/applicants';
import { dealFundingState } from '../../../utils/dealRespond';

type Route = DealsStackScreenProps<'CampaignSelected'>['route'];
type Navigation = DealsStackScreenProps<'CampaignSelected'>['navigation'];

/**
 * What a pick led to (PC3.4). Funded: the creator takes their seat and the escrow holds the price.
 * Unfunded: the seat is reserved and the deal waits 24 h for payment; the deal is read again for its
 * clock and what the wallet still lacks, and if a top-up funds it meanwhile the page turns into the
 * funded one. Everything but "which view first" is the server's.
 */
export const useBrandCampaignSelectedScreen = () => {
  const { id, applicationId, dealId, funded: pickedFunded, seatsOccupied, seatsTotal, promptClose } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const user = useAppSelector(selectUser);
  const card = useGetCampaignApplicantQuery({ id, applicationId }).data ?? null;
  const railArgs = useMemo(() => toApplicantsArgs(id, 'selected', DEFAULT_APPLICANT_FILTERS), [id]);
  const rail = useGetCampaignApplicantsInfiniteQuery(railArgs);
  const deal = useGetDealQuery({ role: 'brand', id: dealId }, { skip: pickedFunded, refetchOnMountOrArgChange: true });

  const others = useMemo(
    () =>
      (rail.data?.pages.flatMap(page => page.items) ?? [])
        .filter(item => item.id !== applicationId)
        .slice(0, Math.max(0, seatsOccupied - 1))
        .map(seatFaceOf),
    [applicationId, rail.data, seatsOccupied],
  );
  const funding = deal.data?.funding ?? null;
  const funded = pickedFunded || (!!deal.data && funding === null);
  const missing = funding?.missing ?? null;

  const openDeal = useCallback(() => navigation.navigate('DealDetail', { id: dealId }), [dealId, navigation]);
  const keepGoing = useCallback(
    () => navigation.popTo('CampaignApplicants', { id, ...(promptClose ? { closePrompt: true } : {}) }),
    [id, navigation, promptClose],
  );
  const topUp = useCallback(() => {
    if (!missing || missing.amount <= 0) return;
    navigate('Main', { screen: 'WalletTab', params: { screen: 'TopUp', params: { amount: missing }, initial: false } });
  }, [missing]);

  return {
    applicant: card,
    face: card ? seatFaceOf(card) : null,
    others,
    seatsOccupied,
    seatsTotal,
    funded,
    price: card?.price.gross ?? null,
    funding,
    fundingState: dealFundingState(funding),
    dueAt: deal.data?.deal.dueAt ?? null,
    dealLoaded: !!deal.data,
    canTopUp: user?.capabilities?.top_up_wallet?.allowed === true,
    openDeal,
    keepGoing,
    topUp,
  };
};
