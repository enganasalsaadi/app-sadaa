import { moderateScale } from '@/core/theme';

/** Tab row height, above the bottom safe-area padding. */
export const BAR_HEIGHT = moderateScale(62);

/** Rounded top corners where the docked bar meets the page (approved 2026-10-16). */
export const BAR_CORNER = moderateScale(28);

/**
 * Share of the iOS home-indicator inset kept under the row. The indicator needs about a third of
 * its 34pt inset, so the full inset reads as an empty band. Android keeps its full inset: a
 * 3-button nav bar would cover the labels otherwise.
 */
export const IOS_INSET_SHARE = 0.6;

/** Upward shadow that lifts the bar off the page. */
export const SHADOW_OFFSET_Y = moderateScale(-6);
export const SHADOW_BLUR = moderateScale(24);

/** Squircle behind the active icon. */
export const PILL_WIDTH = moderateScale(56);
export const PILL_HEIGHT = moderateScale(32);
export const PILL_RADIUS = moderateScale(13);

/** Elastic rail on the top edge: half its rest width, thickness and glow. */
export const RAIL_HALF = moderateScale(14);
export const RAIL_HEIGHT = moderateScale(3);
export const RAIL_GLOW_Y = moderateScale(2);
export const RAIL_GLOW_BLUR = moderateScale(10);
/** The trailing edge waits this long (ms) before it follows, so the rail stretches first. */
export const RAIL_TRAIL_DELAY = 80;

/** Active icon: rests slightly raised, hops once when its tab opens, shrinks while pressed. */
export const ICON_REST_LIFT = moderateScale(-2);
export const ICON_HOP = moderateScale(-7);
/** The hop waits for the rail's leading edge to land (ms). */
export const ICON_HOP_DELAY = 110;
export const ICON_PRESS_SCALE = 0.88;
