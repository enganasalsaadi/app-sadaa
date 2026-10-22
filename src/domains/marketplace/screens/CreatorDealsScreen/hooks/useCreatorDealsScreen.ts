import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import type { DealsStackScreenProps } from '@/core/navigation';
import { useGetDealStrikesQuery } from '../../../api/dealUpsellApi';
import {
  CREATOR_DEAL_TABS,
  CREATOR_DEAL_TAB_DEF,
  type CreatorDealTab,
} from '../../../constants/dealList';
import { useDealsList } from '../../../hooks/useDealsList';

const TURN_TABS: readonly CreatorDealTab[] = ['new', 'active'];

type Route = DealsStackScreenProps<'Deals'>['route'];

/**
 * Creator «Deals» tab: new offers, ongoing, closed; «your turn» over the first two. Live strikes
 * show a warning on top (the `DealStrikes` tag refetches them with every deal move and strike push);
 * a failed read just leaves it out.
 */
export const useCreatorDealsScreen = () => {
  const { t } = useTranslation();
  const list = useDealsList({
    role: 'creator',
    tabs: CREATOR_DEAL_TABS,
    defs: CREATOR_DEAL_TAB_DEF,
    turnTabs: TURN_TABS,
  });
  const newOffers = list.countOf('new');
  const { data: strikes } = useGetDealStrikesQuery();
  const { navigation, setTab } = list;
  const requestedTab = useRoute<Route>().params?.tab;
  // The tab stays mounted, so a Home tile asking for a tab arrives as a param change;
  // it is cleared once applied so the same tile works again after the creator moved on.
  useEffect(() => {
    if (!requestedTab) return;
    setTab(requestedTab);
    navigation.setParams({ tab: undefined });
  }, [navigation, requestedTab, setTab]);
  const openStrikes = useCallback(() => navigation.navigate('Strikes'), [navigation]);

  return {
    ...list,
    title: t('tabs.deals'),
    subtitle:
      newOffers > 0
        ? t('marketplace.deals.newOffers', { count: newOffers })
        : t('marketplace.deals.activeCount', { count: list.activeCount }),
    showTurn: list.tab !== 'closed' && list.turn.length > 0,
    emptyAction: undefined,
    strikes: strikes ?? null,
    openStrikes,
  };
};
