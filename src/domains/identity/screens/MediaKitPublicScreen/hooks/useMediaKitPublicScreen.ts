import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';
import { useNavigation, useRoute, type NavigatorScreenParams } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import {
  navigate,
  type AuthStackParamList,
  type PublicStackScreenProps,
  type RootTabParamList,
} from '@/core/navigation';
import { useAppDispatch, useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectIsAuthenticated, selectUserType } from '@/domains/auth';
import {
  mediaKitApi,
  useGetPublicMediaKitQuery,
  useSetKitShortlistedMutation,
  useTrackMediaKitViewMutation,
} from '../../../api/mediaKitApi';
import { useMediaKitPreviewLabels } from '../../../hooks/useMediaKitPreviewLabels';
import { useMediaKitServices } from '../../../hooks/useMediaKitServices';
import { toPriceFrom } from '../../../utils/mediaKitCard';
import { buildShareUrl } from '../../../utils/mediaKitShare';
import { buildShowcaseMetrics } from '../../../utils/mediaKitShowcase';
import {
  resolvePriceLockNotice,
  toPriceLockReason,
  toPriceLockViewer,
  type PriceLockNotice,
} from '../../../utils/priceLock';
import { resolvePublicMediaKitStatus } from '../../../utils/publicMediaKitStatus';

type ScreenProps = PublicStackScreenProps<'MediaKitPublic'>;

/** What sits in the footer: the unlock step, the brand's offer bar, or nothing. */
export type MediaKitPublicFooter = 'lock' | 'offer' | 'none';

/**
 * A creator's public media kit (contract §17.4), opened from a link or in-app.
 * Counts one view per open (§17.5, fire-and-forget) and moves an old slug to the
 * canonical one so the cache key follows the creator. Locked prices (brand-explore §6)
 * get a footer with the one step that unlocks them for this viewer. A brand who can see
 * prices picks services (an on-screen estimate) and saves the creator to the shortlist.
 */
export const useMediaKitPublicScreen = () => {
  const { t } = useTranslation();
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
  const metrics = useMemo(() => (kit ? buildShowcaseMetrics(kit) : []), [kit]);
  const services = useMediaKitServices(kit, rateRows);
  const viewer = toPriceLockViewer(signedIn, userType);
  const isBrand = viewer === 'brand';
  const selectable = isBrand && kit !== undefined && !kit.price_locked;
  const priceFrom = useMemo(() => toPriceFrom(kit?.price_from_usd ?? null), [kit?.price_from_usd]);

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

  const [setShortlisted, { isLoading: savingShortlist }] = useSetKitShortlistedMutation();
  const isShortlisted = kit?.is_shortlisted === true;
  // Brand bearer → true / false; everyone else → null: no heart at all (contract §17.11).
  const canShortlist = kit !== undefined && kit.is_shortlisted !== null;
  const slug = params.slug;
  const updateShortlist = useCallback(
    async (shortlisted: boolean) => {
      try {
        await setShortlisted({ slug, shortlisted }).unwrap();
        if (shortlisted) toastService.success(t('account.mediaKit.showcase.shortlist.saved'));
      } catch (err: unknown) {
        toastService.error(
          normalizeApiError(err).code === 'shortlist_full'
            ? t('marketplace.shortlist.full')
            : t('marketplace.shortlist.failed'),
        );
      }
    },
    [setShortlisted, slug, t],
  );
  const onSaveToShortlist = useCallback(() => {
    if (savingShortlist) return;
    updateShortlist(true);
  }, [savingShortlist, updateShortlist]);
  const onToggleShortlist = useCallback(() => {
    if (savingShortlist) return;
    updateShortlist(!isShortlisted);
  }, [isShortlisted, savingShortlist, updateShortlist]);

  const onOpenShortlist = useCallback(() => {
    const home: NavigatorScreenParams<RootTabParamList> = {
      screen: 'HomeTab',
      params: { screen: 'Shortlist', initial: false },
    };
    navigate('Main', home);
  }, []);

  const publicUrl = kit?.public_url ?? null;
  const onShare = useMemo(
    () =>
      publicUrl
        ? () => {
            // Brand-side share is not counted: §17.6 records only the creator's own shares.
            Share.share({ message: buildShareUrl(publicUrl) }).catch(() => undefined);
          }
        : null,
    [publicUrl],
  );

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

  // Visitors without an account: one way in per role, from the join card under the pitch.
  const onJoinCreator = useCallback(() => {
    const register: NavigatorScreenParams<AuthStackParamList> = { screen: 'InfluencerRegister' };
    navigate('Auth', register);
  }, []);
  const onJoinBrand = useCallback(() => {
    const register: NavigatorScreenParams<AuthStackParamList> = { screen: 'BrandRegister' };
    navigate('Auth', register);
  }, []);
  const join = useMemo(
    () => (signedIn ? undefined : { onCreator: onJoinCreator, onBrand: onJoinBrand }),
    [onJoinBrand, onJoinCreator, signedIn],
  );

  const footer: MediaKitPublicFooter = priceLock ? 'lock' : selectable ? 'offer' : 'none';

  return {
    status: resolvePublicMediaKitStatus({ hasData: kit !== undefined, error, isFetching }),
    error,
    kit,
    nicheLabels,
    rateRows,
    metrics,
    services,
    selectable,
    priceFrom,
    footer,
    priceLock,
    onPriceLockAction,
    canShortlist,
    isShortlisted,
    savingShortlist,
    onSaveToShortlist,
    onToggleShortlist,
    onOpenShortlist,
    onShare,
    refreshing,
    onRefresh,
    onRetry,
    onBack,
    join,
  };
};

export type MediaKitPublicScreenModel = ReturnType<typeof useMediaKitPublicScreen>;
