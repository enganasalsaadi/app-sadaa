import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignDropReminder } from '../../../types/campaignDrop';

export interface DropBeaconsProps {
  /** Longest lead first. */
  reminders: readonly CampaignDropReminder[];
}

/** The server's three reminders to the creators, lit once they went out. */
const DropBeaconsComponent: React.FC<DropBeaconsProps> = ({ reminders }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const label = ({ minutesBefore }: CampaignDropReminder) =>
    minutesBefore === 1440
      ? t('marketplace.campaign.drop.reminders.day')
      : minutesBefore === 120
        ? t('marketplace.campaign.drop.reminders.hours')
        : minutesBefore === 0
          ? t('marketplace.campaign.drop.reminders.atDrop')
          : t('marketplace.campaign.drop.reminders.minutes', { count: formatNumber(minutesBefore) });

  return (
    <Box row justify="center" gap="sm" wrap>
      {reminders.map(reminder => {
        const text = label(reminder);
        return (
          <Box
            key={reminder.minutesBefore}
            row
            align="center"
            gap="xs"
            px="md"
            py="xs"
            borderRadius="full"
            bg={colors.glass.fill}
            borderWidth="thin"
            borderColor={colors.glass.border}
            accessible
            accessibilityLabel={reminder.sent ? `${text} · ${t('marketplace.campaign.drop.reminders.sent')}` : text}
          >
            <Box
              width={sizes.dot.md}
              height={sizes.dot.md}
              borderRadius="full"
              bg={reminder.sent ? colors.glass.iconMoney : colors.glass.progressTrack}
            />
            <Text variant="caption" color={colors.text.onBrand}>
              {text}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export const DropBeacons = memo(DropBeaconsComponent);
