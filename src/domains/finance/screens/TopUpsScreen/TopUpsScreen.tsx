import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Plus } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Layout, SuperList, Text } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { WalletDayGroupSkeleton } from '../../components';
import { TopUpDayGroup } from './components/TopUpDayGroup';
import { TopUpStatusChips } from './components/TopUpStatusChips';
import { useTopUpsScreen, type TopUpsItem } from './hooks/useTopUpsScreen';

const LOADING_DAY_ROWS = [2, 3, 1] as const;
const MORE_ROWS = 2;

const keyExtractor = (item: TopUpsItem) => item.key;

const TopUpsSkeleton = memo(() => (
  <Box gap="2xl">
    {LOADING_DAY_ROWS.map((rows, index) => (
      <WalletDayGroupSkeleton key={index} rows={rows} />
    ))}
  </Box>
));

const TopUpsEnd = memo(() => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Text variant="caption" color={colors.text.tertiary} align="center">
      {t('finance.topUp.history.end')}
    </Text>
  );
});

/** Top-up history (List archetype): status chips pinned under the header, requests by day. */
const TopUpsScreenComponent: React.FC = () => {
  const onScroll = useJSScrollHandler();
  const vm = useTopUpsScreen();
  useHideBottomBar();

  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing['5xl'] },
  }));

  const { openTopUp } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TopUpsItem>) => {
      switch (item.kind) {
        case 'day':
          return <TopUpDayGroup day={item.day} onPressTopUp={openTopUp} />;
        case 'more':
          return <WalletDayGroupSkeleton rows={MORE_ROWS} />;
        case 'end':
          return <TopUpsEnd />;
        default: {
          const _exhaustive: never = item;
          return _exhaustive;
        }
      }
    },
    [openTopUp],
  );

  return (
    <Layout
      mode="static"
      padding="none"
      header={{
        title: vm.title,
        actions: [{ icon: Plus, accessibilityLabel: vm.newLabel, onPress: vm.newTopUp }],
      }}
    >
      <TopUpStatusChips chips={vm.chips} selected={vm.selectedStatus} onSelect={vm.onSelectStatus} />
      <SuperList
        data={vm.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={vm.isLoading}
        isError={vm.isError}
        isRefreshing={vm.isRefreshing}
        hasNextPage={vm.hasNextPage}
        onEndReached={vm.onEndReached}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyMessage={vm.emptyMessage}
        emptyDescription={vm.emptyDescription}
        emptyAction={vm.emptyAction}
        emptyIcon={vm.emptyIcon}
        ListSkeletonComponent={<TopUpsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const TopUpsScreen = memo(TopUpsScreenComponent);
