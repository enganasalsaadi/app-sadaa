import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useStyles } from '@/core/theme';
import { Box, Layout, Notice, SearchBar, SuperList } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { CreatorCard } from '../../components/CreatorCard';
import { CreatorRowsSkeleton } from '../../components/CreatorRowsSkeleton';
import { PriceLockSheet } from '../../components/PriceLockSheet';
import type { ExploreCreator } from '../../types/explore';
import { EXPLORE_QUERY_MAX } from '../../utils/exploreQuery';
import { ExploreFilterSheet } from './components/ExploreFilterSheet';
import { ExploreSortSheet } from './components/ExploreSortSheet';
import { ExploreToolbar } from './components/ExploreToolbar';
import { useExploreScreen, type ExploreScreenModel } from './hooks/useExploreScreen';

const keyExtractor = (creator: ExploreCreator) => creator.slug;

const LockBanner = memo<{ banner: NonNullable<ExploreScreenModel['lockBanner']> }>(({ banner }) => (
  <Box pb="md">
    <Notice tone="warning" message={banner.message} action={banner.action} />
  </Box>
));

/**
 * Explore (List archetype, rule 09): the search in the header, filter / sort / quick chips
 * pinned under it, then creator rows loading on as the brand nears the end (no total).
 * Pushed from Home: search, a category, or a rail's "See all".
 */
const ExploreScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useExploreScreen();
  useHideBottomBar();

  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing['5xl'] },
    item: { paddingBottom: spacing.md },
  }));

  const { openCreator, toggleShortlist } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ExploreCreator>) => (
      <Box style={styles.item}>
        <CreatorCard creator={item} onPress={openCreator} onToggleShortlist={toggleShortlist} />
      </Box>
    ),
    [openCreator, styles.item, toggleShortlist],
  );

  return (
    <Layout
      mode="static"
      padding="none"
      header={{
        title: t('marketplace.explore.title'),
        leading: (
          <SearchBar
            value={vm.search}
            onChangeText={vm.onChangeSearch}
            placeholder={t('marketplace.explore.searchPlaceholder')}
            autoFocus={vm.autoFocus}
            maxLength={EXPLORE_QUERY_MAX}
            loading={vm.isLoading}
          />
        ),
      }}
    >
      <ExploreToolbar
        filterCount={vm.filterCount}
        sortLabel={vm.sortLabel}
        sortSet={vm.sortSet}
        kycVerified={vm.kycVerified}
        rush={vm.rush}
        toggleQuick={vm.toggleQuick}
        categoryLabel={vm.categoryLabel}
        clearCategory={vm.clearCategory}
        openFilters={vm.openFilters}
        openSort={vm.openSort}
      />
      <SuperList
        data={vm.creators}
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
        emptyMessage={vm.emptyMessage}
        emptyDescription={vm.emptyDescription}
        emptyAction={vm.emptyAction}
        emptyIcon={vm.emptyIcon}
        errorMessage={t('marketplace.explore.loadFailed')}
        ListHeaderComponent={vm.lockBanner ? <LockBanner banner={vm.lockBanner} /> : null}
        ListSkeletonComponent={<CreatorRowsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <ExploreFilterSheet
        visible={vm.sheet === 'filters'}
        onClose={vm.closeSheet}
        onDismissed={vm.onSheetDismissed}
        filters={vm.filters}
        options={vm.options}
        optionsLoading={vm.optionsLoading}
        optionsError={vm.optionsError}
        onRetryOptions={vm.retryOptions}
        onApply={vm.applyDraft}
        priceLocked={vm.priceLocked}
        onLocked={vm.requestLock}
      />
      <ExploreSortSheet
        visible={vm.sheet === 'sort'}
        onClose={vm.closeSheet}
        onDismissed={vm.onSheetDismissed}
        options={vm.options?.sorts ?? []}
        value={vm.sort}
        onSelect={vm.selectSort}
        priceLocked={vm.priceLocked}
        onLocked={vm.requestLock}
      />
      <PriceLockSheet
        visible={vm.lockVisible}
        reason={vm.lockSheetReason}
        onClose={vm.closeLock}
        onAction={vm.openLockAction}
      />
    </Layout>
  );
};

export const ExploreScreen = memo(ExploreScreenComponent);
