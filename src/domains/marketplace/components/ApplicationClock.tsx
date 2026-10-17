import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { ApplicationWindow } from '../utils/creatorApplications';
import { CampaignRing } from './CampaignRing';

const RING_SIZE = 46;
const RING_STROKE = 4;

export interface ApplicationClockProps {
  window: ApplicationWindow;
}

/** The brand's 72 h to answer, as a ring that drains and the hours beside it; warm in the last hours. */
const ApplicationClockComponent: React.FC<ApplicationClockProps> = ({ window: { progress, hoursLeft, urgent, expired } }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tone = urgent ? resolveHue(colors, 'warning') : resolveHue(colors, 'interactive');
  const caption = expired
    ? t('marketplace.campaign.applications.card.windowOver')
    : t('marketplace.campaign.applications.card.hoursLeft', { count: hoursLeft });
  return (
    <Box row align="center" gap="sm">
      <CampaignRing
        progress={progress}
        color={tone.main}
        trackColor={colors.border.default}
        size={RING_SIZE}
        strokeWidth={RING_STROKE}
        accessibilityLabel={caption}
      >
        <Text variant="label" color={colors.text.primary}>
          {t('marketplace.campaign.applications.card.hoursShort', { hours: formatNumber(hoursLeft) })}
        </Text>
      </CampaignRing>
      <Box>
        <Text variant="bodySmall" color={urgent ? tone.text : colors.text.primary}>
          {caption}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.campaign.applications.card.windowLabel')}
        </Text>
      </Box>
    </Box>
  );
};

export const ApplicationClock = memo(ApplicationClockComponent);
