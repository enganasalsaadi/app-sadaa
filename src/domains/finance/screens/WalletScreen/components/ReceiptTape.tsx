import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ReceiptText, Scissors } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Notice, Pressable, Skeleton, Text, useLayoutInView } from '@/shared/ui';
import { formatDayLabel, type LedgerDay } from '../../../utils/walletDates';
import type { WalletActivityModel } from '../hooks/useWalletActivity';
import { DashedRule } from './DashedRule';
import { ReceiptLine } from './ReceiptLine';

const SLOT_HEIGHT = moderateScale(16);
const SHADE_HEIGHT = moderateScale(22);
const TOOTH = moderateScale(14);
const TOOTH_HEIGHT = moderateScale(9);
const TEAR_HEIGHT = moderateScale(52);
const SKELETON_ROWS = [0, 1, 2] as const;
const SKELETON_ROW = moderateScale(48);

/** The torn bottom edge: a row of paper teeth. */
const tornEdge = (width: number): string => {
  const teeth = Math.ceil(width / TOOTH);
  let d = 'M0 0';
  for (let i = 0; i < teeth; i += 1) {
    d += ` L${(i + 0.5) * TOOTH} ${TOOTH_HEIGHT} L${Math.min((i + 1) * TOOTH, width)} 0`;
  }
  return `${d} Z`;
};

const DayRows = memo<{ day: LedgerDay; hidden: boolean; onPressLine: (reference: string) => void }>(
  ({ day, hidden, onPressLine }) => {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    return (
      <Box>
        <Box row align="center" gap="md" pt="lg" pb="xs">
          <Box flex={1}>
            <DashedRule />
          </Box>
          <Text variant="caption" color={colors.text.tertiary} accessibilityRole="header">
            {formatDayLabel(day, t, i18n.language)}
          </Text>
          <Box flex={1}>
            <DashedRule />
          </Box>
        </Box>
        {day.items.map((line, index) => (
          <Box key={line.reference}>
            {index > 0 ? <DashedRule /> : null}
            <ReceiptLine line={line} hidden={hidden} onPress={onPressLine} />
          </Box>
        ))}
      </Box>
    );
  },
);

interface ReceiptTapeProps {
  activity: WalletActivityModel;
  emptyMessage: string;
  hidden: boolean;
  onOpenStatement: () => void;
  onPressLine: (reference: string) => void;
}

/**
 * The latest lines as a paper receipt printed out of a slot: it unrolls the first time it
 * scrolls into view, groups lines by day between dashed rules and ends in a torn edge with
 * "View full statement" on the tear. Loading, empty and error stay on the paper.
 */
const ReceiptTapeComponent: React.FC<ReceiptTapeProps> = ({
  activity,
  emptyMessage,
  hidden,
  onOpenStatement,
  onPressLine,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing, radii, shadows } = useTheme();
  const reduceMotion = useReducedMotion();
  const inView = useLayoutInView();
  const [paperWidth, setPaperWidth] = useState(0);
  const unrolled = useSharedValue(reduceMotion ? 1 : 0);
  const paperHeight = useSharedValue(0);

  useEffect(() => {
    if (!inView.revealed || reduceMotion) return;
    unrolled.value = withTiming(1, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) });
  }, [inView.revealed, reduceMotion, unrolled]);

  const onPaperLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      paperHeight.value = height;
      setPaperWidth(prev => (prev === Math.round(width) ? prev : Math.round(width)));
    },
    [paperHeight],
  );

  // Hidden until measured, then pulled up into the slot and printed down.
  const paperStyle = useAnimatedStyle(() => ({
    opacity: paperHeight.value > 0 || unrolled.value === 1 ? 1 : 0,
    transform: [{ translateY: -(1 - unrolled.value) * paperHeight.value }],
  }));

  const shadowRoom = (shadows.card.shadowRadius ?? 0) + (shadows.card.shadowOffset?.height ?? 0);
  const styles = useStyles(
    (): Record<'clip' | 'slot' | 'shade' | 'tear', ViewStyle> => ({
      // Clips the paper at the slot; the side and bottom pads keep its shadow whole.
      clip: {
        marginTop: SLOT_HEIGHT / 2,
        marginHorizontal: spacing.md - shadowRoom,
        paddingHorizontal: shadowRoom,
        paddingBottom: shadowRoom,
        marginBottom: -shadowRoom,
        overflow: 'hidden',
      },
      slot: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        height: SLOT_HEIGHT,
        borderRadius: radii.sm,
        backgroundColor: colors.wallet.slot,
        boxShadow: `inset 0 ${spacing.xs}px ${spacing.sm}px ${colors.wallet.slotShade}, 0 1px 0 ${colors.wallet.slotRim}`,
      },
      shade: { position: 'absolute', top: 0, start: 0, end: 0, height: SHADE_HEIGHT },
      // The tear runs edge to edge of the paper.
      tear: { marginHorizontal: -spacing.lg, marginTop: spacing.xs },
    }),
    [colors.wallet, radii.sm, shadowRoom, spacing],
  );
  const edge = useMemo(() => (paperWidth > 0 ? tornEdge(paperWidth) : null), [paperWidth]);

  const body = (() => {
    switch (activity.status) {
      case 'loading':
        return (
          <Box gap="md" pt="lg" pb="lg">
            {SKELETON_ROWS.map(row => (
              <Skeleton key={row} width="100%" height={SKELETON_ROW} borderRadius="md" />
            ))}
          </Box>
        );
      case 'error':
        return (
          <Box pt="lg" pb="lg">
            <Notice
              tone="danger"
              message={t('finance.wallet.activity.loadFailed')}
              action={{ label: t('common.retry'), onPress: activity.retry }}
            />
          </Box>
        );
      case 'empty':
        return (
          <Box align="center" gap="sm" pt="2xl" pb="3xl">
            <ReceiptText size={sizes.icon.lg} color={colors.icon.secondary} />
            <Text variant="title" align="center">
              {t('finance.wallet.activity.emptyTitle')}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary} align="center">
              {emptyMessage}
            </Text>
          </Box>
        );
      case 'ready':
        return (
          <>
            {activity.days.map(day => (
              <DayRows key={day.key} day={day} hidden={hidden} onPressLine={onPressLine} />
            ))}
            <Box style={styles.tear}>
              <DashedRule />
              <Pressable
                row
                align="center"
                justify="center"
                gap="sm"
                minHeight={TEAR_HEIGHT}
                onPress={onOpenStatement}
                accessibilityRole="link"
                accessibilityLabel={t('finance.wallet.activity.viewStatement')}
              >
                <Scissors size={sizes.icon.sm} color={colors.interactive.main} />
                <Text variant="buttonSmall" color={colors.interactive.text}>
                  {t('finance.wallet.activity.viewStatement')}
                </Text>
              </Pressable>
            </Box>
          </>
        );
      default: {
        const _exhaustive: never = activity.status;
        return _exhaustive;
      }
    }
  })();

  return (
    <Animated.View ref={inView.ref} onLayout={inView.onLayout}>
      <Box style={styles.clip}>
        <Animated.View style={paperStyle} onLayout={onPaperLayout}>
          <Box bg={colors.surface.main} shadow="card" pt="2xl" px="lg" pb="xs">
            <LinearGradient colors={colors.wallet.tapeShade} style={styles.shade} pointerEvents="none" />
            <Text variant="title" align="center" accessibilityRole="header">
              {t('finance.wallet.activity.title')}
            </Text>
            {body}
          </Box>
          {edge ? (
            <Svg width={paperWidth} height={TOOTH_HEIGHT}>
              <Path d={edge} fill={colors.surface.main} />
            </Svg>
          ) : null}
        </Animated.View>
      </Box>
      <Box style={styles.slot} pointerEvents="none" />
    </Animated.View>
  );
};

export const ReceiptTape = memo(ReceiptTapeComponent);
