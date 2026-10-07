import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, Notice } from '@/shared/ui';
import { MediaKitCard } from '@/domains/identity';
import { useCreatorHomeScreen } from './hooks/useCreatorHomeScreen';
import { CreatorHomeBar } from './components/CreatorHomeBar';
import { CreatorHomeHero } from './components/CreatorHomeHero';
import { ProfileStrengthCard } from './components/ProfileStrengthCard';
import { PlatformsSection } from './components/PlatformsSection';
import { RatesCard } from './components/RatesCard';

/**
 * Creator dashboard: navy hero (identity + 30-day KPIs, tap → Insights) behind a
 * transparent header that pins the creator's identity once the hero scrolls away, then the one blocker, the media kit (Share is the screen's
 * only primary), profile strength, platforms and prices. Sections without an API
 * (wallet, offers, deals) stay out until the API exists (plan §Decisions).
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
      <Box gap="2xl" pt="xl" pb="5xl">
        {vm.notice ? (
          <Box px="xl">
            <Notice
              key={vm.notice.key}
              tone={vm.notice.tone}
              title={vm.notice.title}
              message={vm.notice.message}
              action={vm.notice.action}
            />
          </Box>
        ) : null}

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
      </Box>
    </Layout>
  );
};

export const CreatorHomeScreen = memo(CreatorHomeScreenComponent);
