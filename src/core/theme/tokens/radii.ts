import { moderateScale } from '../utils/responsive';

// Rule 08 (v4, 2026-10-08): soft but structured.
// xs → skeleton lines, checkbox · sm → tags · md → buttons, inputs, icon tiles ·
// lg → cards · xl → sheets, modals, the hero → body seam · full → avatars, pills.
const BASE_RADII = {
  none: 0,
  xs: 4,
  sm: 10,
  md: 15,
  lg: 22,
  xl: 28,
  full: 9999,
} as const;

export type RadiiToken = keyof typeof BASE_RADII;

export const createRadii = () => {
  const entries = Object.entries(BASE_RADII) as [RadiiToken, number][];

  return entries.reduce(
    (acc, [key, value]) => {
      acc[key] = key === 'full' ? BASE_RADII.full : moderateScale(value);
      return acc;
    },
    {} as Record<RadiiToken, number>,
  );
};

export { BASE_RADII };
