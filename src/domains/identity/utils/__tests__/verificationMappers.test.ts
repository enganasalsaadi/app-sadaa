import type { KycDetailsDto } from '../../types/kyc';
import type { DomainVerificationDto, SocialProofDto } from '../../types/verification';
import { toDomainVerification, toKycDetails, toSocialProof } from '../verificationMappers';

// The auth barrel loads native modules; only the method parser is under test here.
jest.mock('@/domains/auth', () => jest.requireActual('@/domains/auth/utils/kycMethod'));

const socialDto: SocialProofDto = {
  id: '01J-social',
  platform: 'instagram',
  platform_label: 'Instagram',
  page_url: 'https://instagram.com/mybrand',
  code: 'SADA-4821',
  status: 'pending',
  status_label: 'Pending',
  rejection_reason: null,
  deep_link: 'https://instagram.com/sada.sy',
  created_at: '2026-10-10T12:00:00Z',
  reviewed_at: null,
};

const domainDto: DomainVerificationDto = {
  id: '01J-domain',
  domain: 'mybrand.sy',
  email: 'admin@mybrand.sy',
  status: 'pending',
  status_label: 'بانتظار التأكيد',
  expires_at: '2026-10-10T13:00:00Z',
  verified_at: null,
  can_resend: false,
  resend_available_at: '2026-10-10T12:01:00Z',
};

const kycDto: KycDetailsDto = {
  status: 'unverified',
  document_type: null,
  rejection_reason: null,
  submitted_at: null,
  reviewed_at: null,
  can_submit: true,
};

describe('toSocialProof', () => {
  it('maps the contract sample', () => {
    expect(toSocialProof(socialDto)).toEqual({
      id: '01J-social',
      platform: 'instagram',
      platformLabel: 'Instagram',
      pageUrl: 'https://instagram.com/mybrand',
      code: 'SADA-4821',
      status: 'pending',
      statusLabel: 'Pending',
      rejectionReason: null,
      deepLink: 'https://instagram.com/sada.sy',
      createdAt: '2026-10-10T12:00:00Z',
      reviewedAt: null,
    });
  });

  it('keeps the resolved statuses', () => {
    expect(toSocialProof({ ...socialDto, status: 'approved' }).status).toBe('approved');
    const rejected = toSocialProof({
      ...socialDto,
      status: 'rejected',
      rejection_reason: 'Code not found',
    });
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('Code not found');
  });

  it('reads unknown platform and status as null', () => {
    const proof = toSocialProof({ ...socialDto, platform: 'tiktok', status: 'archived' });
    expect(proof.platform).toBeNull();
    expect(proof.status).toBeNull();
  });

  it('treats a missing or empty deep link as none', () => {
    expect(toSocialProof({ ...socialDto, deep_link: null }).deepLink).toBeNull();
    expect(toSocialProof({ ...socialDto, deep_link: '' }).deepLink).toBeNull();
  });
});

describe('toDomainVerification', () => {
  it('maps the contract sample', () => {
    expect(toDomainVerification(domainDto)).toEqual({
      id: '01J-domain',
      domain: 'mybrand.sy',
      email: 'admin@mybrand.sy',
      status: 'pending',
      statusLabel: 'بانتظار التأكيد',
      expiresAt: '2026-10-10T13:00:00Z',
      verifiedAt: null,
      canResend: false,
      resendAvailableAt: '2026-10-10T12:01:00Z',
    });
  });

  it('keeps verified and expired, nulls unknown statuses', () => {
    expect(toDomainVerification({ ...domainDto, status: 'verified' }).status).toBe('verified');
    expect(toDomainVerification({ ...domainDto, status: 'expired' }).status).toBe('expired');
    expect(toDomainVerification({ ...domainDto, status: 'revoked' }).status).toBeNull();
  });
});

describe('toKycDetails', () => {
  it('narrows a known method and keeps its label', () => {
    const details = toKycDetails({
      ...kycDto,
      method: 'domain_email',
      method_label: 'Official domain email',
    });
    expect(details.method).toBe('domain_email');
    expect(details.method_label).toBe('Official domain email');
  });

  it('reads an unknown or missing method as none', () => {
    expect(toKycDetails({ ...kycDto, method: 'fax' }).method).toBeNull();
    const legacy = toKycDetails(kycDto);
    expect(legacy.method).toBeNull();
    expect(legacy.method_label).toBeNull();
  });

  it('passes the rest through', () => {
    const details = toKycDetails({
      ...kycDto,
      document_type: 'owner_passport',
      document_type_label: 'Owner passport',
    });
    expect(details).toEqual({
      ...kycDto,
      document_type: 'owner_passport',
      document_type_label: 'Owner passport',
      method: null,
      method_label: null,
    });
  });
});
