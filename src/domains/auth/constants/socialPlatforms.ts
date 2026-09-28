import type { ParseKeys } from 'i18next';
import type { SocialPlatform } from '@/shared/utils';

export const PLATFORM_LABEL_KEY = {
  instagram: 'auth.brandOnboarding.profile.platforms.instagram',
  facebook: 'auth.brandOnboarding.profile.platforms.facebook',
  tiktok: 'auth.brandOnboarding.profile.platforms.tiktok',
  youtube: 'auth.brandOnboarding.profile.platforms.youtube',
  telegram: 'auth.brandOnboarding.profile.platforms.telegram',
  website: 'auth.brandOnboarding.profile.platforms.website',
} as const satisfies Record<SocialPlatform, ParseKeys>;
