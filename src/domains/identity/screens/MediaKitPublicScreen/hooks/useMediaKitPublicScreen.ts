import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { PublicStackScreenProps } from '@/core/navigation';
import { useAppDispatch } from '@/core/store';
import {
  mediaKitApi,
  useGetPublicMediaKitQuery,
  useTrackMediaKitViewMutation,
} from '../../../api/mediaKitApi';
import { useMediaKitPreviewLabels } from '../../../hooks/useMediaKitPreviewLabels';
import { resolvePublicMediaKitStatus } from '../../../utils/publicMediaKitStatus';

type ScreenProps = PublicStackScreenProps<'MediaKitPublic'>;

/**
 * A creator's public media kit (contract §17.4), opened from a link or in-app.
 * Counts one view per open (§17.5, fire-and-forget) and moves an old slug to the
 * canonical one so the cache key follows the creator.
 */
export const useMediaKitPublicScreen = () => {
  const navigation = useNavigation<ScreenProps['navigation']>();
  const { params } = useRoute<ScreenProps['route']>();
  const dispatch = useAppDispatch();
  const { data, error, isFetching, refetch } = useGetPublicMediaKitQuery(params.slug);
  const [trackView] = useTrackMediaKitViewMutation();
  const [refreshing, setRefreshing] = useState(false);

  // The slug/source this screen was opened with: a canonical swap is not a new view.
  const openedWith = useRef(params);
  const viewSent = useRef(false);
  useEffect(() => {
    if (viewSent.current) return;
    viewSent.current = true;
    // Never awaited: the server ignores own / repeat views and every error is dropped.
    trackView({ slug: openedWith.current.slug, src: openedWith.current.source });
  }, [trackView]);

  const kit = data?.kit;
  const canonicalSlug = data?.canonicalSlug ?? null;
  useEffect(() => {
    if (!kit || !canonicalSlug) return;
    dispatch(
      mediaKitApi.util.upsertQueryData('getPublicMediaKit', canonicalSlug, {
        kit,
        canonicalSlug: null,
      }),
    );
    navigation.setParams({ slug: canonicalSlug });
  }, [canonicalSlug, dispatch, kit, navigation]);

  const { nicheLabels, rateRows } = useMediaKitPreviewLabels(kit);

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

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    status: resolvePublicMediaKitStatus({ hasData: kit !== undefined, error, isFetching }),
    error,
    kit,
    nicheLabels,
    rateRows,
    refreshing,
    onRefresh,
    onRetry,
    onBack,
  };
};

export type MediaKitPublicScreenModel = ReturnType<typeof useMediaKitPublicScreen>;
