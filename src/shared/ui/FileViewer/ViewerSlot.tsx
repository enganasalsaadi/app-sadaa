import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Size } from './viewerGeometry';

export interface ViewerSlotProps {
  /** This file's place in the list. */
  position: number;
  stage: Size;
  direction: 1 | -1;
  index: SharedValue<number>;
  pagerX: SharedValue<number>;
  scale: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  children: React.ReactNode;
}

/**
 * One file on the stage, placed by its distance from the active one (reading order: the next
 * file waits to the left in Arabic). Only the active slot takes the zoom.
 */
const ViewerSlotComponent: React.FC<ViewerSlotProps> = ({
  position,
  stage,
  direction,
  index,
  pagerX,
  scale,
  tx,
  ty,
  children,
}) => {
  const place = useAnimatedStyle(() => {
    const active = position === index.value;
    const offset = direction * (position - index.value) * stage.width + pagerX.value;
    return {
      transform: [
        { translateX: offset + (active ? tx.value : 0) },
        { translateY: active ? ty.value : 0 },
        { scale: active ? scale.value : 1 },
      ],
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, place]} pointerEvents="box-none">
      {children}
    </Animated.View>
  );
};

export const ViewerSlot = memo(ViewerSlotComponent);
