import { moderateScale } from '@/core/theme';

/** Visual bar surface height (excluding the safe-area bottom inset). */
export const BAR_HEIGHT = moderateScale(68);

/** Capsule corner radius (approved 2026-10-06, outside the 8–12 card range; rule 08). */
export const BAR_CORNER = moderateScale(26);

/** Scroll offset (px) under which the bar always stays visible. */
export const SCROLL_TOP_THRESHOLD = 20;
