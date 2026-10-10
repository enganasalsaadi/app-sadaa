import { resolvePriceLockNotice, toPriceLockReason, toPriceLockViewer } from '../priceLock';

describe('toPriceLockReason', () => {
  it('keeps known reasons, unknown / missing → null', () => {
    expect(toPriceLockReason('kyc_pending')).toBe('kyc_pending');
    expect(toPriceLockReason('new_reason')).toBeNull();
    expect(toPriceLockReason(null)).toBeNull();
    expect(toPriceLockReason(undefined)).toBeNull();
  });
});

describe('toPriceLockViewer', () => {
  it('no session → guest; brand session → brand; anything else → creator', () => {
    expect(toPriceLockViewer(false, 'brand')).toBe('guest');
    expect(toPriceLockViewer(true, 'brand')).toBe('brand');
    expect(toPriceLockViewer(true, 'influencer')).toBe('creator');
    expect(toPriceLockViewer(true, null)).toBe('creator');
  });
});

describe('resolvePriceLockNotice', () => {
  it('brand: CTA per reason', () => {
    expect(resolvePriceLockNotice('kyc_required', 'brand').cta?.screen).toBe('CompanyVerification');
    expect(resolvePriceLockNotice('kyc_rejected', 'brand').cta?.screen).toBe('CompanyVerification');
    expect(resolvePriceLockNotice('onboarding_incomplete', 'brand').cta?.screen).toBe('CompanyInfoScreen');
    expect(resolvePriceLockNotice('kyc_pending', 'brand').cta).toBeNull();
    expect(resolvePriceLockNotice('account_suspended', 'brand').cta).toBeNull();
    expect(resolvePriceLockNotice('brand_only', 'brand').cta).toBeNull();
  });

  it('brand with an unknown reason → verify', () => {
    expect(resolvePriceLockNotice(null, 'brand').cta?.screen).toBe('CompanyVerification');
  });

  it('guest → sign in, whatever the reason', () => {
    expect(resolvePriceLockNotice('kyc_pending', 'guest').cta?.screen).toBe('Login');
  });

  it('creator → plain text, whatever the reason', () => {
    expect(resolvePriceLockNotice('kyc_required', 'creator').cta).toBeNull();
  });
});
