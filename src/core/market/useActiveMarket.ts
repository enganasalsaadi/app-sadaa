import { useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { getDeviceRegion } from '@/core/config';
import { useGetConfigQuery } from '@/core/api/configApi';
import { readCachedAppConfig } from '@/core/api/configCache';
import { useAppSelector } from '@/core/store';
import { useGetMarketQuery } from './marketApi';
import { pickGuestMarket } from './resolveMarket';

/** The signed-in user's market slug (`/me` → `market.code`), else the guest pick, else `undefined`. */
export const useActiveMarketCode = (): string | undefined => {
  const userMarketCode = useAppSelector(state => state.auth.user?.market?.code);
  const { data } = useGetConfigQuery();
  return useMemo(() => {
    if (userMarketCode) {
      return userMarketCode;
    }
    const config = data ?? readCachedAppConfig();
    return (
      pickGuestMarket(config?.markets, config?.defaultMarket, getDeviceRegion())?.code ??
      config?.defaultMarket
    );
  }, [data, userMarketCode]);
};

/** Full rules (limits, channels, couriers, governorates) of the active market; cached for the session. */
export const useActiveMarket = () => {
  const code = useActiveMarketCode();
  const { data, isLoading, isError, refetch } = useGetMarketQuery(code ?? skipToken);
  return { market: data, isLoading, isError, refetch };
};
