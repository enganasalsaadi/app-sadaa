import React, { useMemo } from 'react';
import type {
  DimensionValue,
  PressableProps,
  ViewStyle,
} from 'react-native';
import { opacity } from '@/core/theme';
import { useTheme } from '@/core/theme/hooks/useTheme';
import type {
  SpacingToken,
  RadiiToken,
  BorderWidthToken,
  ShadowToken,
} from '@/core/theme/types';
import { Box } from './Box';
import { Pressable } from './Pressable';

export interface CardProps {
  children: React.ReactNode;
  /** بدون `onPress` يُعرض كـ Box ثابت؛ مع `onPress` يُلف بـ Pressable */
  onPress?: PressableProps['onPress'];
  /**
   * حالة التحديد: بدون `bg` يُستخدم `interactive.soft` عند `true` و`surface.main` عند `false`.
   * بدون `borderColor` يُستخدم `interactive.main` عند `true` و`border.card` عند `false`.
   */
  selected?: boolean;
  /** ظل من tokens — افتراضي `card`: بطاقة بلا حد على ظل كحلي ناعم (القاعدة 08، v4) */
  shadow?: ShadowToken;
  /** لون الخلفية؛ يتجاوز اشتقاق `selected` */
  bg?: string;
  borderRadius?: RadiiToken;
  /** افتراضي `thin` بلون `border.card` (شفاف في الفاتح، خط رفيع في الداكن)؛ مرّر `none` لإزالته */
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
  shadow = 'card',
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
  activeOpacity = opacity.pressedSubtle,
  scaleOnPress = true,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const { colors } = useTheme();
  const background =
    bg ?? (selected ? colors.interactive.soft : colors.surface.main);
  const resolvedBorderColor =
    borderColor ??
    (selected ? colors.interactive.main : colors.border.card);

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

  if (onPress) {
    return (
      <Pressable
        {...layoutProps}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        scaleOnPress={scaleOnPress}
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
      </Pressable>
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
