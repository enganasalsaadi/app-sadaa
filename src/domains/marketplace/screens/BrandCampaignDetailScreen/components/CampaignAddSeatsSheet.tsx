import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Notice, NumberStepper, Text, SheetFrame } from '@/shared/ui';
import { CampaignCalendar } from '../../../components/CampaignCalendar';
import { SeatPips } from '../../../components/SeatPips';
import type { CampaignDetail } from '../../../types/campaign';
import { formatCampaignDate } from '../../../utils/campaignSchedule';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

export interface CampaignAddSeatsSheetProps {
  campaign: CampaignDetail;
  lifecycle: CampaignLifecycleModel;
}

/**
 * More seats on a published campaign: how many to add (the total stays ≤ 20) and the seats as they
 * will be. Once the old deadline passed, recruiting needs a new one, so a calendar asks for it
 * first. A `filled` campaign goes back to open on the server's side.
 */
const CampaignAddSeatsSheetComponent: React.FC<CampaignAddSeatsSheetProps> = ({ campaign, lifecycle }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { seatsVisible, close, seats, setSeats, maxSeats, needsDeadline, deadlineWindow, pickedDay, pickDay, pickedAt } =
    lifecycle;
  const total = campaign.seatsTotal + seats;
  const noDate = needsDeadline && deadlineWindow === null;

  return (
    <SheetFrame
      visible={seatsVisible}
      onClose={close}
      title={t('marketplace.campaign.detail.addSeats.title')}
      body={t('marketplace.campaign.detail.addSeats.body', { max: maxSeats + campaign.seatsTotal })}
      footer={
        <CustomButton
          title={t('marketplace.campaign.detail.addSeats.confirm', { count: seats })}
          onPress={lifecycle.submitSeats}
          loading={lifecycle.isRunning}
          disabled={noDate || maxSeats === 0}
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
              max={Math.max(1, maxSeats)}
              accessibilityLabel={t('marketplace.campaign.detail.addSeats.a11y')}
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
          <SeatPips total={total} filled={campaign.counters.seatsOccupied} />
        </Box>
      </Card>
      {needsDeadline ? (
        noDate ? (
          <Notice tone="warning" message={t('marketplace.campaign.detail.deadlineSheet.none')} />
        ) : deadlineWindow ? (
          <Box gap="md">
            <Notice tone="warning" message={t('marketplace.campaign.detail.addSeats.needsDeadline')} />
            <CampaignCalendar
              selected={pickedDay}
              minDay={deadlineWindow.minDay}
              maxDay={deadlineWindow.maxDay}
              onPick={pickDay}
            />
            {pickedAt !== null ? (
              <Text variant="bodySmall" color={colors.text.secondary} align="center">
                {t('marketplace.campaign.detail.deadlineSheet.closesAt', { date: formatCampaignDate(pickedAt) })}
              </Text>
            ) : null}
          </Box>
        ) : null
      ) : null}
    </SheetFrame>
  );
};

export const CampaignAddSeatsSheet = memo(CampaignAddSeatsSheetComponent);
