import { moderateScale } from '@/core/theme';

/** Visual bar surface height (excluding the safe-area bottom inset). */
export const BAR_HEIGHT = moderateScale(66);

/**
 * Outer corner radius of the bar.
 * TODO(rule 08): 26 is outside the 8–12 radius range; kept until design signs off a change.
 */
export const BAR_CORNER = moderateScale(26);

/** Scroll offset (px) under which the bar always stays visible. */
export const SCROLL_TOP_THRESHOLD = 20;

/** Active-tab pill behind the icon. */
export const TAB_PILL_WIDTH = moderateScale(40);
export const TAB_PILL_HEIGHT = moderateScale(24);

/** Upward lift (px) of the active tab icon. */
export const TAB_ACTIVE_LIFT = -2;
