import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, StaggerIn } from '@/shared/ui';
import { MediaKitCard } from '@/domains/identity';
import { useCreatorHomeScreen } from './hooks/useCreatorHomeScreen';
import { CreatorHomeBar } from './components/CreatorHomeBar';
import { CreatorHomeHero } from './components/CreatorHomeHero';
import { ProfileStrengthCard } from './components/ProfileStrengthCard';
import { PlatformsSection } from './components/PlatformsSection';
import { RatesCard } from './components/RatesCard';

/**
 * Creator dashboard (v4 "Navy Trust, live"): navy hero with drifting lights (identity,
 * the one blocker as a live island, 30-day KPIs → Insights) behind a transparent header
 * that pins the identity once the hero scrolls away. Then, rising in one by one: the
 * media kit (Share is the screen's only primary), profile strength, platforms and
 * prices. Sections without an API (wallet, offers, deals) stay out until it exists.
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
          },
        ],
      }}
      hero={
        <CreatorHomeHero
          hero={vm.hero}
          notice={vm.notice}
          kpis={vm.kpis}
          onOpenProfile={vm.openProfile}
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
        <StaggerIn gap="2xl">
          <Box px="xl">
            <MediaKitCard {...vm.mediaKit} onOpenPreview={vm.openPreview} />
          </Box>

          {vm.completion.isVisible ? (
            <Box px="xl">
              <ProfileStrengthCard completion={vm.completion} onStepPress={vm.onStepPress} />
            </Box>
          ) : null}

          <PlatformsSection
            platforms={vm.platforms}
            onOpenPlatform={vm.openPlatform}
            onManage={vm.openPlatforms}
          />

          <Box px="xl">
            <RatesCard rates={vm.rates} onEdit={vm.openRates} />
          </Box>
        </StaggerIn>
      </Box>
    </Layout>
  );
};

export const CreatorHomeScreen = memo(CreatorHomeScreenComponent);
