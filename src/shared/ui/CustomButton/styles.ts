import type { ButtonColorVariant, Theme } from '@/core/theme/types';

export type ButtonVariant = ButtonColorVariant;
export type ButtonSize = 'sm' | 'md' | 'lg';

export const getButtonHeight = (size: ButtonSize, theme: Theme): number => {
  return theme.sizes.button[size];
};
