/**
 * Contract §17.2 slug shape, shared by the slug editor and the `/c/{slug}` link
 * parser. Reserved / taken / ULID-shaped slugs are checked by the server only.
 */
export const CREATOR_SLUG_MIN_LENGTH = 3;
export const CREATOR_SLUG_MAX_LENGTH = 30;
export const CREATOR_SLUG_PATTERN = /^[a-z0-9][a-z0-9._]*[a-z0-9]$/;

export const isCreatorSlugLength = (slug: string): boolean =>
  slug.length >= CREATOR_SLUG_MIN_LENGTH && slug.length <= CREATOR_SLUG_MAX_LENGTH;

export const isCreatorSlugFormat = (slug: string): boolean =>
  CREATOR_SLUG_PATTERN.test(slug) && !slug.includes('..');
