import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useLookupItems } from '@/core/api';
import type { OpportunitiesStackScreenProps } from '@/core/navigation';
import { useGetCampaignFeedInfiniteQuery } from '../../../api/creatorCampaignsApi';
import {
  DEFAULT_OPPORTUNITY_FILTERS,
  DEFAULT_OPPORTUNITY_SEGMENT,
  type OpportunitySegment,
} from '../../../constants/opportunities';
import { useCampaignBookmark } from '../../../hooks/useCampaignBookmark';
import { CAMPAIGN_PRICING_MODEL } from '../../../types/campaign';
import type { CampaignPricingModel, CreatorCampaign, CreatorFeedArgs } from '../../../types/campaign';
import { countActiveFeedFilters, isActivityType, toFeedArgs } from '../../../utils/opportunities';

type Navigation = OpportunitiesStackScreenProps<'Opportunities'>['navigation'];

const isPricing = (value: string): value is CampaignPricingModel =>
  (CAMPAIGN_PRICING_MODEL as readonly string[]).includes(value);

/**
 * The creator's Opportunities root (PC4.1): which destination is open, the server-ranked feed under
 * the two filters the API knows, and the save flag. The feed is already gated by the server, so an
 * empty answer is a real «nothing fits you yet», not something to filter around.
 */
export const useCreatorOpportunitiesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const [segment, setSegment] = useState<OpportunitySegment>(DEFAULT_OPPORTUNITY_SEGMENT);
  const [filters, setFilters] = useState<CreatorFeedArgs>(DEFAULT_OPPORTUNITY_FILTERS);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toggleBookmark = useCampaignBookmark();

  const onFeed = segment === 'feed';
  const args = useMemo(() => toFeedArgs(filters), [filters]);
  const feed = useGetCampaignFeedInfiniteQuery(args, { skip: !onFeed, refetchOnMountOrArgChange: 30 });
  const campaigns = useMemo<CreatorCampaign[]>(() => feed.data?.pages.flatMap(page => page.items) ?? [], [feed.data]);
  const total = feed.data?.pages[0]?.meta.total ?? null;

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

  const { refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = feed;
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
  const openProfile = useCallback(() => navigation.navigate('SettingsTab', { screen: 'ProfileScreen' }), [navigation]);

  const activeFilters = countActiveFeedFilters(args);
  return {
    segment,
    setSegment,
    onFeed,
    campaigns,
    subtitle:
      onFeed && total !== null ? t('marketplace.campaign.feed.subtitle', { count: total }) : null,
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
    isLoading: !feed.data && feed.isFetching && !isRefreshing,
    isError: feed.isError && !feed.data,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    onRefresh,
    onRetry,
    onEndReached,
    openCampaign,
    openProfile,
    toggleBookmark,
    emptyTitle: t(
      activeFilters > 0 ? 'marketplace.campaign.feed.empty.filtered.title' : 'marketplace.campaign.feed.empty.title',
    ),
    emptyHint: t(
      activeFilters > 0 ? 'marketplace.campaign.feed.empty.filtered.hint' : 'marketplace.campaign.feed.empty.hint',
    ),
    emptyActionLabel: t(
      activeFilters > 0 ? 'marketplace.campaign.feed.filters.clear' : 'marketplace.campaign.feed.empty.action',
    ),
  };
};
