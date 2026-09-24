export const TAB_ANIMATION_CONFIG = {
  damping: 500,
  stiffness: 1000,
} as const;

export const WIDTH_CONFIG = {
  active: 26.5,
  inactive: 20,
} as const;

export const INTERPOLATE_RANGE = {
  input: [0, 1] as [number, number],
  output: [40, 100] as [number, number],
} as const;
