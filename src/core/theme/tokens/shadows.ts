import type { ViewStyle } from 'react-native';
import { moderateScale } from '../utils/responsive';

// Rule 08: flat surfaces + border; shadows only for floating elements (bars, sheets, FAB).
const LIGHT_SHADOW_COLOR = '#0F1D2B';
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
};

export type ShadowToken = 'none' | 'sm' | 'md';

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
