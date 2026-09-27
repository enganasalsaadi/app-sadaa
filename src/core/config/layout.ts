export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 812;

export const BREAKPOINTS = {
  small: 0,
  medium: 375,
  large: 768,
} as const;

// Below this window height (iPhone SE/mini class) hero headers start compact:
// the full hero plus a keyboard leaves room for barely one field.
export const COMPACT_HERO_MAX_HEIGHT = 700;

export const MAX_FONT_SIZE_MULTIPLIER = 1.4;
export const FONT_SCALE_FACTOR = 0.3;
export const FONT_MAX_SCALE_RATIO = 1.25;
