import { StyleSheet } from 'react-native';

const BASE_BORDER_WIDTHS = {
  none: 0,
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  sm: 1.5,
  md: 2,
  lg: 3,
  xl: 4,
} as const;

export type BorderWidthToken = keyof typeof BASE_BORDER_WIDTHS;

export const createBorderWidths = (): Record<BorderWidthToken, number> => {
  return { ...BASE_BORDER_WIDTHS };
};

export { BASE_BORDER_WIDTHS };
