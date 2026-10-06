import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, Notice } from '@/shared/ui';
import { MediaKitCard } from '@/domains/identity';
import { useCreatorHomeScreen } from './hooks/useCreatorHomeScreen';
import { CreatorHomeHero } from './components/CreatorHomeHero';
import { ProfileStrengthCard } from './components/ProfileStrengthCard';
import { PlatformsStrip } from './components/PlatformsStrip';
import { RatesCard } from './components/RatesCard';

/**
 * Creator dashboard: greeting, the one blocker, the media kit (Share is the screen's
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
      header={{
        title: t('tabs.home'),
        variant: 'brand',
        showBackButton: false,
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
      hero={<CreatorHomeHero hero={vm.hero} onOpenProfile={vm.openProfile} />}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.interactive.main}
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
          <MediaKitCard
            {...vm.mediaKit}
            onOpenInsights={vm.openInsights}
            onOpenPreview={vm.openPreview}
          />
        </Box>

        {vm.completion.isVisible ? (
          <Box px="xl">
            <ProfileStrengthCard completion={vm.completion} onStepPress={vm.onStepPress} />
          </Box>
        ) : null}

        <PlatformsStrip
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
