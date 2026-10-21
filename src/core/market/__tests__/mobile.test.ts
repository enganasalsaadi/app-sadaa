import { matchesMobilePattern, nationalMobileExample, toMarketMobile } from '../mobile';

const SYRIA = { countryCode: 'SY' as const, mobilePattern: '^\\+9639\\d{8}$', mobileExample: '+963944123456' };

describe('toMarketMobile', () => {
  it('normalises a local number to E.164 when the market pattern matches', () => {
    expect(toMarketMobile('0944123456', SYRIA)).toBe('+963944123456');
    expect(toMarketMobile('944123456', SYRIA)).toBe('+963944123456');
  });

  it('rejects a landline or a foreign number', () => {
    expect(toMarketMobile('112345678', SYRIA)).toBeNull();
    expect(toMarketMobile('+971501234567', SYRIA)).toBeNull();
  });

  it('has no verdict without a market', () => {
    expect(toMarketMobile('0944123456', null)).toBeNull();
  });
});

describe('matchesMobilePattern', () => {
  it('lets the server decide when the pattern is not a valid JS regex', () => {
    expect(matchesMobilePattern('+971501234567', '(?<broken')).toBe(true);
  });
});

describe('nationalMobileExample', () => {
  it('shows the example the way it is typed locally', () => {
    expect(nationalMobileExample(SYRIA)).toBe('0944 123 456');
    expect(nationalMobileExample(null)).toBeUndefined();
  });
});
