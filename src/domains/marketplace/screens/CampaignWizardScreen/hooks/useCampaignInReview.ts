import { useCallback } from 'react';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * «In review»: the campaign the brand just sent and the wallet behind it, from Submit's own check
 * (or the latest quote when the screen was opened later). A shortfall is a nudge, never a block.
 */
export const useCampaignInReview = () => {
  const { campaign, cover, submission, money, onClose } = useCampaignWizard();
  const { submittedWallet, canTopUp, topUp, openCampaigns } = submission;

  const wallet = submittedWallet ?? money.quote?.wallet ?? null;
  const shortfall = wallet && wallet.shortfall.amount > 0 ? wallet.shortfall : null;

  const onTopUp = useCallback(() => {
    if (shortfall) topUp(shortfall);
  }, [shortfall, topUp]);

  return {
    campaign: campaign ?? null,
    coverUrl: cover.coverUrl,
    shortfall,
    canTopUp: canTopUp && shortfall !== null,
    onTopUp,
    openCampaigns,
    onClose,
  };
};
