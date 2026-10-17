import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { Timestamp } from '../../../types/deal';
import { campaignDropClockParts } from '../../../utils/campaignDrop';
import { formatCampaignDateTime } from '../../../utils/campaignSchedule';

const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });

export interface AnnouncementLockProps {
  unlocksAt: Timestamp;
}

/** The cap is reached: the next broadcast opens when the clock says (ticking by the second), and the text waits. */
const AnnouncementLockComponent: React.FC<AnnouncementLockProps> = ({ unlocksAt }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, 'warning');
  const parts = campaignDropClockParts(useCountdown(unlocksAt));
  const remaining = `${pad(parts.days * 24 + parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;

  return (
    <Box row align="center" gap="md" p="lg" borderRadius="lg" bg={hue.soft} accessible accessibilityRole="timer">
      <Clock size={sizes.icon.md} color={hue.text} />
      <Box flex={1} gap="xs">
        <Text variant="bodySmall" color={hue.text}>
          {t('marketplace.campaign.announcements.lock.title')}
        </Text>
        <Text variant="amountDisplay" color={hue.text} writingDirection="ltr">
          {isolateLtr(remaining)}
        </Text>
        <Text variant="caption" color={hue.text}>
          {t('marketplace.campaign.announcements.lock.at', { time: formatCampaignDateTime(unlocksAt) })}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.campaign.announcements.lock.kept')}
        </Text>
      </Box>
    </Box>
  );
};

export const AnnouncementLock = memo(AnnouncementLockComponent);
