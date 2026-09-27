import type { Theme } from '@/core/theme';
import type { IconButtonTone, IconButtonVariant } from '../IconButton';
import type { ScreenHeaderVariant } from './ScreenHeader';

export interface HeaderColors {
  bg: string;
  title: string;
  subtitle: string;
  button: { variant: IconButtonVariant; tone: IconButtonTone };
}

/** Status-bar icons that read on each bar. */
export const HEADER_STATUS_BAR = {
  solid: 'auto',
  brand: 'light',
  transparent: 'light',
} as const satisfies Record<ScreenHeaderVariant, 'auto' | 'light'>;

/** Shared with `Layout`, which paints the status-bar strip behind a hiding header. */
export const resolveHeaderColors = (
  colors: Theme['colors'],
  variant: ScreenHeaderVariant,
): HeaderColors => {
  switch (variant) {
    case 'solid':
      return {
        bg: colors.surface.main,
        title: colors.text.primary,
        subtitle: colors.text.secondary,
        button: { variant: 'ghost', tone: 'default' },
      };
    case 'brand':
      return {
        bg: colors.brand.main,
        title: colors.text.onBrand,
        subtitle: colors.text.onBrandMuted,
        button: { variant: 'ghost', tone: 'onBrand' },
      };
    case 'transparent':
      return {
        bg: colors.layout.transparent,
        title: colors.text.onBrand,
        subtitle: colors.text.onBrandMuted,
        button: { variant: 'overlay', tone: 'default' },
      };
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
};
