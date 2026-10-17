import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { formatNumber } from '@/core/i18n';
import type { DealsStackScreenProps } from '@/core/navigation';
import type { Money } from '@/core/money';
import { toastService } from '@/core/toast';
import { useGetCampaignApplicantsInfiniteQuery, useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import { useGetExploreFiltersQuery } from '../../../api/exploreApi';
import {
  APPLICANT_COMPARE_MAX,
  APPLICANT_COMPARE_MIN,
  APPLICANT_SORT_LABEL,
  APPLICANT_STATUS_FILTER_LABEL,
  APPLICANT_TABS,
  APPLICANT_TAB_DEF,
  isApplicantStatusFilter,
  type ApplicantTab,
} from '../../../constants/applicants';
import type { ApplicantCard, ApplicantFilters, ApplicantsPage } from '../../../types/campaign';
import {
  DEFAULT_APPLICANT_FILTERS,
  countActiveFilters,
  defaultApplicantTab,
  isPendingApplicant,
  seatFaceOf,
  toApplicantsArgs,
  togglePick,
  type SeatFace,
} from '../../../utils/applicants';

type Route = DealsStackScreenProps<'CampaignApplicants'>['route'];
type Navigation = DealsStackScreenProps<'CampaignApplicants'>['navigation'];

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

interface Paged {
  pages: readonly ApplicantsPage[];
}
const itemsOf = (data: Paged | undefined): ApplicantCard[] => data?.pages.flatMap(page => page.items) ?? [];

export interface ApplicantTabOption {
  value: ApplicantTab;
  label: string;
  count: number | null;
}

export interface ApplicantFilterChip {
  key: string;
  label: string;
}

/**
 * The brand's applicants table (PC3.1): the tab (new · shortlisted · selected) and the filters
 * choose one query; a second, unfiltered query on the selected applicants feeds what must not move
 * with the filters: the tab badges (`counts`), the seat rail faces and the recruiting summary.
 */
export const useBrandCampaignApplicantsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const detail = useGetCampaignQuery(id);
  const campaign = detail.data ?? null;
  const [pickedTab, setPickedTab] = useState<ApplicantTab | null>(null);
  const [filters, setFilters] = useState<ApplicantFilters>(DEFAULT_APPLICANT_FILTERS);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [picks, setPicks] = useState<SeatFace[]>([]);

  const tab = pickedTab ?? defaultApplicantTab(campaign?.status.key ?? null);
  // A status filter (expired, rejected…) replaces the tabs' own status, so no tab is lit.
  const activeTab = filters.status ? null : tab;

  const listArgs = useMemo(() => toApplicantsArgs(id, tab, filters), [id, tab, filters]);
  const railArgs = useMemo(() => toApplicantsArgs(id, 'selected', DEFAULT_APPLICANT_FILTERS), [id]);
  const list = useGetCampaignApplicantsInfiniteQuery(listArgs, { skip: !campaign, refetchOnMountOrArgChange: 30 });
  const rail = useGetCampaignApplicantsInfiniteQuery(railArgs, { skip: !campaign, refetchOnMountOrArgChange: 30 });
  const exploreFilters = useGetExploreFiltersQuery();

  const applicants = useMemo(() => itemsOf(list.data), [list.data]);
  const summary = rail.data?.pages[0] ?? null;
  const recruiting = summary?.recruiting ?? null;
  const counts = summary?.counts ?? null;

  const faces = useMemo<SeatFace[]>(
    () => itemsOf(rail.data).map(seatFaceOf),
    [rail.data],
  );
  const seatsTotal = recruiting?.seatsTotal ?? campaign?.seatsTotal ?? 0;
  const seatsOccupied = recruiting?.seatsOccupied ?? campaign?.counters.seatsOccupied ?? 0;
  const balance: Money | null = recruiting?.wallet.balance ?? null;

  const tabs = useMemo<ApplicantTabOption[]>(
    () =>
      APPLICANT_TABS.map(value => ({
        value,
        label: t(APPLICANT_TAB_DEF[value].label),
        count: counts ? counts[APPLICANT_TAB_DEF[value].status] : null,
      })),
    [counts, t],
  );

  // Only waiting applicants (new, shortlisted) can be compared, so the other views leave the mode.
  const canCompare = activeTab === 'new' || activeTab === 'shortlisted';
  const exitCompare = useCallback(() => {
    setComparing(false);
    setPicks([]);
  }, []);

  const setTab = useCallback(
    (next: ApplicantTab) => {
      setPickedTab(next);
      setFilters(current => (current.status ? { ...current, status: null } : current));
      if (next === 'selected') exitCompare();
    },
    [exitCompare],
  );

  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const applyFilters = useCallback(
    (next: ApplicantFilters) => {
      setFilters(next);
      setSheetVisible(false);
      if (next.status) exitCompare();
    },
    [exitCompare],
  );
  const clearFilters = useCallback(() => setFilters(current => ({ ...DEFAULT_APPLICANT_FILTERS, sort: current.sort })), []);

  const options = exploreFilters.data;
  const labelOf = useCallback(
    (kind: 'governorates' | 'niches', value: string) =>
      options?.[kind].find(option => option.value === value)?.label ?? value,
    [options],
  );

  const chips = useMemo<ApplicantFilterChip[]>(
    () => [
      ...(isApplicantStatusFilter(filters.status)
        ? [{ key: 'status', label: t(APPLICANT_STATUS_FILTER_LABEL[filters.status]) }]
        : []),
      ...filters.governorates.map(value => ({ key: `gov:${value}`, label: labelOf('governorates', value) })),
      ...filters.niches.map(value => ({ key: `niche:${value}`, label: labelOf('niches', value) })),
      ...(filters.minFollowers
        ? [
            {
              key: 'followers',
              label: t('marketplace.campaign.applicants.filters.followersChip', {
                count: formatNumber(filters.minFollowers, COMPACT),
              }),
            },
          ]
        : []),
      ...(filters.invitedOnly ? [{ key: 'invited', label: t('marketplace.campaign.applicants.filters.invitedChip') }] : []),
    ],
    [filters, labelOf, t],
  );
  const clearChip = useCallback((key: string) => {
    setFilters(current => {
      if (key === 'status') return { ...current, status: null };
      if (key === 'followers') return { ...current, minFollowers: null };
      if (key === 'invited') return { ...current, invitedOnly: false };
      if (key.startsWith('gov:')) return { ...current, governorates: current.governorates.filter(v => `gov:${v}` !== key) };
      return { ...current, niches: current.niches.filter(v => `niche:${v}` !== key) };
    });
  }, []);

  const refetchList = list.refetch;
  const refetchRail = rail.refetch;
  const refetchCampaign = detail.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchCampaign(), refetchList(), refetchRail()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCampaign, refetchList, refetchRail]);
  const onRetry = useCallback(() => {
    refetchCampaign();
    refetchList();
    refetchRail();
  }, [refetchCampaign, refetchList, refetchRail]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const pickedIds = useMemo(() => new Set(picks.map(pick => pick.id)), [picks]);

  // Compare mode: a tap picks or drops, the fourth is refused with a buzz and a word.
  const pickApplicant = useCallback(
    (card: ApplicantCard) => {
      const next = togglePick(picks, seatFaceOf(card), APPLICANT_COMPARE_MAX);
      if (next.full) {
        Vibration.vibrate(HAPTIC_TAP_MS);
        toastService.info(t('marketplace.campaign.applicants.compare.full', { max: APPLICANT_COMPARE_MAX }));
        return;
      }
      setPicks(next.picks);
    },
    [picks, t],
  );
  const startCompare = useCallback(() => setComparing(true), []);
  const pressCard = useCallback(
    (card: ApplicantCard) => {
      if (comparing) pickApplicant(card);
      else navigation.navigate('CampaignApplicant', { id, applicationId: card.id });
    },
    [comparing, id, navigation, pickApplicant],
  );
  const holdCard = useCallback(
    (card: ApplicantCard) => {
      if (!canCompare || !isPendingApplicant(card)) return;
      Vibration.vibrate(HAPTIC_TAP_MS);
      setComparing(true);
      setPicks(current => (current.some(pick => pick.id === card.id) ? current : togglePick(current, seatFaceOf(card), APPLICANT_COMPARE_MAX).picks));
    },
    [canCompare],
  );
  const openCompare = useCallback(() => {
    if (picks.length < APPLICANT_COMPARE_MIN) return;
    navigation.navigate('CampaignCompare', { id, ids: picks.map(pick => pick.id) });
  }, [id, navigation, picks]);
  const openWallet = useCallback(() => navigation.navigate('WalletTab'), [navigation]);
  const refetchOptions = exploreFilters.refetch;
  const retryOptions = useCallback(() => {
    refetchOptions();
  }, [refetchOptions]);

  const activeFilters = countActiveFilters(filters);
  const def = APPLICANT_TAB_DEF[tab];
  const filtered = activeFilters > 0;
  return {
    campaignTitle: campaign?.title ?? '',
    tabs,
    activeTab,
    setTab,
    applicants,
    seatsTotal,
    seatsOccupied,
    faces,
    balance,
    sortLabel: t(APPLICANT_SORT_LABEL[filters.sort]),
    filters,
    chips,
    clearChip,
    clearFilters,
    activeFilters,
    sheet: {
      visible: sheetVisible,
      open: openSheet,
      close: closeSheet,
      apply: applyFilters,
      options,
      optionsLoading: exploreFilters.isLoading,
      optionsError: exploreFilters.isError,
      retryOptions,
    },
    isLoading: (!campaign && detail.isFetching) || (!list.data && list.isFetching && !isRefreshing),
    isError: (detail.isError && !campaign) || (list.isError && !list.data),
    error: detail.error ?? list.error,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onRetry,
    onEndReached,
    goBack,
    pressCard,
    holdCard,
    openWallet,
    compare: {
      active: comparing && canCompare,
      canStart: canCompare && applicants.length >= APPLICANT_COMPARE_MIN,
      picks,
      pickedIds,
      min: APPLICANT_COMPARE_MIN,
      max: APPLICANT_COMPARE_MAX,
      start: startCompare,
      exit: exitCompare,
      open: openCompare,
    },
    emptyTitle: filtered ? t('marketplace.campaign.applicants.empty.filtered.title') : t(def.emptyTitle),
    emptyHint: filtered ? t('marketplace.campaign.applicants.empty.filtered.hint') : t(def.emptyHint),
    emptyActionLabel: filtered ? t('marketplace.campaign.applicants.filters.clear') : null,
  };
};
