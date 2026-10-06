import React, { memo, useCallback, useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Skeleton } from '../Skeleton';
import { buildSparklinePath } from './sparklinePath';

export type SparklineTone = 'interactive' | 'money';

export interface SparklineProps {
  /** Oldest → newest, one value per bucket (day). */
  values: readonly number[];
  /** What the line says in words ("1,240 views, peak 62"); the line itself is hidden from screen readers. */
  accessibilityLabel: string;
  /** `money` only when the series is money flow (earnings), rule 08. */
  tone?: SparklineTone;
  height?: number;
  loading?: boolean;
}

const DEFAULT_HEIGHT = moderateScale(64);
const END_DOT_RADIUS = moderateScale(3.5);
const INSET = END_DOT_RADIUS + iconStroke.bold;

/** Small trend line (daily views, earnings) without axes. Fills its parent's width; time flips in RTL. */
const SparklineComponent: React.FC<SparklineProps> = ({
  values,
  accessibilityLabel,
  tone = 'interactive',
  height = DEFAULT_HEIGHT,
  loading = false,
}) => {
  const { colors, isRTL } = useTheme();
  const [width, setWidth] = useState(0);
  const hue = colors[tone];

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width));
  }, []);

  const geometry = useMemo(
    () =>
      buildSparklinePath(values, {
        width,
        height,
        inset: INSET,
        mirror: isRTL,
      }),
    [height, isRTL, values, width],
  );

  if (loading) {
    return <Skeleton width="100%" height={height} borderRadius="md" />;
  }

  return (
    <Box
      height={height}
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {geometry ? (
        <Svg width={width} height={height}>
          <Path d={geometry.area} fill={hue.soft} />
          <Path
            d={geometry.line}
            fill="none"
            stroke={hue.main}
            strokeWidth={iconStroke.bold}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx={geometry.end.x}
            cy={geometry.end.y}
            r={END_DOT_RADIUS}
            fill={hue.main}
            stroke={colors.surface.main}
            strokeWidth={iconStroke.bold}
          />
        </Svg>
      ) : null}
    </Box>
  );
};

export const Sparkline = memo(SparklineComponent);
