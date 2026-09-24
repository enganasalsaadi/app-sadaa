import React, { memo, useMemo } from 'react';
import type { ViewProps, ViewStyle, DimensionValue } from 'react-native';
import { View } from 'react-native';
import { useTheme } from '@/core/theme/hooks/useTheme';
import type {
  SpacingToken,
  RadiiToken,
  BorderWidthToken,
  ShadowToken,
  Mutable,
} from '@/core/theme/types';

export interface BoxProps extends ViewProps {
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

  row?: boolean;
  reverseRow?: boolean;
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

  borderWidth?: BorderWidthToken;
  borderBottomWidth?: BorderWidthToken;
  borderTopWidth?: BorderWidthToken;
  borderColor?: string;

  opacity?: number;
  zIndex?: number;

  shadow?: ShadowToken;
}

const BoxComponent: React.FC<BoxProps> = ({
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

  row,
  reverseRow,
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

  borderWidth: borderWidthProp,
  borderBottomWidth: borderBottomWidthProp,
  borderTopWidth: borderTopWidthProp,
  borderColor,

  opacity,
  zIndex,

  shadow,

  ...rest
}) => {
  const { spacing, radii, shadows, borderWidths } = useTheme();

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

    if (row) {
      s.flexDirection = 'row';
    }
    if (reverseRow) {
      s.flexDirection = 'row-reverse';
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

    if (borderWidthProp !== undefined) {
      s.borderWidth = borderWidths[borderWidthProp];
    }
    if (borderBottomWidthProp !== undefined) {
      s.borderBottomWidth = borderWidths[borderBottomWidthProp];
    }
    if (borderTopWidthProp !== undefined) {
      s.borderTopWidth = borderWidths[borderTopWidthProp];
    }
    if (borderColor !== undefined) {
      s.borderColor = borderColor;
    }

    if (opacity !== undefined) {
      s.opacity = opacity;
    }
    if (zIndex !== undefined) {
      s.zIndex = zIndex;
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
    row,
    reverseRow,
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
    borderWidthProp,
    borderBottomWidthProp,
    borderTopWidthProp,
    borderColor,
    opacity,
    zIndex,
    shadow,
  ]);

  return (
    <View style={[computedStyle, style]} {...rest}>
      {children}
    </View>
  );
};

export const Box = memo(BoxComponent);
