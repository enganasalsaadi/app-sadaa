import React from 'react';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/core/config';
import { getValidLanguage } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import LogoFullLight from '@/assets/images/logo/logo-full-light.svg';
import LogoFullDark from '@/assets/images/logo/logo-full-dark.svg';
import LogoFullEnLight from '@/assets/images/logo/logo-full-en-light.svg';
import LogoFullEnDark from '@/assets/images/logo/logo-full-en-dark.svg';
import WordmarkLight from '@/assets/images/logo/wordmark-light.svg';
import WordmarkDark from '@/assets/images/logo/wordmark-dark.svg';
import WordmarkEnLight from '@/assets/images/logo/wordmark-en-light.svg';
import WordmarkEnDark from '@/assets/images/logo/wordmark-en-dark.svg';
import SymbolLg from '@/assets/images/logo/symbol-lg.svg';
import SymbolMd from '@/assets/images/logo/symbol-md.svg';
import SymbolSm from '@/assets/images/logo/symbol-sm.svg';
import SymbolLgDark from '@/assets/images/logo/symbol-lg-dark.svg';
import SymbolMdDark from '@/assets/images/logo/symbol-md-dark.svg';
import SymbolSmDark from '@/assets/images/logo/symbol-sm-dark.svg';
import { LOGO_ASPECT } from './logoAspect';

export type BrandLogoVariant = 'full' | 'wordmark' | 'symbol';
/** `auto` follows the theme mode; `brand` = placed on a navy surface in any mode. */
export type BrandLogoSurface = 'auto' | 'brand';

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** Rendered height in px; width follows the artwork's aspect ratio. */
  height: number;
  surface?: BrandLogoSurface;
}

type Artwork = {
  light: React.FC<SvgProps>;
  dark: React.FC<SvgProps>;
  /** viewBox width / height of the generated file. */
  aspect: number;
};

// «صدى» for Arabic, «Sada» for English — each lockup puts the symbol on its reading-start side.
const FULL: Record<SupportedLanguage, Artwork> = {
  ar: { light: LogoFullLight, dark: LogoFullDark, aspect: LOGO_ASPECT.full.ar },
  en: { light: LogoFullEnLight, dark: LogoFullEnDark, aspect: LOGO_ASPECT.full.en },
};
const WORDMARK: Record<SupportedLanguage, Artwork> = {
  ar: { light: WordmarkLight, dark: WordmarkDark, aspect: LOGO_ASPECT.wordmark.ar },
  en: { light: WordmarkEnLight, dark: WordmarkEnDark, aspect: LOGO_ASPECT.wordmark.en },
};
const SYMBOL_LG: Artwork = { light: SymbolLg, dark: SymbolLgDark, aspect: 1 };
const SYMBOL_MD: Artwork = { light: SymbolMd, dark: SymbolMdDark, aspect: 1 };
const SYMBOL_SM: Artwork = { light: SymbolSm, dark: SymbolSmDark, aspect: 1 };

// Rule 08 responsive tiers: ≥48 → 3 arcs · 24–47 → 2 arcs · <24 → 1 arc.
const symbolFor = (height: number): Artwork => {
  if (height >= 48) {
    return SYMBOL_LG;
  }
  return height >= 24 ? SYMBOL_MD : SYMBOL_SM;
};

export const artworkFor = (
  variant: BrandLogoVariant,
  height: number,
  language: SupportedLanguage,
): Artwork => {
  switch (variant) {
    case 'full':
      return FULL[language];
    case 'wordmark':
      return WORDMARK[language];
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
  const { t, i18n } = useTranslation();
  const artwork = artworkFor(variant, height, getValidLanguage(i18n.language));
  // Asset choice, not a color: the logo files carry their own approved palette.
  const Svg = surface === 'brand' || isDark ? artwork.dark : artwork.light;

  return (
    <Svg
      width={height * artwork.aspect}
      height={height}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('common.brandName')}
    />
  );
};
