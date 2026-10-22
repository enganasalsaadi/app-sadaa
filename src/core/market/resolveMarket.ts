import type { MarketSummary } from './marketTypes';

/**
 * Market a signed-out user starts in: the active one matching the device region,
 * else the server's default, else the first active. Only a form prefill — the real
 * market is decided by the server from the phone number (store policy).
 */
export const pickGuestMarket = (
  markets: readonly MarketSummary[] | undefined,
  defaultMarket: string | undefined,
  deviceRegion: string | null,
): MarketSummary | null => {
  const active = (markets ?? []).filter(market => market.status === 'active');
  return (
    active.find(market => market.countryCode === deviceRegion) ??
    active.find(market => market.code === defaultMarket) ??
    active[0] ??
    null
  );
};
