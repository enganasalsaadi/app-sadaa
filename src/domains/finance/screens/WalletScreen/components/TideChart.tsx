import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Canvas, Circle, DashPathEffect, Group, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import Animated, {
  cancelAnimation,
  Easing,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Notice, SegmentedControl, Skeleton, Text, useLayoutInView } from '@/shared/ui';
import { buildTidePath } from '../../../utils/tidePath';
import type { WalletEarningsModel } from '../hooks/useWalletEarnings';
import { WalletSectionTitle } from './WalletSectionTitle';

/** Two short period labels side by side beside the title. */
const PERIOD_SWITCH_WIDTH = moderateScale(164);
const CHART_HEIGHT = moderateScale(164);
const PLOT_TOP = moderateScale(40);
const PLOT_BASE = moderateScale(128);
const INSET = moderateScale(22);
const GRID_ROWS = 4;
const GRID_DASH = [2, 5];
const LINE_W = 3;
const GUIDE_W = 1;
const DROP_OPACITY = 0.7;
const HALO_OPACITY = 0.18;
const POINT_R = 5.5;
const HALO_REST = 9;
const HALO_PEAK = 16;
const LABEL_WIDTH = moderateScale(56);
const LABEL_TOP = PLOT_BASE + moderateScale(10);
const BUBBLE_SLOT = moderateScale(120);
const BUBBLE_LIFT = moderateScale(40);
/** Above six months, every other month is labelled (the current one always). */
const DENSE_AFTER = 6;
const TRANSPARENT = 'transparent';

interface TideCanvasProps {
  earnings: WalletEarningsModel;
  hidden: boolean;
}

/** The plot: dashed guides, the area rising, the line drawing in, the current month pulsing. */
const TideCanvas = memo<TideCanvasProps>(({ earnings, hidden }) => {
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const inView = useLayoutInView({ track: true });
  const [width, setWidth] = useState(0);
  const { chart } = earnings;
  const money = earnings.tone === 'money';
  const ink = money ? colors.money.main : colors.text.tertiary;

  const { onLayout: onInViewLayout } = inView;
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      onInViewLayout();
      const next = Math.round(event.nativeEvent.layout.width);
      setWidth(prev => (prev === next ? prev : next));
    },
    [onInViewLayout],
  );
  const pulsing = inView.visible;

  const values = useMemo(() => chart?.bars.map(bar => bar.value) ?? [], [chart]);
  const geometry = useMemo(
    () => buildTidePath(values, { width, top: PLOT_TOP, base: PLOT_BASE, inset: INSET, mirror: isRTL }),
    [isRTL, values, width],
  );
  const paths = useMemo(() => {
    if (!geometry) return null;
    const grid = Skia.Path.Make();
    for (let row = 0; row < GRID_ROWS; row += 1) {
      const y = PLOT_TOP + ((PLOT_BASE - PLOT_TOP) / (GRID_ROWS - 1)) * row;
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    return { grid, line: Skia.Path.MakeFromSVGString(geometry.line), area: Skia.Path.MakeFromSVGString(geometry.area) };
  }, [geometry, width]);

  const highlight = chart?.highlightIndex !== undefined ? geometry?.points[chart.highlightIndex] : undefined;
  const drop = useMemo(() => {
    if (!highlight) return null;
    const path = Skia.Path.Make();
    path.moveTo(highlight.x, highlight.y);
    path.lineTo(highlight.x, PLOT_BASE);
    return path;
  }, [highlight]);

  // The tide comes in once per period (the parent keys this by period); refreshes snap.
  const drawn = useSharedValue(reduceMotion ? 1 : 0);
  const halo = useSharedValue(HALO_REST);
  const ready = paths !== null;
  useEffect(() => {
    if (!ready || reduceMotion) return;
    drawn.value = withTiming(1, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) });
  }, [drawn, ready, reduceMotion]);
  useEffect(() => {
    if (!ready || reduceMotion || !pulsing) {
      cancelAnimation(halo);
      halo.value = HALO_REST;
      return undefined;
    }
    const leg = motion.loop.statusPulse / 2;
    halo.value = withDelay(
      motion.duration.draw,
      withRepeat(withSequence(withTiming(HALO_PEAK, { duration: leg }), withTiming(HALO_REST, { duration: leg })), -1),
    );
    return () => cancelAnimation(halo);
  }, [halo, pulsing, ready, reduceMotion]);

  const styles = useStyles(
    (): Record<'plot' | 'canvas', ViewStyle> => ({ plot: { height: CHART_HEIGHT }, canvas: { width, height: CHART_HEIGHT } }),
    [width],
  );

  const dense = (chart?.bars.length ?? 0) > DENSE_AFTER;

  return (
    <Animated.View ref={inView.ref} onLayout={onLayout} style={styles.plot}>
      {paths && geometry ? (
        <>
          <Canvas style={styles.canvas} pointerEvents="none">
            <Path path={paths.grid} style="stroke" strokeWidth={GUIDE_W} color={colors.border.default}>
              <DashPathEffect intervals={GRID_DASH} />
            </Path>
            {paths.area ? (
              <Group opacity={drawn}>
                <Path path={paths.area} opacity={colors.wallet.chartFill}>
                  <LinearGradient start={vec(0, PLOT_TOP)} end={vec(0, PLOT_BASE)} colors={[ink, TRANSPARENT]} />
                </Path>
              </Group>
            ) : null}
            {paths.line ? (
              <Path path={paths.line} style="stroke" strokeWidth={LINE_W} strokeCap="round" color={ink} end={drawn} />
            ) : null}
            {highlight && drop ? (
              <Group opacity={drawn}>
                <Path path={drop} style="stroke" strokeWidth={GUIDE_W} color={ink} opacity={DROP_OPACITY}>
                  <DashPathEffect intervals={GRID_DASH} />
                </Path>
                <Circle cx={highlight.x} cy={highlight.y} r={halo} color={ink} opacity={HALO_OPACITY} />
                <Circle cx={highlight.x} cy={highlight.y} r={POINT_R} color={colors.surface.main} />
                <Circle cx={highlight.x} cy={highlight.y} r={POINT_R} style="stroke" strokeWidth={LINE_W} color={ink} />
              </Group>
            ) : null}
          </Canvas>

          {highlight && chart?.bubble && !hidden ? (
            <BubbleTag
              label={chart.bubble}
              money={money}
              fromStart={highlight.fromStart}
              top={highlight.y - BUBBLE_LIFT}
              width={width}
            />
          ) : null}
          {chart?.bars.map((bar, index) => {
            const point = geometry.points[index];
            const current = index === chart.highlightIndex;
            if (!point || (dense && !current && index % 2 !== (chart.bars.length - 1) % 2)) return null;
            return (
              <MonthLabel key={bar.key} label={bar.label} fromStart={point.fromStart} current={current} />
            );
          })}
        </>
      ) : null}
    </Animated.View>
  );
});

const BubbleTag = memo<{ label: string; money: boolean; fromStart: number; top: number; width: number }>(
  ({ label, money, fromStart, top, width }) => {
    const { colors } = useTheme();
    const start = Math.min(Math.max(fromStart - BUBBLE_SLOT / 2, 0), Math.max(width - BUBBLE_SLOT, 0));
    const styles = useStyles(
      (): Record<'slot', ViewStyle> => ({
        slot: { position: 'absolute', top, start, width: BUBBLE_SLOT, alignItems: 'center' },
      }),
      [start, top],
    );
    return (
      <Box style={styles.slot} pointerEvents="none">
        <Box px="md" py="xs" borderRadius="full" bg={money ? colors.money.text : colors.text.primary}>
          <Text variant="amountSmall" color={money ? colors.text.onAccent : colors.surface.main} numberOfLines={1}>
            {label}
          </Text>
        </Box>
      </Box>
    );
  },
);

const MonthLabel = memo<{ label: string; fromStart: number; current: boolean }>(({ label, fromStart, current }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    (): Record<'label', ViewStyle> => ({
      label: { position: 'absolute', top: LABEL_TOP, start: fromStart - LABEL_WIDTH / 2, width: LABEL_WIDTH },
    }),
    [fromStart],
  );
  return (
    <Box style={styles.label} pointerEvents="none">
      <Text
        variant={current ? 'buttonSmall' : 'caption'}
        color={current ? colors.text.primary : colors.text.tertiary}
        align="center"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Box>
  );
});

interface TideChartProps {
  earnings: WalletEarningsModel;
  hidden: boolean;
}

/**
 * Monthly earnings (creator, mint) or campaign spend (brand, neutral) as a tide: a smooth
 * line over a fading area, the current month pulsing with its value. Period total under
 * the title and a 6-month / year switch.
 */
const TideChartComponent: React.FC<TideChartProps> = ({ earnings, hidden }) => {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const { status, chart } = earnings;

  if (status === 'initial' || status === 'hidden') return null;
  if (status === 'error') {
    return (
      <Box px="xl">
        <Notice
          tone="danger"
          message={t('finance.wallet.earnings.loadFailed')}
          action={{ label: t('common.retry'), onPress: earnings.retry }}
        />
      </Box>
    );
  }

  return (
    <Box
      mx="xl"
      bg={colors.surface.main}
      borderRadius="xl"
      borderWidth="thin"
      borderColor={colors.border.card}
      shadow="card"
      pt="xl"
      px="lg"
      pb="md"
      gap="sm"
    >
      <WalletSectionTitle
        title={earnings.title}
        end={
          <Box width={PERIOD_SWITCH_WIDTH}>
            <SegmentedControl
              options={earnings.periodOptions}
              value={earnings.period}
              onChange={earnings.setPeriod}
              accessibilityLabel={t('finance.wallet.earnings.periodA11y')}
            />
          </Box>
        }
      >
        {chart ? (
          <MoneyText
            value={chart.total}
            tone={earnings.tone === 'money' ? 'money' : 'default'}
            rounding="down"
            hidden={hidden}
          />
        ) : (
          <Skeleton width="40%" height={typography.amount.lineHeight} borderRadius="xs" />
        )}
      </WalletSectionTitle>

      <Box accessible accessibilityRole="image" accessibilityLabel={hidden ? earnings.title : chart?.accessibilityLabel ?? earnings.title}>
        {chart ? (
          <TideCanvas key={earnings.period} earnings={earnings} hidden={hidden} />
        ) : (
          <Skeleton width="100%" height={CHART_HEIGHT} borderRadius="lg" />
        )}
      </Box>
    </Box>
  );
};

export const TideChart = memo(TideChartComponent);
