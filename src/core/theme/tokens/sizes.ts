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
  otpCell: {
    width: 56,
    height: 64,
  },
  progress: {
    track: 4,
    /** ProgressBar `md`. */
    thick: 8,
  },
  /** Checkbox box / radio ring and the radio's inner dot. */
  control: {
    md: 20,
    dot: 10,
  },
  /** Count badge min width/height. */
  badge: {
    md: 18,
  },
  /** Circular icon-only controls (header back, modal close). */
  iconButton: {
    sm: 36,
    md: 44,
  },
  sheetHandle: {
    width: 40,
    height: 4,
  },
  /** Uniform hit slop for small controls (number keeps it RTL-agnostic). */
  hitSlop: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  /** Status dots in pills and legends. */
  dot: {
    sm: 6,
    md: 8,
  },
  /** Empty/error state artwork. */
  illustration: {
    sm: 72,
    md: 120,
    lg: 160,
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
