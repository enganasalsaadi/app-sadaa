import { moderateScale } from '@/core/theme';

/** Visual bar surface height (excluding the safe-area bottom inset). */
export const BAR_HEIGHT = moderateScale(68);

/** Capsule corner radius (approved 2026-10-06; rule 08). */
export const BAR_CORNER = moderateScale(26);

/** Scroll offset (px) under which the bar always stays visible. */
export const SCROLL_TOP_THRESHOLD = 20;

/** Gap between the liquid lens and the capsule edges / the tab slot sides (rule 08 v4). */
export const LENS_INSET_X = moderateScale(4);
export const LENS_INSET_Y = moderateScale(7);
