import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Vibration, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Pause } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import {
  Box,
  GradientSurface,
  LiveDot,
  MoneyText,
  Pressable,
  Text,
} from '@/shared/ui';
import { DEAL_NEXT_STEP_COPY } from '../constants/dealCopy';
import { useClock } from '../hooks/useClock';
import type { Deal, DealRole } from '../types';
import { dealNextStep } from '../utils/dealNextStep';
import {
  dealTimeView,
  remainingParts,
  type DealTimeView,
} from '../utils/dealTimer';
import { DealFace } from './DealFace';

const PASS_HEIGHT = moderateScale(186);
const PEEK = moderateScale(14);
const PEEK_INSET = moderateScale(12);
const FACE = moderateScale(44);
const RING = moderateScale(52);
const RING_STROKE = 4;
const SWIPE = 40;
const DOT = moderateScale(6);
const DOT_ON = moderateScale(20);
const MAX_DOTS = 6;
const MINUTE = 60_000;

export interface DealTurnStackProps {
  deals: Deal[];
  role: DealRole;
  onPress: (dealId: string) => void;
}

/** The time left as a ring that empties, number inside, unit under it. */
const TurnRing = memo<{ view: DealTimeView }>(({ view }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    (): Record<'ring', ViewStyle> => ({
      ring: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
    }),
    [],
  );
  if (view.kind !== 'left' && view.kind !== 'paused') return null;
  const radius = (RING - RING_STROKE) / 2;
  const length = 2 * Math.PI * radius;
  const left = view.kind === 'left' ? 1 - (view.share ?? 0) : 1;
  const parts = view.kind === 'left' ? remainingParts(view.seconds) : null;
  const unit = parts
    ? parts.unit === 'minutes'
      ? t('marketplace.deals.turn.unitMinutes', { count: parts.count })
      : parts.unit === 'hours'
      ? t('marketplace.deals.turn.unitHours', { count: parts.count })
      : t('marketplace.deals.turn.unitDays', { count: parts.count })
    : null;
  const stroke =
    view.kind === 'left' && view.late
      ? colors.glass.iconWarning
      : colors.glass.iconInteractive;

  return (
    <Box width={RING} height={RING} align="center" justify="center">
      <Svg width={RING} height={RING} style={styles.ring}>
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={radius}
          stroke={colors.glass.progressTrack}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={length * (1 - left)}
          fill="none"
        />
      </Svg>
      {parts ? (
        <>
          <Text variant="buttonSmall" color={colors.text.onBrand}>
            {formatNumber(parts.count)}
          </Text>
          <Text variant="overline" color={colors.text.onBrandMuted}>
            {unit}
          </Text>
        </>
      ) : (
        <Pause size={sizes.icon.sm} color={colors.text.onBrand} />
      )}
    </Box>
  );
});

interface TurnPassProps {
  deal: Deal;
  role: DealRole;
  onPress: (dealId: string) => void;
}

/** The front pass: who, the time ring, the one thing to do now, the status and the amount. */
const TurnPass = memo<TurnPassProps>(({ deal, role, onPress }) => {
  const now = useClock(MINUTE);
  const { t } = useTranslation();
  const { colors } = useTheme();
  const party = role === 'brand' ? deal.creator : deal.brand;
  const next = dealNextStep(deal, role);
  const view = dealTimeView(deal, now);
  const press = useCallback(() => onPress(deal.id), [deal.id, onPress]);
  const nextText = next
    ? t(DEAL_NEXT_STEP_COPY[next.key].title, { name: party.name ?? '' })
    : deal.status.label;

  return (
    <Pressable
      onPress={press}
      scaleOnPress
      flex={1}
      accessibilityRole="button"
      accessibilityLabel={`${party.name ?? ''}: ${nextText}`}
    >
      <GradientSurface
        variant="live"
        flex={1}
        p="lg"
        borderRadius="xl"
        overflow="hidden"
        justify="space-between"
      >
        <Box gap="md">
          <Box row align="center" gap="md">
            <DealFace party={party} size={FACE} surface="brand" />
            <Box flex={1} gap="xs">
              <Text
                variant="title"
                color={colors.text.onBrand}
                numberOfLines={1}
              >
                {party.name ?? ''}
              </Text>
              <Text
                variant="caption"
                color={colors.text.onBrandMuted}
                numberOfLines={1}
              >
                {deal.items.map(item => item.title).join(' · ')}
              </Text>
            </Box>
            <TurnRing view={view} />
          </Box>
          <Text variant="h4" color={colors.text.onBrand} numberOfLines={2}>
            {nextText}
          </Text>
        </Box>
        <Box row align="center" justify="space-between" gap="sm">
          <Box
            px="md"
            py="xs"
            borderRadius="full"
            bg={colors.glass.fill}
            borderWidth="thin"
            borderColor={colors.glass.border}
            alignSelf="flex-start"
          >
            <Text
              variant="caption"
              color={colors.text.onBrand}
              numberOfLines={1}
            >
              {deal.stage
                ? `${deal.status.label} · ${deal.stage.label}`
                : deal.status.label}
            </Text>
          </Box>
          <MoneyText value={deal.total} size="md" tone="onBrand" />
        </Box>
      </GradientSurface>
    </Pressable>
  );
});

/**
 * «Your turn now»: every deal waiting on the viewer as a stack of navy passes, soonest deadline
 * first. Swipe the front pass for the next one (light haptic); tap it to open the deal. Hidden
 * when nothing waits on the viewer.
 */
const DealTurnStackComponent: React.FC<DealTurnStackProps> = ({
  deals,
  role,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const count = deals.length;
  const current = Math.min(index, Math.max(0, count - 1));

  useEffect(() => {
    if (index > count - 1) setIndex(Math.max(0, count - 1));
  }, [count, index]);

  const go = useCallback(
    (step: 1 | -1) => {
      if (count < 2) return;
      Vibration.vibrate(HAPTIC_TAP_MS);
      setDirection(step === 1 ? 'next' : 'prev');
      setIndex(value => (value + step + count) % count);
    },
    [count],
  );

  // RTL: a swipe toward the right reads forward.
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .onEnd(event => {
          if (Math.abs(event.translationX) < SWIPE) return;
          const forward = isRTL
            ? event.translationX > 0
            : event.translationX < 0;
          go(forward ? 1 : -1);
        }),
    [go, isRTL],
  );

  const styles = useStyles(
    ({
      radii,
    }): Record<'stack' | 'front' | 'behindNear' | 'behindFar', ViewStyle> => ({
      stack: { height: PASS_HEIGHT + PEEK * 2 },
      front: {
        position: 'absolute',
        top: PEEK * 2,
        start: 0,
        end: 0,
        height: PASS_HEIGHT,
      },
      behindNear: {
        position: 'absolute',
        top: PEEK,
        start: PEEK_INSET,
        end: PEEK_INSET,
        height: PASS_HEIGHT,
        borderRadius: radii.xl,
        overflow: 'hidden',
      },
      behindFar: {
        position: 'absolute',
        top: 0,
        start: PEEK_INSET * 2,
        end: PEEK_INSET * 2,
        height: PASS_HEIGHT,
        borderRadius: radii.xl,
        overflow: 'hidden',
      },
    }),
    [],
  );

  const deal = deals[current];
  if (!deal) return null;

  const entering = reduceMotion
    ? undefined
    : direction === null
    ? FadeIn
    : (direction === 'next') !== isRTL
    ? FadeInRight.springify()
    : FadeInLeft.springify();
  const [near, far] = colors.deal.passBehind;

  return (
    <Box gap="md">
      <Box row align="center" gap="sm">
        <LiveDot color={colors.status.warning.main} />
        <Text variant="buttonSmall" color={colors.text.secondary}>
          {t('marketplace.deals.turn.title', { count })}
        </Text>
      </Box>
      <GestureDetector gesture={swipe}>
        <Box
          style={styles.stack}
          accessibilityHint={
            count > 1 ? t('marketplace.deals.turn.hint') : undefined
          }
        >
          {count > 2 && far ? (
            <Box style={styles.behindFar} pointerEvents="none">
              <LinearGradient colors={far} style={StyleSheet.absoluteFill} />
            </Box>
          ) : null}
          {count > 1 && near ? (
            <Box style={styles.behindNear} pointerEvents="none">
              <LinearGradient colors={near} style={StyleSheet.absoluteFill} />
            </Box>
          ) : null}
          <Animated.View key={deal.id} style={styles.front} entering={entering}>
            <TurnPass deal={deal} role={role} onPress={onPress} />
          </Animated.View>
        </Box>
      </GestureDetector>
      {count > 1 ? (
        <Box
          row
          justify="center"
          gap="xs"
          accessible
          accessibilityLabel={t('marketplace.deals.turn.position', {
            index: current + 1,
            count,
          })}
        >
          {deals.slice(0, MAX_DOTS).map((entry, dot) => (
            <Box
              key={entry.id}
              width={dot === current ? DOT_ON : DOT}
              height={DOT}
              borderRadius="full"
              bg={
                dot === current
                  ? colors.interactive.main
                  : colors.border.default
              }
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export const DealTurnStack = memo(DealTurnStackComponent);
