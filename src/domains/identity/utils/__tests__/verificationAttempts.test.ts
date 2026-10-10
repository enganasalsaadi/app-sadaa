import type { KycDetails } from '../../types/kyc';
import type { DomainVerification, SocialProof } from '../../types/verification';
import { selectActiveAttempts } from '../verificationAttempts';

const NOW = Date.parse('2026-10-10T12:30:00Z');

const kyc = (overrides: Partial<KycDetails> = {}): KycDetails => ({
  status: 'unverified',
  document_type: null,
  method: null,
  method_label: null,
  rejection_reason: null,
  submitted_at: null,
  reviewed_at: null,
  can_submit: true,
  ...overrides,
});

const social = (overrides: Partial<SocialProof> = {}): SocialProof => ({
  id: '01J-social',
  platform: 'instagram',
  platformLabel: 'Instagram',
  pageUrl: 'https://instagram.com/mybrand',
  code: 'SADA-4821',
  status: 'pending',
  statusLabel: 'Pending',
  rejectionReason: null,
  deepLink: null,
  createdAt: '2026-10-10T12:00:00Z',
  reviewedAt: null,
  ...overrides,
});

const domain = (overrides: Partial<DomainVerification> = {}): DomainVerification => ({
  id: '01J-domain',
  domain: 'mybrand.sy',
  email: 'admin@mybrand.sy',
  status: 'pending',
  statusLabel: 'Pending',
  expiresAt: '2026-10-10T13:00:00Z',
  verifiedAt: null,
  canResend: false,
  resendAvailableAt: null,
  ...overrides,
});

const shape = (attempts: ReturnType<typeof selectActiveAttempts>) =>
  attempts.map(attempt => `${attempt.kind}:${attempt.state}`);

describe('selectActiveAttempts', () => {
  it('is empty with nothing started', () => {
    expect(selectActiveAttempts(kyc(), null, null, NOW)).toEqual([]);
  });

  it('is empty once verified, whatever else is open', () => {
    expect(
      selectActiveAttempts(kyc({ status: 'verified' }), social(), domain(), NOW),
    ).toEqual([]);
  });

  it('lists a pending or rejected document', () => {
    expect(shape(selectActiveAttempts(kyc({ status: 'pending' }), null, null, NOW))).toEqual([
      'document:pending',
    ]);
    expect(shape(selectActiveAttempts(kyc({ status: 'rejected' }), null, null, NOW))).toEqual([
      'document:rejected',
    ]);
  });

  it('skips closed or unknown social proofs', () => {
    expect(selectActiveAttempts(kyc(), social({ status: 'approved' }), null, NOW)).toEqual([]);
    expect(selectActiveAttempts(kyc(), social({ status: null }), null, NOW)).toEqual([]);
  });

  it('treats a pending domain link past its expiry as expired', () => {
    const late = Date.parse('2026-10-10T13:00:01Z');
    expect(shape(selectActiveAttempts(kyc(), null, domain(), late))).toEqual(['domain:expired']);
    expect(shape(selectActiveAttempts(kyc(), null, domain(), NOW))).toEqual(['domain:pending']);
    expect(
      shape(selectActiveAttempts(kyc(), null, domain({ status: 'expired' }), NOW)),
    ).toEqual(['domain:expired']);
    expect(selectActiveAttempts(kyc(), null, domain({ status: 'verified' }), NOW)).toEqual([]);
  });

  it('puts waiting attempts before failed ones', () => {
    expect(
      shape(
        selectActiveAttempts(
          kyc({ status: 'rejected' }),
          social({ status: 'rejected' }),
          domain(),
          NOW,
        ),
      ),
    ).toEqual(['domain:pending', 'document:rejected', 'social:rejected']);
  });
});
