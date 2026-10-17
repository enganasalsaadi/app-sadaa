import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { BottomSheet, Box, ChipGroup, CustomButton, Text } from '@/shared/ui';
import { formatCampaignDateTime, formatCampaignTime } from '../../../utils/campaignSchedule';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignCalendar } from './CampaignCalendar';

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
    <BottomSheet
      visible={sheetOpen}
      onClose={closeSheet}
      footer={
        <CustomButton
          title={t('marketplace.campaign.wizard.money.sheetConfirm')}
          onPress={confirmSheet}
          disabled={!ready}
          fullWidth
        />
      }
    >
      <Box px="xl" pt="md" pb="xl" gap="lg">
        <Box gap="xs">
          <Text variant="h3" color={colors.text.primary}>
            {t(isDrop ? 'marketplace.campaign.wizard.money.when.sheetTitle' : 'marketplace.campaign.wizard.money.deadline.sheetTitle')}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {isDrop
              ? t('marketplace.campaign.wizard.money.when.sheetBody', { date: formatCampaignDateTime(earliestDrop) })
              : t('marketplace.campaign.wizard.money.deadline.sheetBody')}
          </Text>
        </Box>
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
      </Box>
    </BottomSheet>
  );
};

export const CampaignDateSheet = memo(CampaignDateSheetComponent);
