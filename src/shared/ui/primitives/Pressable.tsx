import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  PressableProps as RNPressableProps,
  ViewStyle,
  DimensionValue,
  GestureResponderEvent,
} from 'react-native';
import { Pressable as RNPressable, Animated } from 'react-native';
import { useTheme } from '@/core/theme/hooks/useTheme';
import type {
  SpacingToken,
  RadiiToken,
  BorderWidthToken,
  ShadowToken,
  Mutable,
} from '@/core/theme/types';

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

interface PressableProps extends Omit<RNPressableProps, 'style'> {
  style?: ViewStyle;
  p?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
  pt?: SpacingToken;
  pb?: SpacingToken;
  ps?: SpacingToken;
  pe?: SpacingToken;
  m?: SpacingToken;
  mx?: SpacingToken;
  my?: SpacingToken;
  mt?: SpacingToken;
  mb?: SpacingToken;
  ms?: SpacingToken;
  me?: SpacingToken;
  gap?: SpacingToken;
  rowGap?: SpacingToken;
  columnGap?: SpacingToken;
  bg?: string;
  borderRadius?: RadiiToken;
  borderTopStartRadius?: RadiiToken;
  borderTopEndRadius?: RadiiToken;
  borderBottomStartRadius?: RadiiToken;
  borderBottomEndRadius?: RadiiToken;
  borderWidth?: BorderWidthToken;
  borderColor?: string;
  row?: boolean;
  wrap?: boolean;
  flex?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  alignSelf?: ViewStyle['alignSelf'];
  overflow?: ViewStyle['overflow'];
  position?: ViewStyle['position'];
  width?: DimensionValue;
  height?: DimensionValue;
  minWidth?: DimensionValue;
  minHeight?: DimensionValue;
  maxWidth?: DimensionValue;
  maxHeight?: DimensionValue;
  opacity?: number;
  zIndex?: number;
  shadow?: ShadowToken;
  activeOpacity?: number;
  scaleOnPress?: boolean;
  disabled?: boolean;
}

const PressableComponent: React.FC<PressableProps> = ({
  style,
  children,
  p,
  px,
  py,
  pt,
  pb,
  ps,
  pe,
  m,
  mx,
  my,
  mt,
  mb,
  ms,
  me,
  gap: gapProp,
  rowGap: rowGapProp,
  columnGap: columnGapProp,
  bg,
  borderRadius: borderRadiusProp,
  borderTopStartRadius: btsrProp,
  borderTopEndRadius: bterProp,
  borderBottomStartRadius: bbsrProp,
  borderBottomEndRadius: bberProp,
  borderWidth: borderWidthProp,
  borderColor,
  row,
  wrap,
  flex: flexProp,
  align,
  justify,
  alignSelf,
  overflow,
  position,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  opacity: opacityProp,
  zIndex: zIndexProp,
  shadow,
  activeOpacity = 0.7,
  scaleOnPress = false,
  disabled = false,
  onPressIn: externalPressIn,
  onPressOut: externalPressOut,
  onPress: externalPress,
  onLongPress: externalLongPress,
  ...rest
}) => {
  const { spacing, radii, shadows, borderWidths } = useTheme();
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
          toValue: 0.96,
          useNativeDriver: true,
          speed: 80,
          bounciness: 8,
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
          duration: 100,
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
            ric(() => externalPress?.(e), { timeout: 100 });
          } else {
            // fallback للـ iOS والـ Android القديمة
            setTimeout(() => externalPress?.(e), 50);
          }
        }, 100);
      } else {
        externalPress?.(e);
      }
    },
    [disabled, externalPress, scaleOnPress],
  );

  const computedStyle = useMemo<ViewStyle>(() => {
    const s: Mutable<ViewStyle> = {};

    if (p !== undefined) {
      s.padding = spacing[p];
    }
    if (px !== undefined) {
      s.paddingHorizontal = spacing[px];
    }
    if (py !== undefined) {
      s.paddingVertical = spacing[py];
    }
    if (pt !== undefined) {
      s.paddingTop = spacing[pt];
    }
    if (pb !== undefined) {
      s.paddingBottom = spacing[pb];
    }
    if (ps !== undefined) {
      s.paddingStart = spacing[ps];
    }
    if (pe !== undefined) {
      s.paddingEnd = spacing[pe];
    }

    if (m !== undefined) {
      s.margin = spacing[m];
    }
    if (mx !== undefined) {
      s.marginHorizontal = spacing[mx];
    }
    if (my !== undefined) {
      s.marginVertical = spacing[my];
    }
    if (mt !== undefined) {
      s.marginTop = spacing[mt];
    }
    if (mb !== undefined) {
      s.marginBottom = spacing[mb];
    }
    if (ms !== undefined) {
      s.marginStart = spacing[ms];
    }
    if (me !== undefined) {
      s.marginEnd = spacing[me];
    }

    if (gapProp !== undefined) {
      s.gap = spacing[gapProp];
    }
    if (rowGapProp !== undefined) {
      s.rowGap = spacing[rowGapProp];
    }
    if (columnGapProp !== undefined) {
      s.columnGap = spacing[columnGapProp];
    }

    if (bg !== undefined) {
      s.backgroundColor = bg;
    }
    if (borderRadiusProp !== undefined) {
      s.borderRadius = radii[borderRadiusProp];
    }
    if (btsrProp !== undefined) {
      s.borderTopStartRadius = radii[btsrProp];
    }
    if (bterProp !== undefined) {
      s.borderTopEndRadius = radii[bterProp];
    }
    if (bbsrProp !== undefined) {
      s.borderBottomStartRadius = radii[bbsrProp];
    }
    if (bberProp !== undefined) {
      s.borderBottomEndRadius = radii[bberProp];
    }
    if (borderWidthProp !== undefined) {
      s.borderWidth = borderWidths[borderWidthProp];
    }
    if (borderColor !== undefined) {
      s.borderColor = borderColor;
    }

    if (row) {
      s.flexDirection = 'row';
    }
    if (wrap) {
      s.flexWrap = 'wrap';
    }
    if (flexProp !== undefined) {
      s.flex = flexProp;
    }
    if (align !== undefined) {
      s.alignItems = align;
    }
    if (justify !== undefined) {
      s.justifyContent = justify;
    }
    if (alignSelf !== undefined) {
      s.alignSelf = alignSelf;
    }
    if (overflow !== undefined) {
      s.overflow = overflow;
    }
    if (position !== undefined) {
      s.position = position;
    }

    if (width !== undefined) {
      s.width = width;
    }
    if (height !== undefined) {
      s.height = height;
    }
    if (minWidth !== undefined) {
      s.minWidth = minWidth;
    }
    if (minHeight !== undefined) {
      s.minHeight = minHeight;
    }
    if (maxWidth !== undefined) {
      s.maxWidth = maxWidth;
    }
    if (maxHeight !== undefined) {
      s.maxHeight = maxHeight;
    }

    if (opacityProp !== undefined) {
      s.opacity = opacityProp;
    }
    if (zIndexProp !== undefined) {
      s.zIndex = zIndexProp;
    }

    if (shadow !== undefined) {
      Object.assign(s, shadows[shadow]);
    }

    return s;
  }, [
    spacing,
    radii,
    shadows,
    borderWidths,
    p,
    px,
    py,
    pt,
    pb,
    ps,
    pe,
    m,
    mx,
    my,
    mt,
    mb,
    ms,
    me,
    gapProp,
    rowGapProp,
    columnGapProp,
    bg,
    borderRadiusProp,
    btsrProp,
    bterProp,
    bbsrProp,
    bberProp,
    borderWidthProp,
    borderColor,
    row,
    wrap,
    flexProp,
    align,
    justify,
    alignSelf,
    overflow,
    position,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    opacityProp,
    zIndexProp,
    shadow,
  ]);

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
