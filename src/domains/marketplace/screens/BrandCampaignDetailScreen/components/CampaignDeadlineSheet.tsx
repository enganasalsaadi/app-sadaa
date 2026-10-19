import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Notice, Text, SheetFrame } from '@/shared/ui';
import { CampaignCalendar } from '../../../components/CampaignCalendar';
import type { CampaignDetail } from '../../../types/campaign';
import { formatCampaignDate } from '../../../utils/campaignSchedule';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

export interface CampaignDeadlineSheetProps {
  campaign: CampaignDetail;
  lifecycle: CampaignLifecycleModel;
}

/**
 * A later application deadline: the calendar starts after the current one and stops at 30 days
 * from publishing (and before the drop's gap). Applications close at the end of the picked day.
 */
const CampaignDeadlineSheetComponent: React.FC<CampaignDeadlineSheetProps> = ({ campaign, lifecycle }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { deadlineVisible, close, deadlineWindow, pickedDay, pickDay, pickedAt, submitDeadline, isRunning } = lifecycle;
  const current = campaign.applyDeadlineAt;

  return (
    <SheetFrame
      visible={deadlineVisible}
      onClose={close}
      title={t('marketplace.campaign.detail.deadlineSheet.title')}
      body={
        current !== null
          ? t('marketplace.campaign.detail.deadlineSheet.body', { date: formatCampaignDate(current) })
          : t('marketplace.campaign.detail.deadlineSheet.bodyNone')
      }
      footer={
        <CustomButton
          title={
            pickedAt !== null
              ? t('marketplace.campaign.detail.deadlineSheet.confirmDate', { date: formatCampaignDate(pickedAt) })
              : t('marketplace.campaign.detail.deadlineSheet.confirm')
          }
          onPress={submitDeadline}
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

export const CampaignDeadlineSheet = memo(CampaignDeadlineSheetComponent);
