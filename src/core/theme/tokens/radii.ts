import { moderateScale } from '../utils/responsive';

// Rule 08: structured marketplace — radius range 8–12 only.
// md → buttons, inputs · lg → cards, sheets, modals · sm → small tags · full → avatars, pills.
const BASE_RADII = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
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
