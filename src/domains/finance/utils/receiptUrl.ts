const ORIGIN = /^(https?):\/\/([^/?#:]+)(?::(\d+))?(?:[/?#]|$)/i;

const originOf = (url: string): string | null => {
  const match = ORIGIN.exec(url.trim());
  if (!match) return null;
  const [, scheme = '', host = '', port = ''] = match;
  return `${scheme.toLowerCase()}://${host.toLowerCase()}${port ? `:${port}` : ''}`;
};

/**
 * A receipt link opens outside the app only when it comes from the API's own origin
 * (rule 07: allow-listed hosts before `Linking`); anything else is refused.
 */
export const isTrustedReceiptUrl = (url: string, apiBaseUrl: string): boolean => {
  const origin = originOf(url);
  return origin !== null && origin === originOf(apiBaseUrl);
};

/** Refresh a little early: the link must still be alive when the image or browser loads it. */
const EXPIRY_MARGIN_MS = 30_000;

/**
 * A signed receipt link lives 10 minutes (top-ups v2 §2). Without `expires_at` (older
 * servers) it counts as alive: opening it simply fails like any dead link.
 */
export const isReceiptLinkExpired = (receipt: { expires_at: string | null }, now: number): boolean => {
  if (!receipt.expires_at) return false;
  const expiresAt = Date.parse(receipt.expires_at);
  return !Number.isNaN(expiresAt) && now >= expiresAt - EXPIRY_MARGIN_MS;
};
