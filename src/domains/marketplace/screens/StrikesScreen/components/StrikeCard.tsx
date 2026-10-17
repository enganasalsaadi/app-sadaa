import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, StatusPill, Text } from '@/shared/ui';
import { DEAL_STRIKE_REASON_FALLBACK } from '../../../constants/dealStrike';
import type { DealStrike } from '../../../types';
import { strikeLife } from '../../../utils/dealCancel';

const FUSE_HEIGHT = moderateScale(8);
const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

export interface StrikeCardProps {
  strike: DealStrike;
  now: number;
}

/**
 * One active strike: why, when, and a fuse that burns down toward the day it disappears, with
 * the days left in words (the bar alone would say nothing to a screen reader).
 */
const StrikeCardComponent: React.FC<StrikeCardProps> = ({ strike, now }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { daysLeft, share } = strikeLife(strike, now);
  const styles = useStyles(
    ({ radii }): Record<'track' | 'fuse', ViewStyle> => ({
      track: {
        height: FUSE_HEIGHT,
        borderRadius: radii.full,
        overflow: 'hidden',
        backgroundColor: colors.surface.elevated,
      },
      fuse: {
        width: `${Math.round(share * 100)}%`,
        height: FUSE_HEIGHT,
        borderRadius: radii.full,
        backgroundColor: colors.status.warning.main,
      },
    }),
    [colors.status.warning.main, colors.surface.elevated, share],
  );
  const reason =
    strike.reason.label || (strike.reason.key ? t(DEAL_STRIKE_REASON_FALLBACK[strike.reason.key]) : '');
  const date = formatDate(strike.occurredAt, DATE_FORMAT, i18n.language);
  const remaining = t('marketplace.deals.strikes.expiresIn', { count: daysLeft });
  return (
    <Box
      p="lg"
      gap="md"
      bg={colors.surface.main}
      borderRadius="xl"
      shadow="card"
      accessible
      accessibilityLabel={t('marketplace.deals.strikes.a11y', {
        reason: [reason, strike.severity?.label].filter(Boolean).join(' · '),
        date,
        remaining,
      })}
    >
      <Box row align="center" justify="space-between" gap="md">
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={colors.text.primary}>
            {reason}
          </Text>
          {strike.severity?.label ? (
            <StatusPill
              label={strike.severity.label}
              tone={strike.severity.key === 'severe' ? 'danger' : 'warning'}
              size="sm"
            />
          ) : null}
        </Box>
        <Text variant="caption" color={colors.text.tertiary}>
          {date}
        </Text>
      </Box>
      <Box style={styles.track}>
        <Box style={styles.fuse} />
      </Box>
      <Text variant="caption" color={colors.status.warning.text}>
        {remaining}
      </Text>
    </Box>
  );
};

export const StrikeCard = memo(StrikeCardComponent);
