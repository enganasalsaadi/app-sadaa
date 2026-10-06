import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { HomeStackScreenProps } from '@/core/navigation';
import { useGetMediaKitQuery } from '../../../api/mediaKitApi';
import { useMediaKitPreviewLabels } from '../../../hooks/useMediaKitPreviewLabels';
import { useMediaKitShareActions } from '../../../hooks/useMediaKitShareActions';

type Navigation = HomeStackScreenProps<'MediaKitPreview'>['navigation'];

export type MediaKitPreviewStatus = 'loading' | 'error' | 'ready';

/**
 * "Preview as brand": the own kit's `preview` (contract §17.1), which is the
 * public §17.4 shape, so no public GET and no view beacon.
 */
export const useMediaKitPreviewScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { data: kit, isError, isFetching, error, refetch } = useGetMediaKitQuery();
  const share = useMediaKitShareActions();
  const [refreshing, setRefreshing] = useState(false);

  const preview = kit?.preview;
  const { nicheLabels, rateRows } = useMediaKitPreviewLabels(preview);

  const openSettings = useCallback(() => navigation.navigate('MediaKitSettings'), [navigation]);

  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const status: MediaKitPreviewStatus = kit
    ? 'ready'
    : isError && !isFetching
    ? 'error'
    : 'loading';

  return {
    status,
    error,
    preview,
    isPublic: kit?.is_public ?? true,
    nicheLabels,
    rateRows,
    share,
    openSettings,
    refreshing,
    onRefresh,
    onRetry,
  };
};

export type MediaKitPreviewScreenModel = ReturnType<typeof useMediaKitPreviewScreen>;
