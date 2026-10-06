import { isCreatorSlugFormat, isCreatorSlugLength } from '@/core/config';

/** Where an opened link leads. Only allow-listed routes exist here (rule 07). */
export type AppLinkTarget = { kind: 'creator'; slug: string };

/** Custom scheme for the web page's "Open in app" button (`sada://c/{slug}`). */
export const APP_LINK_SCHEME = 'sada';
const CREATOR_ROUTE = 'c';
const MAX_LINK_LENGTH = 2048;
// scheme://authority/path?query#fragment. Parsed by hand: RN's URL polyfill has no `hostname`.
const LINK_PARTS = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(?:\?[^#]*)?(?:#.*)?$/i;

/** `/a/b/` → `['a', 'b']`; `null` for an empty segment in the middle (`/c//x`). */
const toSegments = (path: string): string[] | null => {
  const trimmed = path.replace(/^\//, '').replace(/\/$/, '');
  if (trimmed === '') return [];
  const segments = trimmed.split('/');
  return segments.every(Boolean) ? segments : null;
};

const toCreatorTarget = (segments: string[] | null): AppLinkTarget | null => {
  if (!segments || segments.length !== 2 || segments[0] !== CREATOR_ROUTE) return null;
  const slug = (segments[1] ?? '').toLowerCase();
  return isCreatorSlugLength(slug) && isCreatorSlugFormat(slug) ? { kind: 'creator', slug } : null;
};

/**
 * Typed view of an opened URL (contract §17.8): `https://<webHost>/c/{slug}` or
 * `sada://c/{slug}`, slug validated with the §17.2 rule (case-insensitive). Any
 * other host, scheme, port, user-info or path → `null` (the app just opens).
 */
export const parseAppLink = (url: unknown, webHost: string): AppLinkTarget | null => {
  if (typeof url !== 'string' || url.length > MAX_LINK_LENGTH) return null;
  const match = LINK_PARTS.exec(url.trim());
  if (!match) return null;
  const scheme = (match[1] ?? '').toLowerCase();
  const authority = (match[2] ?? '').toLowerCase();
  const path = match[3] ?? '';

  if (scheme === 'https') {
    return webHost !== '' && authority === webHost.toLowerCase()
      ? toCreatorTarget(toSegments(path))
      : null;
  }
  if (scheme === APP_LINK_SCHEME) {
    const rest = toSegments(path);
    return rest ? toCreatorTarget([authority, ...rest]) : null;
  }
  return null;
};
