import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignDropReminder } from '../../../types/campaignDrop';

export interface DropBeaconsProps {
  /** Longest lead first. */
  reminders: readonly CampaignDropReminder[];
}

/** The server's three reminders to the creators, in success tone once they went out. */
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
    <Box row align="center" gap="sm" wrap>
      <Box row align="center" gap="xs">
        <Bell size={sizes.icon.xs} color={colors.text.tertiary} />
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.campaign.drop.reminders.title')}
        </Text>
      </Box>
      {reminders.map(reminder => {
        const text = label(reminder);
        const { sent } = reminder;
        return (
          <Box
            key={reminder.minutesBefore}
            row
            align="center"
            gap="xs"
            px="md"
            py="xs"
            borderRadius="full"
            bg={sent ? colors.status.success.soft : colors.surface.elevated}
            accessible
            accessibilityLabel={sent ? `${text} · ${t('marketplace.campaign.drop.reminders.sent')}` : text}
          >
            <Box
              width={sizes.dot.md}
              height={sizes.dot.md}
              borderRadius="full"
              bg={sent ? colors.status.success.main : colors.border.strong}
            />
            <Text variant="caption" color={sent ? colors.status.success.text : colors.text.secondary}>
              {text}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export const DropBeacons = memo(DropBeaconsComponent);
