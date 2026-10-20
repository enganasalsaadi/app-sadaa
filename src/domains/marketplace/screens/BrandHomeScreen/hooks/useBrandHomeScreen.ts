import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { navigate, type ExploreFilters, type HomeStackScreenProps } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { selectUser, useOpenSupport } from '@/domains/auth';
import { useAmountsHidden } from '@/domains/finance';
import { useGetBrandHomeQuery } from '../../../api/brandHomeApi';
import { useGetExploreFiltersQuery } from '../../../api/exploreApi';
import { BRAND_HOME_ISLAND, resolveCategoryIcon } from '../../../constants/brandHome';
import { useCampaignsEnabled } from '../../../hooks/useCampaignsEnabled';
import { useCreatorCardActions } from '../../../hooks/useCreatorCardActions';
import type { BrandActiveCampaign, BrandActiveDeal, DealParty } from '../../../types';
import type { BrandHomeRail } from '../../../types/explore';
import { splitActiveDeals } from '../../../utils/brandHomeDeals';
import { shouldShowTwoWays } from '../../../utils/brandHomeTwoWays';
import { campaignHomeTarget } from '../../../utils/campaignHome';
import { DAY_PART_GREETING, resolveDayPart } from '../../../utils/dayPart';

type Navigation = HomeStackScreenProps<'BrandHomeScreen'>['navigation'];

/**
 * Every `/brand/home` call records rail impressions (handoff §5, throttle 30/min): refetch on
 * focus only once the data is this old. A remount within the window reuses the cache.
 */
const HOME_STALE_SECONDS = 120;
const HOME_STALE_MS = HOME_STALE_SECONDS * 1000;

export type BrandHomeStatus = 'loading' | 'error' | 'ready';

/** Faces on the «no deals in progress» card: real creators from the rails, at most two. */
const WELCOME_FACES = 2;

/**
 * The «your deals» section: a skeleton while Home loads; nothing on error (the rest of Home
 * still works, a pull brings it back); a welcome when no deal is open; else the next-step card
 * (deals waiting on the brand) over the tracker list (the rest). Counts are the server's.
 */
export type BrandHomeDeals =
  | { kind: 'loading' }
  | { kind: 'hidden' }
  | { kind: 'welcome'; faces: DealParty[] }
  | {
      kind: 'deals';
      waiting: BrandActiveDeal[];
      moving: BrandActiveDeal[];
      needsActionCount: number;
      movingCount: number;
      /** Every open deal, when the server sent fewer rows than that; else `null`. */
      moreCount: number | null;
    };

/**
 * «My active campaigns»: nothing while Home loads or fails and nothing when the server sends
 * `null` (flag off, or no campaign running) — the flag is unknown until Home answers, so a
 * skeleton would flash for brands that never get the rail.
 */
export type BrandHomeCampaigns =
  | { kind: 'hidden' }
  | {
      kind: 'rail';
      needsActionCount: number;
      totalCount: number;
      items: BrandActiveCampaign[];
    };

export const useBrandHomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const user = useAppSelector(selectUser);
  const openSupport = useOpenSupport();
  const { hidden } = useAmountsHidden();
  const homeQuery = useGetBrandHomeQuery(undefined, {
    refetchOnMountOrArgChange: HOME_STALE_SECONDS,
  });
  const filtersQuery = useGetExploreFiltersQuery();
  const { openCreator, toggleShortlist } = useCreatorCardActions();
  const [refreshing, setRefreshing] = useState(false);
  // Read once per mount: Home is a tab root, remounted often enough for a greeting.
  const [dayPart] = useState(() => resolveDayPart(new Date().getHours()));
  const home = homeQuery.data;

  const status: BrandHomeStatus = home ? 'ready' : homeQuery.isError ? 'error' : 'loading';

  const { refetch, fulfilledTimeStamp, isFetching } = homeQuery;
  useFocusEffect(
    useCallback(() => {
      if (!isFetching && fulfilledTimeStamp && Date.now() - fulfilledTimeStamp > HOME_STALE_MS) {
        refetch();
      }
    }, [fulfilledTimeStamp, isFetching, refetch]),
  );

  // Account screens live in the Settings tab; `initial: false` keeps Profile underneath.
  const openProfile = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'ProfileScreen' }),
    [navigation],
  );
  const openNotifications = useCallback(
    () => navigation.navigate('SettingsTab', { screen: 'NotificationsScreen', initial: false }),
    [navigation],
  );
  const openWallet = useCallback(() => navigation.navigate('WalletTab'), [navigation]);
  // `initial: false` keeps the wallet under the wizard, so closing it lands there.
  const openTopUp = useCallback(
    () => navigation.navigate('WalletTab', { screen: 'TopUp', initial: false }),
    [navigation],
  );
  const openShortlist = useCallback(() => navigation.navigate('Shortlist'), [navigation]);

  const openExplore = useCallback(
    (filters?: ExploreFilters) => navigation.navigate('Explore', filters ? { filters } : undefined),
    [navigation],
  );
  const openSearch = useCallback(
    () => navigation.navigate('Explore', { focusSearch: true }),
    [navigation],
  );
  const openCategory = useCallback(
    (category: string) => openExplore({ category }),
    [openExplore],
  );
  const openRail = useCallback(
    (rail: BrandHomeRail) => {
      if (rail.seeAll) openExplore(rail.seeAll);
    },
    [openExplore],
  );
  const browseAll = useCallback(() => openExplore(), [openExplore]);

  // `initial: false` keeps the deals list under the deal, so back lands there.
  const openDeal = useCallback(
    (id: string) =>
      navigation.navigate('DealsTab', { screen: 'DealDetail', params: { id }, initial: false }),
    [navigation],
  );
  const openDeals = useCallback(() => navigation.navigate('DealsTab'), [navigation]);

  // The brand's tab root leads with its campaigns when the flag is on, so `openDeals` also lands on «all campaigns».
  const openCampaignAction = useCallback(
    (campaign: BrandActiveCampaign) => {
      const { id } = campaign;
      const target = campaignHomeTarget(campaign);
      switch (target) {
        case 'wallet':
          // The chosen seats fund themselves once the top-up lands.
          openTopUp();
          return;
        case 'applicants':
          navigation.navigate('DealsTab', { screen: 'CampaignApplicants', params: { id }, initial: false });
          return;
        case 'campaign':
          navigation.navigate('DealsTab', { screen: 'CampaignDetail', params: { id }, initial: false });
          return;
        default: {
          const _exhaustive: never = target;
          return _exhaustive;
        }
      }
    },
    [navigation, openTopUp],
  );

  const categoryOptions = filtersQuery.data?.categories;
  const categories = useMemo(
    () =>
      categoryOptions?.map(({ value, label }) => ({ value, label, icon: resolveCategoryIcon(value) })) ??
      [],
    [categoryOptions],
  );

  const supportUrl = home?.supportWhatsappUrl ?? null;
  const contactSupport = useCallback(() => {
    if (!supportUrl) return;
    // Allow-listed in the mapper (rule 07); the boot-config number is the fallback.
    Linking.openURL(supportUrl).catch(() =>
      openSupport(t('marketplace.brandHome.support.message')),
    );
  }, [openSupport, supportUrl, t]);

  const islandDto = home?.island ?? null;
  const island = useMemo(() => {
    if (!islandDto) return null;
    const def = BRAND_HOME_ISLAND[islandDto.type];
    return {
      key: islandDto.type,
      tone: def.tone,
      // Server copy, shown as-is (rule 03).
      title: islandDto.title,
      message: islandDto.body,
      note: islandDto.waitingDeals?.campaignCount
        ? t('marketplace.brandHome.island.campaignSeats', { count: islandDto.waitingDeals.campaignCount })
        : null,
      hint: islandDto.ctaLabel,
      onPress: () => {
        const { target } = def;
        if (target.tab === 'topUp') openTopUp();
        else navigation.navigate('SettingsTab', { screen: target.screen, initial: false });
      },
    };
  }, [islandDto, navigation, openTopUp, t]);

  const companyName = home?.companyName || user?.display_name || null;
  const governorate = home?.governorate?.label ?? null;
  const wallet = home?.wallet ?? null;
  // "Top up" shows only once `/me` allows it; any blocker is the island's job (rule 06).
  const canTopUp = user?.capabilities?.top_up_wallet?.allowed === true;
  const hero = useMemo(
    () => ({
      status,
      greeting: t(DAY_PART_GREETING[dayPart]),
      companyName: companyName ?? t('marketplace.brandHome.companyFallback'),
      governorate,
      wallet,
      canTopUp,
    }),
    [canTopUp, companyName, dayPart, governorate, status, t, wallet],
  );

  const activeDeals = home?.activeDeals;
  const rails = home?.rails;
  const deals = useMemo((): BrandHomeDeals => {
    if (status === 'loading') return { kind: 'loading' };
    if (status === 'error') return { kind: 'hidden' };
    if (!activeDeals) {
      // A creator can sit on several rails: one face each.
      const withPhoto = new Map(
        (rails ?? [])
          .flatMap(rail => rail.items)
          .filter(creator => creator.avatarUrl)
          .map(creator => [creator.slug, creator] as const),
      );
      const faces = [...withPhoto.values()]
        .slice(0, WELCOME_FACES)
        .map(({ displayName, avatarUrl }) => ({ name: displayName, avatarUrl }));
      return { kind: 'welcome', faces };
    }
    const { waiting, moving } = splitActiveDeals(activeDeals.items);
    const { needsActionCount, totalCount } = activeDeals;
    return {
      kind: 'deals',
      waiting,
      moving,
      needsActionCount,
      movingCount: Math.max(0, totalCount - needsActionCount),
      moreCount: totalCount > activeDeals.items.length ? totalCount : null,
    };
  }, [activeDeals, rails, status]);

  const activeCampaigns = home?.activeCampaigns;
  const campaigns = useMemo(
    (): BrandHomeCampaigns =>
      activeCampaigns
        ? {
            kind: 'rail',
            needsActionCount: activeCampaigns.needsActionCount,
            totalCount: activeCampaigns.totalCount,
            items: activeCampaigns.items,
          }
        : { kind: 'hidden' },
    [activeCampaigns],
  );

  // The wizard is the campaigns flow's own stack: reached from here the way the campaigns list does.
  const openCreateCampaign = useCallback(() => navigate('CampaignWizard'), []);
  const campaignsEnabled = useCampaignsEnabled('brand');
  const showTwoWays = shouldShowTwoWays({
    campaignsEnabled,
    noOpenDeal: deals.kind === 'welcome',
    noActiveCampaign: campaigns.kind === 'hidden',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    status,
    error: homeQuery.error,
    hero,
    island,
    hidden,
    rails: rails ?? [],
    deals,
    openDeal,
    openDeals,
    campaigns,
    openCampaignAction,
    showTwoWays,
    openCreateCampaign,
    hasSupport: !!supportUrl,
    unreadNotifications: user?.unread_notifications_count ?? 0,
    refreshing,
    onRefresh,
    retry,
    openProfile,
    openNotifications,
    openShortlist,
    openWallet,
    openTopUp,
    openCreator,
    toggleShortlist,
    contactSupport,
    openSearch,
    // Categories are a shortcut: hidden while loading or when `/explore/filters` fails.
    categories,
    openCategory,
    openRail,
    browseAll,
  };
};

export type BrandHomeScreenModel = ReturnType<typeof useBrandHomeScreen>;
