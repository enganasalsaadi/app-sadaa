import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, Heart } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout } from '@/shared/ui';
import { useBrandHomeScreen } from './hooks/useBrandHomeScreen';
import { BrandHomeBar } from './components/BrandHomeBar';
import { BrandHomeHero } from './components/BrandHomeHero';
import { BrandHomeRails } from './components/BrandHomeRails';
import { ExploreEntry } from './components/ExploreEntry';

/**
 * Brand dashboard (v4 "Navy Trust, live"): navy hero with drifting lights (company, the
 * wallet strip with its eye, the server's one blocker as a live island) behind a transparent
 * header that pins the company once the hero scrolls away. Then the server's creator rails
 * rise in one by one, closed by the help card. Search, category chips and each rail's
 * "See all" open Explore; the ❤️ beside the bell opens the Shortlist.
 */
const BrandHomeScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useBrandHomeScreen();

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
          <BrandHomeBar companyName={vm.hero.companyName} onOpenProfile={vm.openProfile} />
        ),
        actions: [
          {
            icon: Heart,
            accessibilityLabel: t('marketplace.shortlist.open'),
            onPress: vm.openShortlist,
          },
          {
            icon: Bell,
            accessibilityLabel: vm.unreadNotifications
              ? t('notifications.inbox.openUnread', { count: vm.unreadNotifications })
              : t('notifications.inbox.title'),
            badge: vm.unreadNotifications,
            onPress: vm.openNotifications,
          },
        ],
      }}
      hero={
        <BrandHomeHero
          hero={vm.hero}
          island={vm.island}
          hidden={vm.hidden}
          onToggleHidden={vm.toggleHidden}
          onOpenWallet={vm.openWallet}
          onOpenProfile={vm.openProfile}
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
      <Box pt="xl" pb="5xl" gap="2xl">
        <ExploreEntry
          openSearch={vm.openSearch}
          categories={vm.categories}
          categoriesLoading={vm.categoriesLoading}
          openCategory={vm.openCategory}
        />
        <BrandHomeRails
          status={vm.status}
          rails={vm.rails}
          hasSupport={vm.hasSupport}
          retry={vm.retry}
          openCreator={vm.openCreator}
          toggleShortlist={vm.toggleShortlist}
          contactSupport={vm.contactSupport}
          openRail={vm.openRail}
          browseAll={vm.browseAll}
        />
      </Box>
    </Layout>
  );
};

export const BrandHomeScreen = memo(BrandHomeScreenComponent);
