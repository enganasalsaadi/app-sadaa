/**
 * Brand company verification, routes 2 and 3 (`docs/company-verification.md`).
 * Route 1 (documents / owner ID) stays on `POST /user/kyc` (`types/kyc.ts`).
 */

export const SOCIAL_PROOF_PLATFORMS = ['instagram', 'facebook'] as const;
export type SocialProofPlatform = (typeof SOCIAL_PROOF_PLATFORMS)[number];

export const SOCIAL_PROOF_STATUS = ['pending', 'approved', 'rejected'] as const;
export type SocialProofStatus = (typeof SOCIAL_PROOF_STATUS)[number];

export const DOMAIN_VERIFICATION_STATUS = ['pending', 'verified', 'expired'] as const;
export type DomainVerificationStatus = (typeof DOMAIN_VERIFICATION_STATUS)[number];

/** `POST|GET /brand/verification/social-dm`. */
export interface SocialProofDto {
  id: string;
  platform: string;
  platform_label: string;
  page_url: string;
  code: string;
  status: string;
  status_label: string;
  rejection_reason: string | null;
  /** Sada's official account; `null` until ops configures it. */
  deep_link: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface SocialProof {
  id: string;
  /** Unknown server value → `null`. */
  platform: SocialProofPlatform | null;
  platformLabel: string;
  pageUrl: string;
  /** DM'd to Sada's account; never expires, replaced by a new start. */
  code: string;
  /** Unknown server value → `null`. */
  status: SocialProofStatus | null;
  statusLabel: string;
  rejectionReason: string | null;
  deepLink: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface StartSocialProofRequest {
  platform: SocialProofPlatform;
  page_url: string;
}

/** `POST|GET /brand/verification/domain-email`. */
export interface DomainVerificationDto {
  id: string;
  domain: string;
  email: string;
  status: string;
  status_label: string;
  expires_at: string;
  verified_at: string | null;
  can_resend: boolean;
  resend_available_at: string | null;
}

export interface DomainVerification {
  id: string;
  domain: string;
  email: string;
  /** Unknown server value → `null`. */
  status: DomainVerificationStatus | null;
  statusLabel: string;
  expiresAt: string;
  verifiedAt: string | null;
  /** False while the 60 s cooldown runs (`resendAvailableAt`) or once verified. */
  canResend: boolean;
  resendAvailableAt: string | null;
}

/** Resend = the same request again; it replaces the pending attempt. */
export interface StartDomainVerificationRequest {
  domain: string;
  email: string;
}
