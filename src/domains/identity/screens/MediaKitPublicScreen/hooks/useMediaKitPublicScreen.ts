import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute, type NavigatorScreenParams } from '@react-navigation/native';
import {
  navigate,
  type AuthStackParamList,
  type PublicStackScreenProps,
  type RootTabParamList,
} from '@/core/navigation';
import { useAppDispatch, useAppSelector } from '@/core/store';
import { selectIsAuthenticated, selectUserType } from '@/domains/auth';
import {
  mediaKitApi,
  useGetPublicMediaKitQuery,
  useTrackMediaKitViewMutation,
} from '../../../api/mediaKitApi';
import { useMediaKitPreviewLabels } from '../../../hooks/useMediaKitPreviewLabels';
import {
  resolvePriceLockNotice,
  toPriceLockReason,
  toPriceLockViewer,
  type PriceLockNotice,
} from '../../../utils/priceLock';
import { resolvePublicMediaKitStatus } from '../../../utils/publicMediaKitStatus';

type ScreenProps = PublicStackScreenProps<'MediaKitPublic'>;

/**
 * A creator's public media kit (contract §17.4), opened from a link or in-app.
 * Counts one view per open (§17.5, fire-and-forget) and moves an old slug to the
 * canonical one so the cache key follows the creator. Locked prices (brand-explore §6)
 * get a footer with the one step that unlocks them for this viewer.
 */
export const useMediaKitPublicScreen = () => {
  const navigation = useNavigation<ScreenProps['navigation']>();
  const { params } = useRoute<ScreenProps['route']>();
  const dispatch = useAppDispatch();
  const signedIn = useAppSelector(selectIsAuthenticated);
  const userType = useAppSelector(selectUserType);
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

  const lockReason = kit?.price_lock_reason;
  const priceLock = useMemo<PriceLockNotice | null>(
    () =>
      kit?.price_locked
        ? resolvePriceLockNotice(toPriceLockReason(lockReason), toPriceLockViewer(signedIn, userType))
        : null,
    [kit?.price_locked, lockReason, signedIn, userType],
  );

  // This screen sits on the root stack above Main / Auth, so the CTA leaves it for the
  // branch underneath; the locked body is dropped once verification saves (`User` tag).
  const onPriceLockAction = useCallback(() => {
    const cta = priceLock?.cta;
    if (!cta) return;
    if (cta.screen === 'Login') {
      const login: NavigatorScreenParams<AuthStackParamList> = { screen: 'Login' };
      navigate('Auth', login);
      return;
    }
    const settings: NavigatorScreenParams<RootTabParamList> = {
      screen: 'SettingsTab',
      params: { screen: cta.screen, initial: false },
    };
    navigate('Main', settings);
  }, [priceLock]);

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
    priceLock,
    onPriceLockAction,
    refreshing,
    onRefresh,
    onRetry,
    onBack,
  };
};

export type MediaKitPublicScreenModel = ReturnType<typeof useMediaKitPublicScreen>;
