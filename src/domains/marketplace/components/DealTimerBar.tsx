import React, { memo, useId } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Clock, Pause } from 'lucide-react-native';
import {
  moderateScale,
  opacity,
  resolveHue,
  useStyles,
  useTheme,
  type HueTone,
} from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const HEIGHT = moderateScale(44);
const STRIPE = 10;

/** The right end of the line: time left, paused, when it closed, or nothing (no running window). */
export type DealTimerBarTime =
  | { kind: 'left'; text: string; late: boolean }
  | { kind: 'paused' }
  | { kind: 'closed'; text: string }
  | { kind: 'none' };

export interface DealTimerBarProps {
  /** Server status label (rule 06). */
  label: string;
  tone: HueTone;
  /** Share of the window already gone (0–1): the line fills behind the text. */
  share: number | null;
  time: DealTimerBarTime;
}

/** Diagonal stripes: the deal's clock is frozen (shipping issue, dispute). */
const PausedStripes = memo<{ color: string }>(({ color }) => {
  const id = `stripes${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={STRIPE * 2}
          height={STRIPE * 2}
          patternTransform="rotate(-45)"
        >
          <Rect
            width={STRIPE}
            height={STRIPE * 2}
            fill={color}
            opacity={opacity.windowStripe}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
});

/**
 * One full-width line under a deal's identity: the server's status on the reading start, the
 * time left on the end, and a fill behind both that grows as the window runs out. Under 12 hours
 * left it turns amber; frozen timers show stripes and no clock.
 */
const DealTimerBarComponent: React.FC<DealTimerBarProps> = ({
  label,
  tone,
  share,
  time,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const late = time.kind === 'left' && time.late;
  const hue = resolveHue(colors, late ? 'warning' : tone);

  const styles = useStyles(
    ({ radii, spacing }): Record<'bar' | 'fill' | 'dot', ViewStyle> => ({
      bar: {
        height: HEIGHT,
        borderRadius: radii.md,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: hue.soft,
      },
      fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        width: `${Math.round((share ?? 0) * 100)}%`,
        backgroundColor: hue.main,
        opacity: opacity.windowFill,
      },
      dot: {
        width: sizes.dot.md,
        height: sizes.dot.md,
        borderRadius: radii.full,
        backgroundColor: hue.main,
      },
    }),
    [hue.main, hue.soft, share, sizes.dot.md],
  );

  return (
    <Box
      style={styles.bar}
      accessible
      accessibilityLabel={timeLabel(t, label, time)}
    >
      {time.kind === 'paused' ? <PausedStripes color={hue.main} /> : null}
      {share !== null && time.kind === 'left' ? (
        <Box style={styles.fill} pointerEvents="none" />
      ) : null}
      <Box row align="center" gap="sm" flex={1}>
        <Box style={styles.dot} />
        <Text variant="buttonSmall" color={hue.text} numberOfLines={1}>
          {label}
        </Text>
      </Box>
      {time.kind === 'left' ? (
        <Box row align="center" gap="xs">
          <Clock size={sizes.icon.xs} color={hue.text} />
          <Text variant="buttonSmall" color={hue.text}>
            {time.text}
          </Text>
          <Text variant="caption" color={hue.text}>
            {t('marketplace.deals.timer.left')}
          </Text>
        </Box>
      ) : time.kind === 'paused' ? (
        <Box row align="center" gap="xs">
          <Pause size={sizes.icon.xs} color={hue.text} />
          <Text variant="caption" color={hue.text}>
            {t('marketplace.deals.timer.paused')}
          </Text>
        </Box>
      ) : time.kind === 'closed' ? (
        <Text variant="caption" color={hue.text} numberOfLines={1}>
          {time.text}
        </Text>
      ) : null}
    </Box>
  );
};

const timeLabel = (
  t: TFunction,
  label: string,
  time: DealTimerBarTime,
): string => {
  switch (time.kind) {
    case 'left':
      return `${label}, ${time.text} ${t('marketplace.deals.timer.left')}`;
    case 'paused':
      return `${label}, ${t('marketplace.deals.timer.paused')}`;
    case 'closed':
      return `${label}, ${time.text}`;
    case 'none':
      return label;
    default: {
      const _exhaustive: never = time;
      return _exhaustive;
    }
  }
};

export const DealTimerBar = memo(DealTimerBarComponent);
