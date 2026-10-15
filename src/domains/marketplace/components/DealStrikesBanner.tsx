import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { useClock } from '../hooks/useClock';
import type { DealStrikes } from '../types';
import { strikesAlert } from '../utils/dealCancel';

/** Strikes clear by the day, so a minute tick is plenty. */
const TICK_MS = 60_000;

export interface DealStrikesBannerProps {
  strikes: DealStrikes;
  onPress: () => void;
}

/**
 * The creator board's strike warning (P8.1, approved 2026-10-16): a calm amber strip above «your
 * turn» with the live count and when the soonest clears; opens «My strikes». Nothing live → nothing.
 */
const DealStrikesBannerComponent: React.FC<DealStrikesBannerProps> = ({ strikes, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const now = useClock(TICK_MS);
  const alert = strikesAlert(strikes, now);
  if (!alert) return null;

  const title = t('marketplace.deals.strikes.banner', { count: alert.count });
  const clears = t('marketplace.deals.strikes.expiresIn', { count: alert.daysLeft });
  const when = alert.count > 1 ? t('marketplace.deals.strikes.bannerSoonest', { when: clears }) : clears;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      onPress={onPress}
      row
      align="center"
      gap="md"
      p="lg"
      mb="lg"
      borderRadius="lg"
      bg={colors.status.warning.soft}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.strikes.bannerA11y', { title, when })}
      accessibilityHint={t('marketplace.deals.strikes.bannerHint')}
    >
      <Box
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        borderRadius="full"
        align="center"
        justify="center"
        bg={colors.surface.main}
      >
        <ShieldAlert size={sizes.icon.md} color={colors.status.warning.main} />
      </Box>
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.status.warning.text} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {when}
        </Text>
      </Box>
      <Chevron size={sizes.icon.sm} color={colors.status.warning.main} />
    </Pressable>
  );
};

export const DealStrikesBanner = memo(DealStrikesBannerComponent);
