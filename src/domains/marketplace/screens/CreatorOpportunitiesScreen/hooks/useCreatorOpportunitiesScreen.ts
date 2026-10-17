import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLookupItems } from '@/core/api';
import type { OpportunitiesStackScreenProps } from '@/core/navigation';
import { useGetCampaignFeedInfiniteQuery, useGetSavedCampaignsInfiniteQuery } from '../../../api/creatorCampaignsApi';
import {
  DEFAULT_OPPORTUNITY_FILTERS,
  DEFAULT_OPPORTUNITY_SEGMENT,
  type OpportunitySegment,
} from '../../../constants/opportunities';
import { useCampaignBookmark } from '../../../hooks/useCampaignBookmark';
import { useRestrictions } from '../../../hooks/useRestrictions';
import { CAMPAIGN_PRICING_MODEL } from '../../../types/campaign';
import type { CampaignPricingModel, CreatorCampaign, CreatorFeedArgs } from '../../../types/campaign';
import { countActiveFeedFilters, isActivityType, toFeedArgs } from '../../../utils/opportunities';
import { useMyApplications } from './useMyApplications';

type Navigation = OpportunitiesStackScreenProps<'Opportunities'>['navigation'];
type Route = OpportunitiesStackScreenProps<'Opportunities'>['route'];

const isPricing = (value: string): value is CampaignPricingModel =>
  (CAMPAIGN_PRICING_MODEL as readonly string[]).includes(value);

/**
 * The creator's Opportunities root (PC4.1–5.2): which destination is open, the server-ranked feed under
 * the two filters the API knows, the saved list (newest save first, no filters), the save flag and
 * my applications (their own hook).
 * The feed is already gated by the server, so an empty answer is a real «nothing fits you yet»,
 * not something to filter around. Both lists read through the same view: only the open one loads.
 */
export const useCreatorOpportunitiesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const requestedSegment = useRoute<Route>().params?.segment;
  const [segment, setSegment] = useState<OpportunitySegment>(requestedSegment ?? DEFAULT_OPPORTUNITY_SEGMENT);
  // The tab stays mounted, so a Home chip asking for a destination arrives as a param change;
  // it is cleared once applied so the same chip works again after the creator moved on.
  useEffect(() => {
    if (!requestedSegment) return;
    setSegment(requestedSegment);
    navigation.setParams({ segment: undefined });
  }, [navigation, requestedSegment]);
  const [filters, setFilters] = useState<CreatorFeedArgs>(DEFAULT_OPPORTUNITY_FILTERS);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toggleBookmark = useCampaignBookmark();

  const onFeed = segment === 'feed';
  const onSaved = segment === 'saved';
  const onApplications = segment === 'applications';
  const args = useMemo(() => toFeedArgs(filters), [filters]);
  const feed = useGetCampaignFeedInfiniteQuery(args, { skip: !onFeed, refetchOnMountOrArgChange: 30 });
  const saved = useGetSavedCampaignsInfiniteQuery(undefined, { skip: !onSaved, refetchOnMountOrArgChange: 30 });
  const list = onSaved ? saved : feed;
  const campaigns = useMemo<CreatorCampaign[]>(() => list.data?.pages.flatMap(page => page.items) ?? [], [list.data]);
  const total = list.data?.pages[0]?.meta.total ?? null;

  const lookups = useLookupItems('campaign_activity_types');
  const { items: lookupItems, refetch: refetchLookups } = lookups;
  const activityOptions = useMemo(
    () => lookupItems.filter(item => isActivityType(item.value)),
    [lookupItems],
  );
  const activityLabel = useMemo(() => {
    const activityTypes = args.activityTypes ?? [];
    const first = activityTypes[0];
    if (first === undefined) return t('marketplace.campaign.feed.filters.activity');
    const label = activityOptions.find(item => item.value === first)?.label ?? first;
    return activityTypes.length > 1
      ? t('marketplace.campaign.feed.filters.activityMore', { label, count: activityTypes.length - 1 })
      : label;
  }, [activityOptions, args.activityTypes, t]);

  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const applyFilters = useCallback((next: CreatorFeedArgs) => {
    setFilters(toFeedArgs(next));
    setSheetVisible(false);
  }, []);
  const clearFilters = useCallback(() => setFilters(DEFAULT_OPPORTUNITY_FILTERS), []);
  const pickPricing = useCallback((value: string) => {
    if (!isPricing(value)) return;
    setFilters(current => ({ ...current, pricingModel: current.pricingModel === value ? null : value }));
  }, []);
  const retryActivities = useCallback(() => {
    refetchLookups();
  }, [refetchLookups]);

  const { refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const openCampaign = useCallback((id: string) => navigation.navigate('CampaignDetail', { id }), [navigation]);
  const openDeal = useCallback(
    (id: string) => navigation.navigate('DealsTab', { screen: 'DealDetail', params: { id }, initial: false }),
    [navigation],
  );
  const browseFeed = useCallback(() => setSegment('feed'), []);
  const applications = useMyApplications(onApplications, { openCampaign, openDeal, browse: browseFeed });
  const openPersonalInfo = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'PersonalInfoScreen' }),
    [navigation],
  );
  const openProfile = useCallback(() => navigation.navigate('SettingsTab', { screen: 'ProfileScreen' }), [navigation]);

  const activeFilters = countActiveFeedFilters(args);
  const restrictions = useRestrictions('public');
  return {
    restrictions,
    segment,
    setSegment,
    onFeed,
    onList: onFeed || onSaved,
    onApplications,
    applications,
    campaigns,
    subtitle: onApplications
      ? t('marketplace.campaign.applications.subtitle')
      : total === null
        ? null
        : onFeed
          ? t('marketplace.campaign.feed.subtitle', { count: total })
          : t('marketplace.campaign.feed.savedSubtitle', { count: total }),
    filters: args,
    activeFilters,
    activityLabel,
    activityOptions,
    activityLoading: lookups.isLoading,
    activityFailed: lookups.isError,
    retryActivities,
    sheet: { visible: sheetVisible, open: openSheet, close: closeSheet, apply: applyFilters },
    clearFilters,
    pickPricing,
    isLoading: !list.data && list.isFetching && !isRefreshing,
    isError: list.isError && !list.data,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onRetry,
    onEndReached,
    openCampaign,
    openProfile,
    openPersonalInfo,
    toggleBookmark,
    browseFeed,
    emptyTitle: onSaved
      ? t('marketplace.campaign.feed.saved.title')
      : t(activeFilters > 0 ? 'marketplace.campaign.feed.empty.filtered.title' : 'marketplace.campaign.feed.empty.title'),
    emptyHint: onSaved
      ? t('marketplace.campaign.feed.saved.hint')
      : t(activeFilters > 0 ? 'marketplace.campaign.feed.empty.filtered.hint' : 'marketplace.campaign.feed.empty.hint'),
    emptyActionLabel: onSaved
      ? t('marketplace.campaign.feed.saved.action')
      : t(activeFilters > 0 ? 'marketplace.campaign.feed.filters.clear' : 'marketplace.campaign.feed.empty.action'),
    /** What the empty state's button does: browse (saved), clear the filters, or fix the profile. */
    onEmptyAction: onSaved ? browseFeed : activeFilters > 0 ? clearFilters : openProfile,
  };
};
