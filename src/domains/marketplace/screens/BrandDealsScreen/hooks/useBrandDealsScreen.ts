import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate } from '@/core/navigation';
import {
  BRAND_DEAL_TABS,
  BRAND_DEAL_TAB_DEF,
  type BrandDealTab,
} from '../../../constants/dealList';
import { useCampaignsEnabled } from '../../../hooks/useCampaignsEnabled';
import { useDealsList } from '../../../hooks/useDealsList';

const TURN_TABS: readonly BrandDealTab[] = ['active'];

/** Brand «Campaigns» tab: active (with «your turn»), drafts, closed. Empty active → Explore. */
export const useBrandDealsScreen = () => {
  const { t } = useTranslation();
  const list = useDealsList({
    role: 'brand',
    tabs: BRAND_DEAL_TABS,
    defs: BRAND_DEAL_TAB_DEF,
    turnTabs: TURN_TABS,
  });
  const { navigation, tab } = list;
  const campaignsEnabled = useCampaignsEnabled('brand') === true;

  const openExplore = useCallback(
    () =>
      navigation.navigate('HomeTab', { screen: 'Explore', params: undefined }),
    [navigation],
  );
  const openNewCampaign = useCallback(() => navigate('CampaignWizard'), []);
  const emptyAction = useMemo(
    () =>
      tab === 'active'
        ? { label: t('marketplace.deals.empty.explore'), onPress: openExplore }
        : undefined,
    [openExplore, t, tab],
  );

  return {
    ...list,
    title: t('tabs.campaigns'),
    subtitle: t('marketplace.deals.activeCount', { count: list.activeCount }),
    showTurn: tab === 'active' && list.turn.length > 0,
    openNewCampaign: campaignsEnabled ? openNewCampaign : undefined,
    emptyAction,
  };
};
