// Social profile links (rule 07): user-entered links are normalised to
// https and checked against a per-platform host allow-list before they're
// stored or ever opened.

export const SOCIAL_PLATFORMS = [
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'telegram',
  'website',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const isSocialPlatform = (value: string): value is SocialPlatform =>
  (SOCIAL_PLATFORMS as readonly string[]).includes(value);

type ProfilePlatform = Exclude<SocialPlatform, 'website'>;

interface PlatformRule {
  /** Registrable domains; subdomains (www., m.) are accepted. */
  hosts: readonly string[];
  /** Prefix a bare @handle is expanded with. */
  profileBase: string;
}

const PLATFORM_RULES: Record<ProfilePlatform, PlatformRule> = {
  instagram: {
    hosts: ['instagram.com', 'instagr.am'],
    profileBase: 'https://instagram.com/',
  },
  facebook: {
    hosts: ['facebook.com', 'fb.com', 'fb.me'],
    profileBase: 'https://facebook.com/',
  },
  tiktok: { hosts: ['tiktok.com'], profileBase: 'https://www.tiktok.com/@' },
  youtube: {
    hosts: ['youtube.com', 'youtu.be'],
    profileBase: 'https://www.youtube.com/@',
  },
  telegram: { hosts: ['t.me', 'telegram.me'], profileBase: 'https://t.me/' },
};

/** Placeholder host shown in each input so users see the expected format. */
export const SOCIAL_PLACEHOLDER_HOST: Record<SocialPlatform, string> = {
  instagram: 'instagram.com/',
  facebook: 'facebook.com/',
  tiktok: 'tiktok.com/@',
  youtube: 'youtube.com/@',
  telegram: 't.me/',
  website: 'www.',
};

const HANDLE_REGEX = /^[A-Za-z0-9._-]{1,64}$/;
// RN's URL polyfill has no reliable `hostname`, so parse the parts ourselves.
const URL_REGEX = /^(?:(https?):\/\/)?([^/?#:\s]+)(?::\d{1,5})?([/?#][^\s]*)?$/i;
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

const matchesHost = (host: string, allowed: readonly string[]) =>
  allowed.some(domain => host === domain || host.endsWith(`.${domain}`));

const looksLikeHandle = (value: string) =>
  value.startsWith('@') || (!value.includes('/') && !value.includes('.'));

/**
 * Returns the canonical https URL, or null when the input is not a valid link
 * for that platform. Bare handles (`@brand`) are expanded for profile
 * platforms. Empty input returns null — callers treat empty as "not provided".
 */
export const normalizeSocialUrl = (
  platform: SocialPlatform,
  raw: string,
): string | null => {
  const value = raw.trim();
  if (!value) return null;

  if (platform !== 'website' && looksLikeHandle(value)) {
    const handle = value.replace(/^@/, '');
    return HANDLE_REGEX.test(handle)
      ? `${PLATFORM_RULES[platform].profileBase}${handle}`
      : null;
  }

  const match = URL_REGEX.exec(value);
  if (!match) return null;
  const host = (match[2] ?? '').toLowerCase();
  const rest = match[3] ?? '';
  if (!DOMAIN_REGEX.test(host)) return null;

  if (platform !== 'website') {
    if (!matchesHost(host, PLATFORM_RULES[platform].hosts)) return null;
    // A bare "instagram.com" isn't a profile.
    if (rest.replace(/[/?#]+$/, '').length === 0) return null;
  }

  // Always upgrade to https: links are opened later and must not downgrade.
  return `https://${host}${rest}`;
};

export const isValidSocialUrl = (platform: SocialPlatform, raw: string) =>
  normalizeSocialUrl(platform, raw) !== null;
