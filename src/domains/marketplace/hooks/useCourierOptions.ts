import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveMarket, type MarketCourier } from '@/core/market';
import type { ChipGroupItem } from '@/shared/ui';
import { DEAL_COURIER_OTHER } from '../constants/dealShipping';

export interface CourierOptions {
  /** The active market's catalog, for naming a code back. */
  couriers: readonly MarketCourier[];
  /** One chip per market courier, then «other» (always there: the catalog may be slow or empty). */
  items: readonly ChipGroupItem[];
}

/** The couriers a brand or creator can pick, from the market the account lives in. */
export const useCourierOptions = (): CourierOptions => {
  const { t } = useTranslation();
  const { market } = useActiveMarket();
  const couriers = market?.couriers;
  return useMemo(() => {
    const list = couriers ?? [];
    return {
      couriers: list,
      items: [
        ...list.map(courier => ({ value: courier.code, label: courier.name })),
        { value: DEAL_COURIER_OTHER, label: t('marketplace.deals.shipping.couriers.other') },
      ],
    };
  }, [couriers, t]);
};
