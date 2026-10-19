import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Notice, Text, SheetFrame } from '@/shared/ui';
import { CampaignCalendar } from '../../../components/CampaignCalendar';
import { formatCampaignDate } from '../../../utils/campaignSchedule';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

export interface CampaignReopenSheetProps {
  lifecycle: CampaignLifecycleModel;
}

/**
 * Reopening for applications (a suspended campaign, or a filled one with a freed seat) when the
 * old deadline can't stand: the calendar asks for the new one first. When the server asks for
 * nothing the island reopens without a sheet.
 */
const CampaignReopenSheetComponent: React.FC<CampaignReopenSheetProps> = ({ lifecycle }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { reopenVisible, close, reopenPath, deadlineWindow, pickedDay, pickDay, pickedAt, submitReopen, isRunning } =
    lifecycle;
  const suspended = reopenPath === 'reopen';

  return (
    <SheetFrame
      visible={reopenVisible}
      onClose={close}
      title={t(suspended ? 'marketplace.campaign.detail.reopen.title' : 'marketplace.campaign.detail.reopen.seatTitle')}
      body={t(suspended ? 'marketplace.campaign.detail.reopen.body' : 'marketplace.campaign.detail.reopen.seatBody')}
      footer={
        <CustomButton
          title={
            pickedAt !== null
              ? t('marketplace.campaign.detail.deadlineSheet.confirmDate', { date: formatCampaignDate(pickedAt) })
              : t('marketplace.campaign.detail.reopen.confirm')
          }
          onPress={submitReopen}
          loading={isRunning}
          disabled={deadlineWindow === null}
          size="lg"
          fullWidth
        />
      }
    >
      {deadlineWindow ? (
        <Box gap="md">
          <CampaignCalendar
            selected={pickedDay}
            minDay={deadlineWindow.minDay}
            maxDay={deadlineWindow.maxDay}
            onPick={pickDay}
          />
          <Text variant="caption" color={colors.text.tertiary} align="center">
            {t('marketplace.campaign.detail.deadlineSheet.rule')}
          </Text>
        </Box>
      ) : (
        <Notice tone="warning" message={t('marketplace.campaign.detail.deadlineSheet.none')} />
      )}
    </SheetFrame>
  );
};

export const CampaignReopenSheet = memo(CampaignReopenSheetComponent);
