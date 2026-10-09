import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Layout, SuperList, Text } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { WalletDayGroupSkeleton } from '../../components';
import { StatusFilterChips } from '../../components/StatusFilterChips';
import { WithdrawalDayGroup } from './components/WithdrawalDayGroup';
import { useWithdrawalsScreen, type WithdrawalsItem } from './hooks/useWithdrawalsScreen';

const LOADING_DAY_ROWS = [2, 3, 1] as const;
const MORE_ROWS = 2;

const keyExtractor = (item: WithdrawalsItem) => item.key;

const WithdrawalsSkeleton = memo(() => (
  <Box gap="2xl">
    {LOADING_DAY_ROWS.map((rows, index) => (
      <WalletDayGroupSkeleton key={index} rows={rows} />
    ))}
  </Box>
));

const WithdrawalsEnd = memo(() => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Text variant="caption" color={colors.text.tertiary} align="center">
      {t('finance.withdraw.history.end')}
    </Text>
  );
});

/** Withdrawal history (List archetype): status chips pinned under the header, requests by day. */
const WithdrawalsScreenComponent: React.FC = () => {
  const onScroll = useJSScrollHandler();
  const vm = useWithdrawalsScreen();
  useHideBottomBar();

  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing['5xl'] },
  }));

  const { openWithdrawal } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WithdrawalsItem>) => {
      switch (item.kind) {
        case 'day':
          return <WithdrawalDayGroup day={item.day} onPressWithdrawal={openWithdrawal} />;
        case 'more':
          return <WalletDayGroupSkeleton rows={MORE_ROWS} />;
        case 'end':
          return <WithdrawalsEnd />;
        default: {
          const _exhaustive: never = item;
          return _exhaustive;
        }
      }
    },
    [openWithdrawal],
  );

  return (
    <Layout mode="static" padding="none" header={{ title: vm.title }}>
      <StatusFilterChips
        chips={vm.chips}
        selected={vm.selectedStatus}
        onSelect={vm.onSelectStatus}
        accessibilityLabel={vm.filtersLabel}
      />
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
        ListSkeletonComponent={<WithdrawalsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const WithdrawalsScreen = memo(WithdrawalsScreenComponent);
