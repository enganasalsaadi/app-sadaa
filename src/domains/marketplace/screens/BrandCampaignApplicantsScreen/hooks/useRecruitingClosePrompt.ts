import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigate, type DealsStackScreenProps } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectUser } from '@/domains/auth';
import { useCampaignAction } from '../../../hooks/useCampaignAction';
import type { CampaignRecruiting } from '../../../types/campaign';

type Route = DealsStackScreenProps<'CampaignApplicants'>['route'];
type Navigation = DealsStackScreenProps<'CampaignApplicants'>['navigation'];

/**
 * «Keep recruiting or close it?» (PC3.4, frame 9): asked once when the result page hands back with
 * `closePrompt` (the pick left seats open but the wallet short). The param is spent as soon as the
 * sheet is asked for, so a refresh or coming back never repeats it. Closing is the lifecycle `close`
 * with an idempotency key; the figures on the sheet are the recruiting summary's.
 */
export const useRecruitingClosePrompt = (campaignId: string, recruiting: CampaignRecruiting | null) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { closePrompt } = useRoute<Route>().params;
  const user = useAppSelector(selectUser);
  const [asked, setAsked] = useState(false);
  const closing = useCampaignAction(campaignId, { idempotent: true });

  const setParams = navigation.setParams;
  useEffect(() => {
    if (!closePrompt) return;
    setAsked(true);
    setParams({ closePrompt: undefined });
  }, [closePrompt, setParams]);

  const keep = useCallback(() => setAsked(false), []);
  const runClose = closing.run;
  const close = useCallback(async (): Promise<boolean> => {
    const outcome = await runClose('close');
    if (outcome.ok) {
      setAsked(false);
      toastService.success(t('marketplace.campaign.applicants.closePrompt.closed'));
      return true;
    }
    // A conflict already toasted the server's words and refetched; the choice is stale either way.
    if (outcome.conflict) setAsked(false);
    return false;
  }, [runClose, t]);

  // The wallet opens once the sheet has left the screen (iOS can't present under a dismissing modal).
  const shortfall = recruiting?.wallet.shortfall ?? null;
  const topUpNext = useRef(false);
  const topUp = useCallback(() => {
    if (!shortfall || shortfall.amount <= 0) return;
    topUpNext.current = true;
    setAsked(false);
  }, [shortfall]);
  const onDismissed = useCallback(() => {
    if (!topUpNext.current || !shortfall) return;
    topUpNext.current = false;
    navigate('Main', { screen: 'WalletTab', params: { screen: 'TopUp', params: { amount: shortfall }, initial: false } });
  }, [shortfall]);

  return {
    visible: asked && recruiting !== null,
    recruiting,
    canTopUp: user?.capabilities?.top_up_wallet?.allowed === true,
    keep,
    close,
    topUp,
    onDismissed,
  };
};

export type RecruitingClosePrompt = ReturnType<typeof useRecruitingClosePrompt>;
