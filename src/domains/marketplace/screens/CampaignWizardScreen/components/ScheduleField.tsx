import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Flag } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ChipGroup, InlineError, SegmentedControl, Text, type SegmentedOption } from '@/shared/ui';
import {
  formatCampaignDate,
  formatCampaignDateTime,
  type CampaignScheduleMode,
} from '../../../utils/campaignSchedule';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CampaignField } from './CampaignField';
import { DateFieldButton } from './DateFieldButton';
import { DropTimeline } from './DropTimeline';

/**
 * The dates: when applications close (≤ 30 days), then how the content goes out: each creator
 * within a window, or everyone at one drop moment (Damascus time), with the run of dates the
 * server derives from it.
 */
const ScheduleFieldComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { schedule } = useCampaignWizard();
  const {
    mode,
    chooseMode,
    deadline,
    deliveryDays,
    deliveryChoices,
    chooseDeliveryDays,
    dropAt,
    dropGapDays,
    earliestDrop,
    dropTooEarly,
    deadlineDaysLeft,
    openDeadline,
    openDrop,
    deadlineMaxDays,
    deadlineError,
    whenError,
  } = schedule;

  const modes = useMemo<SegmentedOption<CampaignScheduleMode>[]>(
    () => [
      { value: 'delivery', label: t('marketplace.campaign.wizard.money.when.delivery') },
      { value: 'drop', label: t('marketplace.campaign.wizard.money.when.drop') },
    ],
    [t],
  );
  const dayChips = useMemo(
    () =>
      deliveryChoices.map(days => ({
        value: String(days),
        label: t('marketplace.campaign.wizard.money.when.days', { count: days }),
      })),
    [deliveryChoices, t],
  );

  let deadlineCaption: string | undefined;
  if (deadlineDaysLeft !== null) {
    deadlineCaption =
      deadlineDaysLeft <= 0
        ? t('marketplace.campaign.wizard.money.deadline.today')
        : t('marketplace.campaign.wizard.money.deadline.inDays', { count: deadlineDaysLeft });
  }

  return (
    <Box gap="2xl">
      <CampaignField
        label={t('marketplace.campaign.wizard.money.deadline.label')}
        note={t('marketplace.campaign.wizard.money.deadline.note', { days: deadlineMaxDays })}
      >
        <DateFieldButton
          icon={CalendarDays}
          value={deadline === null ? null : formatCampaignDate(deadline)}
          placeholder={t('marketplace.campaign.wizard.money.deadline.placeholder')}
          caption={deadlineCaption}
          error={deadlineError}
          onPress={openDeadline}
          accessibilityLabel={t('marketplace.campaign.wizard.money.deadline.label')}
        />
      </CampaignField>
      <CampaignField label={t('marketplace.campaign.wizard.money.when.label')}>
        <Box gap="md">
          <SegmentedControl
            options={modes}
            value={mode}
            onChange={chooseMode}
            accessibilityLabel={t('marketplace.campaign.wizard.money.when.label')}
          />
          {mode === 'delivery' ? (
            <>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.campaign.wizard.money.when.deliveryHint')}
              </Text>
              <ChipGroup
                items={dayChips}
                value={deliveryDays === null ? null : String(deliveryDays)}
                onChange={chooseDeliveryDays}
                accessibilityLabel={t('marketplace.campaign.wizard.money.when.delivery')}
              />
            </>
          ) : (
            <>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.campaign.wizard.money.when.dropHint', { days: dropGapDays })}
              </Text>
              <DateFieldButton
                icon={Flag}
                value={dropAt === null ? null : formatCampaignDateTime(dropAt)}
                placeholder={t('marketplace.campaign.wizard.money.when.dropPlaceholder')}
                caption={t('marketplace.campaign.wizard.money.when.zone')}
                error={
                  dropTooEarly
                    ? t('marketplace.campaign.wizard.money.when.tooEarly', { date: formatCampaignDateTime(earliestDrop) })
                    : undefined
                }
                onPress={openDrop}
                accessibilityLabel={t('marketplace.campaign.wizard.money.when.drop')}
              />
              <DropTimeline />
            </>
          )}
          {/* The local «too early» line already says what the server would. */}
          {whenError && !dropTooEarly ? <InlineError error={whenError} /> : null}
        </Box>
      </CampaignField>
    </Box>
  );
};

export const ScheduleField = memo(ScheduleFieldComponent);
