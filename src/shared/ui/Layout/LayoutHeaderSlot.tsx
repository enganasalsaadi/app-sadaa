import React, { memo } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type DerivedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { ScreenHeader } from '../ScreenHeader';
import type { ScreenHeaderMotion, ScreenHeaderVariant } from '../ScreenHeader';
import { resolveHeaderColors } from '../ScreenHeader/headerColors';
import type { LayoutHeaderBehavior, LayoutHeaderConfig } from './types';

interface LayoutHeaderSlotProps {
  config: LayoutHeaderConfig;
  variant: ScreenHeaderVariant;
  behavior: LayoutHeaderBehavior;
  floats: boolean;
  motion: ScreenHeaderMotion;
  translateY: DerivedValue<number>;
  onLayout: (event: LayoutChangeEvent) => void;
}

/** Config header + its scroll behaviour. Floating headers sit over the body instead of above it. */
const LayoutHeaderSlotComponent: React.FC<LayoutHeaderSlotProps> = ({
  config,
  variant,
  behavior,
  floats,
  motion,
  translateY,
  onLayout,
}) => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const stripBg = resolveHeaderColors(colors, variant).bg;

  const styles = useStyles(
    (theme): Record<'floating' | 'strip', ViewStyle> => ({
      floating: { position: 'absolute', top: 0, start: 0, end: 0, zIndex: theme.zIndices.header },
      strip: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        height: top,
        backgroundColor: stripBg,
        zIndex: theme.zIndices.header,
      },
    }),
    [top, stripBg],
  );

  const slideStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const header = (
    <ScreenHeader
      {...config}
      variant={variant}
      // Collapse: the large title in the content carries the subtitle.
      subtitle={behavior === 'collapse' ? undefined : config.subtitle}
      motion={motion}
      onLayout={onLayout}
    />
  );

  if (!floats) return header;

  return (
    <>
      <Animated.View style={[styles.floating, slideStyle]}>{header}</Animated.View>
      {behavior === 'hideOnScroll' ? <Box style={styles.strip} pointerEvents="none" /> : null}
    </>
  );
};

export const LayoutHeaderSlot = memo(LayoutHeaderSlotComponent);
