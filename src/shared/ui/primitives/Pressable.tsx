import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  PressableProps as RNPressableProps,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { Pressable as RNPressable, Animated } from 'react-native';
import { motion, opacity } from '@/core/theme';
import type { Mutable } from '@/core/theme/types';
import type { BoxStyleProps } from './boxStyle';
import { splitBoxStyleProps, useBoxStyle } from './boxStyle';

type RequestIdleCallback = (
  callback: () => void,
  options?: { timeout: number },
) => void;

// Not every Hermes/JSC build exposes requestIdleCallback, so probe at runtime.
const getRequestIdleCallback = (): RequestIdleCallback | undefined => {
  const candidate: unknown = Reflect.get(globalThis, 'requestIdleCallback');
  return typeof candidate === 'function'
    ? (candidate as RequestIdleCallback)
    : undefined;
};

// With scaleOnPress, onPress is deferred so the release animation gets a frame
// budget before the handler (often a navigation) blocks the JS thread.
const PRESS_RELEASE_DELAY_MS = 100;
// Upper bound for waiting on an idle slot; the press must never feel lost.
const PRESS_IDLE_TIMEOUT_MS = 100;
// Fallback defer when requestIdleCallback is unavailable (older iOS/Android engines).
const PRESS_FALLBACK_DELAY_MS = 50;

interface PressableProps
  extends Omit<RNPressableProps, 'style'>,
    BoxStyleProps {
  style?: ViewStyle;
  activeOpacity?: number;
  scaleOnPress?: boolean;
  disabled?: boolean;
}

const PressableComponent: React.FC<PressableProps> = ({
  style,
  children,
  activeOpacity = opacity.pressed,
  scaleOnPress = false,
  disabled = false,
  onPressIn: externalPressIn,
  onPressOut: externalPressOut,
  onPress: externalPress,
  onLongPress: externalLongPress,
  ...props
}) => {
  const { styleProps, rest } = splitBoxStyleProps(props);
  const computedStyle = useBoxStyle(styleProps);
  const {
    flex: flexProp,
    alignSelf,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = styleProps;
  const scaleAnim = useMemo(() => new Animated.Value(1), []);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const longPressOccurredRef = useRef(false);

  useEffect(() => {
    return () => {
      animRef.current?.stop();
    };
  }, []);

  const resetScale = useCallback(() => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
    scaleAnim.setValue(1);
  }, [scaleAnim]);

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return;
      if (scaleOnPress) {
        resetScale();
        Animated.spring(scaleAnim, {
          toValue: motion.pressScale,
          useNativeDriver: true,
          ...motion.spring,
        }).start();
      }
      externalPressIn?.(e);
    },
    [scaleOnPress, scaleAnim, resetScale, externalPressIn, disabled],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return;
      if (scaleOnPress) {
        scaleAnim.stopAnimation();
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: motion.duration.fast,
          useNativeDriver: true,
        }).start();
      }
      externalPressOut?.(e);
    },
    [scaleOnPress, scaleAnim, externalPressOut, disabled],
  );

  const handleLongPress = useCallback(
    (e: GestureResponderEvent) => {
      longPressOccurredRef.current = true;
      if (scaleOnPress) resetScale();
      externalLongPress?.(e);
    },
    [scaleOnPress, resetScale, externalLongPress],
  );

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return;
      if (longPressOccurredRef.current) {
        longPressOccurredRef.current = false;
        return;
      }

      if (scaleOnPress) {
        setTimeout(() => {
          // requestIdleCallback instead of InteractionManager (deprecated).
          const ric = getRequestIdleCallback();
          if (ric) {
            ric(() => externalPress?.(e), { timeout: PRESS_IDLE_TIMEOUT_MS });
          } else {
            setTimeout(() => externalPress?.(e), PRESS_FALLBACK_DELAY_MS);
          }
        }, PRESS_RELEASE_DELAY_MS);
      } else {
        externalPress?.(e);
      }
    },
    [disabled, externalPress, scaleOnPress],
  );

  const wrapperStyle = useMemo<ViewStyle>(() => {
    const s: Mutable<ViewStyle> = {};
    if (flexProp !== undefined) s.flex = flexProp;
    if (alignSelf !== undefined) s.alignSelf = alignSelf;
    if (width !== undefined) s.width = width;
    if (height !== undefined) s.height = height;
    if (minWidth !== undefined) s.minWidth = minWidth;
    if (minHeight !== undefined) s.minHeight = minHeight;
    if (maxWidth !== undefined) s.maxWidth = maxWidth;
    if (maxHeight !== undefined) s.maxHeight = maxHeight;
    return s;
  }, [
    flexProp,
    alignSelf,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  ]);

  if (disabled) {
    return (
      <RNPressable
        disabled={true}
        style={({ pressed }) => [
          computedStyle,
          pressed && { opacity: activeOpacity },
          style,
        ]}
        {...rest}
      >
        {children}
      </RNPressable>
    );
  }

  if (scaleOnPress) {
    return (
      <Animated.View
        style={[wrapperStyle, { transform: [{ scale: scaleAnim }] }]}
      >
        <RNPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={({ pressed }) => [
            computedStyle,
            pressed && { opacity: activeOpacity },
            style,
          ]}
          {...rest}
        >
          {children}
        </RNPressable>
      </Animated.View>
    );
  }

  return (
    <RNPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        computedStyle,
        pressed && { opacity: activeOpacity },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNPressable>
  );
};

export const Pressable = memo(PressableComponent);
