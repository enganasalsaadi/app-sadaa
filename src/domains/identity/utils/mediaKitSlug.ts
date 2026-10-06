import type { ParseKeys } from 'i18next';
import { normalizeApiError } from '@/core/api';
import {
  CREATOR_SLUG_MAX_LENGTH,
  isCreatorSlugFormat,
  isCreatorSlugLength,
} from '@/core/config';
import { SLUG_REASONS, type SlugReason } from '../types/mediaKit';
import { formatLinkLabel } from './mediaKitCard';

export const SLUG_MAX_LENGTH = CREATOR_SLUG_MAX_LENGTH;

export const SLUG_REASON_KEY = {
  invalid_length: 'account.mediaKit.settingsScreen.reasons.invalidLength',
  invalid_format: 'account.mediaKit.settingsScreen.reasons.invalidFormat',
  reserved: 'account.mediaKit.settingsScreen.reasons.reserved',
  taken: 'account.mediaKit.settingsScreen.reasons.taken',
} as const satisfies Record<SlugReason, ParseKeys>;

/** The server lowercases slugs; spaces are never valid, so they are dropped as typed. */
export const normalizeSlugInput = (text: string): string =>
  text.replace(/\s+/g, '').toLowerCase();

/** The reason the server would reject this slug for its shape, or `null` when it may be sent. */
export const validateSlugLocally = (slug: string): SlugReason | null => {
  if (!isCreatorSlugLength(slug)) {
    return 'invalid_length';
  }
  if (!isCreatorSlugFormat(slug)) {
    return 'invalid_format';
  }
  return null;
};

export const isSlugReason = (value: unknown): value is SlugReason =>
  typeof value === 'string' && (SLUG_REASONS as readonly string[]).includes(value);

/** `can_change_slug_at` in the future = cooldown; `null` or past = a new slug can be picked now. */
export const resolveSlugCooldown = (
  canChangeSlugAt: string | null,
  now: number,
): Date | null => {
  if (!canChangeSlugAt) {
    return null;
  }
  const at = Date.parse(canChangeSlugAt);
  return Number.isFinite(at) && at > now ? new Date(at) : null;
};

/**
 * Display-only preview of the link with another slug (`host/c/next`). The link
 * that is shared always comes from the server's `public_url` (§17.8).
 */
export const previewSlugLink = (
  publicUrl: string,
  currentSlug: string,
  nextSlug: string,
): string => {
  const label = formatLinkLabel(publicUrl);
  const suffix = `/${currentSlug}`;
  return label.endsWith(suffix)
    ? `${label.slice(0, -suffix.length)}/${nextSlug}`
    : label;
};

export type SlugSaveError =
  | { kind: 'unavailable'; reason: SlugReason }
  | { kind: 'cooldown'; availableAt: Date | null }
  | { kind: 'rate_limited' }
  | { kind: 'failed' };

/** PATCH §17.2 failures: branch on `error_code` + `meta.reason`, never on the message. */
export const classifySlugSaveError = (error: unknown): SlugSaveError => {
  const { code, statusCode, reason, availableAt } = normalizeApiError(error);
  if (code === 'slug_unavailable') {
    return {
      kind: 'unavailable',
      reason: isSlugReason(reason)
        ? reason
        : statusCode === 409
        ? 'taken'
        : 'invalid_format',
    };
  }
  if (code === 'slug_change_cooldown') {
    const at = availableAt ? Date.parse(availableAt) : NaN;
    return { kind: 'cooldown', availableAt: Number.isFinite(at) ? new Date(at) : null };
  }
  if (statusCode === 429 || code === 'too_many_requests') {
    return { kind: 'rate_limited' };
  }
  return { kind: 'failed' };
};
