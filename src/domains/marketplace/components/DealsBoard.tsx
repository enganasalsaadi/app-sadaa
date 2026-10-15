import React, { memo, useCallback } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import {
  Box,
  Layout,
  SuperList,
  type EmptyStateAction,
  type SegmentedOption,
} from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import type { Deal, DealRole } from '../types';
import { DealTicket } from './DealTicket';
import { DealTicketsSkeleton } from './DealTicketsSkeleton';
import { DealTurnStack } from './DealTurnStack';
import { DealsListHeader } from './DealsListHeader';

const keyExtractor = (deal: Deal) => deal.id;

export interface DealsBoardModel<T extends string> {
  role: DealRole;
  title: string;
  subtitle: string;
  tab: T;
  setTab: (tab: T) => void;
  options: readonly SegmentedOption<T>[];
  deals: Deal[];
  turn: Deal[];
  showTurn: boolean;
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onRetry: () => void;
  openDeal: (id: string) => void;
  openGuide: () => void;
  emptyTitle: string;
  emptyHint: string;
  emptyAction: EmptyStateAction | undefined;
}

export interface DealsBoardProps<T extends string> {
  vm: DealsBoardModel<T>;
  emptyIcon: LucideIcon;
  errorMessage: string;
}

/**
 * The deal board both roles' tab roots render («لوحة الدور», approved 2026-10-14): fixed title and
 * status tabs, then «your turn» passes and every deal of the tab as a ticket, loading on near the end.
 */
const DealsBoardComponent = <T extends string>({
  vm,
  emptyIcon,
  errorMessage,
}: DealsBoardProps<T>) => {
  const onScroll = useJSScrollHandler();
  const { role, openDeal } = vm;
  const styles = useStyles(({ spacing }) => ({
    list: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing['7xl'] * 1.5,
    },
    item: { paddingBottom: spacing.md },
    turn: { paddingBottom: spacing['2xl'] },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Deal>) => (
      <Box style={styles.item}>
        <DealTicket deal={item} role={role} onPress={openDeal} />
      </Box>
    ),
    [openDeal, role, styles.item],
  );

  return (
    <Layout
      mode="static"
      padding="none"
      header={
        <DealsListHeader
          title={vm.title}
          subtitle={vm.subtitle}
          options={vm.options}
          tab={vm.tab}
          onTab={vm.setTab}
          onGuide={vm.openGuide}
        />
      }
    >
      <SuperList
        key={vm.tab}
        data={vm.deals}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={vm.isLoading}
        isError={vm.isError}
        isRefreshing={vm.isRefreshing}
        isFetchingNextPage={vm.isFetchingNextPage}
        hasNextPage={vm.hasNextPage}
        onEndReached={vm.onEndReached}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyIcon={emptyIcon}
        emptyMessage={vm.emptyTitle}
        emptyDescription={vm.emptyHint}
        emptyAction={vm.emptyAction}
        errorMessage={errorMessage}
        ListHeaderComponent={
          vm.showTurn ? (
            <Box style={styles.turn}>
              <DealTurnStack deals={vm.turn} role={role} onPress={openDeal} />
            </Box>
          ) : null
        }
        ListSkeletonComponent={<DealTicketsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const DealsBoard = memo(
  DealsBoardComponent,
) as typeof DealsBoardComponent;
