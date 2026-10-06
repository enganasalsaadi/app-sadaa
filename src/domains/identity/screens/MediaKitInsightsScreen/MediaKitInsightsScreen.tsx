import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  Box,
  ErrorState,
  Layout,
  LayoutFooter,
  SegmentedControl,
} from '@/shared/ui';
import { MediaKitShareNotice } from '../../components/MediaKitCard/MediaKitShareNotice';
import { useMediaKitInsightsScreen } from './hooks/useMediaKitInsightsScreen';
import { BrandLocationsCard } from './components/BrandLocationsCard';
import { DailyViewsCard } from './components/DailyViewsCard';
import { InsightsStatsGrid } from './components/InsightsStatsGrid';
import { TopWorkCard } from './components/TopWorkCard';

/**
 * Media kit stats per period (Detail archetype, plan §Screens): period switch,
 * metric tiles vs the previous period, daily views, brand cities, top work.
 * Sections whose data is empty stay hidden (§17.7); Share is the one primary.
 */
const MediaKitInsightsScreenComponent: React.FC = () => {
  useHideBottomBar();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useMediaKitInsightsScreen();
  const { share } = vm;

  return (
    <Layout
      header={{ title: t('account.mediaKit.insightsScreen.title') }}
      sticky={
        <Box px="xl" py="sm" bg={colors.layout.base}>
          <SegmentedControl
            options={vm.periodOptions}
            value={vm.period}
            onChange={vm.onPeriodChange}
            accessibilityLabel={t(
              'account.mediaKit.insightsScreen.periodLabel',
            )}
          />
        </Box>
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.interactive.main}
          />
        ),
      }}
      footer={
        <LayoutFooter
          top={
            share.error ? (
              <MediaKitShareNotice
                error={share.error}
                canRetry={share.canRetry}
                onMakePublic={share.onMakePublic}
                onRetry={share.onRetry}
                onDismiss={share.onDismissError}
              />
            ) : undefined
          }
          primary={{
            label: t('account.mediaKit.share.cta'),
            onPress: share.onShare,
            loading: share.isSharing,
            disabled: !share.isReady || share.isMakingPublic,
          }}
        />
      }
    >
      {vm.status === 'error' ? (
        <ErrorState
          title={t('account.mediaKit.insightsScreen.loadFailed')}
          error={vm.error}
          onRetry={vm.onRetry}
        />
      ) : (
        <Box gap="2xl">
          <InsightsStatsGrid
            loading={vm.status === 'loading'}
            rows={vm.tileRows}
            rangeLabel={vm.rangeLabel}
            compareLabel={vm.compareLabel}
            noActivity={vm.noActivity}
          />
          {vm.dailyViews ? (
            <DailyViewsCard
              values={vm.dailyViews.values}
              accessibilityLabel={vm.dailyViews.accessibilityLabel}
            />
          ) : null}
          {vm.locations.length > 0 ? (
            <BrandLocationsCard rows={vm.locations} />
          ) : null}
          {vm.topWork.length > 0 ? <TopWorkCard items={vm.topWork} /> : null}
        </Box>
      )}
    </Layout>
  );
};

export const MediaKitInsightsScreen = memo(MediaKitInsightsScreenComponent);
