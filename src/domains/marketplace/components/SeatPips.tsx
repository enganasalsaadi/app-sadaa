import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useReducedMotion, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, ProgressBar } from '@/shared/ui';

const PIP_SIZE = { md: moderateScale(22), lg: moderateScale(40) } as const;
/** Up to this many seats read as individual circles (what fits the row); more become a bar. */
const MAX_PIPS = { md: 8, lg: 6 } as const;
const STAGGER_MS = 70;

export interface SeatPipsProps {
  total: number;
  filled: number;
  /** `lg` is the detail page's seats (bigger, spread across the width). */
  size?: keyof typeof PIP_SIZE;
}

/** The seats as circles that pop in one by one: filled teal with a check, empty dashed. */
const SeatPipsComponent: React.FC<SeatPipsProps> = ({ total, filled, size = 'md' }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const diameter = PIP_SIZE[size];
  const styles = useStyles(
    ({ borderWidths }): Record<'pip' | 'full' | 'empty', ViewStyle> => ({
      pip: { width: diameter, height: diameter, borderRadius: diameter / 2, alignItems: 'center', justifyContent: 'center' },
      full: { backgroundColor: colors.interactive.main },
      empty: { borderWidth: borderWidths.md, borderStyle: 'dashed', borderColor: colors.border.strong },
    }),
    [colors.border.strong, colors.interactive.main, diameter],
  );
  const label = t('marketplace.campaign.list.seatsA11y', { filled, total });
  const maxPips = MAX_PIPS[size];
  const slots = useMemo(() => Array.from({ length: Math.min(total, maxPips) }, (_, index) => index), [total, maxPips]);

  if (total > maxPips) {
    return <Box flex={1}><ProgressBar value={total === 0 ? 0 : filled / total} accessibilityLabel={label} /></Box>;
  }
  return (
    <Box row gap={size === 'lg' ? 'md' : 'xs'} accessible accessibilityLabel={label}>
      {slots.map(index => (
        <Animated.View
          key={index}
          entering={reduceMotion ? undefined : ZoomIn.delay(index * STAGGER_MS).springify().damping(11)}
          style={[styles.pip, index < filled ? styles.full : styles.empty]}
        >
          {index < filled ? <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={iconStroke.bold} /> : null}
        </Animated.View>
      ))}
    </Box>
  );
};

export const SeatPips = memo(SeatPipsComponent);
