import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { Money } from '@/core/money';
import type { DealsStackScreenProps } from '@/core/navigation';
import { useGetCampaignApplicantsInfiniteQuery, useGetCampaignQuery } from '../api/brandCampaignsApi';
import type { ApplicantCard, CampaignSelectResult } from '../types/campaign';
import { DEFAULT_APPLICANT_FILTERS, toApplicantsArgs } from '../utils/applicants';
import { deliverablesSummary, selectEstimate, type SelectEstimate } from '../utils/applicantSelect';
import { useApplicantSelect } from './useApplicantSelect';

type Navigation = DealsStackScreenProps<'CampaignApplicants'>['navigation'];

/**
 * The confirm-and-hold sheet for picking one applicant (PC3.4), shared by the applicant's page and
 * the comparison. The sheet reads the wallet from the recruiting summary the table already holds
 * (fetched only once a sheet opens) and the campaign's deliverables; the answer opens the result page
 * once the sheet has left the screen (iOS can't push under a dismissing modal).
 */
export const useApplicantSelectFlow = (campaignId: string) => {
  const navigation = useNavigation<Navigation>();
  const select = useApplicantSelect(campaignId);
  const campaign = useGetCampaignQuery(campaignId).data ?? null;
  const [target, setTarget] = useState<ApplicantCard | null>(null);
  const [visible, setVisible] = useState(false);
  const answer = useRef<CampaignSelectResult | null>(null);

  const summaryArgs = useMemo(() => toApplicantsArgs(campaignId, 'selected', DEFAULT_APPLICANT_FILTERS), [campaignId]);
  const summary = useGetCampaignApplicantsInfiniteQuery(summaryArgs, { skip: !target });
  const recruiting = summary.data?.pages[0]?.recruiting ?? null;

  const balance: Money | null = recruiting?.wallet.balance ?? null;
  const estimate = useMemo<SelectEstimate>(
    () => (target ? selectEstimate(balance, target.price.gross) : { kind: 'unknown' }),
    [balance, target],
  );
  const seatsTotal = recruiting?.seatsTotal ?? campaign?.seatsTotal ?? 0;
  const seat = (recruiting?.seatsOccupied ?? campaign?.counters.seatsOccupied ?? 0) + 1;
  const deliverables = useMemo(() => (campaign ? deliverablesSummary(campaign.deliverables) : ''), [campaign]);

  const open = useCallback((card: ApplicantCard) => {
    setTarget(card);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);

  const run = select.run;
  const sign = useCallback(async (): Promise<boolean> => {
    if (!target) return false;
    const outcome = await run(target.id);
    if (outcome.ok) {
      answer.current = outcome.result;
      setVisible(false);
      return true;
    }
    if (outcome.refused) setVisible(false);
    return false;
  }, [run, target]);

  const onDismissed = useCallback(() => {
    const done = answer.current;
    answer.current = null;
    if (!done) return;
    navigation.navigate('CampaignSelected', {
      id: campaignId,
      applicationId: done.application.id,
      dealId: done.deal.id,
      funded: done.funding.funded,
      seatsOccupied: done.recruiting.seatsOccupied,
      seatsTotal: done.recruiting.seatsTotal,
      promptClose: done.recruiting.promptClose,
    });
  }, [campaignId, navigation]);

  return { target, visible, estimate, balance, seat, seatsTotal, deliverables, open, close, sign, onDismissed };
};

export type ApplicantSelectFlow = ReturnType<typeof useApplicantSelectFlow>;
