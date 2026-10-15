import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCountdown } from '@/core/hooks';
import { resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';
import { DEAL_LATE_SECONDS, formatClock } from '../utils/dealTimer';

export interface DealItemFuseProps {
  /** `null` while the item's clock is paused. */
  dueAt: number | null;
  paused: boolean;
  /** `brand` = on the navy review stage (glass pill). */
  surface?: 'page' | 'brand';
  /** Read out after the time («then it's approved automatically»). */
  caption?: string;
}

/**
 * A deliverable's deadline as a live pill (teal; amber in the last 12 hours; grey while paused).
 * Ticks on its own so the screen around it doesn't re-render every second.
 */
const DealItemFuseComponent: React.FC<DealItemFuseProps> = ({ dueAt, paused, surface = 'page', caption }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const seconds = useCountdown(paused ? null : dueAt);
  const late = !paused && seconds < DEAL_LATE_SECONDS;
  const hue = resolveHue(colors, paused ? 'neutral' : late ? 'warning' : 'interactive');
  const onBrand = surface === 'brand';
  const styles = useStyles(
    ({ radii, spacing, sizes, borderWidths }): Record<'pill' | 'clock', ViewStyle> => ({
      pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: sizes.button.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.full,
        backgroundColor: onBrand ? colors.glass.fill : hue.soft,
        borderWidth: onBrand ? borderWidths.thin : 0,
        borderColor: colors.glass.border,
      },
      clock: { direction: 'ltr' },
    }),
    [colors.glass.border, colors.glass.fill, hue.soft, onBrand],
  );
  const dot = onBrand ? (late ? colors.glass.iconWarning : colors.glass.iconInteractive) : hue.main;
  const text = onBrand ? colors.text.onBrand : hue.text;
  const time = formatClock(seconds);
  const label = paused
    ? t('marketplace.deals.drafts.deliverables.paused')
    : [t('marketplace.deals.drafts.upload.fuse', { time }), caption].filter(Boolean).join(' · ');
  return (
    <Box style={styles.pill} accessible accessibilityLabel={label}>
      {paused ? null : <LiveDot color={dot} />}
      <Text variant="label" color={text} style={paused ? undefined : styles.clock}>
        {paused ? label : time}
      </Text>
    </Box>
  );
};

export const DealItemFuse = memo(DealItemFuseComponent);
