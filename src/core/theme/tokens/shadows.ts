import type { ViewStyle } from 'react-native';
import { moderateScale } from '../utils/responsive';

// Rule 08 (v4): cards are borderless on a soft navy shadow (`card`); `lg` lifts sheets
// and the tab bar. In dark a shadow can't read on navy, so cards add `border.card` instead.
const LIGHT_SHADOW_COLOR = '#1C3349';
const DARK_SHADOW_COLOR = '#000000';

interface ShadowBase {
  shadowOffset: { width: number; height: number };
  shadowOpacity: { light: number; dark: number };
  shadowRadius: number;
  elevation: number;
}

const BASE_SHADOWS: Record<ShadowToken, ShadowBase> = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: { light: 0, dark: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  // شادو ناعم جداً يكاد لا يرى (للكاردات البسيطة)
  sm: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { light: 0.04, dark: 0.2 },
    shadowRadius: 4,
    elevation: 2,
  },
  // الشادو القياسي (أكثر استخداماً)
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: { light: 0.08, dark: 0.3 },
    shadowRadius: 8,
    elevation: 4,
  },
  // Content cards: wide and faint, so the card floats without an outline.
  card: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: { light: 0.09, dark: 0.35 },
    shadowRadius: 16,
    elevation: 3,
  },
  // Sheets and the floating tab bar.
  lg: {
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: { light: 0.18, dark: 0.5 },
    shadowRadius: 28,
    elevation: 10,
  },
};

export type ShadowToken = 'none' | 'sm' | 'md' | 'card' | 'lg';

export type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

export const createShadows = (
  isDark: boolean = false,
): Record<ShadowToken, ShadowStyle> => {
  const shadowColor = isDark ? DARK_SHADOW_COLOR : LIGHT_SHADOW_COLOR;
  const result = {} as Record<ShadowToken, ShadowStyle>;

  for (const [key, value] of Object.entries(BASE_SHADOWS) as [
    ShadowToken,
    ShadowBase,
  ][]) {
    result[key] = {
      shadowColor,
      shadowOffset: {
        width: 0, // العرض دائماً 0 ليكون الشادو متوازناً
        height: moderateScale(value.shadowOffset.height),
      },
      // في الداكن نزيد الشفافية لأن الخلفية داكنة والشادو يحتاج لبروز أكبر
      shadowOpacity: isDark
        ? value.shadowOpacity.dark
        : value.shadowOpacity.light,
      shadowRadius: moderateScale(value.shadowRadius),
      elevation: value.elevation,
    };
  }

  return result;
};

export { BASE_SHADOWS };
