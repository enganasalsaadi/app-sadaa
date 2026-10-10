import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Heart } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, Layout, SuperList } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { CreatorCard } from '../../components/CreatorCard';
import { CreatorRowsSkeleton } from '../../components/CreatorRowsSkeleton';
import type { ExploreCreator } from '../../types/explore';
import { useShortlistScreen } from './hooks/useShortlistScreen';

const keyExtractor = (creator: ExploreCreator) => creator.slug;

/**
 * Shortlist (List archetype, rule 09), opened from the ❤️ in the Home header: the brand's saved
 * creators as row cards, loading on near the end. Empty → a nudge back to Explore.
 */
const ShortlistScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useShortlistScreen();
  useHideBottomBar();

  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing['5xl'] },
    item: { paddingBottom: spacing.md },
  }));

  const { openCreator, removeCreator } = vm;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ExploreCreator>) => (
      <Box style={styles.item}>
        <CreatorCard creator={item} onPress={openCreator} onToggleShortlist={removeCreator} />
      </Box>
    ),
    [openCreator, removeCreator, styles.item],
  );

  return (
    <Layout mode="static" padding="none" header={{ title: t('marketplace.shortlist.title') }}>
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
        emptyIcon={Heart}
        emptyMessage={t('marketplace.shortlist.empty.title')}
        emptyDescription={t('marketplace.shortlist.empty.hint')}
        emptyAction={vm.emptyAction}
        errorMessage={t('marketplace.shortlist.loadFailed')}
        ListSkeletonComponent={<CreatorRowsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const ShortlistScreen = memo(ShortlistScreenComponent);
