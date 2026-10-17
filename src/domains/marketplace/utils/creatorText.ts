import { formatNumber } from '@/core/i18n';
import type { ExploreCreator } from '../types/explore';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

/** First letter of the name, for the photo-less monogram. */
/** «سارة الحلبي» → «سارة»: short enough for a button that names who is being picked. */
export const firstNameOf = (name: string): string => name.trim().split(/\s+/)[0] ?? '';

export const monogramOf = (name: string): string => Array.from(name.trim())[0] ?? '';

/** First niche · city, one muted line ("Food · Damascus"). */
export const nicheCityOf = (creator: ExploreCreator): string =>
  [creator.niches[0]?.label, creator.governorate?.label].filter(Boolean).join(' · ');

/** Compact follower count of the primary platform ("48.2K"), or `null` without one. */
export const followersOf = (creator: ExploreCreator): string | null =>
  creator.primaryPlatform ? formatNumber(creator.primaryPlatform.followerCount, COMPACT) : null;
