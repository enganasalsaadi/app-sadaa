import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Wallet } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, ProgressBar, Text, SheetFrame } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import type { RecruitingClosePrompt } from '../hooks/useRecruitingClosePrompt';

export interface CampaignClosePromptSheetProps {
  prompt: RecruitingClosePrompt;
}

/**
 * The follow-up to a pick that left seats open with the wallet short (frame 9): the balance against
 * what the open seats need, a shortcut to top up, «keep recruiting» as the easy way out and closing
 * as a press-and-hold (it ends applications for good).
 */
const CampaignClosePromptSheetComponent: React.FC<CampaignClosePromptSheetProps> = ({ prompt }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { recruiting } = prompt;
  if (!recruiting) return null;
  const { balance, required, shortfall } = recruiting.wallet;
  const covered = required.amount > 0 ? Math.min(1, Math.max(0, balance.amount / required.amount)) : 1;
  return (
    <SheetFrame
      visible={prompt.visible}
      onClose={prompt.keep}
      onDismissed={prompt.onDismissed}
      title={t('marketplace.campaign.applicants.closePrompt.title')}
      body={t('marketplace.campaign.applicants.closePrompt.body')}
      footer={
        <Box gap="md">
          <CustomButton fullWidth title={t('marketplace.campaign.applicants.closePrompt.keep')} onPress={prompt.keep} />
          <DealHoldToSign
            tone="danger"
            icon={Lock}
            label={t('marketplace.campaign.applicants.closePrompt.hold')}
            caption={t('marketplace.campaign.applicants.closePrompt.holdCaption')}
            hint={t('marketplace.deals.respond.hold.hint')}
            accessibilityLabel={t('marketplace.campaign.applicants.closePrompt.holdA11y')}
            accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
            onComplete={prompt.close}
          />
        </Box>
      }
    >
      <Box gap="sm" p="lg" borderRadius="lg" bg={colors.surface.main}>
        <Box row align="center" justify="space-between">
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.applicants.closePrompt.balance')}
          </Text>
          <MoneyText value={balance} size="md" tone="money" />
        </Box>
        <ProgressBar value={covered} accessibilityLabel={t('marketplace.campaign.applicants.closePrompt.balance')} />
        <Box row align="center" justify="space-between">
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.applicants.closePrompt.required')}
          </Text>
          <MoneyText value={required} size="md" />
        </Box>
        {prompt.canTopUp && shortfall.amount > 0 ? (
          <CustomButton
            variant="secondary"
            fullWidth
            title={t('marketplace.campaign.applicants.closePrompt.topUp', { amount: formatMoney(shortfall, i18n.language) })}
            leftIcon={<Wallet size={sizes.icon.sm} color={colors.interactive.main} strokeWidth={iconStroke.regular} />}
            onPress={prompt.topUp}
          />
        ) : null}
      </Box>
      <Text variant="caption" color={colors.text.secondary}>
        {t('marketplace.campaign.applicants.closePrompt.fine')}
      </Text>
    </SheetFrame>
  );
};

export const CampaignClosePromptSheet = memo(CampaignClosePromptSheetComponent);
