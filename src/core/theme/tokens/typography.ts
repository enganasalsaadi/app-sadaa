import type { TextStyle } from 'react-native';
import { fontScale, moderateScale } from '../utils/responsive';

export type FontWeightToken =
  | 'light'
  | 'regular'
  | 'medium'
  | 'bold'
  | 'extraBold';

/** Tajawal PostScript names (rule 08). Tajawal has no SemiBold — 600 is Bold. */
export const FONT_FAMILY: Record<FontWeightToken, string> = {
  light: 'Tajawal-Light',
  regular: 'Tajawal-Regular',
  medium: 'Tajawal-Medium',
  bold: 'Tajawal-Bold',
  extraBold: 'Tajawal-ExtraBold',
};

type TypographyBase = {
  fontSize: number;
  lineHeight: number;
  weight: FontWeightToken;
  letterSpacing: number;
  tabular?: true;
};

const BASE_TYPOGRAPHY = {
  h1: { fontSize: 32, lineHeight: 40, weight: 'extraBold', letterSpacing: -0.5 },
  h2: { fontSize: 28, lineHeight: 36, weight: 'bold', letterSpacing: -0.3 },
  h3: { fontSize: 24, lineHeight: 32, weight: 'bold', letterSpacing: 0 },
  h4: { fontSize: 20, lineHeight: 28, weight: 'bold', letterSpacing: 0.15 },
  title: { fontSize: 18, lineHeight: 26, weight: 'bold', letterSpacing: 0.15 },
  body: { fontSize: 16, lineHeight: 24, weight: 'regular', letterSpacing: 0.25 },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    weight: 'medium',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    weight: 'regular',
    letterSpacing: 0.25,
  },
  caption: { fontSize: 12, lineHeight: 16, weight: 'regular', letterSpacing: 0.4 },
  button: { fontSize: 16, lineHeight: 24, weight: 'bold', letterSpacing: 0.5 },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    weight: 'bold',
    letterSpacing: 0.5,
  },
  overline: { fontSize: 10, lineHeight: 14, weight: 'medium', letterSpacing: 1.5 },
  label: { fontSize: 16, lineHeight: 20, weight: 'regular', letterSpacing: 0.1 },
  amount: {
    fontSize: 16,
    lineHeight: 24,
    weight: 'bold',
    letterSpacing: 0,
    tabular: true,
  },
  amountLarge: {
    fontSize: 32,
    lineHeight: 40,
    weight: 'extraBold',
    letterSpacing: 0,
    tabular: true,
  },
} as const satisfies Record<string, TypographyBase>;

export type TypographyVariant = keyof typeof BASE_TYPOGRAPHY;

export type TypographyStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing: number;
  fontFamily: string;
  fontVariant?: TextStyle['fontVariant'];
};

// Arabic glyphs sit taller than Latin; extra leading keeps diacritics from clipping.
const RTL_LINE_HEIGHT_MULTIPLIER = 1.12;

const TABULAR: TextStyle['fontVariant'] = ['tabular-nums'];

export const createTypography = (
  isRTL: boolean = false,
): Record<TypographyVariant, TypographyStyle> => {
  const entries = Object.entries(BASE_TYPOGRAPHY) as [
    TypographyVariant,
    TypographyBase,
  ][];

  return entries.reduce((acc, [key, value]) => {
    const scaledLineHeight = fontScale(value.lineHeight);

    acc[key] = {
      fontSize: fontScale(value.fontSize),
      lineHeight: isRTL
        ? Math.round(scaledLineHeight * RTL_LINE_HEIGHT_MULTIPLIER)
        : scaledLineHeight,
      // Weight is carried by the font file; a numeric weight would make Android synthesise bold.
      fontWeight: 'normal',
      letterSpacing: isRTL ? 0 : moderateScale(value.letterSpacing, 0.3),
      fontFamily: FONT_FAMILY[value.weight],
      ...(value.tabular ? { fontVariant: TABULAR } : {}),
    };
    return acc;
  }, {} as Record<TypographyVariant, TypographyStyle>);
};
