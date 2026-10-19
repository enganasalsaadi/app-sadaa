import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Notice, NumberStepper, Text, SheetFrame } from '@/shared/ui';
import { SeatPips } from '../../../components/SeatPips';
import type { CampaignDetail } from '../../../types/campaign';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

export interface CampaignReduceSheetProps {
  campaign: CampaignDetail;
  lifecycle: CampaignLifecycleModel;
}

/**
 * Dropping freed seats the brand won't refill (up to `seat_freed.reducible`), with the seats as
 * they will be. Dropping the last seat ends the campaign, which the sheet says before the tap.
 */
const CampaignReduceSheetComponent: React.FC<CampaignReduceSheetProps> = ({ campaign, lifecycle }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { reduceVisible, close, seats, setSeats, submitReduce, isRunning } = lifecycle;
  const reducible = Math.max(1, campaign.seatFreed?.reducible ?? 1);
  const total = Math.max(0, campaign.seatsTotal - seats);

  return (
    <SheetFrame
      visible={reduceVisible}
      onClose={close}
      title={t('marketplace.campaign.detail.reduce.title')}
      body={t('marketplace.campaign.detail.reduce.body')}
      footer={
        <CustomButton
          title={t('marketplace.campaign.detail.reduce.confirm', { count: seats })}
          onPress={submitReduce}
          loading={isRunning}
          variant={total === 0 ? 'danger' : 'primary'}
          size="lg"
          fullWidth
        />
      }
    >
      <Card p="lg" shadow="card">
        <Box gap="lg">
          <Box row align="center" justify="space-between" gap="md">
            <NumberStepper
              value={seats}
              onChange={setSeats}
              min={1}
              max={reducible}
              accessibilityLabel={t('marketplace.campaign.detail.reduce.a11y')}
            />
            <Box flex={1} align="flex-end">
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.campaign.detail.addSeats.totalLabel')}
              </Text>
              <Text variant="h3" color={colors.text.primary}>
                {formatNumber(total)}
              </Text>
            </Box>
          </Box>
          {total > 0 ? <SeatPips total={total} filled={campaign.counters.seatsOccupied} /> : null}
        </Box>
      </Card>
      {total === 0 ? <Notice tone="warning" message={t('marketplace.campaign.detail.reduce.cancels')} /> : null}
    </SheetFrame>
  );
};

export const CampaignReduceSheet = memo(CampaignReduceSheetComponent);
