import React, { memo, useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, SuperList, type EmptyStateAction } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { DealTicket } from '../../../components/DealTicket';
import { DealTicketsSkeleton } from '../../../components/DealTicketsSkeleton';
import type { useBrandDeals } from '../../../hooks/useBrandDeals';
import type { Deal } from '../../../types';

const keyExtractor = (deal: Deal) => deal.id;

/** The filters that send the brand to Explore when they are empty. */
const OFFERS_EXPLORE = ['all', 'waiting', 'ongoing', 'drafts'];

export interface BrandDealRequestsListProps {
  list: ReturnType<typeof useBrandDeals>;
  /** Refreshes the whole hub, not just this face. */
  onRefresh: () => Promise<void>;
}

/** The direct requests face: every deal as the ticket the deal board uses, so the journey reads the same everywhere. */
const BrandDealRequestsListComponent: React.FC<BrandDealRequestsListProps> = ({
  list,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const { filter, openDeal, openExplore } = list;
  const styles = useStyles(({ spacing }) => ({
    list: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing['7xl'] * 1.5,
    },
    item: { paddingBottom: spacing.md },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Deal>) => (
      <Box style={styles.item}>
        <DealTicket deal={item} role="brand" onPress={openDeal} />
      </Box>
    ),
    [openDeal, styles.item],
  );

  const emptyAction: EmptyStateAction | undefined = useMemo(
    () =>
      OFFERS_EXPLORE.includes(filter)
        ? { label: t('marketplace.deals.empty.explore'), onPress: openExplore }
        : undefined,
    [filter, openExplore, t],
  );

  return (
    <SuperList
      data={list.deals}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      isLoading={list.isLoading}
      isError={list.isError}
      isRefreshing={list.isRefreshing}
      isFetchingNextPage={list.isFetchingNextPage}
      hasNextPage={list.hasNextPage}
      onEndReached={list.onEndReached}
      onRefresh={onRefresh}
      onRetry={list.onRetry}
      emptyIcon={Send}
      emptyMessage={list.emptyTitle}
      emptyDescription={list.emptyHint}
      emptyAction={emptyAction}
      errorMessage={t('marketplace.deals.loadFailed')}
      ListSkeletonComponent={<DealTicketsSkeleton />}
      contentContainerStyle={styles.list}
      onScroll={onScroll}
    />
  );
};

export const BrandDealRequestsList = memo(BrandDealRequestsListComponent);
