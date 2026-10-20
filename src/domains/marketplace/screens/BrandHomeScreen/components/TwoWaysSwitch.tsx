import React, { memo, useCallback } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { TWO_WAYS, TWO_WAYS_LABEL, type TwoWay } from '../../../constants/brandHomeTwoWays';

const HEIGHT = moderateScale(48);
const PAD = moderateScale(4);

interface SegmentProps {
  option: TwoWay;
  selected: boolean;
  onSelect: (way: TwoWay) => void;
}

const SegmentComponent: React.FC<SegmentProps> = ({ option, selected, onSelect }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const handlePress = useCallback(() => onSelect(option), [onSelect, option]);
  return (
    <Pressable
      flex={1}
      align="center"
      justify="center"
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={t(TWO_WAYS_LABEL[option])}
    >
      <Text variant="buttonSmall" color={selected ? colors.text.onAccent : colors.text.secondary}>
        {t(TWO_WAYS_LABEL[option])}
      </Text>
    </Pressable>
  );
};

const Segment = memo(SegmentComponent);

interface TwoWaysSwitchProps {
  way: TwoWay;
  /** 0 = first way, 1 = second: the same value drives the scene, so pick and picture move as one. */
  progress: SharedValue<number>;
  onChange: (way: TwoWay) => void;
}

/** Two-segment switch with one teal pick that slides under the chosen label. */
const TwoWaysSwitchComponent: React.FC<TwoWaysSwitchProps> = ({ way, progress, onChange }) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const trackWidth = useSharedValue(0);
  const styles = useStyles(
    ({ radii }): Record<'track' | 'pick', ViewStyle> => ({
      track: { height: HEIGHT, padding: PAD, borderRadius: radii.md },
      pick: {
        position: 'absolute',
        top: PAD,
        bottom: PAD,
        start: PAD,
        borderRadius: radii.sm,
        backgroundColor: colors.interactive.main,
      },
    }),
    [colors.interactive.main],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width;
    },
    [trackWidth],
  );
  const pickStyle = useAnimatedStyle(() => {
    const slot = (trackWidth.value - PAD * 2) / TWO_WAYS.length;
    return { width: slot, transform: [{ translateX: progress.value * slot * (isRTL ? -1 : 1) }] };
  });

  return (
    <Box
      row
      bg={colors.surface.elevated}
      style={styles.track}
      onLayout={onLayout}
      accessibilityRole="tablist"
      accessibilityLabel={t('marketplace.brandHome.twoWays.switchLabel')}
    >
      <Animated.View style={[styles.pick, pickStyle]} />
      {TWO_WAYS.map(option => (
        <Segment key={option} option={option} selected={option === way} onSelect={onChange} />
      ))}
    </Box>
  );
};

export const TwoWaysSwitch = memo(TwoWaysSwitchComponent);
