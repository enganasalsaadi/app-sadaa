import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { applyServerFieldErrors, normalizeApiError, useLookupItems } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import type { SettingsStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import {
  SERVICE_TYPES,
  createInfluencerRatesSchema,
  formatClock,
  fromPriceUsd,
  toPriceUsd,
  type InfluencerRatesFormValues,
  type PlatformAccountFormValues,
  type RateCardEntry,
  type ServiceType,
} from '@/domains/auth';
import {
  useDeletePlatformMutation,
  useGetPlatformsQuery,
  useRefreshPlatformMutation,
  useReplaceRateCardsMutation,
  useSetPlatformAvailabilityMutation,
  useSetPrimaryPlatformMutation,
  useUpdatePlatformMutation,
} from '../../../api/platformsApi';
import { useGetUserProfileQuery } from '../../../api/accountApi';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard';
import { usePlatformSheetSupport } from '../../../hooks/usePlatformSheetSupport';
import { platformErrorMessage, toPlatformBody, toPlatformForm } from '../../../utils/platformForm';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'PlatformDetailScreen'>;
type Route = RouteProp<SettingsStackParamList, 'PlatformDetailScreen'>;

/** Contract §5.3: refresh is limited to 2 per hour; fall back to that when `retry_after` is missing. */
const REFRESH_FALLBACK_WAIT_S = 30 * 60;

/** Form row index = position in SERVICE_TYPES, so the rows never depend on loaded data. */
const RATE_ROWS = SERVICE_TYPES.map((service, index) => ({ index, service }));

const buildRates = (
  platform: string,
  cards: readonly RateCardEntry[],
): InfluencerRatesFormValues => ({
  rates: SERVICE_TYPES.map(service => {
    const card = cards.find(c => c.platform === platform && c.service_type === service);
    return {
      platform,
      service,
      enabled: !!card,
      price: card ? fromPriceUsd(card.price_usd) : null,
    };
  }),
});

export const usePlatformDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { platformId } = useRoute<Route>().params;

  const list = useGetPlatformsQuery();
  const details = useGetUserProfileQuery();
  const services = useLookupItems('service_types');
  const support = usePlatformSheetSupport();
  const platform = list.data?.find(item => item.id === platformId) ?? null;
  const platformKey = platform?.platform ?? null;
  const allCards = details.data?.profile.rate_cards;

  const [updatePlatform, { isLoading: isUpdating }] = useUpdatePlatformMutation();
  const [deletePlatform, { isLoading: isDeleting }] = useDeletePlatformMutation();
  const [refreshPlatform, { isLoading: isRefreshing }] = useRefreshPlatformMutation();
  const [setPrimary, { isLoading: isSettingPrimary }] = useSetPrimaryPlatformMutation();
  const [setAvailability, { isLoading: isSettingAvailability }] =
    useSetPlatformAvailabilityMutation();
  const [replaceRateCards, { isLoading: isSavingRates }] = useReplaceRateCardsMutation();

  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [refreshUntil, setRefreshUntil] = useState<number | null>(null);
  const refreshSeconds = useCountdown(refreshUntil);

  // ─── Prices ────────────────────────────────────────────────────────────
  const schema = useMemo(() => createInfluencerRatesSchema(t, { requireOne: false }), [t]);
  const { control, handleSubmit, reset, setError, formState } = useForm<InfluencerRatesFormValues>(
    { mode: 'onTouched', resolver: yupResolver(schema), defaultValues: { rates: [] } },
  );
  const { isDirty } = formState;
  const [ratesReady, setRatesReady] = useState(false);

  // Prefill when both the platform and the saved prices land (and after each save); never over unsaved edits.
  useEffect(() => {
    if (!platformKey || !allCards || isDirty) return;
    reset(buildRates(platformKey, allCards));
    setRatesReady(true);
  }, [platformKey, allCards, isDirty, reset]);

  const guard = useDiscardGuard(isDirty && !removed);

  useEffect(() => {
    if (removed) navigation.goBack();
  }, [removed, navigation]);

  const serviceLabel = useCallback(
    (service: ServiceType) =>
      services.items.find(item => item.value === service)?.label ?? service,
    [services.items],
  );

  const toastFailure = useCallback(
    (err: unknown) => {
      const message = platformErrorMessage(err, t);
      if (message) toastService.error(message);
    },
    [t],
  );

  const saveRates = useCallback(() => {
    handleSubmit(async values => {
      if (!platformKey || !allCards) return;
      // Full replace: keep every other platform's prices exactly as saved.
      const others = allCards
        .filter(card => card.platform !== platformKey)
        .map(({ platform: p, service_type, price_usd }) => ({ platform: p, service_type, price_usd }));
      const mine = values.rates.flatMap((row, index) =>
        row.enabled && row.price
          ? [{ index, card: { platform: platformKey, service_type: row.service, price_usd: toPriceUsd(row.price) } }]
          : [],
      );
      try {
        await replaceRateCards([...others, ...mine.map(item => item.card)]).unwrap();
        reset(values);
        toastService.success(t('account.platforms.ratesSaved'));
      } catch (err) {
        const fieldMap = Object.fromEntries(
          mine.map((item, i) => [
            `rate_cards.${others.length + i}.price_usd`,
            `rates.${item.index}.price` as const,
          ]),
        );
        applyServerFieldErrors(err, fieldMap, setError);
        toastFailure(err);
      }
    })();
  }, [allCards, handleSubmit, platformKey, replaceRateCards, reset, setError, t, toastFailure]);

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

  const retry = useCallback(() => {
    list.refetch();
    details.refetch();
  }, [list, details]);

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
    // Prices
    rates: {
      control,
      rows: RATE_ROWS,
      serviceLabel,
      ready: ratesReady,
      isError: details.isError && !details.data,
      retry: details.refetch,
    },
    saveRates,
    isSavingRates,
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
    guard,
  };
};

export type PlatformDetailModel = ReturnType<typeof usePlatformDetailScreen>;
