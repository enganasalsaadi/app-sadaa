import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, StaggerIn } from '@/shared/ui';
import { useCreatorHomeScreen } from './hooks/useCreatorHomeScreen';
import { AudienceSection } from './components/AudienceSection';
import { CreatorHomeBar } from './components/CreatorHomeBar';
import { EscrowLine } from './components/EscrowLine';
import { HomeDeals } from './components/HomeDeals';
import { PriceTagsSection } from './components/PriceTagsSection';
import { ReadinessSection } from './components/ReadinessSection';
import { ShareBar } from './components/ShareBar';
import { StorefrontHero } from './components/StorefrontHero';
import { WatchGrid } from './components/WatchGrid';

/**
 * Creator dashboard «الواجهة» (approved 2026-10-13): Home is the creator's storefront as
 * brands meet it. Navy hero with drifting lights (only the tilted pass and the one blocker
 * hanging from it as a sign) behind a transparent header that pins the identity once the
 * hero scrolls away; the body slides over it as a sheet. Then, rising in one by one and
 * always present (each has its own empty state): «your turn» (the deals waiting on the creator;
 * leaves only if its read fails) with the money held for them and a KYC nudge under it, who's looking in the last 30 days with the share bar, how ready
 * the storefront is, the audience by platform and the price tags. Sections without an API (wallet)
 * stay out until it exists.
 */
const CreatorHomeScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useCreatorHomeScreen();

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
        leading: <CreatorHomeBar hero={vm.hero} onOpenProfile={vm.openProfile} />,
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
          notice={vm.notice}
          kpis={vm.kpis}
          platforms={vm.platforms}
          mediaKit={vm.mediaKit}
          onOpenPreview={vm.openPreview}
          onAddPhoto={vm.openAvatar}
          onLinkPlatform={vm.openPlatforms}
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
      <Box pt="2xl" pb="5xl">
        <StaggerIn gap="3xl">
          {vm.homeDeals.deals.kind !== 'hidden' ? (
            <HomeDeals homeDeals={vm.homeDeals} openRates={vm.openRates} openPlatforms={vm.openPlatforms} />
          ) : null}
          {vm.walletGlance.escrow || vm.walletGlance.kycNudge ? (
            <EscrowLine
              glance={vm.walletGlance}
              hidden={vm.amountsHidden}
              onOpenWallet={vm.openWallet}
              onOpenKyc={vm.openKyc}
            />
          ) : null}
          <Box px="xl" gap="lg">
            <WatchGrid kpis={vm.kpis} onOpenInsights={vm.openInsights} />
            <ShareBar mediaKit={vm.mediaKit} onOpenPreview={vm.openPreview} />
          </Box>
          <Box px="xl">
            <ReadinessSection completion={vm.completion} onStepPress={vm.onStepPress} />
          </Box>
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
