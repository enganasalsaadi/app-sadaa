import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, ChipGroup, CustomButton, SheetFrame, Text } from '@/shared/ui';
import { CampaignCalendar } from '../../../components/CampaignCalendar';
import { formatCampaignDateTime, formatCampaignTime } from '../../../utils/campaignSchedule';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * The deadline or drop picker: a calendar bounded by the rules (deadline within 30 days, drop
 * after the gap), and for the drop a row of times that are still legal on the chosen day.
 * Nothing changes until «Confirm».
 */
const CampaignDateSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { schedule } = useCampaignWizard();
  const {
    sheet,
    sheetOpen,
    closeSheet,
    confirmSheet,
    pickedDay,
    pickDay,
    deadlineRange,
    dropMinDay,
    earliestDrop,
    dropTimes,
    dropMinute,
    pickMinute,
  } = schedule;
  const isDrop = sheet === 'drop';

  const times = useMemo(
    () => dropTimes.map(option => ({ value: String(option.minute), label: formatCampaignTime(option.at) })),
    [dropTimes],
  );
  const onTime = useCallback((value: string) => pickMinute(Number(value)), [pickMinute]);

  const ready = pickedDay !== null && (!isDrop || dropMinute !== null);

  return (
    <SheetFrame
      visible={sheetOpen}
      onClose={closeSheet}
      title={t(isDrop ? 'marketplace.campaign.wizard.money.when.sheetTitle' : 'marketplace.campaign.wizard.money.deadline.sheetTitle')}
      body={
        isDrop
          ? t('marketplace.campaign.wizard.money.when.sheetBody', { date: formatCampaignDateTime(earliestDrop) })
          : t('marketplace.campaign.wizard.money.deadline.sheetBody')
      }
      footer={
        <CustomButton
          title={t('marketplace.campaign.wizard.money.sheetConfirm')}
          onPress={confirmSheet}
          disabled={!ready}
          fullWidth
        />
      }
    >
      <CampaignCalendar
        // A fresh calendar per opening, so it opens on the month of the date picked last.
        key={sheetOpen ? sheet : 'closed'}
        selected={pickedDay}
        minDay={isDrop ? dropMinDay : deadlineRange.min}
        maxDay={isDrop ? undefined : deadlineRange.max}
        onPick={pickDay}
      />
      {isDrop && pickedDay !== null ? (
        <Box gap="sm">
          <Text variant="label" color={colors.text.secondary}>
            {t('marketplace.campaign.wizard.money.when.time')}
          </Text>
          {times.length > 0 ? (
            <ChipGroup
              items={times}
              value={dropMinute === null ? null : String(dropMinute)}
              onChange={onTime}
              accessibilityLabel={t('marketplace.campaign.wizard.money.when.time')}
            />
          ) : (
            <Text variant="bodySmall" color={colors.status.warning.text}>
              {t('marketplace.campaign.wizard.money.when.noTime')}
            </Text>
          )}
        </Box>
      ) : null}
    </SheetFrame>
  );
};

export const CampaignDateSheet = memo(CampaignDateSheetComponent);
