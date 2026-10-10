import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { HomeStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetShortlistInfiniteQuery } from '../../../api/shortlistApi';
import { useCreatorCardActions } from '../../../hooks/useCreatorCardActions';
import type { ExploreCreator } from '../../../types/explore';

type Navigation = HomeStackScreenProps<'Shortlist'>['navigation'];

/**
 * Shortlist (handoff §5): the brand's saved creators, cursor-paged, newest first. ❤️ here only
 * removes: the row leaves at once, and once the server agrees an Undo toast can save it back.
 * Refetched on every open so creators who became ineligible elsewhere drop out.
 */
export const useShortlistScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { openCreator, setShortlist } = useCreatorCardActions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useGetShortlistInfiniteQuery(undefined, { refetchOnMountOrArgChange: true });

  const pages = data?.pages;
  const creators = useMemo(() => pages?.flatMap(page => page.items) ?? [], [pages]);

  const removeCreator = useCallback(
    async (creator: ExploreCreator) => {
      if (!(await setShortlist(creator, false))) return;
      toastService.info(t('marketplace.shortlist.removed', { name: creator.displayName }), {
        action: {
          label: t('common.undo'),
          onPress: () => {
            setShortlist(creator, true);
          },
        },
      });
    },
    [setShortlist, t],
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const openExplore = useCallback(() => navigation.navigate('Explore'), [navigation]);
  const emptyAction = useMemo(
    () => ({ label: t('marketplace.shortlist.empty.explore'), onPress: openExplore }),
    [openExplore, t],
  );

  return {
    creators,
    isLoading: !data && isFetching && !isRefreshing,
    isError: isError && !data,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onEndReached,
    onRetry,
    emptyAction,
    openCreator,
    removeCreator,
  };
};
