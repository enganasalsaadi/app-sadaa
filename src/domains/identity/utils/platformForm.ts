import type { ParseKeys, TFunction } from 'i18next';
import { normalizeApiError, type ApiErrorCode } from '@/core/api';
import {
  isInfluencerPlatform,
  type FollowerTierId,
  type PlatformAccountFormValues,
  type PlatformResource,
} from '@/domains/auth';

/** A saved platform → the add/edit sheet's values; `null` for platforms the app can't edit. */
export const toPlatformForm = (platform: PlatformResource): PlatformAccountFormValues | null =>
  isInfluencerPlatform(platform.platform)
    ? {
        platform: platform.platform,
        handle: platform.username,
        followerTier: platform.follower_tier,
        tierSource: platform.tier_source,
        isPrimary: platform.is_primary,
      }
    : null;

/** Same mapping as onboarding step 2: the tier goes along whenever the sheet has one. */
export const toPlatformBody = (
  account: PlatformAccountFormValues,
): { handle: string; follower_tier?: FollowerTierId } => ({
  handle: account.handle,
  ...(account.followerTier ? { follower_tier: account.followerTier } : {}),
});

const PLATFORM_ERROR_KEY = {
  platform_already_exists: 'account.platforms.errors.alreadyExists',
  last_platform: 'account.platforms.errors.lastPlatform',
  platform_not_eligible_for_primary: 'account.platforms.errors.notEligibleForPrimary',
  social_lookup_unavailable: 'account.platforms.errors.lookupUnavailable',
} as const satisfies Partial<Record<ApiErrorCode, ParseKeys>>;

const hasPlatformErrorKey = (code: ApiErrorCode | null): code is keyof typeof PLATFORM_ERROR_KEY =>
  code !== null && code in PLATFORM_ERROR_KEY;

/**
 * What to toast for a failed platform write, or `null` when baseQuery already
 * reported it (422 toast, 403 modal, 5xx modal).
 */
export const platformErrorMessage = (error: unknown, t: TFunction): string | null => {
  const apiError = normalizeApiError(error);
  if (apiError.statusCode === 422 || apiError.isForbidden || apiError.isServerError) return null;
  if (hasPlatformErrorKey(apiError.code)) return t(PLATFORM_ERROR_KEY[apiError.code]);
  if (apiError.statusCode === 404) return t('account.platforms.errors.notFound');
  return t('errors.generic');
};
