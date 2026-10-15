import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

const TRACK = moderateScale(10);
const HEAD = moderateScale(16);

export interface VerifyFuseCardProps {
  /** «41 h 12 min» left; `null` while the clock is paused. */
  time: string | null;
  /** Share of the verify window already gone (0–1). */
  share: number;
}

/**
 * The auto-verify fuse: how long before silence counts as a confirmation, as a burning line whose
 * glowing head moves with the window (display only; the server decides).
 */
const VerifyFuseCardComponent: React.FC<VerifyFuseCardProps> = ({ time, share }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const burnt = useSharedValue(reduceMotion ? share : 0);
  useEffect(() => {
    burnt.value = reduceMotion ? share : withTiming(share, { duration: motion.duration.draw });
  }, [burnt, reduceMotion, share]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${burnt.value * 100}%` }));
  const headStyle = useAnimatedStyle(() => ({ start: `${burnt.value * 100}%` }));

  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'card' | 'track' | 'fill' | 'head', ViewStyle> => ({
      card: {
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      track: {
        height: TRACK,
        borderRadius: radii.full,
        backgroundColor: colors.surface.elevated,
        justifyContent: 'center',
      },
      fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.main,
      },
      head: {
        position: 'absolute',
        width: HEAD,
        height: HEAD,
        marginStart: -HEAD / 2,
        borderRadius: radii.full,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.lg,
        borderColor: colors.interactive.main,
        shadowColor: colors.interactive.main,
        shadowOpacity: 0.8,
        shadowRadius: spacing.sm,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
    [colors],
  );

  return (
    <Box style={styles.card} accessible accessibilityRole="timer">
      <Box row align="center" gap="sm">
        <Clock size={sizes.icon.sm} color={colors.icon.secondary} />
        <Box flex={1}>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {time ? t('marketplace.deals.publish.brand.fuse.title') : t('marketplace.deals.publish.brand.fuse.paused')}
          </Text>
        </Box>
        {time ? (
          <Text variant="amountTitle" color={colors.text.primary}>
            {time}
          </Text>
        ) : null}
      </Box>
      {time ? (
        <Box style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
          <Animated.View style={[styles.head, headStyle]} />
        </Box>
      ) : null}
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.deals.publish.brand.fuse.hint')}
      </Text>
    </Box>
  );
};

export const VerifyFuseCard = memo(VerifyFuseCardComponent);
