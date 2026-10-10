import { toKycMethod } from '@/domains/auth';
import type { KycDetails, KycDetailsDto } from '../types/kyc';
import {
  DOMAIN_VERIFICATION_STATUS,
  SOCIAL_PROOF_PLATFORMS,
  SOCIAL_PROOF_STATUS,
  type DomainVerification,
  type DomainVerificationDto,
  type SocialProof,
  type SocialProofDto,
} from '../types/verification';

const pick = <T extends string>(values: readonly T[], value: string): T | null =>
  values.find(known => known === value) ?? null;

export const toSocialProof = (dto: SocialProofDto): SocialProof => ({
  id: dto.id,
  platform: pick(SOCIAL_PROOF_PLATFORMS, dto.platform),
  platformLabel: dto.platform_label,
  pageUrl: dto.page_url,
  code: dto.code,
  status: pick(SOCIAL_PROOF_STATUS, dto.status),
  statusLabel: dto.status_label,
  rejectionReason: dto.rejection_reason,
  deepLink: dto.deep_link || null,
  createdAt: dto.created_at,
  reviewedAt: dto.reviewed_at,
});

export const toDomainVerification = (dto: DomainVerificationDto): DomainVerification => ({
  id: dto.id,
  domain: dto.domain,
  email: dto.email,
  status: pick(DOMAIN_VERIFICATION_STATUS, dto.status),
  statusLabel: dto.status_label,
  expiresAt: dto.expires_at,
  verifiedAt: dto.verified_at,
  canResend: dto.can_resend,
  resendAvailableAt: dto.resend_available_at,
});

export const toKycDetails = ({ method, method_label, ...dto }: KycDetailsDto): KycDetails => ({
  ...dto,
  method: toKycMethod(method),
  method_label: method_label ?? null,
});
