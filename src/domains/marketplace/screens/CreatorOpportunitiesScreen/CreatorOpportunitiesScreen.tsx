import React, { memo, useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { Bookmark, ClipboardList, Radar } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, EmptyState, Layout, SuperList } from '@/shared/ui';
import type { EmptyStateAction } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { OpportunitiesHeader } from '../../components/OpportunitiesHeader';
import { OpportunitiesSkeleton } from '../../components/OpportunitiesSkeleton';
import { OpportunityCard } from '../../components/OpportunityCard';
import { OpportunityEmptyRules } from '../../components/OpportunityEmptyRules';
import { OpportunityFilterChips } from '../../components/OpportunityFilterChips';
import { OpportunityFilterSheet } from '../../components/OpportunityFilterSheet';
import type { CreatorCampaign } from '../../types/campaign';
import { useCreatorOpportunitiesScreen } from './hooks/useCreatorOpportunitiesScreen';

const keyExtractor = (campaign: CreatorCampaign) => campaign.id;

/**
 * Creator `OpportunitiesTab` root (PC4.0, approved 2026-10-17): the capsule switches between the
 * ranked feed, the saved ones and my applications; the feed is tickets that lead with what the
 * creator would take home. Saved and applications land in PC4.2 / PC5.2.
 */
const CreatorOpportunitiesScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useCreatorOpportunitiesScreen();
  const { openCampaign, toggleBookmark, activeFilters } = vm;
  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing['7xl'] * 1.5 },
    item: { paddingBottom: spacing.lg },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CreatorCampaign>) => (
      <Box style={styles.item}>
        <OpportunityCard campaign={item} onPress={openCampaign} onToggleBookmark={toggleBookmark} />
      </Box>
    ),
    [openCampaign, styles.item, toggleBookmark],
  );

  const emptyAction = useMemo<EmptyStateAction>(
    () => ({ label: vm.emptyActionLabel, onPress: activeFilters > 0 ? vm.clearFilters : vm.openProfile }),
    [activeFilters, vm.clearFilters, vm.emptyActionLabel, vm.openProfile],
  );

  return (
    <Layout
      mode="static"
      padding="none"
      header={
        <OpportunitiesHeader
          segment={vm.segment}
          onSegment={vm.setSegment}
          subtitle={vm.subtitle}
          onFilters={vm.onFeed ? vm.sheet.open : null}
          activeFilters={activeFilters}
        />
      }
    >
      {vm.onFeed ? (
        <>
          <OpportunityFilterChips
            activityLabel={vm.activityLabel}
            activitySelected={(vm.filters.activityTypes ?? []).length > 0}
            pricingModel={vm.filters.pricingModel ?? null}
            onOpenSheet={vm.sheet.open}
            onPricing={vm.pickPricing}
          />
          <SuperList
            data={vm.campaigns}
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
            emptyIcon={Radar}
            emptyMessage={vm.emptyTitle}
            emptyDescription={vm.emptyHint}
            emptyContent={activeFilters > 0 ? undefined : <OpportunityEmptyRules />}
            emptyAction={emptyAction}
            errorMessage={t('marketplace.campaign.feed.loadFailed')}
            ListSkeletonComponent={<OpportunitiesSkeleton />}
            contentContainerStyle={styles.list}
            onScroll={onScroll}
          />
        </>
      ) : (
        <EmptyState
          icon={vm.segment === 'saved' ? Bookmark : ClipboardList}
          title={t('tabs.comingSoon.title')}
          message={t('tabs.comingSoon.message')}
        />
      )}
      <OpportunityFilterSheet
        visible={vm.sheet.visible}
        onClose={vm.sheet.close}
        filters={vm.filters}
        activityOptions={vm.activityOptions}
        activityLoading={vm.activityLoading}
        activityFailed={vm.activityFailed}
        onRetryActivities={vm.retryActivities}
        onApply={vm.sheet.apply}
      />
    </Layout>
  );
};

export const CreatorOpportunitiesScreen = memo(CreatorOpportunitiesScreenComponent);
