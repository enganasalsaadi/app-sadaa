import type { BrandSocialLink } from '@/domains/auth';
import type { UserProfileDetails } from '../types/profile';

const isSocialLink = (value: unknown): value is BrandSocialLink =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).platform === 'string' &&
  typeof (value as Record<string, unknown>).url === 'string';

/** Contract §3.2 says a list; anything else (e.g. a keyed object from old seed data) reads as "no links" instead of crashing. */
export const toSocialLinks = (raw: unknown): BrandSocialLink[] =>
  Array.isArray(raw) ? raw.filter(isSocialLink) : [];

export const toUserProfileDetails = (dto: UserProfileDetails): UserProfileDetails =>
  dto.profile.social_links === undefined
    ? dto
    : { ...dto, profile: { ...dto.profile, social_links: toSocialLinks(dto.profile.social_links) } };
