import React, { memo, useCallback, useEffect, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { BlurMask, Canvas, DashPathEffect, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { motion, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Skeleton, Text } from '@/shared/ui';
import type { WalletTileTarget } from '../../../constants';
import type { WalletDialKind, WalletDialSegment, WalletHeroStatus } from '../hooks/useWalletHero';
import { MonthInPill } from './MonthInPill';

/** Geometry in the dial's own 268-unit box, scaled to the drawn size. */
const VIEW = 268;
const RING_R = 118;
const RING_W = 13;
const RING_W_PICKED = 17;
const BEZEL_R = 100;
const BEZEL_W = 7;
const BEZEL_DASH = [1.3, 9.17];
const GLOW_W = 22;
const GLOW_BLUR = 6;
/** Path length left open between two arcs (their round caps eat half of it). */
const ARC_GAP = 26;
const ARC_MIN = 2;
const CENTER_INSET = 34;
const FULL_TURN = 360;
const TOP = -90;
const FACE_FROM_SCALE = 0.92;

const DIAL_SIZE = moderateScale(268);
const DIAL_SIZE_COMPACT = moderateScale(224);
/** From 10,000.00 $ the centre figure steps down a size so it stays inside the ring. */
const LARGE_MINOR = 1_000_000;
const NO_VALUE = '—';
const SKELETON_LABEL = '55%';
const SKELETON_FIGURE = '80%';

const OPEN_TILE_LABEL = {
  withdrawalsPending: 'finance.wallet.dial.openWithdrawals',
  topUpsInReview: 'finance.wallet.dial.openTopUps',
} as const satisfies Record<WalletTileTarget, ParseKeys>;

interface ArcGeometry {
  key: string;
  kind: WalletDialKind;
  path: SkPath;
}

/** One arc per segment in the available currency, sized by its share of the total, gaps between. */
const buildArcs = (segments: readonly WalletDialSegment[], size: number, mirror: boolean): ArcGeometry[] => {
  const currency = segments[0]?.value.currency;
  const parts = segments.filter(s => s.value.currency === currency && s.value.amount > 0);
  const total = parts.reduce((sum, s) => sum + s.value.amount, 0);
  if (total === 0) return [];
  const k = size / VIEW;
  const r = RING_R * k;
  const oval = { x: size / 2 - r, y: size / 2 - r, width: r * 2, height: r * 2 };
  const circumference = 2 * Math.PI * RING_R;
  const direction = mirror ? -1 : 1;
  let start = 0;
  return parts.map(s => {
    const length = (s.value.amount / total) * circumference;
    const single = parts.length === 1;
    const dash = single ? circumference : Math.max(length - ARC_GAP, ARC_MIN);
    const from = single ? 0 : start + ARC_GAP / 2;
    start += length;
    const path = Skia.Path.Make();
    path.addArc(oval, TOP + direction * (from / circumference) * FULL_TURN, direction * (dash / circumference) * FULL_TURN);
    return { key: s.key, kind: s.kind, path };
  });
};

const dialAmountSize = (value: Money, compact: boolean) =>
  compact || value.amount >= LARGE_MINOR ? ('lg' as const) : ('hero' as const);

interface DialArcProps {
  arc: ArcGeometry;
  index: number;
  selectedKey: string;
  size: number;
}

/** Draws in once (staggered); the picked arc thickens, the others fade back. */
const DialArc = memo<DialArcProps>(({ arc, index, selectedKey, size }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const k = size / VIEW;
  const rest =
    arc.kind === 'available' ? 1 : arc.kind === 'escrow' ? colors.wallet.dialEscrowOpacity : colors.wallet.dialWaitingOpacity;
  const anyPicked = selectedKey !== 'available';
  const picked = anyPicked && selectedKey === arc.key;
  const targetOpacity = picked ? 1 : anyPicked ? colors.wallet.dialDimOpacity : rest;
  const targetWidth = (picked ? RING_W_PICKED : RING_W) * k;

  const end = useSharedValue(reduceMotion ? 1 : 0);
  const opacity = useSharedValue(targetOpacity);
  const width = useSharedValue(targetWidth);
  const glow = useSharedValue(anyPicked ? 0 : 1);

  useEffect(() => {
    if (reduceMotion) return;
    end.value = withDelay(
      index * motion.duration.slow,
      withTiming(1, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) }),
    );
    // Once drawn the arc stays at 1, so a re-run (new order after a refresh) changes nothing.
  }, [end, index, reduceMotion]);

  useEffect(() => {
    const timing = { duration: reduceMotion ? 0 : motion.duration.slow };
    opacity.value = withTiming(targetOpacity, timing);
    width.value = withTiming(targetWidth, timing);
    glow.value = withTiming(anyPicked ? 0 : 1, timing);
  }, [anyPicked, glow, opacity, reduceMotion, targetOpacity, targetWidth, width]);

  const color = arc.kind === 'waiting' ? colors.text.onBrandMuted : colors.glass.iconMoney;

  return (
    <>
      {arc.kind === 'available' ? (
        <Path
          path={arc.path}
          style="stroke"
          strokeWidth={GLOW_W * k}
          strokeCap="round"
          color={colors.wallet.dialGlow}
          end={end}
          opacity={glow}
        >
          <BlurMask blur={GLOW_BLUR * k} style="normal" />
        </Path>
      ) : null}
      <Path
        path={arc.path}
        style="stroke"
        strokeWidth={width}
        strokeCap="round"
        color={color}
        end={end}
        opacity={opacity}
      />
    </>
  );
});

interface DialFaceProps {
  segment: WalletDialSegment;
  active: boolean;
  hidden: boolean;
  compact: boolean;
  monthIn: Money | null;
  monthInKey: ParseKeys;
  dealsCount: number;
  onOpenTile: (target: WalletTileTarget) => void;
}

/** What the centre says about one arc; faces cross-fade with a small spring when the pick changes. */
const DialFace = memo<DialFaceProps>(
  ({ segment, active, hidden, compact, monthIn, monthInKey, dealsCount, onOpenTile }) => {
    const { t } = useTranslation();
    const { colors, sizes, isRTL } = useTheme();
    const reduceMotion = useReducedMotion();
    const shown = useSharedValue(active ? 1 : 0);

    useEffect(() => {
      shown.value = reduceMotion
        ? active
          ? 1
          : 0
        : active
          ? withSpring(1, motion.spring)
          : withTiming(0, { duration: motion.duration.fast });
    }, [active, reduceMotion, shown]);

    const faceStyle = useAnimatedStyle(() => ({
      opacity: shown.value,
      transform: [{ scale: FACE_FROM_SCALE + (1 - FACE_FROM_SCALE) * shown.value }],
    }));
    const styles = useStyles(
      (): Record<'face', ViewStyle> => ({
        face: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, alignItems: 'center', justifyContent: 'center' },
      }),
      [],
    );

    const { opens } = segment;
    const openTile = useCallback(() => {
      if (opens) onOpenTile(opens);
    }, [onOpenTile, opens]);
    const Chevron = isRTL ? ChevronLeft : ChevronRight;

    const chip =
      segment.kind === 'available' ? (
        monthIn && !hidden && !compact ? <MonthInPill value={monthIn} labelKey={monthInKey} /> : null
      ) : segment.kind === 'escrow' ? (
        dealsCount > 0 ? (
          <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.glass.badge}>
            <ShieldCheck size={sizes.icon.xs} color={colors.glass.iconMoney} />
            <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
              {t('finance.wallet.escrowCard.dealsCount', { count: dealsCount })}
            </Text>
          </Box>
        ) : null
      ) : opens ? (
        <Pressable
          justify="center"
          minHeight={sizes.iconButton.md}
          onPress={openTile}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={t(OPEN_TILE_LABEL[opens])}
        >
          <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.glass.badge}>
            <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
              {t(OPEN_TILE_LABEL[opens])}
            </Text>
            <Chevron size={sizes.icon.xs} color={colors.text.onBrand} />
          </Box>
        </Pressable>
      ) : null;

    return (
      <Animated.View
        style={[styles.face, faceStyle]}
        pointerEvents={active ? 'box-none' : 'none'}
        accessibilityElementsHidden={!active}
        importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      >
        <Box align="center" gap="xs">
          <Text variant="bodySmall" color={colors.text.onBrandMuted} align="center" numberOfLines={1}>
            {segment.label}
          </Text>
          <MoneyText
            value={segment.value}
            size={dialAmountSize(segment.value, compact)}
            tone="onBrand"
            splitFraction
            rounding="down"
            animated={segment.kind === 'available'}
            hidden={hidden}
          />
          {chip}
        </Box>
      </Animated.View>
    );
  },
);

export interface BalanceDialProps {
  status: WalletHeroStatus;
  segments: readonly WalletDialSegment[];
  selectedKey: string;
  availableLabel: string;
  hidden: boolean;
  compact: boolean;
  monthIn: Money | null;
  monthInKey: ParseKeys;
  /** Active escrows (the escrow arc's chip). */
  dealsCount: number;
  onOpenTile: (target: WalletTileTarget) => void;
}

/**
 * The wallet's signature: one ring splitting every dollar the user has — available (bright
 * mint with a soft halo), in escrow (faded mint), waiting on a transfer or review (muted) —
 * drawn in once, arc after arc. The centre explains the picked arc (legend below). The ring
 * runs from the top toward the reading end. Loading: the empty ring and a pulsing centre.
 */
const BalanceDialComponent: React.FC<BalanceDialProps> = ({
  status,
  segments,
  selectedKey,
  availableLabel,
  hidden,
  compact,
  monthIn,
  monthInKey,
  dealsCount,
  onOpenTile,
}) => {
  const { colors, typography, isRTL } = useTheme();
  const size = compact ? DIAL_SIZE_COMPACT : DIAL_SIZE;
  const k = size / VIEW;

  const ring = useMemo(() => {
    const circle = (r: number) => {
      const path = Skia.Path.Make();
      path.addCircle(size / 2, size / 2, r * k);
      return path;
    };
    return { track: circle(RING_R), bezel: circle(BEZEL_R) };
  }, [k, size]);
  const arcs = useMemo(() => buildArcs(segments, size, isRTL), [isRTL, segments, size]);

  const styles = useStyles(
    (): Record<'dial' | 'center', ViewStyle> => ({
      dial: { width: size, height: size, alignSelf: 'center' },
      center: { position: 'absolute', top: CENTER_INSET * k, bottom: CENTER_INSET * k, start: CENTER_INSET * k, end: CENTER_INSET * k },
    }),
    [k, size],
  );

  const figureVariant = compact ? 'amountLarge' : 'amountHero';

  return (
    <Box style={styles.dial}>
      <Canvas style={styles.dial} pointerEvents="none">
        <Path path={ring.track} style="stroke" strokeWidth={RING_W * k} color={colors.wallet.dialTrack} />
        <Path path={ring.bezel} style="stroke" strokeWidth={BEZEL_W * k} color={colors.wallet.dialBezel}>
          <DashPathEffect intervals={BEZEL_DASH.map(v => v * k)} />
        </Path>
        {arcs.map((arc, index) => (
          <DialArc key={arc.key} arc={arc} index={index} selectedKey={selectedKey} size={size} />
        ))}
      </Canvas>

      <Box style={styles.center}>
        {status === 'ready' ? (
          segments.map(segment => (
            <DialFace
              key={segment.key}
              segment={segment}
              active={segment.key === selectedKey}
              hidden={hidden}
              compact={compact}
              monthIn={monthIn}
              monthInKey={monthInKey}
              dealsCount={dealsCount}
              onOpenTile={onOpenTile}
            />
          ))
        ) : (
          <Box flex={1} align="center" justify="center" gap="sm">
            <Text variant="bodySmall" color={colors.text.onBrandMuted} align="center" numberOfLines={1}>
              {availableLabel}
            </Text>
            {status === 'error' ? (
              <Text variant={figureVariant} color={colors.text.onBrand}>
                {NO_VALUE}
              </Text>
            ) : (
              <Box width="100%" align="center" gap="sm">
                <Skeleton width={SKELETON_FIGURE} height={typography[figureVariant].lineHeight} borderRadius="md" surface="brand" />
                <Skeleton width={SKELETON_LABEL} height={typography.caption.lineHeight} borderRadius="full" surface="brand" />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const BalanceDial = memo(BalanceDialComponent);
