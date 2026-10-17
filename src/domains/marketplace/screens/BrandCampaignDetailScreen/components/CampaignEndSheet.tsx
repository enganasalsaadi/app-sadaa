import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleStop, X } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Card, KeyValueRow, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import { DealSheetFrame } from '../../../components/DealSheetFrame';
import type { CampaignDetail } from '../../../types/campaign';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

export interface CampaignEndSheetProps {
  campaign: CampaignDetail;
  lifecycle: CampaignLifecycleModel;
}

/**
 * Ending the campaign, one of two ways the taken seats decide: «close recruiting» keeps the
 * running deals (≥ 1 seat taken), «cancel» ends it outright (none). Either way the waiting
 * applications become «not selected». Press-and-hold, since it can't be undone.
 */
const CampaignEndSheetComponent: React.FC<CampaignEndSheetProps> = ({ campaign, lifecycle }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { endVisible, close, endAction, confirmEnd, isRunning } = lifecycle;
  const closing = endAction === 'close';
  const { seatsOccupied, applicationsOpen } = campaign.counters;

  return (
    <DealSheetFrame
      visible={endVisible}
      onClose={close}
      title={t(closing ? 'marketplace.campaign.detail.end.closeTitle' : 'marketplace.campaign.detail.end.cancelTitle')}
      body={t(closing ? 'marketplace.campaign.detail.end.closeBody' : 'marketplace.campaign.detail.end.cancelBody')}
      footer={
        <DealHoldToSign
          label={t(closing ? 'marketplace.campaign.detail.end.closeHold' : 'marketplace.campaign.detail.end.cancelHold')}
          caption={t('marketplace.campaign.detail.end.caption')}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t(
            closing ? 'marketplace.campaign.detail.end.closeTitle' : 'marketplace.campaign.detail.end.cancelTitle',
          )}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          tone="danger"
          icon={closing ? CircleStop : X}
          sending={isRunning}
          onComplete={confirmEnd}
        />
      }
    >
      <Card p="lg" shadow="card">
        <Box gap="xs">
          {closing ? (
            <KeyValueRow label={t('marketplace.campaign.detail.end.seatsStay')} value={formatNumber(seatsOccupied)} />
          ) : null}
          <KeyValueRow label={t('marketplace.campaign.detail.end.applications')} value={formatNumber(applicationsOpen)} />
        </Box>
      </Card>
      <Text variant="bodySmall" color={colors.text.secondary}>
        {t(closing ? 'marketplace.campaign.detail.end.closeNote' : 'marketplace.campaign.detail.end.cancelNote')}
      </Text>
    </DealSheetFrame>
  );
};

export const CampaignEndSheet = memo(CampaignEndSheetComponent);
