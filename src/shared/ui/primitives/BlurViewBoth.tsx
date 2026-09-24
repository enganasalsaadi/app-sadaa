import React, { memo } from 'react';
import type { TextProps as RNTextProps } from 'react-native';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '@/core/theme/hooks/useTheme';
import { Box } from './Box';

// Android has no native blur; a translucent surface approximates the iOS light blur.
const ANDROID_BLUR_FALLBACK_OPACITY = 0.3;
interface BlurViewProps extends RNTextProps {}

const BlurViewBothComponent: React.FC<BlurViewProps> = () => {
  const { colors } = useTheme();
  return Platform.OS === 'ios' ? (
    <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={3} />
  ) : (
    <Box
      style={StyleSheet.absoluteFill}
      bg={colors.surface.main}
      opacity={ANDROID_BLUR_FALLBACK_OPACITY}
    />
  );
};

export const BlurViewBoth = memo(BlurViewBothComponent);
