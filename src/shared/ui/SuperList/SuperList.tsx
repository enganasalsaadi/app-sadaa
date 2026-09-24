import React, { useRef, useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { FlashListProps, FlashListRef } from '@shopify/flash-list';
import { useTheme } from '@/core/theme';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkeletonList } from './components/SkeletonList';
import { ListEmptyState } from './components/ListEmptyState';
import { ListFooterLoader } from './components/ListFooterLoader';
import { useScrollRestoration } from './hooks/useScrollRestoration';
import type { SuperListProps } from './types';
import { BASE_SPACING } from '@/core/theme/tokens/spacing';

// Stable empty-array so FlashList never sees a new reference when data is empty
const EMPTY: never[] = [];

const ItemSeparator: React.FC = () => <View style={styles.separator} />;

export function SuperList<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  isFetchingNextPage = false,
  isRefreshing = false,
  isError = false,
  hasNextPage = false,
  onEndReached,
  prefetchThreshold = 5,
  onRefresh,
  onRetry,
  emptyMessage,
  errorMessage,
  layout = 'list',
  overrideItemLayout,
  scrollRestorationKey,
  onScroll,
  scrollEventThrottle = 16,
  ListHeaderComponent,
  contentContainerStyle,
  style,
  skeletonCount = 6,
  ListSkeletonComponent,
  testID,
}: SuperListProps<T>): React.ReactElement {
  const { colors } = useTheme();
  const listRef = useRef<FlashListRef<T>>(null);

  const { onScrollEnd, onListLayout } = useScrollRestoration(
    scrollRestorationKey,
    listRef,
  );

  const numColumns = layout === 'grid-3' ? 3 : layout === 'grid-2' ? 2 : 1;

  // ─── Pre-fetch: fires when user is within `prefetchThreshold` items of end ──
  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 50 }),
    [],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (
        viewableItems.length === 0 ||
        !hasNextPage ||
        isFetchingNextPage ||
        !onEndReached
      ) {
        return;
      }
      const last = viewableItems[viewableItems.length - 1];
      if (!last || last.index === null) return;
      const itemsFromEnd = data.length - 1 - last.index;
      if (itemsFromEnd <= prefetchThreshold) {
        onEndReached();
      }
    },
    [
      data.length,
      hasNextPage,
      isFetchingNextPage,
      onEndReached,
      prefetchThreshold,
    ],
  );

  // ─── Footer ─────────────────────────────────────────────────────────────────
  const renderFooter = useCallback(
    () => <ListFooterLoader isVisible={isFetchingNextPage && !isLoading} />,
    [isFetchingNextPage, isLoading],
  );

  // ─── Empty / Error state ─────────────────────────────────────────────────────
  const renderEmpty = useCallback(
    () => (
      <ListEmptyState
        isError={isError}
        message={isError ? errorMessage : emptyMessage}
        onRetry={onRetry}
      />
    ),
    [isError, emptyMessage, errorMessage, onRetry],
  );

  // Adds flexGrow:1 when empty so ListEmptyComponent stretches to fill the screen
  const resolvedContentStyle = useMemo(() => {
    const flat = StyleSheet.flatten(contentContainerStyle) ?? {};
    return data.length === 0
      ? { ...flat, flexGrow: 1, paddingTop: BASE_SPACING.xl }
      : flat;
  }, [contentContainerStyle, data.length]);

  // ─── Pull-to-refresh spinner (themed) ────────────────────────────────────────
  const refreshControl = useMemo(
    () =>
      onRefresh ? (
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.interactive.main}
          colors={[colors.interactive.main]}
        />
      ) : undefined,
    [onRefresh, isRefreshing, colors.interactive.main],
  );

  // ─── Skeleton screen (initial load only) ─────────────────────────────────────
  // Refreshes keep the existing list mounted and show the pull-to-refresh spinner
  // instead of swapping in the skeleton.
  if (isLoading) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        contentContainerStyle={resolvedContentStyle}
        style={style}
      >
        {ListSkeletonComponent ?? (
          <SkeletonList count={skeletonCount} layout={layout} />
        )}
      </ScrollView>
    );
  }

  return (
    <ErrorBoundary>
      <FlashList<T>
        ref={listRef}
        // key forces remount when numColumns changes — FlashList requires this for grid transitions
        key={layout}
        data={data.length > 0 ? data : EMPTY}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        overrideItemLayout={
          overrideItemLayout as FlashListProps<T>['overrideItemLayout']
        }
        // ─── Pagination ─────────────────────────────────────────────────────
        onEndReached={hasNextPage ? onEndReached : undefined}
        onEndReachedThreshold={0.4}
        // ─── Refresh ────────────────────────────────────────────────────────
        refreshControl={refreshControl}
        // ─── Slots ──────────────────────────────────────────────────────────
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        // ─── Scroll ─────────────────────────────────────────────────────────
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        onLayout={onListLayout}
        // ─── Pre-fetch ──────────────────────────────────────────────────────
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // ─── Style ──────────────────────────────────────────────────────────
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        drawDistance={500}
        contentContainerStyle={resolvedContentStyle}
        style={style}
        testID={testID}
        ItemSeparatorComponent={ItemSeparator}
      />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  separator: { padding: BASE_SPACING.sm },
});
