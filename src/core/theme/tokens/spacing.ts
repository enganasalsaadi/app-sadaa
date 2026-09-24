import {moderateScale} from '../utils/responsive';

const BASE_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;

export type SpacingToken = keyof typeof BASE_SPACING;

export const createSpacing = () => {
  const entries = Object.entries(BASE_SPACING) as [SpacingToken, number][];

  return entries.reduce(
    (acc, [key, value]) => {
      acc[key] = moderateScale(value);
      return acc;
    },
    {} as Record<SpacingToken, number>,
  );
};

export {BASE_SPACING};
