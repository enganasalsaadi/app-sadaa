import { env } from './env';

const LEGAL_FALLBACK_HOST = 'getsadaapp.com';

const legalHost = env.PUBLIC_WEB_HOST || LEGAL_FALLBACK_HOST;

/** Used when `/config` returns no legal URLs (it sends `null` until the backend sets them). */
export const LEGAL_URLS = {
  privacy: `https://${legalHost}/privacy`,
  terms: `https://${legalHost}/terms`,
} as const;

/** WebView allow-list (rule 07): the legal pages' host and its subdomains, https only. */
export const isLegalUrlAllowed = (url: string): boolean => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && (hostname === legalHost || hostname.endsWith(`.${legalHost}`));
  } catch {
    return false;
  }
};
