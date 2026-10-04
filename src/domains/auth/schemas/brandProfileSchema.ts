import * as yup from 'yup';
import type { TFunction } from 'i18next';
import {
  SOCIAL_PLATFORMS,
  isSocialPlatform,
  isValidSocialUrl,
  normalizeSocialUrl,
} from '@/shared/utils';
import type { SocialPlatform } from '@/shared/utils';
import type { BrandSocialLink } from '../store';

export type SocialLinksFormValues = Record<SocialPlatform, string>;

export interface BrandProfileFormValues {
  governorate: string;
  businessType: string;
  /** One optional input per platform; empty = not provided. */
  socialLinks: SocialLinksFormValues;
}

export const EMPTY_SOCIAL_LINKS: SocialLinksFormValues = {
  instagram: '',
  facebook: '',
  tiktok: '',
  youtube: '',
  telegram: '',
  website: '',
};

/** Server list (`[{ platform, url }]`) → one field per platform. Unknown platforms are dropped. */
export const toSocialLinksForm = (
  links: readonly BrandSocialLink[] | undefined,
): SocialLinksFormValues => {
  const result = { ...EMPTY_SOCIAL_LINKS };
  for (const link of links ?? []) {
    if (isSocialPlatform(link.platform)) result[link.platform] = link.url;
  }
  return result;
};

/** Form fields → the full-replace list the server stores (canonical https URLs, empties dropped). */
export const toSocialLinksPayload = (links: SocialLinksFormValues): BrandSocialLink[] =>
  SOCIAL_PLATFORMS.flatMap(platform => {
    const url = normalizeSocialUrl(platform, links[platform]);
    return url ? [{ platform, url }] : [];
  });

const socialLinkField = (platform: SocialPlatform, t: TFunction) =>
  yup
    .string()
    .defined()
    .test(
      'social-url',
      t('validation.invalidSocialLink'),
      value => !value?.trim() || isValidSocialUrl(platform, value),
    );

/** Every link optional; a filled one must be a URL on that platform's hosts. */
export const createSocialLinksSchema = (
  t: TFunction,
): yup.ObjectSchema<SocialLinksFormValues> =>
  yup.object({
    instagram: socialLinkField('instagram', t),
    facebook: socialLinkField('facebook', t),
    tiktok: socialLinkField('tiktok', t),
    youtube: socialLinkField('youtube', t),
    telegram: socialLinkField('telegram', t),
    website: socialLinkField('website', t),
  });

export const createBrandProfileSchema = (
  t: TFunction,
): yup.ObjectSchema<BrandProfileFormValues> =>
  yup.object({
    governorate: yup.string().required(t('validation.selectOne')),
    businessType: yup.string().required(t('validation.selectOne')),
    socialLinks: createSocialLinksSchema(t),
  });
