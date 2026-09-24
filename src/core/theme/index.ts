export {ThemeProvider} from './components/ThemeProvider';

export {useTheme} from './hooks/useTheme';
export {useStyles} from './hooks/useStyles';
export {useResponsiveValue} from './hooks/useResponsiveValue';

export {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  fontScale,
  getScreenCategory,
  isTablet,
  isLandscape,
  screenWidth,
  screenHeight,
  hitSlop,
} from './utils/responsive';

export {FONT_FAMILY} from './tokens/typography';
export {STATUS_TONES, BUTTON_COLOR_VARIANTS} from './tokens/colors';

export type {
  Theme,
  ThemeMode,
  ThemeContextValue,
  SpacingToken,
  TypographyVariant,
  TypographyStyle,
  FontWeightToken,
  RadiiToken,
  ThemeColors,
  HueColors,
  StatusTone,
  ButtonColorVariant,
  SizeCategory,
  ShadowToken,
  ShadowStyle,
  BorderWidthToken,
  ZIndexToken,
} from './types';

export type {ScreenCategory} from './utils/responsive';
