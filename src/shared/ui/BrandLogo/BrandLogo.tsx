import React from 'react';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import LogoFullLight from '@/assets/images/logo/logo-full-light.svg';
import LogoFullDark from '@/assets/images/logo/logo-full-dark.svg';
import WordmarkLight from '@/assets/images/logo/wordmark-light.svg';
import WordmarkDark from '@/assets/images/logo/wordmark-dark.svg';
import SymbolLg from '@/assets/images/logo/symbol-lg.svg';
import SymbolMd from '@/assets/images/logo/symbol-md.svg';
import SymbolSm from '@/assets/images/logo/symbol-sm.svg';
import SymbolLgDark from '@/assets/images/logo/symbol-lg-dark.svg';
import SymbolMdDark from '@/assets/images/logo/symbol-md-dark.svg';
import SymbolSmDark from '@/assets/images/logo/symbol-sm-dark.svg';

export type BrandLogoVariant = 'full' | 'wordmark' | 'symbol';
/** `auto` follows the theme mode; `brand` = placed on a navy surface in any mode. */
export type BrandLogoSurface = 'auto' | 'brand';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Rendered height in px; width follows the artwork's aspect ratio. */
  height: number;
  surface?: BrandLogoSurface;
}

type Artwork = { light: React.FC<SvgProps>; dark: React.FC<SvgProps> };

// viewBox width / height of the generated files (scripts/logo/gen.py).
const ASPECT: Record<BrandLogoVariant, number> = {
  full: 362.01 / 120,
  wordmark: 219.01 / 65.8,
  symbol: 1,
};

const FULL: Artwork = { light: LogoFullLight, dark: LogoFullDark };
const WORDMARK: Artwork = { light: WordmarkLight, dark: WordmarkDark };
const SYMBOL_LG: Artwork = { light: SymbolLg, dark: SymbolLgDark };
const SYMBOL_MD: Artwork = { light: SymbolMd, dark: SymbolMdDark };
const SYMBOL_SM: Artwork = { light: SymbolSm, dark: SymbolSmDark };

// Rule 08 responsive tiers: ≥48 → 3 arcs · 24–47 → 2 arcs · <24 → 1 arc.
const symbolFor = (height: number): Artwork => {
  if (height >= 48) {
    return SYMBOL_LG;
  }
  return height >= 24 ? SYMBOL_MD : SYMBOL_SM;
};

const artworkFor = (variant: BrandLogoVariant, height: number): Artwork => {
  switch (variant) {
    case 'full':
      return FULL;
    case 'wordmark':
      return WORDMARK;
    case 'symbol':
      return symbolFor(height);
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  height,
  surface = 'auto',
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const artwork = artworkFor(variant, height);
  // Asset choice, not a color: the logo files carry their own approved palette.
  const Svg = surface === 'brand' || isDark ? artwork.dark : artwork.light;

  return (
    <Svg
      width={height * ASPECT[variant]}
      height={height}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('common.brandName')}
    />
  );
};
