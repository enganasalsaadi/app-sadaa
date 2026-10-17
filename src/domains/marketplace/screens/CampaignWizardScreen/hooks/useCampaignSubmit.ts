import { useCallback, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import type { Money } from '@/core/money';
import type { RootTabParamList } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectUser } from '@/domains/auth';
import { useCampaignAction } from '../../../hooks/useCampaignAction';
import type { CampaignWallet } from '../../../types/campaign';
import type { CampaignWizardProgress, CampaignWizardStep } from '../../../types/campaignDraft';
import { campaignWizardProgress } from '../../../utils/campaignDraft';
import {
  campaignKycGate,
  readCampaignMissing,
  submitBlockOf,
  type CampaignSubmitBlock,
} from '../../../utils/campaignReview';

export type CampaignWizardExit = NavigatorScreenParams<RootTabParamList>;

const VERIFY: CampaignWizardExit = {
  screen: 'SettingsTab',
  params: { screen: 'CompanyVerification', initial: false },
};
const MY_CAMPAIGNS: CampaignWizardExit = { screen: 'DealsTab' };

interface UseCampaignSubmitArgs {
  campaignId: string | null;
  progress: CampaignWizardProgress;
  /** Saves what is pending; `false` when the draft can't be saved right now. */
  flush: () => Promise<boolean>;
  /** Reads the campaign again (its `missing[]` after a refused send). */
  reload: () => void;
  /** A cover or brief file still uploading. */
  uploadsBusy: boolean;
  openStep: (step: CampaignWizardStep) => void;
  /** Leaves the wizard for a tab (the wizard sits above them). */
  leaveTo: (exit: CampaignWizardExit) => void;
}

/**
 * Sending the draft for review (contract §3.3). What is missing sends the brand to its step
 * without a request; the draft is saved first; the brand's verification is checked against `/me`
 * before the server checks it again. A refusal lands where it can be fixed: the missing step, the
 * verification, or «my campaigns» at the live limit. Success swaps the wizard for «in review» (the
 * cached campaign is now `pending_review`), with the wallet the server checked.
 */
export const useCampaignSubmit = ({
  campaignId,
  progress,
  flush,
  reload,
  uploadsBusy,
  openStep,
  leaveTo,
}: UseCampaignSubmitArgs) => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const kyc = campaignKycGate(user?.kyc_status);
  const canTopUp = user?.capabilities?.top_up_wallet?.allowed === true;
  const { run, isRunning } = useCampaignAction(campaignId ?? '');
  const [saving, setSaving] = useState(false);
  // The last refusal stays set while its sheet closes, so the copy doesn't vanish mid-animation.
  const [block, setBlock] = useState<CampaignSubmitBlock | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [submittedWallet, setSubmittedWallet] = useState<CampaignWallet | null>(null);
  const busyRef = useRef(false);
  // Where the sheet leads once it is gone: navigating while it closes would race the modal.
  const afterBlockRef = useRef<CampaignWizardExit | null>(null);

  const showBlock = useCallback((next: CampaignSubmitBlock, message: string | null = null) => {
    setBlockMessage(message);
    setBlock(next);
    setBlockOpen(true);
  }, []);

  const submit = useCallback(async () => {
    if (campaignId === null || busyRef.current) return;
    if (uploadsBusy) {
      toastService.info(t('marketplace.campaign.wizard.review.waitUploads'));
      return;
    }
    if (!progress.ready) {
      toastService.info(t('marketplace.campaign.wizard.review.notReady'));
      if (progress.firstIncomplete && progress.firstIncomplete !== 'review') openStep(progress.firstIncomplete);
      return;
    }
    busyRef.current = true;
    setSaving(true);
    try {
      if (!(await flush())) return;
      if (kyc === 'pending') {
        showBlock('kycPending');
        return;
      }
      if (kyc === 'required') {
        showBlock('kyc');
        return;
      }
      const outcome = await run('submit');
      if (outcome.ok) {
        Vibration.vibrate(HAPTIC_TAP_MS);
        setSubmittedWallet(outcome.result.wallet);
        return;
      }
      // A conflict was already reported and the campaign is being read again.
      if (outcome.conflict) return;
      const { error } = outcome;
      const blocked = submitBlockOf(error);
      if (blocked) {
        showBlock(blocked, blocked === 'liveLimit' ? error.message : null);
        return;
      }
      if (error.code === 'campaign_not_ready') {
        reload();
        const missing = readCampaignMissing(error.details);
        const target = missing ? campaignWizardProgress(missing).firstIncomplete : null;
        if (target && target !== 'review') openStep(target);
      }
      toastService.error(error.message);
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }, [campaignId, flush, kyc, openStep, progress, reload, run, showBlock, t, uploadsBusy]);

  const closeBlock = useCallback(() => setBlockOpen(false), []);
  const confirmBlock = useCallback(() => {
    if (block === 'kyc') afterBlockRef.current = VERIFY;
    if (block === 'liveLimit') afterBlockRef.current = MY_CAMPAIGNS;
    setBlockOpen(false);
  }, [block]);
  const onBlockDismissed = useCallback(() => {
    const exit = afterBlockRef.current;
    afterBlockRef.current = null;
    if (exit) leaveTo(exit);
  }, [leaveTo]);

  const openVerification = useCallback(() => leaveTo(VERIFY), [leaveTo]);
  const openCampaigns = useCallback(() => leaveTo(MY_CAMPAIGNS), [leaveTo]);
  const topUp = useCallback(
    (amount: Money) =>
      leaveTo({ screen: 'WalletTab', params: { screen: 'TopUp', params: { amount }, initial: false } }),
    [leaveTo],
  );

  return {
    submit,
    submitting: saving || isRunning,
    kyc,
    canTopUp,
    /** The wallet the server checked on send; `null` before (or when it sent none). */
    submittedWallet,
    block,
    blockOpen,
    /** The server's words for the live limit (it knows the number). */
    blockMessage,
    closeBlock,
    confirmBlock,
    onBlockDismissed,
    openVerification,
    openCampaigns,
    topUp,
  };
};
