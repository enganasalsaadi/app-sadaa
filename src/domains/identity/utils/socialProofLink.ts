import {
  SOCIAL_PROOF_APP_URL,
  SOCIAL_PROOF_DEEP_LINK_HOSTS,
} from '../constants/verification';
import type { SocialProof } from '../types/verification';

/** Which instructions the code screen shows: the platform's own link, or the manual fallback. */
export type SocialProofLinkKind = 'instagram' | 'facebook' | 'none';

export interface SocialProofLink {
  kind: SocialProofLinkKind;
  /** What the primary opens; `null` when the platform itself is unknown. */
  url: string | null;
}

// https only, no userinfo or port: `https://instagram.com@evil.example` must not pass as Instagram.
const HTTPS_HOST = /^https:\/\/([a-z0-9.-]+)(?:[/?#]|$)/i;

/** The server's `deep_link`, only when it is https on that platform's allow-listed hosts. */
export const toSafeDeepLink = (
  proof: Pick<SocialProof, 'platform' | 'deepLink'>,
): string | null => {
  const { platform, deepLink } = proof;
  if (!platform || !deepLink) return null;
  const host = HTTPS_HOST.exec(deepLink.trim())?.[1]?.toLowerCase();
  if (!host) return null;
  return (SOCIAL_PROOF_DEEP_LINK_HOSTS[platform] as readonly string[]).includes(
    host,
  )
    ? deepLink.trim()
    : null;
};

/** No safe deep link → open the platform's home and show the manual DM instructions. */
export const resolveSocialProofLink = (
  proof: Pick<SocialProof, 'platform' | 'deepLink'>,
): SocialProofLink => {
  const deepLink = toSafeDeepLink(proof);
  if (deepLink && proof.platform)
    return { kind: proof.platform, url: deepLink };
  return {
    kind: 'none',
    url: proof.platform ? SOCIAL_PROOF_APP_URL[proof.platform] : null,
  };
};
