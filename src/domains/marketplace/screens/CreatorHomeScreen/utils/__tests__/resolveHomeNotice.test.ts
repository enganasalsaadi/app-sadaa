import { resolveHomeNotice, type HomeNoticeInput } from '../resolveHomeNotice';

const input = (overrides: Partial<HomeNoticeInput> = {}): HomeNoticeInput => ({
  platformsReviewStatus: 'verified',
  kycStatus: 'verified',
  needsRateCards: false,
  isKitPublic: true,
  ...overrides,
});

describe('resolveHomeNotice', () => {
  it('shows nothing when no blocker exists', () => {
    expect(resolveHomeNotice(input())).toBeNull();
    expect(resolveHomeNotice(input({ platformsReviewStatus: null, kycStatus: 'pending' }))).toBeNull();
  });

  it('puts platforms needing action above everything', () => {
    expect(
      resolveHomeNotice(
        input({ platformsReviewStatus: 'action_required', kycStatus: 'rejected', isKitPublic: false }),
      ),
    ).toBe('platformsActionRequired');
  });

  it('puts a KYC rejection above platforms under review and a hidden kit', () => {
    expect(
      resolveHomeNotice(
        input({ platformsReviewStatus: 'under_review', kycStatus: 'rejected', isKitPublic: false }),
      ),
    ).toBe('kycRejected');
  });

  it('puts missing rates below a KYC rejection and above platforms under review', () => {
    expect(resolveHomeNotice(input({ kycStatus: 'rejected', needsRateCards: true }))).toBe('kycRejected');
    expect(
      resolveHomeNotice(
        input({ platformsReviewStatus: 'under_review', needsRateCards: true, isKitPublic: false }),
      ),
    ).toBe('rateCardRequired');
  });

  it('puts platforms under review above a hidden kit', () => {
    expect(
      resolveHomeNotice(input({ platformsReviewStatus: 'under_review', isKitPublic: false })),
    ).toBe('platformsUnderReview');
  });

  it('flags a hidden kit only once the kit is known', () => {
    expect(resolveHomeNotice(input({ isKitPublic: false }))).toBe('kitHidden');
    expect(resolveHomeNotice(input({ isKitPublic: null }))).toBeNull();
  });
});
