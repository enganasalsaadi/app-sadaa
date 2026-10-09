import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Eye, EyeOff } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Layout, SuperList, Text } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { WalletDayGroup, WalletDayGroupSkeleton } from '../../components';
import type { WalletRole } from '../../types';
import { StatementFilters } from './components/StatementFilters';
import { StatementPeriodSheet } from './components/StatementPeriodSheet';
import { useStatementScreen, type StatementItem } from './hooks/useStatementScreen';

const LOADING_DAY_ROWS = [2, 3, 1] as const;
const MORE_ROWS = 2;

const keyExtractor = (item: StatementItem) => item.key;

interface StatementScreenProps {
  /** Picked by the role's wallet navigator (rule 01): sets the type chips. */
  role: WalletRole;
}

const StatementSkeleton = memo(() => (
  <Box gap="2xl">
    {LOADING_DAY_ROWS.map((rows, index) => (
      <WalletDayGroupSkeleton key={index} rows={rows} />
    ))}
  </Box>
));

const StatementCount = memo<{ label: string }>(({ label }) => {
  const { colors } = useTheme();
  return (
    <Text variant="caption" color={colors.text.tertiary} pb="md">
      {label}
    </Text>
  );
});

const StatementEnd = memo(() => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Text variant="caption" color={colors.text.tertiary} align="center">
      {t('finance.statement.end')}
    </Text>
  );
});

/**
 * Statement (List archetype, rule 09): filters pinned under a solid header, then the
 * lines grouped by day, one card per day, loading more as the user nears the end.
 * The eye hides amounts here and on the wallet tab alike.
 */
const StatementScreenComponent: React.FC<StatementScreenProps> = ({ role }) => {
  const onScroll = useJSScrollHandler();
  const vm = useStatementScreen(role);
  useHideBottomBar();

  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing['5xl'] },
  }));

  const { hidden, openReceipt } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<StatementItem>) => {
      switch (item.kind) {
        case 'day':
          return <WalletDayGroup day={item.day} hidden={hidden} onPressLine={openReceipt} />;
        case 'more':
          return <WalletDayGroupSkeleton rows={MORE_ROWS} />;
        case 'end':
          return <StatementEnd />;
        default: {
          const _exhaustive: never = item;
          return _exhaustive;
        }
      }
    },
    [hidden, openReceipt],
  );

  return (
    <Layout
      mode="static"
      padding="none"
      header={{
        title: vm.title,
        actions: [
          {
            icon: vm.hidden ? EyeOff : Eye,
            accessibilityLabel: vm.hiddenLabel,
            onPress: vm.toggleHidden,
          },
        ],
      }}
    >
      <StatementFilters
        periodLabel={vm.periodLabel}
        periodSet={vm.periodSet}
        onOpenPeriod={vm.openPeriodSheet}
        onClearPeriod={vm.clearPeriod}
        typeChips={vm.typeChips}
        selectedType={vm.selectedType}
        onSelectType={vm.onSelectType}
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
        ListHeaderComponent={vm.countLabel ? <StatementCount label={vm.countLabel} /> : null}
        ListSkeletonComponent={<StatementSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <StatementPeriodSheet
        visible={vm.sheetVisible}
        onClose={vm.closePeriodSheet}
        options={vm.periodOptions}
        value={vm.periodOption}
        onSelect={vm.onSelectPeriod}
        customSelected={vm.customSelected}
        customLabel={vm.customLabel}
        customSpan={vm.customSpan}
        onConfirmCustom={vm.onConfirmCustom}
      />
    </Layout>
  );
};

export const StatementScreen = memo(StatementScreenComponent);
