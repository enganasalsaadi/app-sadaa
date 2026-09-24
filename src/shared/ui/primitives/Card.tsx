import React, { useMemo } from 'react';
import {
  type DimensionValue,
  type PressableProps,
  type ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/core/theme/hooks/useTheme';
import { Box } from './Box';
import type {
  SpacingToken,
  RadiiToken,
  BorderWidthToken,
  ShadowToken,
  Mutable,
} from '@/core/theme/types';

export interface CardProps {
  children: React.ReactNode;
  /** بدون `onPress` يُعرض كـ Box ثابت؛ مع `onPress` يُلف بـ Pressable */
  onPress?: PressableProps['onPress'];
  /**
   * حالة التحديد: بدون `bg` يُستخدم `interactive.soft` عند `true` و`surface.main` عند `false`.
   * بدون `borderColor` يُستخدم `interactive.main` عند `true` و`border.default` عند `false`.
   */
  selected?: boolean;
  /** ظل من tokens — افتراضي `sm` للكروت (سطوح مسطحة + حد، انظر القاعدة 08) */
  shadow?: ShadowToken;
  /** لون الخلفية؛ يتجاوز اشتقاق `selected` */
  bg?: string;
  borderRadius?: RadiiToken;
  /** افتراضي `thin`؛ مرّر `none` لإزالة الحد */
  borderWidth?: BorderWidthToken;
  /** لون الحد؛ يتجاوز اشتقاق `selected` */
  borderColor?: string;
  /** افتراضي `md` */
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
  flex?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  row?: boolean;
  alignSelf?: ViewStyle['alignSelf'];
  style?: ViewStyle;
  activeOpacity?: number;
  scaleOnPress?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const CardInner: React.FC<CardProps> = ({
  children,
  onPress,
  selected,
  shadow = 'sm',
  bg,
  borderRadius = 'lg',
  borderWidth = 'thin',
  borderColor,
  p = 'md',
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
  flex,
  width,
  height,
  align,
  justify,
  row,
  alignSelf,
  style,
  activeOpacity = 0.9,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors, spacing, radii, shadows, borderWidths } = useTheme();
  const background =
    bg ?? (selected ? colors.interactive.soft : colors.surface.main);
  const resolvedBorderColor =
    borderColor ??
    (selected ? colors.interactive.main : colors.border.default);

  const layoutProps = useMemo(
    () => ({
      shadow,
      bg: background,
      borderRadius,
      borderWidth,
      borderColor: resolvedBorderColor,
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
      flex,
      width,
      height,
      align,
      justify,
      row,
      alignSelf,
      style,
    }),
    [
      shadow,
      background,
      borderRadius,
      borderWidth,
      resolvedBorderColor,
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
      flex,
      width,
      height,
      align,
      justify,
      row,
      alignSelf,
      style,
    ],
  );

  const touchableStyle = useMemo<ViewStyle>(() => {
    const s: Mutable<ViewStyle> = {
      backgroundColor: background,
      borderRadius: radii[borderRadius],
      borderWidth: borderWidths[borderWidth],
      borderColor: resolvedBorderColor,
    };
    if (shadow !== undefined) {
      Object.assign(s, shadows[shadow]);
    }
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
    if (flex !== undefined) {
      s.flex = flex;
    }
    if (width !== undefined) {
      s.width = width;
    }
    if (height !== undefined) {
      s.height = height;
    }
    if (align !== undefined) {
      s.alignItems = align;
    }
    if (justify !== undefined) {
      s.justifyContent = justify;
    }
    if (row) {
      s.flexDirection = 'row';
    }
    if (alignSelf !== undefined) {
      s.alignSelf = alignSelf;
    }
    return s;
  }, [
    background,
    borderRadius,
    borderWidth,
    resolvedBorderColor,
    shadow,
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
    flex,
    width,
    height,
    align,
    justify,
    row,
    alignSelf,
    spacing,
    radii,
    shadows,
    borderWidths,
  ]);

  if (onPress) {
    return (
      <TouchableOpacity
        style={[touchableStyle, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: !!disabled,
          ...(selected !== undefined ? { selected: !!selected } : {}),
        }}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <Box
      {...layoutProps}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </Box>
  );
};

export const Card = React.memo(CardInner);
