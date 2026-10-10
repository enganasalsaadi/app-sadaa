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
import { CategoryTiles } from './components/CategoryTiles';
import { WalletStrip } from './components/WalletStrip';

/**
 * Brand discover home (rule 09): a compact navy band with drifting lights (greeting + company,
 * search, the server's one blocker) behind a transparent header that pins the company once
 * the band scrolls away. Creators are the hero: category tiles, then the server's
 * photo-first rails rise in one by one with the wallet card after the first, closed by the
 * help card. Search, tiles and
 * each rail's "See all" open Explore; the ❤️ beside the bell opens the Shortlist.
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
          onOpenProfile={vm.openProfile}
          onOpenSearch={vm.openSearch}
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
      {/* `xl` top clears the sheet's rounded corners when the tiles scroll under them. */}
      <Box pt="xl" pb="5xl" gap="xl">
        <CategoryTiles
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
          wallet={
            <WalletStrip
              hero={vm.hero}
              hidden={vm.hidden}
              onToggleHidden={vm.toggleHidden}
              onOpenWallet={vm.openWallet}
              onTopUp={vm.openTopUp}
            />
          }
        />
      </Box>
    </Layout>
  );
};

export const BrandHomeScreen = memo(BrandHomeScreenComponent);
