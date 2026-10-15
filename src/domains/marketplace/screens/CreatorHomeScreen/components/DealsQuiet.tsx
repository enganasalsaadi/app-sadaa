import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock } from 'lucide-react-native';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { useClock } from '../../../hooks/useClock';
import type { CreatorActiveDeal } from '../../../types';
import { formatRemaining, timerSecondsLeft } from '../../../utils/dealTimer';

const MARK = moderateScale(56);
const MINUTE = 60_000;

interface DealsQuietProps {
  /** The nearest deadline among the deals that wait on someone else, if any has one. */
  nextUp: CreatorActiveDeal | null;
}

/** Nothing waits on the creator: a calm card, and under it the next thing about to move. */
const DealsQuietComponent: React.FC<DealsQuietProps> = ({ nextUp }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(MINUTE);
  const title = t('marketplace.creatorHome.deals.quiet.title');
  const message = t('marketplace.creatorHome.deals.quiet.message');
  const nextText =
    nextUp?.dueAt != null
      ? t('marketplace.creatorHome.deals.quiet.nextUp', {
          name: nextUp.brand.name ?? nextUp.title,
          time: formatRemaining(t, timerSecondsLeft(nextUp.dueAt, now)),
        })
      : null;

  return (
    <Box gap="sm">
      <Box
        row
        align="center"
        gap="lg"
        mx="xl"
        p="lg"
        borderRadius="xl"
        bg={colors.status.success.soft}
        accessible
        accessibilityLabel={`${title}. ${message}`}
      >
        <Box
          width={MARK}
          height={MARK}
          borderRadius="full"
          bg={colors.status.success.main}
          align="center"
          justify="center"
        >
          <Check size={sizes.icon.lg} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.status.success.text} numberOfLines={2}>
            {title}
          </Text>
          <Text variant="bodySmall" color={colors.status.success.text} numberOfLines={2}>
            {message}
          </Text>
        </Box>
      </Box>
      {nextText ? (
        <Box row align="center" gap="sm" mx="xl" px="lg" py="md" borderRadius="lg" bg={colors.surface.main} shadow="card">
          <Clock size={sizes.icon.sm} color={colors.interactive.text} />
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
              {nextText}
            </Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export const DealsQuiet = memo(DealsQuietComponent);
