import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { OnAirLamp } from './OnAirLamp';

const WAVE = { inner: moderateScale(120), middle: moderateScale(190), outer: moderateScale(260) } as const;
const WAVE_KEYS = ['inner', 'middle', 'outer'] as const;

export interface PublishHeroProps {
  /** «Deliverable 2 of 3» over the item's title; the overlay header shows them once scrolled. */
  position: string;
  itemTitle: string;
  lampOn: boolean;
  title: string;
  body: string;
}

/**
 * The navy studio over the hand-in (approved «على الهواء»): faint broadcast circles behind the
 * «ON AIR» lamp, the question it answers, and what happens after. The lamp is the only thing that
 * changes: it lights when the post is ready to go.
 */
const PublishHeroComponent: React.FC<PublishHeroProps> = ({ position, itemTitle, lampOn, title, body }) => {
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'container' | 'titleRow' | 'stage' | 'waves' | 'wave' | (typeof WAVE_KEYS)[number], ViewStyle> => ({
      // The overlay header floats over the hero: start at its icon row, not under the status bar.
      container: { paddingTop: top + spacing.sm },
      // Clears the back button on one side and mirrors it on the other.
      titleRow: {
        minHeight: sizes.iconButton.md,
        paddingStart: sizes.iconButton.md + spacing.sm,
        paddingEnd: sizes.iconButton.md + spacing.sm,
      },
      stage: { minHeight: WAVE.outer / 2, justifyContent: 'center' },
      waves: {
        position: 'absolute',
        width: WAVE.outer,
        height: WAVE.outer,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      },
      wave: {
        position: 'absolute',
        borderRadius: radii.full,
        borderWidth: borderWidths.thin,
        borderColor: colors.live.wave,
      },
      inner: { width: WAVE.inner, height: WAVE.inner },
      middle: { width: WAVE.middle, height: WAVE.middle },
      outer: { width: WAVE.outer, height: WAVE.outer },
    }),
    [colors.live.wave, sizes.iconButton.md, spacing.sm, top],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="lg">
      <Box justify="center" style={styles.titleRow}>
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {position}
        </Text>
        <Text variant="title" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
          {itemTitle}
        </Text>
      </Box>
      <Box style={styles.stage} mt="md">
        <Box style={styles.waves} pointerEvents="none">
          {WAVE_KEYS.map(key => (
            <Box key={key} style={[styles.wave, styles[key]]} />
          ))}
        </Box>
        <OnAirLamp on={lampOn} />
      </Box>
      <Box gap="xs">
        <Text variant="h3" color={colors.text.onBrand} align="center">
          {title}
        </Text>
        <Text variant="bodySmall" color={colors.text.onBrandMuted} align="center">
          {body}
        </Text>
      </Box>
    </Box>
  );
};

export const PublishHero = memo(PublishHeroComponent);
