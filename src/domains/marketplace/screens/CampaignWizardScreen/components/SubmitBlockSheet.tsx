import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';
import { CAMPAIGN_SUBMIT_BLOCK } from '../../../constants/campaignWizard';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * Why the campaign wasn't sent, when the fix lives outside the wizard: verify the company, wait for
 * the verification, or make room among the live campaigns. The way out opens once the sheet is gone.
 */
const SubmitBlockSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { submission } = useCampaignWizard();
  const { block, blockOpen, blockMessage, closeBlock, confirmBlock, onBlockDismissed } = submission;
  if (!block) return null;

  const copy = CAMPAIGN_SUBMIT_BLOCK[block];
  const Icon = copy.icon;
  // The server knows the live limit's number; its words win.
  const body = block === 'liveLimit' && blockMessage ? blockMessage : t(copy.body);

  return (
    <ConfirmSheet
      visible={blockOpen}
      onClose={closeBlock}
      title={t(copy.title)}
      body={body}
      icon={<Icon size={sizes.icon.lg} color={colors.interactive.main} />}
      confirmLabel={t(copy.confirm)}
      onConfirm={confirmBlock}
      cancelLabel={copy.leads ? t('marketplace.campaign.wizard.review.blocked.later') : undefined}
      onDismissed={onBlockDismissed}
    />
  );
};

export const SubmitBlockSheet = memo(SubmitBlockSheetComponent);
