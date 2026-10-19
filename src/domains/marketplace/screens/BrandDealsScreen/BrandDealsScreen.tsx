import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { motion } from '@/core/theme';
import { Layout } from '@/shared/ui';
import { DealsHubHeader } from '../../components/DealsHubHeader';
import { BrandCampaignsList } from './components/BrandCampaignsList';
import { BrandDealRequestsList } from './components/BrandDealRequestsList';
import { useBrandDealsRoot } from './hooks/useBrandDealsRoot';

const FILL: ViewStyle = { flex: 1 };

/**
 * Brand deals tab (approved 2026-10-18): one page, two levels. The pill picks the face (public
 * campaigns | direct requests), the chips under it filter that face with their counts, and the
 * cards below swap softly when either changes. Each face remembers its own chip.
 */
const BrandDealsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { face, setFace, faces, campaigns, deals, onRefresh } =
    useBrandDealsRoot();
  const common = {
    title: t('tabs.deals'),
    faces,
    face,
    onFace: setFace,
    onGuide: deals.openGuide,
  };

  return (
    <Layout
      padding="none"
      header={
        face === 'campaigns' ? (
          <DealsHubHeader
            {...common}
            newLabel={t('marketplace.deals.newCampaign')}
            onNew={campaigns.openNewCampaign}
            filters={campaigns.options}
            filter={campaigns.filter}
            onFilter={campaigns.setFilter}
            filtersLabel={t('marketplace.campaign.list.tabsLabel')}
          />
        ) : (
          <DealsHubHeader
            {...common}
            newLabel={t('marketplace.hub.newRequest')}
            onNew={deals.openExplore}
            filters={deals.options}
            filter={deals.filter}
            onFilter={deals.setFilter}
            filtersLabel={t('marketplace.deals.tabsLabel')}
          />
        )
      }
    >
      <Animated.View
        key={`${face}:${
          face === 'campaigns' ? campaigns.filter : deals.filter
        }`}
        entering={
          reduceMotion ? undefined : FadeIn.duration(motion.duration.base)
        }
        style={FILL}
      >
        {face === 'campaigns' ? (
          <BrandCampaignsList list={campaigns} onRefresh={onRefresh} />
        ) : (
          <BrandDealRequestsList list={deals} onRefresh={onRefresh} />
        )}
      </Animated.View>
    </Layout>
  );
};

export const BrandDealsScreen = memo(BrandDealsScreenComponent);
