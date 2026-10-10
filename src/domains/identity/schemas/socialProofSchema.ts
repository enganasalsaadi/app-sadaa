import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { normalizeSocialUrl } from '@/shared/utils';
import {
  SOCIAL_PROOF_HOSTS,
  SOCIAL_PROOF_PLATFORM_LABEL,
  VERIFICATION_FIELD_MAX_LENGTH,
} from '../constants/verification';
import { SOCIAL_PROOF_PLATFORMS } from '../types/verification';
import type { SocialProofPlatform, StartSocialProofRequest } from '../types/verification';

export interface SocialProofFormValues {
  platform: SocialProofPlatform;
  /** Link or bare `@handle`, as typed. */
  pageUrl: string;
}

const hostOf = (url: string) => url.replace(/^https:\/\//, '').split(/[/?#]/)[0] ?? '';

/**
 * Canonical https page URL, or null when it isn't a page on that platform's hosts.
 * Runs the shared social-link allow-list first, then the route's narrower host list.
 */
export const toSocialProofPageUrl = (platform: SocialProofPlatform, raw: string): string | null => {
  const url = normalizeSocialUrl(platform, raw);
  if (!url) return null;
  return (SOCIAL_PROOF_HOSTS[platform] as readonly string[]).includes(hostOf(url)) ? url : null;
};

export const createSocialProofSchema = (t: TFunction): yup.ObjectSchema<SocialProofFormValues> =>
  yup.object({
    platform: yup
      .mixed<SocialProofPlatform>()
      .oneOf(SOCIAL_PROOF_PLATFORMS, t('validation.selectOne'))
      .required(t('validation.selectOne')),
    pageUrl: yup
      .string()
      .defined()
      .test('page-url', function (value) {
        if (!value.trim()) {
          return this.createError({ message: t('account.verification.social.errors.urlRequired') });
        }
        const { platform } = this.parent as SocialProofFormValues;
        const url = toSocialProofPageUrl(platform, value);
        if (!url) {
          return this.createError({
            message: t('account.verification.social.errors.urlInvalid', {
              platform: t(SOCIAL_PROOF_PLATFORM_LABEL[platform]),
            }),
          });
        }
        return url.length <= VERIFICATION_FIELD_MAX_LENGTH
          ? true
          : this.createError({
              message: t('validation.maxLength', { count: VERIFICATION_FIELD_MAX_LENGTH }),
            });
      }),
  });

/** Sends the canonical URL; the server re-validates the raw text if it ever gets through unparsed. */
export const toStartSocialProofRequest = ({
  platform,
  pageUrl,
}: SocialProofFormValues): StartSocialProofRequest => ({
  platform,
  page_url: toSocialProofPageUrl(platform, pageUrl) ?? pageUrl.trim(),
});
