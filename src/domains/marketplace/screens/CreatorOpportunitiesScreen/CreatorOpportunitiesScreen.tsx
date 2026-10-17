import React, { memo, useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { Bookmark, Radar } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, Layout, SuperList } from '@/shared/ui';
import type { EmptyStateAction } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { OpportunitiesHeader } from '../../components/OpportunitiesHeader';
import { OpportunitiesSkeleton } from '../../components/OpportunitiesSkeleton';
import { OpportunityCard } from '../../components/OpportunityCard';
import { OpportunityEmptyRules } from '../../components/OpportunityEmptyRules';
import { OpportunityFilterChips } from '../../components/OpportunityFilterChips';
import { OpportunityFilterSheet } from '../../components/OpportunityFilterSheet';
import type { CreatorCampaign } from '../../types/campaign';
import { MyApplicationsView } from './components/MyApplicationsView';
import { useCreatorOpportunitiesScreen } from './hooks/useCreatorOpportunitiesScreen';

const keyExtractor = (campaign: CreatorCampaign) => campaign.id;

/**
 * Creator `OpportunitiesTab` root (PC4.0, approved 2026-10-17): the capsule switches between the
 * ranked feed, the saved ones and my applications; the feed is tickets that lead with what the
 * creator would take home. Saved shares the same tickets (PC4.2); my applications (PC5.2) are their
 * own cards with the brand's 72 h clock, the deal once selected, and the withdraw.
 */
const CreatorOpportunitiesScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useCreatorOpportunitiesScreen();
  const { openCampaign, toggleBookmark, openPersonalInfo, activeFilters } = vm;
  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing['7xl'] * 1.5 },
    item: { paddingBottom: spacing.lg },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CreatorCampaign>) => (
      <Box style={styles.item}>
        <OpportunityCard
          campaign={item}
          onPress={openCampaign}
          onToggleBookmark={toggleBookmark}
          onFillGender={openPersonalInfo}
        />
      </Box>
    ),
    [openCampaign, openPersonalInfo, styles.item, toggleBookmark],
  );

  const emptyAction = useMemo<EmptyStateAction>(
    () => ({ label: vm.emptyActionLabel, onPress: vm.onEmptyAction }),
    [vm.emptyActionLabel, vm.onEmptyAction],
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
      {vm.onList ? (
        <>
          {vm.onFeed ? (
            <OpportunityFilterChips
              activityLabel={vm.activityLabel}
              activitySelected={(vm.filters.activityTypes ?? []).length > 0}
              pricingModel={vm.filters.pricingModel ?? null}
              onOpenSheet={vm.sheet.open}
              onPricing={vm.pickPricing}
            />
          ) : null}
          <SuperList
            key={vm.segment}
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
            emptyIcon={vm.onFeed ? Radar : Bookmark}
            emptyMessage={vm.emptyTitle}
            emptyDescription={vm.emptyHint}
            emptyContent={vm.onFeed && activeFilters === 0 ? <OpportunityEmptyRules /> : undefined}
            emptyAction={emptyAction}
            errorMessage={t(vm.onFeed ? 'marketplace.campaign.feed.loadFailed' : 'marketplace.campaign.feed.savedLoadFailed')}
            ListSkeletonComponent={<OpportunitiesSkeleton />}
            contentContainerStyle={styles.list}
            onScroll={onScroll}
          />
        </>
      ) : (
        <MyApplicationsView applications={vm.applications} />
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
