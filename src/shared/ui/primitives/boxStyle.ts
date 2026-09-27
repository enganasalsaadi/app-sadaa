import { useRef } from 'react';
import type { DimensionValue, ViewStyle } from 'react-native';
import { useTheme } from '@/core/theme/hooks/useTheme';
import type {
  SpacingToken,
  RadiiToken,
  BorderWidthToken,
  ShadowToken,
  ZIndexToken,
  Theme,
  Mutable,
} from '@/core/theme/types';

/** Token-based layout props shared by `Box`, `Pressable` and `Card`. */
export interface BoxStyleProps {
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
  zIndex?: ZIndexToken;

  shadow?: ShadowToken;
}

type BoxStyleTheme = Pick<
  Theme,
  'spacing' | 'radii' | 'shadows' | 'borderWidths' | 'zIndices'
>;

/** Splits token layout props from the rest (passed through to the native view). */
export const splitBoxStyleProps = <P extends BoxStyleProps>({
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
  gap,
  rowGap,
  columnGap,
  bg,
  borderRadius,
  borderTopStartRadius,
  borderTopEndRadius,
  borderBottomStartRadius,
  borderBottomEndRadius,
  row,
  reverseRow,
  wrap,
  flex,
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
  borderWidth,
  borderBottomWidth,
  borderTopWidth,
  borderColor,
  opacity,
  zIndex,
  shadow,
  ...rest
}: P): { styleProps: BoxStyleProps; rest: Omit<P, keyof BoxStyleProps> } => ({
  styleProps: {
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
    gap,
    rowGap,
    columnGap,
    bg,
    borderRadius,
    borderTopStartRadius,
    borderTopEndRadius,
    borderBottomStartRadius,
    borderBottomEndRadius,
    row,
    reverseRow,
    wrap,
    flex,
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
    borderWidth,
    borderBottomWidth,
    borderTopWidth,
    borderColor,
    opacity,
    zIndex,
    shadow,
  } satisfies Required<Record<keyof BoxStyleProps, unknown>>,
  rest,
});

/** Resolves token layout props into a plain `ViewStyle` (undefined props are skipped). */
export const buildBoxStyle = (
  props: BoxStyleProps,
  { spacing, radii, shadows, borderWidths, zIndices }: BoxStyleTheme,
): ViewStyle => {
  const s: Mutable<ViewStyle> = {};

  if (props.p !== undefined) s.padding = spacing[props.p];
  if (props.px !== undefined) s.paddingHorizontal = spacing[props.px];
  if (props.py !== undefined) s.paddingVertical = spacing[props.py];
  if (props.pt !== undefined) s.paddingTop = spacing[props.pt];
  if (props.pb !== undefined) s.paddingBottom = spacing[props.pb];
  if (props.ps !== undefined) s.paddingStart = spacing[props.ps];
  if (props.pe !== undefined) s.paddingEnd = spacing[props.pe];

  if (props.m !== undefined) s.margin = spacing[props.m];
  if (props.mx !== undefined) s.marginHorizontal = spacing[props.mx];
  if (props.my !== undefined) s.marginVertical = spacing[props.my];
  if (props.mt !== undefined) s.marginTop = spacing[props.mt];
  if (props.mb !== undefined) s.marginBottom = spacing[props.mb];
  if (props.ms !== undefined) s.marginStart = spacing[props.ms];
  if (props.me !== undefined) s.marginEnd = spacing[props.me];

  if (props.gap !== undefined) s.gap = spacing[props.gap];
  if (props.rowGap !== undefined) s.rowGap = spacing[props.rowGap];
  if (props.columnGap !== undefined) s.columnGap = spacing[props.columnGap];

  if (props.bg !== undefined) s.backgroundColor = props.bg;
  if (props.borderRadius !== undefined) {
    s.borderRadius = radii[props.borderRadius];
  }
  if (props.borderTopStartRadius !== undefined) {
    s.borderTopStartRadius = radii[props.borderTopStartRadius];
  }
  if (props.borderTopEndRadius !== undefined) {
    s.borderTopEndRadius = radii[props.borderTopEndRadius];
  }
  if (props.borderBottomStartRadius !== undefined) {
    s.borderBottomStartRadius = radii[props.borderBottomStartRadius];
  }
  if (props.borderBottomEndRadius !== undefined) {
    s.borderBottomEndRadius = radii[props.borderBottomEndRadius];
  }

  if (props.row) s.flexDirection = 'row';
  if (props.reverseRow) s.flexDirection = 'row-reverse';
  if (props.wrap) s.flexWrap = 'wrap';
  if (props.flex !== undefined) s.flex = props.flex;
  if (props.align !== undefined) s.alignItems = props.align;
  if (props.justify !== undefined) s.justifyContent = props.justify;
  if (props.alignSelf !== undefined) s.alignSelf = props.alignSelf;
  if (props.overflow !== undefined) s.overflow = props.overflow;
  if (props.position !== undefined) s.position = props.position;

  if (props.width !== undefined) s.width = props.width;
  if (props.height !== undefined) s.height = props.height;
  if (props.minWidth !== undefined) s.minWidth = props.minWidth;
  if (props.minHeight !== undefined) s.minHeight = props.minHeight;
  if (props.maxWidth !== undefined) s.maxWidth = props.maxWidth;
  if (props.maxHeight !== undefined) s.maxHeight = props.maxHeight;

  if (props.borderWidth !== undefined) {
    s.borderWidth = borderWidths[props.borderWidth];
  }
  if (props.borderBottomWidth !== undefined) {
    s.borderBottomWidth = borderWidths[props.borderBottomWidth];
  }
  if (props.borderTopWidth !== undefined) {
    s.borderTopWidth = borderWidths[props.borderTopWidth];
  }
  if (props.borderColor !== undefined) s.borderColor = props.borderColor;

  if (props.opacity !== undefined) s.opacity = props.opacity;
  if (props.zIndex !== undefined) s.zIndex = zIndices[props.zIndex];

  if (props.shadow !== undefined) Object.assign(s, shadows[props.shadow]);

  return s;
};

const shallowEqual = (a: BoxStyleProps, b: BoxStyleProps): boolean => {
  const entries = Object.entries(a);
  return (
    entries.length === Object.keys(b).length &&
    entries.every(([key, value]) => Reflect.get(b, key) === value)
  );
};

interface BoxStyleCache {
  props: BoxStyleProps;
  theme: BoxStyleTheme;
  style: ViewStyle;
}

/**
 * Memoised `buildBoxStyle`. A shallow prop compare keeps the style object stable
 * across re-renders without every caller maintaining a 45-entry deps list.
 */
export const useBoxStyle = (props: BoxStyleProps): ViewStyle => {
  const { spacing, radii, shadows, borderWidths, zIndices } = useTheme();
  const cache = useRef<BoxStyleCache | null>(null);
  const cached = cache.current;

  if (
    cached &&
    cached.theme.spacing === spacing &&
    cached.theme.radii === radii &&
    cached.theme.shadows === shadows &&
    cached.theme.borderWidths === borderWidths &&
    cached.theme.zIndices === zIndices &&
    shallowEqual(cached.props, props)
  ) {
    return cached.style;
  }

  const theme = { spacing, radii, shadows, borderWidths, zIndices };
  const style = buildBoxStyle(props, theme);
  cache.current = { props, theme, style };
  return style;
};
