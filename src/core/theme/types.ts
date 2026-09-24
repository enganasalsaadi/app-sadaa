import type { SpacingToken } from './tokens/spacing';
import type {
  TypographyVariant,
  TypographyStyle,
  FontWeightToken,
} from './tokens/typography';
import type {
  ThemeColors,
  HueColors,
  StatusTone,
  ButtonColorVariant,
} from './tokens/colors';
import type { RadiiToken } from './tokens/radii';
import type { SizeCategory } from './tokens/sizes';
import type { BASE_SIZES } from './tokens/sizes';
import type { ShadowToken, ShadowStyle } from './tokens/shadows';
import type { BorderWidthToken } from './tokens/borderWidths';
import type { ZIndexToken } from './tokens/zIndices';
import type { ScreenCategory } from './utils/responsive';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  language: string;
  isRTL: boolean;
  colors: ThemeColors;
  spacing: Record<SpacingToken, number>;
  typography: Record<TypographyVariant, TypographyStyle>;
  radii: Record<RadiiToken, number>;
  shadows: Record<ShadowToken, ShadowStyle>;
  borderWidths: Record<BorderWidthToken, number>;
  zIndices: Record<ZIndexToken, number>;
  sizes: {
    [K in SizeCategory]: {
      [S in keyof (typeof BASE_SIZES)[K]]: number;
    };
  };
  screen: {
    category: ScreenCategory;
    isTablet: boolean;
    isLandscape: boolean;
    width: number;
    height: number;
  };
}

export interface ThemeContextValue extends Theme {
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  changeLanguage: (lang: string) => Promise<void>;
}

export type {
  SpacingToken,
  TypographyVariant,
  TypographyStyle,
  FontWeightToken,
  RadiiToken,
};
export type {
  ThemeColors,
  HueColors,
  StatusTone,
  ButtonColorVariant,
  SizeCategory,
};
export type { ShadowToken, ShadowStyle };
export type { BorderWidthToken };
export type { ZIndexToken };

/** RN Strict API style types are deeply readonly; use for incremental style builders. */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };
