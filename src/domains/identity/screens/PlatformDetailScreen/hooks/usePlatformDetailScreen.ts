import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { normalizeApiError, useGetRateCardCatalogQuery } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import type { SettingsStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { formatClock, type PlatformAccountFormValues } from '@/domains/auth';
import {
  useDeletePlatformMutation,
  useGetPlatformsQuery,
  useRefreshPlatformMutation,
  useSetPlatformAvailabilityMutation,
  useSetPrimaryPlatformMutation,
  useUpdatePlatformMutation,
} from '../../../api/platformsApi';
import { useGetRateCardsQuery } from '../../../api/rateCardsApi';
import { usePlatformSheetSupport } from '../../../hooks/usePlatformSheetSupport';
import { platformErrorMessage, toPlatformBody, toPlatformForm } from '../../../utils/platformForm';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'PlatformDetailScreen'>;
type Route = RouteProp<SettingsStackParamList, 'PlatformDetailScreen'>;

/** Contract §5.3: refresh is limited to 2 per hour; fall back to that when `retry_after` is missing. */
const REFRESH_FALLBACK_WAIT_S = 30 * 60;

export const usePlatformDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { platformId } = useRoute<Route>().params;

  const list = useGetPlatformsQuery();
  const rateCards = useGetRateCardsQuery();
  const catalog = useGetRateCardCatalogQuery();
  const support = usePlatformSheetSupport();
  const platform = list.data?.find(item => item.id === platformId) ?? null;
  const platformKey = platform?.platform ?? null;

  const [updatePlatform, { isLoading: isUpdating }] = useUpdatePlatformMutation();
  const [deletePlatform, { isLoading: isDeleting }] = useDeletePlatformMutation();
  const [refreshPlatform, { isLoading: isRefreshing }] = useRefreshPlatformMutation();
  const [setPrimary, { isLoading: isSettingPrimary }] = useSetPrimaryPlatformMutation();
  const [setAvailability, { isLoading: isSettingAvailability }] =
    useSetPlatformAvailabilityMutation();

  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [refreshUntil, setRefreshUntil] = useState<number | null>(null);
  const refreshSeconds = useCountdown(refreshUntil);

  useEffect(() => {
    if (removed) navigation.goBack();
  }, [removed, navigation]);

  const toastFailure = useCallback(
    (err: unknown) => {
      const message = platformErrorMessage(err, t);
      if (message) toastService.error(message);
    },
    [t],
  );

  // ─── Account actions ───────────────────────────────────────────────────
  const onToggleAvailable = useCallback(
    async (next: boolean) => {
      try {
        await setAvailability({ id: platformId, is_available: next }).unwrap();
      } catch (err) {
        toastFailure(err);
      }
    },
    [platformId, setAvailability, toastFailure],
  );

  // There is no "unset": another platform becomes primary from its own page.
  const onMakePrimary = useCallback(async () => {
    try {
      await setPrimary(platformId).unwrap();
    } catch (err) {
      toastFailure(err);
    }
  }, [platformId, setPrimary, toastFailure]);

  const onRefresh = useCallback(async () => {
    if (refreshSeconds > 0) return;
    try {
      await refreshPlatform(platformId).unwrap();
      toastService.success(t('account.platforms.refreshed'));
    } catch (err) {
      const apiError = normalizeApiError(err);
      if (apiError.statusCode === 429) {
        const waitS = apiError.retryAfter ?? REFRESH_FALLBACK_WAIT_S;
        setRefreshUntil(Date.now() + waitS * 1000);
        toastService.warning(t('account.platforms.refreshIn', { time: formatClock(waitS) }));
        return;
      }
      toastFailure(err);
    }
  }, [platformId, refreshPlatform, refreshSeconds, t, toastFailure]);

  // ─── Edit sheet ────────────────────────────────────────────────────────
  // Snapshot on open: the sheet resets its form whenever `initial` changes.
  const [editInitial, setEditInitial] = useState<PlatformAccountFormValues | null>(null);
  const editPlatforms = useMemo(() => (editInitial ? [editInitial.platform] : []), [editInitial]);

  const onSaveEdit = useCallback(
    async (account: PlatformAccountFormValues) => {
      try {
        await updatePlatform({ id: platformId, ...toPlatformBody(account) }).unwrap();
        setEditVisible(false);
        toastService.success(t('account.platforms.updated'));
      } catch (err) {
        toastFailure(err);
      }
    },
    [platformId, t, toastFailure, updatePlatform],
  );

  const onConfirmDelete = useCallback(async () => {
    try {
      await deletePlatform(platformId).unwrap();
      setDeleteVisible(false);
      toastService.success(t('account.platforms.deleted'));
      setRemoved(true);
    } catch (err) {
      setDeleteVisible(false);
      toastFailure(err);
    }
  }, [deletePlatform, platformId, t, toastFailure]);

  const openEdit = useCallback(() => {
    const form = platform ? toPlatformForm(platform) : null;
    if (!form) return;
    setEditInitial(form);
    setEditVisible(true);
  }, [platform]);
  const closeEdit = useCallback(() => setEditVisible(false), []);
  const openDelete = useCallback(() => setDeleteVisible(true), []);
  const closeDelete = useCallback(() => setDeleteVisible(false), []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openRates = useCallback(() => navigation.navigate('RateCards'), [navigation]);

  const retry = useCallback(() => {
    list.refetch();
  }, [list]);

  // `null` (no row) until both load, and for a platform the catalog doesn't price.
  const isPriced = !!catalog.data?.platforms.some(
    entry => entry.key === platformKey && entry.services.length > 0,
  );
  const rateCount =
    rateCards.data && isPriced
      ? rateCards.data.filter(card => card.platform === platformKey).length
      : null;

  return {
    platform,
    isLoading: list.isLoading,
    isError: list.isError && !list.data,
    error: list.error,
    isNotFound: !!list.data && !platform && !removed,
    retry,
    goBack,
    // Account
    onToggleAvailable,
    isSettingAvailability,
    onMakePrimary,
    isSettingPrimary,
    canMakePrimary: platform?.verification_status !== 'rejected',
    onRefresh,
    isRefreshing,
    refreshSeconds,
    // Prices are edited on their own screen; this page shows the count.
    rates: { count: rateCount, open: openRates },
    // Sheets
    edit: {
      visible: editVisible,
      onClose: closeEdit,
      initial: editInitial,
      platforms: editPlatforms,
      ...support,
      onSave: onSaveEdit,
      saving: isUpdating,
      showPrimary: false,
    },
    openEdit,
    deleteSheet: {
      visible: deleteVisible,
      onClose: closeDelete,
      onConfirm: onConfirmDelete,
      loading: isDeleting,
    },
    openDelete,
  };
};

export type PlatformDetailModel = ReturnType<typeof usePlatformDetailScreen>;
