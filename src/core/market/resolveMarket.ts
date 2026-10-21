import type { CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY, getDeviceRegion } from '@/core/config';
import { readCachedAppConfig } from '@/core/api/configCache';
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

/** Country a phone input opens on: from the cached `/config`, never waits for the network. */
export const resolveInitialPhoneCountry = (): CountryCode => {
  const config = readCachedAppConfig();
  return (
    pickGuestMarket(config?.markets, config?.defaultMarket, getDeviceRegion())?.countryCode ??
    DEFAULT_PHONE_COUNTRY
  );
};
