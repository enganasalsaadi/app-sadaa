import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, StaggerIn } from '@/shared/ui';
import { useCreatorHomeScreen } from './hooks/useCreatorHomeScreen';
import { AudienceSection } from './components/AudienceSection';
import { CreatorHomeBar } from './components/CreatorHomeBar';
import { HomeCampaigns } from './components/HomeCampaigns';
import { HomeTasks } from './components/HomeTasks';
import { MoneyCard } from './components/MoneyCard';
import { PriceTagsSection } from './components/PriceTagsSection';
import { ReadinessSection } from './components/ReadinessSection';
import { RunningDeals } from './components/RunningDeals';
import { SadaMap } from './components/SadaMap';
import { StorefrontCard } from './components/StorefrontCard';
import { StorefrontHero } from './components/StorefrontHero';

/**
 * Creator dashboard (v3, approved 2026-10-22). Navy hero behind a transparent header: who the
 * creator is, their link (copy · preview · share) and the last 30 days; the body is a sheet with
 * rounded shoulders that never floats over it, and as it climbs the hero content sinks behind it
 * while the header pins identity, share and the bell. Then, rising in one by one and each with
 * its own empty state: the task deck (blocker, deals waiting, first-run steps), the Sada map with
 * any live strike, running deals, campaigns for you (only while Public Campaigns is on), money,
 * the storefront to brands, readiness, the audience and the price tags.
 */
const CreatorHomeScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useCreatorHomeScreen();
  const { share } = vm.mediaKit;

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandGlow"
      heroBehavior="parallax"
      header={{
        title: t('tabs.home'),
        variant: 'brand',
        showBackButton: false,
        leading: (
          <CreatorHomeBar
            hero={vm.hero}
            onOpenProfile={vm.openProfile}
            onShare={vm.mediaKit.isPublic ? share.onShare : null}
          />
        ),
        actions: [
          {
            icon: Bell,
            accessibilityLabel: vm.unreadNotifications
              ? t('notifications.inbox.openUnread', { count: vm.unreadNotifications })
              : t('notifications.inbox.title'),
            badge: vm.unreadNotifications,
            onPress: vm.openNotifications,
            glass: true,
          },
        ],
      }}
      hero={
        <StorefrontHero
          hero={vm.hero}
          kpis={vm.kpis}
          mediaKit={vm.mediaKit}
          onOpenProfile={vm.openProfile}
          onOpenPreview={vm.openPreview}
          onOpenInsights={vm.openInsights}
        />
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            // The spinner sits over the navy backdrop.
            tintColor={colors.text.onBrand}
          />
        ),
      }}
    >
      <Box pt="xl" pb="5xl">
        <StaggerIn gap="3xl">
          {vm.deck.kind !== 'none' ? (
            <HomeTasks
              deck={vm.deck}
              notice={vm.notice}
              onStepStage={vm.onStepStage}
              onOpenDeal={vm.homeDeals.openDeal}
            />
          ) : null}
          <SadaMap
            tiles={vm.mapTiles}
            strikes={vm.strikes}
            onOpenStrikes={vm.openStrikes}
            amountsHidden={vm.amountsHidden}
          />
          {vm.homeDeals.deals.kind !== 'hidden' ? (
            <RunningDeals
              deals={vm.homeDeals.deals}
              onOpenDeal={vm.homeDeals.openDeal}
              onOpenDeals={vm.homeDeals.openDeals}
              onSetRates={vm.openRates}
              onLinkPlatforms={vm.openPlatforms}
            />
          ) : null}
          {vm.homeCampaigns.campaigns.kind !== 'hidden' ? (
            <HomeCampaigns {...vm.homeCampaigns} openRates={vm.openRates} />
          ) : null}
          <MoneyCard
            glance={vm.walletGlance}
            hidden={vm.amountsHidden}
            onOpenWallet={vm.openWallet}
            onOpenKyc={vm.openKyc}
          />
          <StorefrontCard
            kpis={vm.kpis}
            mediaKit={vm.mediaKit}
            onOpenInsights={vm.openInsights}
            onOpenPreview={vm.openPreview}
          />
          <ReadinessSection completion={vm.completion} onStepPress={vm.onStepStage} />
          <Box px="xl">
            <AudienceSection platforms={vm.platforms} onOpenPlatform={vm.openPlatform} onManage={vm.openPlatforms} />
          </Box>
          <PriceTagsSection rates={vm.rates} onEdit={vm.openRates} />
        </StaggerIn>
      </Box>
    </Layout>
  );
};

export const CreatorHomeScreen = memo(CreatorHomeScreenComponent);
