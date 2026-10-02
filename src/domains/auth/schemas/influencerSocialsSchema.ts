import * as yup from 'yup';
import type { TFunction } from 'i18next';
import type { SocialPlatform } from '@/shared/utils';
import { FOLLOWER_TIERS } from '../store';
import type { FollowerTierId } from '../store';
import { INFLUENCER_MAX_NICHES } from '../constants/influencerOnboarding';

const HANDLE_MAX_LENGTH = 255;
const HANDLE_PATTERN = /^[\p{L}\p{N}._-]+$/u;

/** Platforms a creator can link — the website entry is brand-only. */
export const INFLUENCER_PLATFORMS = [
  'instagram',
  'tiktok',
  'youtube',
  'facebook',
  'telegram',
] as const satisfies readonly SocialPlatform[];
export type InfluencerPlatform = (typeof INFLUENCER_PLATFORMS)[number];

/** Where the tier came from: a `found` lookup, or picked by hand (admin reviews it). */
export type TierSource = 'auto' | 'manual';

export interface PlatformAccountFormValues {
  platform: InfluencerPlatform;
  /** Bare handle; the server stores it as `username`. */
  handle: string;
  followerTier: FollowerTierId;
  tierSource: TierSource;
  isPrimary: boolean;
}

export interface InfluencerSocialsFormValues {
  niches: string[];
  platforms: PlatformAccountFormValues[];
}

/**
 * What the user typed → bare handle: trims, drops a leading `@` and, when a
 * profile link was pasted, keeps its last path segment.
 */
export const toHandle = (input: string): string => {
  const trimmed = input.trim();
  const path = trimmed.includes('/')
    ? trimmed.split(/[?#]/)[0]?.split('/').filter(Boolean).pop() ?? ''
    : trimmed;
  return path.replace(/^@+/, '');
};

export const isInfluencerPlatform = (value: string): value is InfluencerPlatform =>
  (INFLUENCER_PLATFORMS as readonly string[]).includes(value);

export const isFollowerTier = (value: string | null | undefined): value is FollowerTierId =>
  !!value && (FOLLOWER_TIERS as readonly string[]).includes(value);

/** The add/edit sheet while typing: nothing picked yet is allowed until submit. */
export interface PlatformAccountDraft {
  platform: string;
  handle: string;
  followerTier: string;
}

/** One platform account, validated in the sheet before it joins the list. */
export const createPlatformAccountSchema = (
  t: TFunction,
): yup.ObjectSchema<PlatformAccountDraft> =>
  yup.object({
    platform: yup
      .string()
      .required(t('validation.selectOne'))
      .test('platform', t('validation.selectOne'), value => isInfluencerPlatform(value ?? '')),
    handle: yup
      .string()
      .required(t('validation.required'))
      .test('handle', t('auth.influencerOnboarding.socials.errors.username'), value =>
        HANDLE_PATTERN.test(toHandle(value ?? '')),
      )
      .test(
        'handle-length',
        t('validation.maxLength', { count: HANDLE_MAX_LENGTH }),
        value => toHandle(value ?? '').length <= HANDLE_MAX_LENGTH,
      ),
    followerTier: yup
      .string()
      .required(t('auth.influencerOnboarding.socials.errors.tier'))
      .test('tier', t('auth.influencerOnboarding.socials.errors.tier'), value =>
        isFollowerTier(value),
      ),
  });

export const createInfluencerSocialsSchema = (
  t: TFunction,
): yup.ObjectSchema<InfluencerSocialsFormValues> =>
  yup.object({
    niches: yup
      .array(yup.string().required())
      .min(1, t('auth.influencerOnboarding.socials.errors.nichesMin'))
      .max(
        INFLUENCER_MAX_NICHES,
        t('auth.influencerOnboarding.socials.errors.nichesMax', { count: INFLUENCER_MAX_NICHES }),
      )
      .required(),
    // Each entry was already validated by the sheet (createPlatformAccountSchema).
    platforms: yup
      .array(yup.mixed<PlatformAccountFormValues>().required())
      .min(1, t('auth.influencerOnboarding.socials.errors.platformsMin'))
      .test(
        'unique-platform',
        t('auth.influencerOnboarding.socials.errors.duplicate'),
        list => new Set(list?.map(item => item.platform)).size === (list?.length ?? 0),
      )
      .required(),
  });
