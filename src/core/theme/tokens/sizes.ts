import { moderateScale } from '../utils/responsive';

const BASE_SIZES = {
  icon: {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  },
  button: {
    sm: 32,
    md: 44,
    lg: 52,
    xl: 60,
  },
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  thumbnail: {
    sm: 48,
    md: 80,
    lg: 120,
  },
} as const;

export type SizeCategory = keyof typeof BASE_SIZES;

type ScaledSizes = {
  [K in SizeCategory]: {
    [S in keyof (typeof BASE_SIZES)[K]]: number;
  };
};

export const createSizes = (): ScaledSizes => {
  const result = {} as Record<string, Record<string, number>>;

  for (const [category, sizes] of Object.entries(BASE_SIZES)) {
    result[category] = {};
    for (const [key, value] of Object.entries(sizes)) {
      result[category][key] = moderateScale(value as number);
    }
  }

  return result as ScaledSizes;
};

export { BASE_SIZES };
