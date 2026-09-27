import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { SOCIAL_PLATFORMS, isValidSocialUrl } from '@/shared/utils';
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

const isSocialPlatform = (value: string): value is SocialPlatform =>
  (SOCIAL_PLATFORMS as readonly string[]).includes(value);

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

const socialLinkField = (platform: SocialPlatform, t: TFunction) =>
  yup
    .string()
    .defined()
    .test(
      'social-url',
      t('validation.invalidSocialLink'),
      value => !value?.trim() || isValidSocialUrl(platform, value),
    );

export const createBrandProfileSchema = (
  t: TFunction,
): yup.ObjectSchema<BrandProfileFormValues> =>
  yup.object({
    governorate: yup.string().required(t('validation.selectOne')),
    businessType: yup.string().required(t('validation.selectOne')),
    socialLinks: yup.object({
      instagram: socialLinkField('instagram', t),
      facebook: socialLinkField('facebook', t),
      tiktok: socialLinkField('tiktok', t),
      youtube: socialLinkField('youtube', t),
      telegram: socialLinkField('telegram', t),
      website: socialLinkField('website', t),
    }),
  });
