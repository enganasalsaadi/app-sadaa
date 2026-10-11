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

/** Morph bar (brand tabs): how much wider the active tab grows (flex 1 → 1 + this). */
export const MORPH_ACTIVE_GROW = 1.6;
/** Morph bar: the longest label the active capsule reveals before it truncates. */
export const MORPH_LABEL_MAX = moderateScale(96);
/** Morph bar: inner padding between the pill edge and the tab slots. */
export const MORPH_INSET = moderateScale(10);
