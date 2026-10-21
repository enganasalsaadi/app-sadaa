import { pickGuestMarket } from '../resolveMarket';
import type { MarketSummary } from '../marketTypes';

const market = (code: string, countryCode: MarketSummary['countryCode'], status: MarketSummary['status']): MarketSummary => ({
  code,
  countryCode,
  name: code,
  status,
  callingCode: '+0',
  mobileExample: '+0',
  defaultCurrency: 'USD',
  timezone: 'UTC',
});

const MARKETS = [market('sy', 'SY', 'active'), market('ae', 'AE', 'coming_soon')];

describe('pickGuestMarket', () => {
  it('takes the active market matching the device region', () => {
    expect(pickGuestMarket(MARKETS, 'sy', 'SY')?.code).toBe('sy');
  });

  it('never picks a coming-soon market, even when the device region matches it', () => {
    expect(pickGuestMarket(MARKETS, 'sy', 'AE')?.code).toBe('sy');
  });

  it('falls back to the default market, then the first active one', () => {
    const two = [market('sy', 'SY', 'active'), market('ae', 'AE', 'active')];
    expect(pickGuestMarket(two, 'ae', 'DE')?.code).toBe('ae');
    expect(pickGuestMarket(two, undefined, null)?.code).toBe('sy');
  });

  it('is null when the config has no markets (old server, empty cache)', () => {
    expect(pickGuestMarket(undefined, undefined, 'SY')).toBeNull();
  });
});
