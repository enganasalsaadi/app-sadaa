import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Pressable, Text, type LiveIslandTone } from '@/shared/ui';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';

type Island = NonNullable<BrandHomeScreenModel['island']>;

/** Island tone → status hue; "live" (verification pending) reads as info. */
const TONE_HUE = {
  danger: 'danger',
  warning: 'warning',
  live: 'info',
} as const satisfies Record<LiveIslandTone, 'danger' | 'warning' | 'info'>;

/**
 * The server's one blocker as a soft tinted card with a pulsing dot: title in the tone,
 * the server's line under it, a chevron toward the screen that fixes it.
 */
const HomeIslandComponent: React.FC<{ island: Island }> = ({ island }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const hue = resolveHue(colors, TONE_HUE[island.tone]);
  const styles = useStyles(() => ({ chevron: { transform: [{ scaleX: isRTL ? -1 : 1 }] } }), [isRTL]);

  return (
    <Pressable
      row
      align="center"
      gap="md"
      mx="xl"
      px="lg"
      py="md"
      borderRadius="lg"
      bg={hue.soft}
      onPress={island.onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.brandHome.islandLabel', { title: island.title, message: island.message })}
      accessibilityHint={island.hint}
    >
      <LiveDot color={hue.main} />
      <Box flex={1}>
        <Text variant="bodyMedium" color={hue.text} numberOfLines={1}>
          {island.title}
        </Text>
        {island.message ? (
          <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
            {island.message}
          </Text>
        ) : null}
        {island.note ? (
          <Text variant="caption" color={hue.text} numberOfLines={1}>
            {island.note}
          </Text>
        ) : null}
      </Box>
      <Box style={styles.chevron}>
        <ChevronRight size={sizes.icon.sm} color={hue.main} />
      </Box>
    </Pressable>
  );
};

export const HomeIsland = memo(HomeIslandComponent);
