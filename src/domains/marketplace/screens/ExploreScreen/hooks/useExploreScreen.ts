import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ListFilter, SearchX } from 'lucide-react-native';
import { normalizeApiError } from '@/core/api';
import type { HomeStackScreenProps } from '@/core/navigation';
import {
  PRICE_LOCK_ACTION,
  PRICE_LOCK_ACTION_FALLBACK,
  toPriceLockReason,
  type PriceLockReason,
  type PriceLockScreen,
} from '@/domains/identity';
import { brandHomeApi } from '../../../api/brandHomeApi';
import { useGetExploreCreatorsInfiniteQuery, useGetExploreFiltersQuery } from '../../../api/exploreApi';
import { useCreatorCardActions } from '../../../hooks/useCreatorCardActions';
import type { ExploreFilters, ExploreSort } from '../../../types/explore';
import {
  applyFilterDraft,
  clearNarrowingFilters,
  countSheetFilters,
  hasGatedParams,
  hasNarrowingFilters,
  stripGatedFilters,
  toSearchQuery,
  type ExploreFilterDraft,
} from '../../../utils/exploreFilters';

type Screen = HomeStackScreenProps<'Explore'>;

/** Typing settles before a request: the endpoint allows 60/min. */
const SEARCH_DEBOUNCE_MS = 400;

export type ExploreSheet = 'filters' | 'sort';
export type ExploreQuickToggle = 'kycVerified' | 'rush';

interface LockState {
  visible: boolean;
  reason: PriceLockReason | null;
}

/**
 * Explore (handoff §3): search + filters + sort over a cursor-paged creator list. A 🔒 filter
 * or sort while prices are locked never reaches the server; it opens the lock sheet instead.
 * Should the server still answer `403 gated_parameter`, the 🔒 part is dropped and the same
 * sheet opens, so the brand never sees an empty list for it.
 */
export const useExploreScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Screen['navigation']>();
  const { params } = useRoute<Screen['route']>();
  const { openCreator, toggleShortlist } = useCreatorCardActions();

  const [filters, setFilters] = useState<ExploreFilters>(() => params?.filters ?? {});
  const [search, setSearch] = useState(() => params?.filters?.q ?? '');
  const [sheet, setSheet] = useState<ExploreSheet | null>(null);
  const [lock, setLock] = useState<LockState>({ visible: false, reason: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  // A lock asked for from inside a sheet opens once that sheet is gone (two modals never race).
  const queuedLock = useRef<{ reason: PriceLockReason | null } | null>(null);

  const query = useGetExploreCreatorsInfiniteQuery(filters);
  const { currentData, data, isFetching, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    query;
  const filtersQuery = useGetExploreFiltersQuery();
  // Home's cached answer covers the moment before the first page; read only, never fetched here.
  const { data: home } = brandHomeApi.endpoints.getBrandHome.useQueryState();

  // ── Lock ──────────────────────────────────────────────────────────────────
  const firstPage = data?.pages[0];
  const priceLocked = firstPage ? firstPage.priceLocked : home ? !home.viewPrices.allowed : false;
  const lockReason = firstPage ? firstPage.priceLockReason : (home?.viewPrices.reason ?? null);

  const openLock = useCallback((reason: PriceLockReason | null) => {
    setLock({ visible: true, reason });
  }, []);
  const closeLock = useCallback(() => setLock(prev => ({ ...prev, visible: false })), []);

  const requestLock = useCallback(() => {
    if (sheet) {
      queuedLock.current = { reason: lockReason };
      setSheet(null);
      return;
    }
    openLock(lockReason);
  }, [lockReason, openLock, sheet]);

  const onSheetDismissed = useCallback(() => {
    const queued = queuedLock.current;
    queuedLock.current = null;
    if (queued) openLock(queued.reason);
  }, [openLock]);

  const gatedError = useMemo(() => {
    if (!error) return null;
    const normalized = normalizeApiError(error);
    return normalized.code === 'gated_parameter' ? normalized : null;
  }, [error]);

  useEffect(() => {
    if (!gatedError) return;
    setFilters(stripGatedFilters);
    openLock(toPriceLockReason(gatedError.reason));
  }, [gatedError, openLock]);

  // Settings tab keeps Profile underneath, like the Home island.
  const openLockAction = useCallback(
    (screen: PriceLockScreen) =>
      navigation.navigate('SettingsTab', { screen, initial: false }),
    [navigation],
  );

  /** Applies `next` unless it carries a 🔒 part the viewer can't use. */
  const commit = useCallback(
    (next: ExploreFilters) => {
      if (priceLocked && hasGatedParams(next)) {
        requestLock();
        return false;
      }
      setFilters(next);
      return true;
    },
    [priceLocked, requestLock],
  );

  // ── Search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = toSearchQuery(search);
      setFilters(prev => {
        if (prev.q === q) return prev;
        const next = { ...prev };
        if (q === undefined) delete next.q;
        else next.q = q;
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Toolbar ───────────────────────────────────────────────────────────────
  const toggleQuick = useCallback((key: ExploreQuickToggle) => {
    setFilters(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }, []);

  const clearCategory = useCallback(() => {
    setFilters(({ category: _category, ...rest }) => rest);
  }, []);

  const openFilters = useCallback(() => setSheet('filters'), []);
  const openSort = useCallback(() => setSheet('sort'), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const applyDraft = useCallback(
    (draft: ExploreFilterDraft) => {
      if (commit(applyFilterDraft(filters, draft))) setSheet(null);
    },
    [commit, filters],
  );

  const selectSort = useCallback(
    (sort: ExploreSort) => {
      const next = { ...filters };
      if (sort === 'recommended') delete next.sort;
      else next.sort = sort;
      if (commit(next)) setSheet(null);
    },
    [commit, filters],
  );

  const clearFilters = useCallback(() => setFilters(clearNarrowingFilters), []);

  // ── Options ───────────────────────────────────────────────────────────────
  const options = filtersQuery.data;
  const sort: ExploreSort = filters.sort ?? 'recommended';
  const sortLabel = useMemo(
    () => options?.sorts.find(option => option.value === sort)?.label ?? t('marketplace.explore.sort.title'),
    [options, sort, t],
  );
  const categoryLabel = useMemo(() => {
    if (!filters.category) return null;
    return options?.categories.find(option => option.value === filters.category)?.label ?? filters.category;
  }, [filters.category, options]);
  const filterCount = countSheetFilters(filters);

  // ── List ──────────────────────────────────────────────────────────────────
  // `currentData` (not `data`): a new filter shows its skeleton, not the previous results.
  const pages = currentData?.pages;
  const creators = useMemo(() => pages?.flatMap(page => page.items) ?? [], [pages]);

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

  const narrowed = hasNarrowingFilters(filters);
  const emptyAction = useMemo(
    () =>
      narrowed
        ? { label: t('marketplace.explore.clearFilters'), onPress: clearFilters, variant: 'secondary' as const }
        : undefined,
    [clearFilters, narrowed, t],
  );

  const lockAction = lockReason ? PRICE_LOCK_ACTION[lockReason] : PRICE_LOCK_ACTION_FALLBACK;
  const lockBannerAction = useMemo(() => {
    const { cta } = lockAction;
    return cta ? { label: t(cta.label), onPress: () => openLockAction(cta.screen) } : undefined;
  }, [lockAction, openLockAction, t]);

  return {
    // Search
    search,
    onChangeSearch: setSearch,
    autoFocus: params?.focusSearch ?? false,
    // Toolbar
    filterCount,
    sortLabel,
    sortSet: sort !== 'recommended',
    kycVerified: !!filters.kycVerified,
    rush: !!filters.rush,
    toggleQuick,
    categoryLabel,
    clearCategory,
    openFilters,
    openSort,
    // Sheets
    sheet,
    closeSheet,
    onSheetDismissed,
    filters,
    options,
    optionsLoading: filtersQuery.isLoading,
    optionsError: filtersQuery.isError && !options,
    retryOptions: filtersQuery.refetch,
    applyDraft,
    sort,
    selectSort,
    priceLocked,
    requestLock,
    // Lock
    lockVisible: lock.visible,
    lockSheetReason: lock.reason,
    closeLock,
    openLockAction,
    lockBanner: priceLocked ? { message: t(lockAction.title), action: lockBannerAction } : null,
    // List
    creators,
    isLoading: !currentData && isFetching && !isRefreshing,
    isError: isError && !currentData && !gatedError,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onEndReached,
    onRetry,
    emptyMessage: t(narrowed ? 'marketplace.explore.empty.filteredTitle' : 'marketplace.explore.empty.title'),
    emptyDescription: t(narrowed ? 'marketplace.explore.empty.filteredHint' : 'marketplace.explore.empty.hint'),
    emptyIcon: narrowed ? ListFilter : SearchX,
    emptyAction,
    openCreator,
    toggleShortlist,
  };
};

export type ExploreScreenModel = ReturnType<typeof useExploreScreen>;
