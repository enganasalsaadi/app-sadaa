import { toKycMethod } from '../kycMethod';

describe('toKycMethod', () => {
  it('keeps every known method', () => {
    expect(toKycMethod('commercial_registry')).toBe('commercial_registry');
    expect(toKycMethod('social_dm_proof')).toBe('social_dm_proof');
    expect(toKycMethod('personal_id')).toBe('personal_id');
    expect(toKycMethod('domain_email')).toBe('domain_email');
  });

  it('reads unknown or missing values as no method', () => {
    expect(toKycMethod('carrier_pigeon')).toBeNull();
    expect(toKycMethod('')).toBeNull();
    expect(toKycMethod(null)).toBeNull();
    expect(toKycMethod(undefined)).toBeNull();
  });
});
