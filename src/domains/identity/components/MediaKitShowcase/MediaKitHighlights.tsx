import React, { memo, useMemo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { AnimatedNumber, Box, Card, GradientSurface, Image, Text, useLayoutInView } from '@/shared/ui';
import type { MediaKitHighlights as Highlights, MediaKitWorkedWithBrand } from '../../types/mediaKit';
import type { ShowcaseMetric, ShowcaseMetricKey } from '../../utils/mediaKitShowcase';
import { MediaKitGrow } from './MediaKitGrow';
import { MediaKitRise } from './MediaKitRise';
import { MediaKitSectionTitle } from './MediaKitSectionTitle';

const METRIC_LABEL = {
  engagement: 'account.mediaKit.showcase.metrics.engagement',
  avgViews: 'account.mediaKit.showcase.metrics.avgViews',
  localAudience: 'account.mediaKit.showcase.metrics.localAudience',
  campaigns: 'account.mediaKit.showcase.metrics.campaigns',
} as const satisfies Record<ShowcaseMetricKey, ParseKeys>;

const PER_ROW = 2;
const TILE_MIN = moderateScale(150);
const RING = moderateScale(58);
const RING_STROKE = moderateScale(7);
/** The ring is full at 10% engagement: a strong rate for local creators. */
const RING_FULL_PCT = 10;
/** Decorative rising bars: a glyph for "views", not a chart (the number is the data). */
const VIEW_BARS = [0.4, 0.62, 0.48, 0.75, 0.58, 1] as const;
const BARS_HEIGHT = moderateScale(44);
const BARS_GAP = moderateScale(4);
const TRACK_HEIGHT = moderateScale(10);
const STACK = moderateScale(30);
const STACK_OVERLAP = moderateScale(-9);
const STACK_MAX = 4;
const TILE_STAGGER = 80;
const BAR_STAGGER = 60;

/** The value rolls up from zero the moment its tile reaches the screen. */
const TileValue = memo<{ value: string; revealed: boolean; onBrand?: boolean }>(({ value, revealed, onBrand }) => {
  const { colors } = useTheme();
  const zeros = value.replace(/\d/g, '0');
  return (
    <AnimatedNumber
      key={revealed ? 'value' : 'zero'}
      value={revealed ? value : zeros}
      variant="h2"
      color={onBrand ? colors.text.onBrand : colors.text.primary}
      accessibilityLabel={value}
    />
  );
});

const EngagementRing = memo<{ pct: number }>(({ pct }) => {
  const { colors } = useTheme();
  const { ref, onLayout, progress } = useLayoutInView();
  const arc = useMemo(() => {
    const path = Skia.Path.Make();
    const inset = RING_STROKE / 2;
    path.addArc({ x: inset, y: inset, width: RING - RING_STROKE, height: RING - RING_STROKE }, -90, 360);
    return path;
  }, []);
  const target = Math.min(Math.max(pct / RING_FULL_PCT, 0), 1);
  const end = useDerivedValue(() => progress.value * target);
  const styles = useStyles(() => ({ ring: { width: RING, height: RING } }), []);
  return (
    <Animated.View ref={ref} onLayout={onLayout} style={styles.ring}>
      <Canvas style={styles.ring} pointerEvents="none">
        <Path path={arc} style="stroke" strokeWidth={RING_STROKE} color={colors.glass.progressTrack} />
        <Path
          path={arc}
          style="stroke"
          strokeWidth={RING_STROKE}
          strokeCap="round"
          color={colors.glass.iconInteractive}
          start={0}
          end={end}
        />
      </Canvas>
    </Animated.View>
  );
});

const ViewBar = memo<{ share: number; index: number }>(({ share, index }) => {
  const last = index === VIEW_BARS.length - 1;
  const styles = useStyles(
    ({ colors, radii }) => ({
      bar: {
        flex: 1,
        height: `${share * 100}%` as const,
        borderRadius: radii.xs,
        backgroundColor: last ? colors.interactive.main : colors.interactive.soft,
      },
    }),
    [share, last],
  );
  return <MediaKitGrow axis="y" delay={index * BAR_STAGGER} style={styles.bar} />;
});

const ViewBars = memo(() => {
  const styles = useStyles(
    () => ({
      bars: { flexDirection: 'row' as const, alignItems: 'flex-end' as const, height: BARS_HEIGHT, gap: BARS_GAP },
    }),
    [],
  );
  return (
    <Box style={styles.bars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {VIEW_BARS.map((share, index) => (
        <ViewBar key={share} share={share} index={index} />
      ))}
    </Box>
  );
});

const LocalTrack = memo<{ pct: number }>(({ pct }) => {
  const styles = useStyles(
    ({ colors, radii }) => ({
      track: {
        height: TRACK_HEIGHT,
        borderRadius: radii.full,
        overflow: 'hidden' as const,
        backgroundColor: colors.surface.elevated,
      },
      fill: {
        height: '100%' as const,
        width: `${Math.min(Math.max(pct, 0), 100)}%` as const,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.main,
      },
    }),
    [pct],
  );
  return (
    <Box style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <MediaKitGrow axis="x" style={styles.fill} />
    </Box>
  );
});

const BrandStack = memo<{ brands: readonly MediaKitWorkedWithBrand[] }>(({ brands }) => {
  const { colors } = useTheme();
  const styles = useStyles(() => ({ overlap: { marginStart: STACK_OVERLAP } }), []);
  return (
    <Box row accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {brands.slice(0, STACK_MAX).map((brand, index) => (
        <Box
          key={brand.id}
          style={index > 0 ? styles.overlap : undefined}
          width={STACK}
          height={STACK}
          borderRadius="full"
          borderWidth="md"
          borderColor={colors.surface.main}
          bg={colors.brand.soft}
          align="center"
          justify="center"
          overflow="hidden"
        >
          {brand.logo_url ? (
            <Image uri={brand.logo_url} size={STACK} circle resizeMode="cover" />
          ) : (
            <Text variant="caption" color={colors.brand.text}>
              {brand.name.trim().charAt(0).toUpperCase()}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
});

interface TileProps {
  metric: ShowcaseMetric;
  highlights: Highlights;
  brands: readonly MediaKitWorkedWithBrand[];
  index: number;
}

const Tile = memo<TileProps>(({ metric, highlights, brands, index }) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { ref, onLayout, revealed } = useLayoutInView();
  const styles = useStyles(() => ({ tile: { flex: 1 } }), []);
  const label = t(METRIC_LABEL[metric.key]);
  const onBrand = metric.key === 'engagement';

  let visual: React.ReactNode = null;
  switch (metric.key) {
    case 'engagement':
      visual = <EngagementRing pct={highlights.engagement_rate_pct ?? 0} />;
      break;
    case 'avgViews':
      visual = <ViewBars />;
      break;
    case 'localAudience':
      visual = <LocalTrack pct={highlights.local_audience_pct ?? 0} />;
      break;
    case 'campaigns':
      visual = brands.length > 0 ? <BrandStack brands={brands} /> : null;
      break;
    default: {
      const _exhaustive: never = metric.key;
      visual = _exhaustive;
    }
  }

  const body = (
    <Box flex={1} minHeight={TILE_MIN - spacing.lg * 2} justify="space-between" gap="lg">
      {visual}
      <Box>
        <TileValue value={metric.value} revealed={revealed} onBrand={onBrand} />
        <Text variant="bodySmall" color={onBrand ? colors.text.onBrandMuted : colors.text.secondary}>
          {label}
        </Text>
      </Box>
    </Box>
  );

  return (
    <Animated.View ref={ref} onLayout={onLayout} style={styles.tile}>
      <MediaKitRise from="pop" delay={index * TILE_STAGGER}>
        {onBrand ? (
          <GradientSurface variant="brand" p="lg" borderRadius="xl">
            {body}
          </GradientSurface>
        ) : (
          <Card p="lg" borderRadius="xl">
            {body}
          </Card>
        )}
      </MediaKitRise>
    </Animated.View>
  );
});

interface MediaKitHighlightsProps {
  metrics: readonly ShowcaseMetric[];
  highlights: Highlights | null;
  brands: readonly MediaKitWorkedWithBrand[];
}

/**
 * "By the numbers": the server's highlights as tiles in pairs, each with its own little
 * visual (engagement ring drawing, view bars rising, the local share filling, the faces of
 * brands served), numbers rolling as they arrive. Only metrics the server sent.
 */
const MediaKitHighlightsComponent: React.FC<MediaKitHighlightsProps> = ({ metrics, highlights, brands }) => {
  const { t } = useTranslation();
  if (metrics.length === 0 || !highlights) return null;

  const rows: ShowcaseMetric[][] = [];
  for (let i = 0; i < metrics.length; i += PER_ROW) rows.push(metrics.slice(i, i + PER_ROW));

  return (
    <Box gap="lg">
      <MediaKitSectionTitle
        overline={t('account.mediaKit.showcase.metrics.overline')}
        title={t('account.mediaKit.showcase.metrics.title')}
      />
      <Box gap="md">
        {rows.map((row, rowIndex) => (
          <Box key={row.map(metric => metric.key).join()} row gap="md">
            {row.map((metric, column) => (
              <Tile
                key={metric.key}
                metric={metric}
                highlights={highlights}
                brands={brands}
                index={rowIndex * PER_ROW + column}
              />
            ))}
            {row.length < PER_ROW ? <Box flex={1} /> : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const MediaKitHighlights = memo(MediaKitHighlightsComponent);
