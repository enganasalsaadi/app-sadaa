import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { Canvas, Rect, SweepGradient, vec } from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { motion, useStyles, useTheme } from '@/core/theme';
import type { SpacingToken } from '@/core/theme/types';
import { Box } from '../primitives/Box';

export interface SmartBorderProps {
  children: React.ReactNode;
  /** Inner padding of the card; defaults to `lg`. */
  p?: SpacingToken;
}

const FULL_TURN = Math.PI * 2;

/**
 * A card whose edge carries a slow teal sheen: reserved for what the system
 * suggests (smart match, AI suggestion), never for ordinary content (rule 09 §3.1).
 * The sheen is a Skia sweep gradient turning under a 1.5pt ring; reduced motion
 * holds it still. Teal family only, no new hue (rule 08).
 */
const SmartBorderComponent: React.FC<SmartBorderProps> = ({ children, p = 'lg' }) => {
  const { colors, radii, borderWidths } = useTheme();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const angle = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    angle.value = withRepeat(
      withTiming(FULL_TURN, { duration: motion.loop.sheen, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(angle);
  }, [angle, reduceMotion]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const center = vec(size.width / 2, size.height / 2);
  const transform = useDerivedValue(() => [{ rotate: angle.value }]);
  const styles = useStyles(
    (): { inner: ViewStyle } => ({
      inner: {
        margin: borderWidths.sm,
        borderRadius: radii.lg - borderWidths.sm,
        backgroundColor: colors.surface.main,
      },
    }),
    [borderWidths.sm, radii.lg, colors.surface.main],
  );

  return (
    <Box borderRadius="lg" shadow="card" bg={colors.surface.main}>
      <Box borderRadius="lg" overflow="hidden" onLayout={onLayout}>
        {size.width > 0 ? (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width={size.width} height={size.height}>
              <SweepGradient
                c={center}
                origin={center}
                transform={transform}
                colors={[
                  colors.interactive.main,
                  colors.interactive.soft,
                  colors.surface.elevated,
                  colors.interactive.main,
                ]}
              />
            </Rect>
          </Canvas>
        ) : null}
        <Box style={styles.inner} p={p}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export const SmartBorder = memo(SmartBorderComponent);
